import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true, index: true },
    grade: { type: String, required: true, trim: true, index: true }, // e.g. "Grade 3-5"
    teacher: { type: String, required: true, trim: true },
    teacherRating: { type: Number, required: true, min: 0, max: 5, index: true },
    price: { type: Number, required: true, min: 0, index: true },
    description: { type: String, trim: true },
    thumbnail: { type: String, default: "" },
    duration: { type: String, default: "4 Weeks (8 Live Classes)" },
    schedule: { type: String, default: "Tue & Thu, 5:00 PM - 6:00 PM IST" },
    availableSlots: {
      type: [String],
      default: [
        "Mon & Wed: 4:00 PM - 5:00 PM",
        "Tue & Thu: 5:00 PM - 6:00 PM",
        "Sat & Sun: 11:00 AM - 12:00 PM",
      ],
    },
    highlights: {
      type: [String],
      default: [
        "1-on-1 personalized doubt solving",
        "Interactive live coding & exercises",
        "Weekly homework & progress report",
        "Certificate upon course completion",
      ],
    },
    syllabus: {
      type: [
        {
          week: { type: String },
          topic: { type: String },
          detail: { type: String },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

// Compound indexes for high-speed queries
courseSchema.index({ name: "text", subject: "text", teacher: "text", description: "text" });
courseSchema.index({ subject: 1, grade: 1, price: 1 });
courseSchema.index({ teacherRating: -1 });

export default mongoose.model("Course", courseSchema);

