import fs from "fs";
import pdfParse from "pdf-parse";
import mongoose from "mongoose";
import { randomUUID } from "crypto";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDF = require("../models/PDF").default;

import { AuthRequest } from "../middleware/authMiddleware";
import { generateAnswerFromPDF } from "../services/groqService";
import Chat from "../models/Chat";
import Lesson from "../models/Lesson";
import Lecture from "../models/Lecture";
import LessonProgress from "../models/LessonProgress";

const cleanExtractedText = (text: string) =>
  text.replace(/\s+/g, " ").trim();

export const uploadPDF = async (
  req: AuthRequest,
  res: any
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No PDF uploaded",
      });
    }

    const buffer = fs.readFileSync(req.file.path);
    const data = await pdfParse(buffer);
    const extractedText = cleanExtractedText(data.text || "");

    if (!extractedText) {
      return res.status(400).json({
        success: false,
        message:
          "This PDF has no readable text. Please upload a text-based PDF, not a scanned image PDF.",
      });
    }

    const pdf = await PDF.create({
      userId: req.user.userId,
      fileName: req.file.originalname,
      filePath: req.file.path,
      extractedText,
    });

    res.status(201).json({
      success: true,
      pdf,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyPDFs = async (
  req: AuthRequest,
  res: any
) => {
  try {
    const pdfs = await PDF.find({
      userId: req.user.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: pdfs.length,
      pdfs,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deletePDF = async (
  req: AuthRequest,
  res: any
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

    const lessons = await Lesson.find({
      pdfId: pdf._id,
      userId: req.user.userId,
    }).select("_id");
    const lessonIds = lessons.map((lesson) => lesson._id);

    await Promise.all([
      Chat.deleteMany({
        pdfId: pdf._id,
        userId: req.user.userId,
      }),
      LessonProgress.deleteMany({
        lessonId: { $in: lessonIds },
        userId: req.user.userId,
      }),
      Lesson.deleteMany({
        pdfId: pdf._id,
        userId: req.user.userId,
      }),
      Lecture.deleteMany({
        pdfId: pdf._id,
        userId: req.user.userId,
      }),
    ]);

    if (pdf.filePath && fs.existsSync(pdf.filePath)) {
      fs.unlinkSync(pdf.filePath);
    }

    await PDF.deleteOne({
      _id: pdf._id,
      userId: req.user.userId,
    });

    res.json({
      success: true,
      message: "PDF deleted",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const chatWithPDF = async (
  req: AuthRequest,
  res: any
) => {
  try {
    const pdfId = req.params.pdfId as string;
    const { question, chatId } = req.body;

    const pdf = await PDF.findById(pdfId);

    if (!pdf) {
      return res.status(404).json({
        success: false,
        message: "PDF not found",
      });
    }

    if (!pdf.extractedText || pdf.extractedText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "This PDF has no readable text. Please upload a text-based PDF, not a scanned image PDF.",
      });
    }

    const currentChatId = chatId || randomUUID();

    const answer = await generateAnswerFromPDF(
      pdf.extractedText,
      question
    );

    const existingChat = await Chat.findOne({
  chatId: currentChatId,
});

await Chat.create({
  userId: req.user.userId,
  pdfId: pdf._id,
  chatId: currentChatId,

  title: existingChat
    ? existingChat.title
    : question.length > 40
    ? question.substring(0, 40) + "..."
    : question,

  question,
  answer,
});

    res.status(200).json({
      success: true,
      answer,
      chatId: currentChatId,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getChatHistory = async (
  req: AuthRequest,
  res: any
) => {
  try {
    const pdfId = req.params.pdfId as string;
    const chatId = req.query.chatId as string;

    const filter: any = {
      userId: req.user.userId,
      pdfId,
    };

    if (chatId) {
      filter.chatId = chatId;
    }

    const chats = await Chat.find(filter).sort({
      createdAt: 1,
    });

    res.status(200).json({
      success: true,
      chats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getChatSessions = async (
  req: AuthRequest,
  res: any
) => {
  try {
    const pdfId = req.params.pdfId as string;

    const chats = await Chat.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(
            req.user.userId as string
          ),
          pdfId: new mongoose.Types.ObjectId(pdfId),
          isDeleted: false,
        },
      },

      {
        $sort: {
          createdAt: -1,
        },
      },

      {
        $group: {
          _id: "$chatId",

          title: {
            $first: "$title",
          },

          lastMessage: {
            $first: "$question",
          },

          createdAt: {
            $first: "$createdAt",
          },

          pinned: {
            $first: "$pinned",
          },
        },
      },

      {
        $sort: {
          pinned: -1,
          createdAt: -1,
        },
      },
    ]);

    res.json({
      success: true,
      chats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteChat = async (
  req: AuthRequest,
  res: any
) => {
  try {
    const { chatId } = req.params;

    await Chat.updateMany(
      {
        userId: req.user.userId,
        chatId,
      },
      {
        isDeleted: true,
      }
    );

    res.json({
      success: true,
      message: "Chat deleted",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const renameChat = async (
  req: AuthRequest,
  res: any
) => {
  try {
    const { chatId } = req.params;

    const { title } = req.body;

    await Chat.updateMany(
      {
        userId: req.user.userId,
        chatId,
      },
      {
        title,
      }
    );

    res.json({
      success: true,
      message: "Renamed",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const pinChat = async (
  req: AuthRequest,
  res: any
) => {
  try {
    const { chatId } = req.params;

    const firstMessage = await Chat.findOne({
      userId: req.user.userId,
      chatId,
    });

    if (!firstMessage) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    const newValue = !firstMessage.pinned;

    await Chat.updateMany(
      {
        userId: req.user.userId,
        chatId,
      },
      {
        pinned: newValue,
      }
    );

    res.json({
      success: true,
      pinned: newValue,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
