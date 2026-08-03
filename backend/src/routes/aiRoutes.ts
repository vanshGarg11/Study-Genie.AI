import { Router } from "express";

import { protect } from "../middleware/authMiddleware";
import {
  generateStudyNotes,
  generateStudyQuiz,
  generateStudyFlashcards,
  getStudyNotes,
} from "../controllers/aiController";

const router = Router();

router.post(
  "/notes",
  protect,
  generateStudyNotes
);
router.get(
  "/notes",
  protect,
  getStudyNotes
);
router.post(
  "/quiz",
  protect,
  generateStudyQuiz
);
router.post(
  "/flashcards",
  protect,
  generateStudyFlashcards
);
export default router;
