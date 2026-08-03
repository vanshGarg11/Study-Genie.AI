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
} from "../controllers/pdfController";


const router = Router();

router.post(
  "/upload",
  protect,
  upload.single("pdf"),
  uploadPDF
);

router.get(
  "/my-pdfs",
  protect,
  getMyPDFs
);

router.delete(
  "/:pdfId",
  protect,
  deletePDF
);


router.post(
  "/chat/:pdfId",
  protect,
  chatWithPDF
);
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


