import { Response } from "express";
import Lesson from "../models/Lesson";
import LessonProgress from "../models/LessonProgress";
import { AuthRequest } from "../middleware/authMiddleware";

export const getLessonProgress = async (
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

    const progress = await LessonProgress.findOne({
      lessonId: req.params.lessonId,
      userId: req.user.userId,
    });

    res.json({
      success: true,
      progress: progress || {
        lessonId: req.params.lessonId,
        currentSlide: 0,
        completed: false,
        quizScore: 0,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateLessonProgress = async (
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

    const currentSlide =
      typeof req.body.currentSlide === "number"
        ? Math.max(
            0,
            Math.min(req.body.currentSlide, lesson.slides.length - 1)
          )
        : undefined;

    const update: {
      currentSlide?: number;
      completed?: boolean;
      quizScore?: number;
    } = {};

    if (currentSlide !== undefined) {
      update.currentSlide = currentSlide;
    }

    if (typeof req.body.completed === "boolean") {
      update.completed = req.body.completed;
    }

    if (typeof req.body.quizScore === "number") {
      update.quizScore = Math.max(0, req.body.quizScore);
    }

    const progress = await LessonProgress.findOneAndUpdate(
      {
        lessonId: req.params.lessonId,
        userId: req.user.userId,
      },
      {
        $set: update,
        $setOnInsert: {
          lessonId: req.params.lessonId,
          userId: req.user.userId,
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    res.json({
      success: true,
      progress,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
