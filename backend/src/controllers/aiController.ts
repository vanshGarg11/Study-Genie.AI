import { Response } from "express";

import { AuthRequest } from "../middleware/authMiddleware";
import { handleCoinDeduction } from "../utils/handleCoinDeduction";
import Note from "../models/Note";

import {
  generateNotes,
  generateQuiz,
  generateFlashcards,
} from "../services/groqService";

export const generateStudyNotes = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { topic } = req.body;

    if (!topic) {
      res.status(400).json({
        success: false,
        message: "Topic is required",
      });
      return;
    }

    const cleanTopic = topic.trim();
    const notes = await generateNotes(cleanTopic);
    const savedNote = await Note.create({
      userId: req.user.userId,
      topic: cleanTopic,
      notes,
    });

    res.status(200).json({
      success: true,
      notes,
      note: savedNote,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getStudyNotes = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const notes = await Note.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .select("topic notes createdAt updatedAt");

    res.status(200).json({
      success: true,
      notes,
      count: notes.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteStudyNote = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { noteId } = req.params;

    const note = await Note.findOneAndDelete({
      _id: noteId,
      userId: req.user.userId,
    });

    if (!note) {
      res.status(404).json({
        success: false,
        message: "Note not found or already deleted",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const generateStudyQuiz = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { topic } = req.body;

    if (!topic) {
      res.status(400).json({
        success: false,
        message: "Topic is required",
      });
      return;
    }

    const success = await handleCoinDeduction(
      req.user.userId,
      3,
      "Quiz Generation",
      res
    );

    if (!success) return;

    const quiz = await generateQuiz(topic);

    res.status(200).json({
      success: true,
      quiz,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const generateStudyFlashcards = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { topic } = req.body;

    if (!topic) {
      res.status(400).json({
        success: false,
        message: "Topic is required",
      });
      return;
    }

    const success = await handleCoinDeduction(
      req.user.userId,
      2,
      "Flashcards Generation",
      res
    );

    if (!success) return;

    const flashcards = await generateFlashcards(topic);

    res.status(200).json({
      success: true,
      flashcards,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
