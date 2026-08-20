import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    childName: {
      type: String,
      required: true,
      trim: true,
    },
    childGrade: {
      type: String,
      required: true,
      trim: true,
    },
    parentEmail: {
      type: String,
      required: true,
      trim: true,
    },
    slot: {
      type: String,
      default: "Standard Batch (Tue & Thu, 5:00 PM)",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["confirmed", "pending", "cancelled"],
      default: "confirmed",
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Prevent duplicate active booking of the same course for the same child
bookingSchema.index({ user: 1, course: 1, childName: 1, status: 1 });

export default mongoose.model("Booking", bookingSchema);
