import express from "express";
import {
  getCourses,
  getCourseMeta,
  getCourseById,
  bookCourse,
  getMyBookings,
  cancelBooking,
  seedCourses,
} from "../controllers/courseController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public / Protected Course Routes
router.get("/", protect, getCourses);
router.get("/meta", protect, getCourseMeta);
router.get("/my-bookings", protect, getMyBookings);
router.delete("/bookings/:id", protect, cancelBooking);
router.post("/seed", seedCourses);
router.get("/:id", protect, getCourseById);
router.post("/:id/book", protect, bookCourse);

export default router;

