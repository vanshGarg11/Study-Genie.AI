import { Response } from "express";
import fs from "fs";
import pdfParse from "pdf-parse";
import { AuthRequest } from "../middleware/authMiddleware";
import PDF from "../models/PDF";
import Lesson from "../models/Lesson";
import {
  answerLessonQuestion,
  generateLesson,
} from "../services/lessonService";
import { addCoins, deductCoins, getBalance } from "../services/coinService";
import mongoose from "mongoose";

const cleanExtractedText = (text: string) =>
  text.replace(/\s+/g, " ").trim();

const refreshPdfText = async (pdf: any) => {
  if (pdf.extractedText && pdf.extractedText.trim().length > 0) {
    return cleanExtractedText(pdf.extractedText);
  }

  if (!pdf.filePath || !fs.existsSync(pdf.filePath)) {
    return "";
  }

  const buffer = fs.readFileSync(pdf.filePath);
  const data = await pdfParse(buffer);
  const extractedText = cleanExtractedText(data.text || "");

  if (extractedText) {
    pdf.extractedText = extractedText;
    await pdf.save();
  }

  return extractedText;
};

export const createLesson = async (
    req: AuthRequest,
    res: Response
)=> {

    try {

        const pdfId = req.params.pdfId as string;

        // Ensure the PDF exists AND belongs to the requesting user
        const pdf = await PDF.findOne({
            _id: pdfId,
            userId: req.user.userId,
        });

        if (!pdf) {
            return res.status(404).json({
                success: false,
                message: "PDF not found",
            });
        }

        const extractedText = await refreshPdfText(pdf);

        if (!extractedText) {
            return res.status(400).json({
                success: false,
                message: "This PDF has no readable text for lesson generation. Please upload a text-based PDF, not a scanned image PDF.",
            });
        }

        // Generate first — don't charge coins for a generation that might fail
        const coinBalance = await getBalance(req.user.userId);

        if (coinBalance < 20) {
            return res.status(400).json({
                success: false,
                message: "Insufficient Coins",
            });
        }

        const lesson = await generateLesson(extractedText);

        // Only deduct coins once we know generation succeeded
        await deductCoins(
            req.user.userId,
            20,
            "AI Lesson"
        );

        let savedLesson;
        try {
            savedLesson = await Lesson.create({
    userId: new mongoose.Types.ObjectId(req.user.userId),
    pdfId: new mongoose.Types.ObjectId(pdfId),
                title: lesson.title,
                slides: lesson.slides,
                quiz: lesson.quiz,
            });
        } catch (saveError) {
            // Generation succeeded and coins were charged, but the save failed.
            // Refund so the user isn't charged for a lesson they never received.
            console.error("Lesson save failed after coin deduction:", saveError);

            try {
                await addCoins(
                    req.user.userId,
                    20,
                    "AI Lesson Refund (save failed)"
                );
            } catch (refundError) {
                console.error("Refund also failed:", refundError);
            }

            throw saveError;
        }

        res.json({
            success: true,
            lesson: savedLesson,
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Lesson generation failed",
        });

    }

};
export const getLesson = async (
    req: AuthRequest,
    res: Response
) => {
  try {
    const lesson = await Lesson.findOne({
      _id: req.params.lessonId,
      userId: req.user.userId,
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    res.json({
      success: true,
      lesson,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getMyLessons = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const lessons = await Lesson.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user.userId),
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $lookup: {
          from: "lessonprogresses",
          let: { lessonId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$lessonId", "$$lessonId"] },
                    {
                      $eq: [
                        "$userId",
                        new mongoose.Types.ObjectId(req.user.userId),
                      ],
                    },
                  ],
                },
              },
            },
            { $limit: 1 },
          ],
          as: "progress",
        },
      },
      {
        $addFields: {
          progress: { $first: "$progress" },
        },
      },
      {
        $project: {
          title: 1,
          pdfId: 1,
          slidesCount: { $size: "$slides" },
          quizCount: { $size: "$quiz" },
          createdAt: 1,
          progress: {
            currentSlide: "$progress.currentSlide",
            completed: { $ifNull: ["$progress.completed", false] },
            quizScore: { $ifNull: ["$progress.quizScore", 0] },
          },
        },
      },
    ]);

    res.json({
      success: true,
      lessons,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const askLessonQuestion = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    const lesson = await Lesson.findOne({
      _id: req.params.lessonId,
      userId: req.user.userId,
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    const lessonContext = [
      `Title: ${lesson.title}`,
      ...lesson.slides.map((slide, index) =>
        [
          `Slide ${index + 1}: ${slide.heading}`,
          `Content: ${slide.content.join("; ")}`,
          `Teacher Notes: ${slide.speakerNotes}`,
        ].join("\n")
      ),
      `Quiz: ${lesson.quiz
        .map((item, index) => `${index + 1}. ${item.question} Answer: ${item.answer}`)
        .join("\n")}`,
    ].join("\n\n");

    const answer = await answerLessonQuestion(
      lessonContext,
      question
    );

    res.json({
      success: true,
      answer,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
