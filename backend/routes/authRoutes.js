import express from "express";
import rateLimit from "express-rate-limit";
import { signup, login, getMe, updateProfile } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Tighter rate limit on auth routes specifically -- protects against
// credential-stuffing / brute force independent of the general API limiter.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: "Too many attempts, please try again later." },
});

router.post("/signup", authLimiter, signup);
router.post("/login", authLimiter, login);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);

export default router;

