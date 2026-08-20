import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";

const BookCourseModal = ({ course, onClose, onBookingSuccess }) => {
  const { user, showToast } = useAuth();
  const [form, setForm] = useState({
    childName: user?.childName || "",
    childGrade: user?.childGrade || course?.grade || "",
    slot: course?.availableSlots?.[0] || course?.schedule || "Standard Batch",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!course) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.childName.trim()) {
      setError("Please enter your child's name.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post(`/courses/${course._id}/book`, form);
      showToast(res.data.message || `Successfully enrolled ${form.childName}!`, "success");
      if (onBookingSuccess) onBookingSuccess(res.data.booking);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to book this course. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative bg-white border border-line rounded-card w-full max-w-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-8 w-16 h-2 bg-sage rounded-b-sm" />

        {/* Header */}
        <div className="p-6 pb-4 border-b border-line flex items-start justify-between gap-4 pt-8">
          <div>
            <span className="text-xs font-mono uppercase tracking-wide text-sage font-semibold">
              Enrollment Form
            </span>
            <h2 className="font-display text-xl font-semibold text-ink mt-0.5">
              Book {course.name}
            </h2>
            <p className="text-xs text-slate mt-1">
              Instructor: <span className="font-medium text-ink">{course.teacher}</span> • {course.grade}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-paper hover:bg-line/60 flex items-center justify-center text-slate hover:text-ink transition text-lg"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="text-sm text-coral bg-coral/10 border border-coral/30 rounded-md px-3.5 py-2.5">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">
                Child's Name <span className="text-coral">*</span>
              </label>
              <input
                required
                value={form.childName}
                onChange={(e) => setForm({ ...form, childName: e.target.value })}
                placeholder="e.g. Aarav"
                className="w-full rounded-md border border-line px-3 py-2 text-sm text-ink focus:border-sage outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">
                Child's Grade
              </label>
              <input
                value={form.childGrade}
                onChange={(e) => setForm({ ...form, childGrade: e.target.value })}
                placeholder="e.g. Grade 5"
                className="w-full rounded-md border border-line px-3 py-2 text-sm text-ink focus:border-sage outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">
              Select Batch / Time Slot
            </label>
            <select
              value={form.slot}
              onChange={(e) => setForm({ ...form, slot: e.target.value })}
              className="w-full rounded-md border border-line px-3 py-2.5 text-sm bg-white focus:border-sage outline-none text-ink"
            >
              {course.availableSlots && course.availableSlots.length > 0 ? (
                course.availableSlots.map((s, idx) => (
                  <option key={idx} value={s}>
                    {s}
                  </option>
                ))
              ) : (
                <option value={course.schedule}>{course.schedule || "Regular Live Batch"}</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">
              Special Notes / Learning Goals (Optional)
            </label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="e.g. Beginner in coding, wants to focus on logic games..."
              className="w-full rounded-md border border-line px-3 py-2 text-sm text-ink focus:border-sage outline-none resize-none"
            />
          </div>

          <div className="bg-paper p-3.5 rounded-lg border border-line flex items-center justify-between">
            <div>
              <p className="text-xs font-mono text-slate uppercase">Total Enrollment Fee</p>
              <p className="text-xs text-slate">Includes all materials & live sessions</p>
            </div>
            <p className="font-mono text-xl font-bold text-ink">₹{course.price?.toLocaleString("en-IN")}</p>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 text-sm font-medium border border-line bg-white hover:bg-paper py-2.5 rounded-md text-slate transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 text-sm font-medium bg-sage text-white py-2.5 rounded-md hover:bg-sage/90 transition shadow-sm disabled:opacity-60"
            >
              {submitting ? "Confirming…" : "Confirm Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookCourseModal;
