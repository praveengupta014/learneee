import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true, index: true },
    grade: { type: String, required: true, trim: true, index: true }, // e.g. "Grade 5"
    teacher: { type: String, required: true, trim: true },
    teacherRating: { type: Number, required: true, min: 0, max: 5, index: true },
    price: { type: Number, required: true, min: 0, index: true },
    description: { type: String, trim: true },
    thumbnail: { type: String, default: "" },
  },
  { timestamps: true }
);

// Compound + text indexes: search/filter/sort are the hot path for this
// app, so indexes are placed on every field used in a query or sort.
courseSchema.index({ name: "text", subject: "text", teacher: "text" });
courseSchema.index({ subject: 1, grade: 1, price: 1 });
courseSchema.index({ teacherRating: -1 });

export default mongoose.model("Course", courseSchema);
