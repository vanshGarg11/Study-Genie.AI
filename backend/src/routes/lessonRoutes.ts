import express from "express";
import { protect } from "../middleware/authMiddleware";
import {
  askLessonQuestion,
  createLesson,
  getLesson,
  getMyLessons,
} from "../controllers/lessonController";
import {
  getLessonProgress,
  updateLessonProgress,
} from "../controllers/lessonProgressController";

const router = express.Router();

router.post(
    "/generate/:pdfId",
    protect,
    createLesson
);
router.get(
  "/my-lessons",
  protect,
  getMyLessons
);
router.get(
  "/:lessonId/progress",
  protect,
  getLessonProgress
);
router.post(
  "/:lessonId/ask",
  protect,
  askLessonQuestion
);
router.patch(
  "/:lessonId/progress",
  protect,
  updateLessonProgress
);
router.get(
  "/:lessonId",
  protect,
  getLesson
);

export default router;
