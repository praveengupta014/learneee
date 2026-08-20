import { useState, useEffect, useCallback } from "react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

const MyBookingsModal = ({ isOpen, onClose, onBrowse }) => {
  const { showToast } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/courses/my-bookings");
      setBookings(res.data.bookings || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchBookings();
    }
  }, [isOpen, fetchBookings]);

  if (!isOpen) return null;

  const handleCancel = async (bookingId, courseName) => {
    if (!window.confirm(`Are you sure you want to cancel enrollment in "${courseName}"?`)) {
      return;
    }

    setCancellingId(bookingId);
    try {
      await api.delete(`/courses/bookings/${bookingId}`);
      showToast("Booking cancelled.", "info");
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: "cancelled" } : b))
      );
    } catch (err) {
      showToast(err.response?.data?.message || "Could not cancel booking", "error");
    } finally {
      setCancellingId(null);
    }
  };

  const activeBookings = bookings.filter((b) => b.status === "confirmed");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative bg-white border border-line rounded-card w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-8 w-16 h-2 bg-indigo rounded-b-sm" />

        {/* Header */}
        <div className="p-6 pb-4 border-b border-line flex items-center justify-between gap-4 pt-8">
          <div>
            <span className="text-xs font-mono uppercase tracking-wide text-indigo font-semibold">
              Parent Dashboard
            </span>
            <h2 className="font-display text-xl font-semibold text-ink">
              My Enrolled Courses ({activeBookings.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-paper hover:bg-line/60 flex items-center justify-center text-slate hover:text-ink transition text-lg"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-28 bg-paper border border-line rounded-lg animate-pulse" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12 px-4 bg-paper/50 rounded-lg border border-dashed border-line">
              <span className="text-3xl mb-2 block">📚</span>
              <h3 className="font-display text-base font-semibold text-ink">No courses booked yet</h3>
              <p className="text-slate text-xs mt-1 mb-4">
                Explore our catalog of math, science, coding, and arts courses for your child.
              </p>
              <button
                onClick={() => {
                  onClose();
                  if (onBrowse) onBrowse();
                }}
                className="text-xs font-medium bg-indigo text-paper px-4 py-2 rounded-md hover:bg-ink transition"
              >
                Browse Courses
              </button>
            </div>
          ) : (
            bookings.map((booking) => {
              const course = booking.course || {};
              const isCancelled = booking.status === "cancelled";

              return (
                <div
                  key={booking._id}
                  className={`p-4 rounded-lg border transition ${
                    isCancelled
                      ? "bg-paper/60 border-line opacity-70"
                      : "bg-white border-line hover:border-sage/40 shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono uppercase text-slate font-semibold">
                          {course.subject || "Course"}
                        </span>
                        <span
                          className={`text-xs font-mono px-2 py-0.5 rounded-full border ${
                            isCancelled
                              ? "bg-coral/10 text-coral border-coral/30"
                              : "bg-sage/10 text-sage border-sage/30"
                          }`}
                        >
                          {isCancelled ? "Cancelled" : "Confirmed"}
                        </span>
                      </div>
                      <h4 className="font-display text-base font-semibold text-ink">
                        {course.name || "Course Session"}
                      </h4>
                    </div>

                    <p className="font-mono text-sm font-semibold text-ink">
                      ₹{booking.amountPaid?.toLocaleString("en-IN") || course.price?.toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-2 text-xs text-slate bg-paper/70 p-2.5 rounded-md border border-line/60">
                    <div>
                      <span className="font-mono uppercase text-[10px] text-slate/80 block">Enrolled For</span>
                      <span className="font-medium text-ink">{booking.childName} ({booking.childGrade || "Grade N/A"})</span>
                    </div>
                    <div>
                      <span className="font-mono uppercase text-[10px] text-slate/80 block">Teacher</span>
                      <span className="font-medium text-ink">{course.teacher || "Instructor"}</span>
                    </div>
                    <div>
                      <span className="font-mono uppercase text-[10px] text-slate/80 block">Slot</span>
                      <span className="font-medium text-ink truncate block">{booking.slot || "Regular"}</span>
                    </div>
                  </div>

                  {!isCancelled && (
                    <div className="flex justify-end gap-3 mt-3 pt-2 border-t border-line/40">
                      <button
                        onClick={() => handleCancel(booking._id, course.name)}
                        disabled={cancellingId === booking._id}
                        className="text-xs font-mono text-slate hover:text-coral transition"
                      >
                        {cancellingId === booking._id ? "Cancelling…" : "Cancel Enrollment"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-line bg-paper/30 flex justify-end">
          <button
            onClick={onClose}
            className="text-sm font-medium border border-line bg-white hover:bg-paper px-5 py-2 rounded-md text-ink transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyBookingsModal;
