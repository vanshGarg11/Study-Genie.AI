import { Router } from "express";
import { protect } from "../middleware/authMiddleware";

import {
  createOrder,
  verifyPayment,
  getPaymentHistory,
  getPaymentById,
} from "../controllers/paymentController";

const router = Router();

router.post("/create-order", protect, createOrder);
router.post("/verify", protect, verifyPayment);
router.get("/history", protect, getPaymentHistory);
router.get("/history/:paymentId", protect, getPaymentById);

export default router;