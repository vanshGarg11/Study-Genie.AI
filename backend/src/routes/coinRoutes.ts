import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import { getCoinBalance,getCoinHistory } from "../controllers/coinController";

const router = Router();

router.get("/balance", protect, getCoinBalance);
router.get("/history", protect, getCoinHistory);

export default router;