import express from "express";
import { getCourses, getCourseMeta } from "../controllers/courseController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Course search sits behind the dashboard, so it's protected like the
// rest of the parent-only area.
router.get("/", protect, getCourses);
router.get("/meta", protect, getCourseMeta);

export default router;
