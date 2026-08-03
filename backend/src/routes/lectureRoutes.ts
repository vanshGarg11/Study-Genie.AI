import express from "express";
import { protect } from "../middleware/authMiddleware";
import {
  askLectureQuestion,
  createLecture,
  getLecture,
  updateLectureState,
} from "../controllers/lectureController";

const router = express.Router();

router.post("/generate/:pdfId", protect, createLecture);
router.get("/:lectureId", protect, getLecture);
router.patch("/:lectureId/state", protect, updateLectureState);
router.post("/:lectureId/ask", protect, askLectureQuestion);

export default router;
