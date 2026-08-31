import { Router } from "express";

import { protect } from "../middleware/authMiddleware";
import { upload } from "../config/multer";
import {
  uploadPDF,
  getMyPDFs,
  deletePDF,
  chatWithPDF,
  getChatHistory,
  getChatSessions,
  deleteChat,
  renameChat,
  pinChat,
  getPDFDetails,
  createNewChatSession,
  getSuggestedQuestionsForPDF,
} from "../controllers/pdfController";

const router = Router();

// Upload endpoints (support both POST / and POST /upload, and any field name like 'file' or 'pdf')
router.post(
  "/upload",
  protect,
  upload.any(),
  uploadPDF
);

router.post(
  "/",
  protect,
  upload.any(),
  uploadPDF
);

// List PDFs (support both GET / and GET /my-pdfs)
router.get(
  "/",
  protect,
  getMyPDFs
);

router.get(
  "/my-pdfs",
  protect,
  getMyPDFs
);

// Single PDF info and sessions
router.get(
  "/chat/:pdfId",
  protect,
  getPDFDetails
);

router.get(
  "/:pdfId",
  protect,
  getPDFDetails
);

// Suggested questions for a PDF
router.get(
  "/:pdfId/suggested-questions",
  protect,
  getSuggestedQuestionsForPDF
);

router.get(
  "/suggested-questions/:pdfId",
  protect,
  getSuggestedQuestionsForPDF
);

// Create new chat session for a PDF
router.post(
  "/chat/:pdfId/new",
  protect,
  createNewChatSession
);

// Delete PDF
router.delete(
  "/:pdfId",
  protect,
  deletePDF
);

// Chat with PDF
router.post(
  "/chat/:pdfId",
  protect,
  chatWithPDF
);

router.post(
  "/:pdfId/chat",
  protect,
  chatWithPDF
);

// Chat history and sessions
router.get(
  "/chat-history/:pdfId",
  protect,
  getChatHistory
);

router.get(
  "/chats/:pdfId",
  protect,
  getChatSessions
);

// Rename Chat
router.patch(
  "/chat/:chatId/title",
  protect,
  renameChat
);

// Pin / Unpin Chat
router.patch(
  "/chat/:chatId/pin",
  protect,
  pinChat
);

// Delete Chat (Soft Delete)
router.delete(
  "/chat/:chatId",
  protect,
  deleteChat
);

export default router;
