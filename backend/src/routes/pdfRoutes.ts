import { Router } from "express";

import { protect } from "../middleware/authMiddleware";
import { upload } from "../config/multer";
import { uploadPDF } from "../controllers/pdfController";
import { getMyPDFs } from "../controllers/pdfController";

const router = Router();

router.post(
  "/upload",
  (req, res, next) => {
    console.log("Route hit");
    next();
    
  },
  protect,
  upload.single("pdf"),
  
  uploadPDF
);
router.get(
  "/my-pdfs",
  protect,
  getMyPDFs
);
export default router;

