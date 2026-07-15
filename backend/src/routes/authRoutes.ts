import { Router } from "express";
import { register, login, getProfile  } from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, getProfile);

router.get("/test", protect, (req, res) => {
  res.json({
    success: true,
    message: "Protected Route Working",
  });
});


export default router;