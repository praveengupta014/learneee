import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import Navbar from "../components/Navbar.jsx";
import CourseSearch from "../components/CourseSearch.jsx";
import EditProfileModal from "../components/EditProfileModal.jsx";
import MyBookingsModal from "../components/MyBookingsModal.jsx";
import Toast from "../components/Toast.jsx";
import api from "../api/axios.js";

const Dashboard = () => {
  const { user } = useAuth();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isBookingsOpen, setIsBookingsOpen] = useState(false);
  const [bookingCount, setBookingCount] = useState(0);

  const fetchBookingCount = useCallback(async () => {
    try {
      const res = await api.get("/courses/my-bookings");
      const active = (res.data.bookings || []).filter((b) => b.status === "confirmed");
      setBookingCount(active.length);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchBookingCount();
  }, [fetchBookingCount]);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <Navbar
        onOpenBookings={() => setIsBookingsOpen(true)}
        onOpenProfile={() => setIsEditProfileOpen(true)}
        bookingCount={bookingCount}
      />

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1">
        {/* Report-card style header */}
        <div className="relative bg-white border border-line rounded-card p-5 sm:p-6 mb-8 shadow-sm overflow-hidden">
          <div className="absolute top-0 left-6 w-12 h-1.5 bg-indigo rounded-b-sm" />

          <div className="flex items-center justify-between gap-2 mb-3">
            <p className="text-xs font-mono uppercase tracking-wide text-slate">{today}</p>
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="text-xs font-mono text-sage hover:underline flex items-center gap-1"
            >
              ✎ Edit Child Details
            </button>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink">
                Welcome, {user?.name?.split(" ")[0] || "Parent"}
              </h1>
              <p className="text-slate text-sm mt-1">
                Explore curated, high-impact live courses tailored for your child.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 bg-paper/60 p-3.5 sm:p-4 rounded-lg border border-line/70">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wide text-slate">Child</p>
                <p className="text-sm font-semibold text-ink truncate">{user?.childName || "Not set"}</p>
              </div>
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wide text-slate">Grade</p>
                <p className="text-sm font-semibold text-ink truncate">{user?.childGrade || "Not set"}</p>
              </div>
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wide text-slate">Account</p>
                <p className="text-sm font-medium text-ink truncate max-w-[140px]" title={user?.email}>
                  {user?.email}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wide text-slate">Enrolled</p>
                <button
                  onClick={() => setIsBookingsOpen(true)}
                  className="text-sm font-semibold text-indigo hover:text-sage transition flex items-center gap-1"
                >
                  <span>{bookingCount} {bookingCount === 1 ? "Course" : "Courses"}</span>
                  <span className="text-xs">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Course Search & Filter Section */}
        <CourseSearch onBookingUpdated={fetchBookingCount} />
      </main>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />

      {/* My Bookings Modal */}
      <MyBookingsModal
        isOpen={isBookingsOpen}
        onClose={() => {
          setIsBookingsOpen(false);
          fetchBookingCount();
        }}
      />

      {/* Toast Notification Container */}
      <Toast />
    </div>
  );
};

export default Dashboard;

