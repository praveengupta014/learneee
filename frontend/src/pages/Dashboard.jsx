import { useAuth } from "../context/AuthContext.jsx";
import Navbar from "../components/Navbar.jsx";
import CourseSearch from "../components/CourseSearch.jsx";

const Dashboard = () => {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Report-card style header: labeled fields, not a generic hero banner */}
        <div className="relative bg-white border border-line rounded-card p-6 mb-8 overflow-hidden">
          <div className="absolute top-0 left-6 w-9 h-1.5 bg-indigo rounded-b-sm" />
          <p className="text-xs font-mono uppercase tracking-wide text-slate mb-3">{today}</p>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-semibold text-ink">
                Welcome, {user?.name?.split(" ")[0]}
              </h1>
              <p className="text-slate text-sm mt-1">
                Here's your account, and courses matched to your child below.
              </p>
            </div>
            <div className="flex gap-6">
              <div>
                <p className="text-xs font-mono uppercase tracking-wide text-slate">Child</p>
                <p className="text-sm font-medium text-ink">{user?.childName || "Not set"}</p>
              </div>
              <div>
                <p className="text-xs font-mono uppercase tracking-wide text-slate">Grade</p>
                <p className="text-sm font-medium text-ink">{user?.childGrade || "Not set"}</p>
              </div>
              <div>
                <p className="text-xs font-mono uppercase tracking-wide text-slate">Account</p>
                <p className="text-sm font-medium text-ink truncate max-w-[160px]">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        <CourseSearch />
      </main>
    </div>
  );
};

export default Dashboard;
