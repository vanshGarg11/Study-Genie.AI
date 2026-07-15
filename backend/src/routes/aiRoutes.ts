import { Router } from "express";

import { protect } from "../middleware/authMiddleware";
import { generateStudyNotes,generateStudyQuiz,generateStudyFlashcards } from "../controllers/aiController";

const router = Router();

router.post(
  "/notes",
  protect,
  generateStudyNotes
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