import { Response } from "express";
import fs from "fs";
import mongoose from "mongoose";
import pdfParse from "pdf-parse";
import { AuthRequest } from "../middleware/authMiddleware";
import PDF from "../models/PDF";
import Lecture from "../models/Lecture";
import {
  answerLectureQuestion,
  generateLecturePlan,
} from "../services/lectureService";
import { addCoins, deductCoins, getBalance } from "../services/coinService";

const LECTURE_COST = 30;

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

const buildLectureContext = (lecture: any) =>
  [
    `Title: ${lecture.title}`,
    ...lecture.segments.map((segment: any, index: number) =>
      [
        `Segment ${index + 1}: ${segment.heading}`,
        `Objective: ${segment.objective}`,
        `Script: ${segment.script}`,
        `Recap: ${segment.recap}`,
      ].join("\n")
    ),
  ].join("\n\n");

export const createLecture = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const pdfId = req.params.pdfId as string;

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
        message:
          "This PDF has no readable text for lecture generation. Please upload a text-based PDF.",
      });
    }

    const balance = await getBalance(req.user.userId);

    if (balance < LECTURE_COST) {
      return res.status(400).json({
        success: false,
        message: "Insufficient Coins",
      });
    }

    const lecturePlan = await generateLecturePlan(extractedText);

    await deductCoins(
      req.user.userId,
      LECTURE_COST,
      "AI Video Lecture"
    );

    let lecture;
    try {
      lecture = await Lecture.create({
        userId: new mongoose.Types.ObjectId(req.user.userId),
        pdfId: new mongoose.Types.ObjectId(pdfId),
        title: lecturePlan.title,
        segments: lecturePlan.segments,
        currentSegment: 0,
        status: "paused",
      });
    } catch (saveError) {
      try {
        await addCoins(
          req.user.userId,
          LECTURE_COST,
          "AI Video Lecture Refund (save failed)"
        );
      } catch (refundError) {
        console.error("Lecture refund failed:", refundError);
      }

      throw saveError;
    }

    res.json({
      success: true,
      lecture,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getLecture = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const lecture = await Lecture.findOne({
      _id: req.params.lectureId,
      userId: req.user.userId,
    });

    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found",
      });
    }

    res.json({
      success: true,
      lecture,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateLectureState = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const lecture = await Lecture.findOne({
      _id: req.params.lectureId,
      userId: req.user.userId,
    });

    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found",
      });
    }

    if (typeof req.body.currentSegment === "number") {
      lecture.currentSegment = Math.max(
        0,
        Math.min(req.body.currentSegment, lecture.segments.length - 1)
      );
    }

    if (["teaching", "paused", "completed"].includes(req.body.status)) {
      lecture.status = req.body.status;
    }

    await lecture.save();

    res.json({
      success: true,
      lecture,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const askLectureQuestion = async (
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

    const lecture = await Lecture.findOne({
      _id: req.params.lectureId,
      userId: req.user.userId,
    });

    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found",
      });
    }

    lecture.status = "paused";
    await lecture.save();

    const segment = lecture.segments[lecture.currentSegment];
    const answer = await answerLectureQuestion(
      buildLectureContext(lecture),
      [
        `Heading: ${segment.heading}`,
        `Objective: ${segment.objective}`,
        `Script: ${segment.script}`,
      ].join("\n"),
      question
    );

    res.json({
      success: true,
      answer,
      lecture,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
