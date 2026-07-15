import { Response } from "express";

import { AuthRequest } from "../middleware/authMiddleware";
import { deductCoins } from "../services/coinService";
import { generateNotes } from "../services/geminiService";
import { generateFlashcards } from "../services/geminiService";
import { generateQuiz } from "../services/geminiService";

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

    await deductCoins(
      req.user.userId,
      5,
      "Notes Generation"
    );

    const notes = await generateNotes(topic);

    res.status(200).json({
      success: true,
      notes,
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

    await deductCoins(
      req.user.userId,
      3,
      "Quiz Generation"
    );

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

    await deductCoins(
      req.user.userId,
      2,
      "Flashcards Generation"
    );

    const flashcards =
      await generateFlashcards(topic);

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