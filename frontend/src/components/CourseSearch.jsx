import { useEffect, useState, useCallback, useRef } from "react";
import api from "../api/axios.js";
import Filters from "./Filters.jsx";
import CourseCard from "./CourseCard.jsx";
import Pagination from "./Pagination.jsx";
import CourseDetailModal from "./CourseDetailModal.jsx";
import BookCourseModal from "./BookCourseModal.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const emptyFilters = {
  q: "",
  grade: "",
  subject: "",
  minPrice: "",
  maxPrice: "",
  minRating: "",
  sortBy: "newest",
  page: 1,
};

const CourseSearch = ({ onBookingUpdated }) => {
  const { showToast } = useAuth();
  const [meta, setMeta] = useState({ subjects: [], grades: [] });
  const [filters, setFilters] = useState(emptyFilters);
  const [searchInput, setSearchInput] = useState("");
  const [courses, setCourses] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState("");

  // Modals state
  const [selectedCourseForDetails, setSelectedCourseForDetails] = useState(null);
  const [selectedCourseForBooking, setSelectedCourseForBooking] = useState(null);

  const requestIdRef = useRef(0);

  const loadMeta = useCallback(() => {
    api.get("/courses/meta").then((res) => setMeta(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  // Debounce free-text search
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((f) => ({ ...f, q: searchInput, page: 1 }));
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchCourses = useCallback(async (append = false) => {
    const thisRequestId = ++requestIdRef.current;
    append ? setLoadingMore(true) : setLoading(true);
    setError("");
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== "" && v !== null)
      );
      const res = await api.get("/courses", { params });

      if (thisRequestId !== requestIdRef.current) return;

      setCourses((prev) => {
        if (!append) return res.data.courses;
        const seen = new Set(prev.map((c) => c._id));
        const deduped = res.data.courses.filter((c) => !seen.has(c._id));
        return [...prev, ...deduped];
      });
      setPagination(res.data.pagination);
    } catch (err) {
      if (thisRequestId !== requestIdRef.current) return;
      setError("Couldn't load courses right now. Please check your connection.");
    } finally {
      if (thisRequestId === requestIdRef.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [filters]);

  useEffect(() => {
    fetchCourses(filters.page > 1);
  }, [filters, fetchCourses]);

  const handleLoadMore = () => {
    setFilters((f) => ({ ...f, page: f.page + 1 }));
  };

  const handleReset = () => {
    setSearchInput("");
    setFilters(emptyFilters);
  };

  const handleQuickSubject = (subj) => {
    setFilters((f) => ({
      ...f,
      subject: f.subject === subj ? "" : subj,
      page: 1,
    }));
  };

  const handleSeedCourses = async () => {
    setSeeding(true);
    try {
      const res = await api.post("/courses/seed?force=true");
      showToast(res.data.message || "Sample courses populated!", "success");
      loadMeta();
      fetchCourses(false);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to load sample courses.", "error");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink">Find a course</h2>
          <p className="text-slate text-sm mt-1">
            Search by name, subject, or teacher, and book interactive live batches.
          </p>
        </div>
      </div>

      {/* Quick Subject Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
        <button
          onClick={() => handleQuickSubject("")}
          className={`text-xs font-mono px-3.5 py-1.5 rounded-full border transition whitespace-nowrap ${
            filters.subject === ""
              ? "bg-indigo text-paper border-indigo font-semibold shadow-sm"
              : "bg-white text-slate border-line hover:border-sage hover:text-ink"
          }`}
        >
          All Subjects
        </button>
        {["Mathematics", "Coding", "Science", "English", "Art", "Music"].map((subj) => (
          <button
            key={subj}
            onClick={() => handleQuickSubject(subj)}
            className={`text-xs font-mono px-3.5 py-1.5 rounded-full border transition whitespace-nowrap ${
              filters.subject.toLowerCase() === subj.toLowerCase()
                ? "bg-indigo text-paper border-indigo font-semibold shadow-sm"
                : "bg-white text-slate border-line hover:border-sage hover:text-ink"
            }`}
          >
            {subj}
          </button>
        ))}
      </div>

      {/* Search Bar & Sort Dropdown */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search course name, subject, or instructor…"
            className="w-full rounded-md border border-line px-4 py-3 text-sm bg-white focus:border-sage outline-none"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate hover:text-ink"
            >
              ✕
            </button>
          )}
        </div>
        <select
          value={filters.sortBy}
          onChange={(e) => setFilters((f) => ({ ...f, sortBy: e.target.value, page: 1 }))}
          className="rounded-md border border-line px-4 py-3 text-sm bg-white focus:border-sage outline-none md:w-56"
        >
          <option value="newest">Newest first</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
          <option value="rating_desc">Teacher rating</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Filters */}
        <div className="md:col-span-1">
          <Filters meta={meta} filters={filters} setFilters={setFilters} onReset={handleReset} />
        </div>

        {/* Results Area */}
        <div className="md:col-span-3">
          {error && (
            <div className="text-sm text-coral bg-coral/10 border border-coral/30 rounded-md px-4 py-3 mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="h-60 rounded-card bg-white border border-line animate-pulse" />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center bg-white border border-dashed border-line rounded-card py-16 px-6">
              <p className="font-display text-lg font-semibold text-ink mb-1">No courses match yet</p>
              <p className="text-slate text-sm mb-5 max-w-md mx-auto">
                Try widening your price range, clearing your search query, or loading sample course data.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleReset}
                  className="text-xs font-medium border border-line bg-paper text-ink rounded-md px-4 py-2.5 hover:bg-line/60 transition"
                >
                  Clear all filters
                </button>
                <button
                  onClick={handleSeedCourses}
                  disabled={seeding}
                  className="text-xs font-medium bg-indigo text-paper rounded-md px-4 py-2.5 hover:bg-ink transition shadow-sm disabled:opacity-60"
                >
                  {seeding ? "Loading courses…" : "⚡ Populate Sample Courses"}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-mono text-slate">
                  {pagination?.total} course{pagination?.total === 1 ? "" : "s"} found
                </p>
                {filters.subject && (
                  <span className="text-xs font-mono bg-paper border border-line px-2 py-0.5 rounded text-slate">
                    Filtered by: {filters.subject}
                  </span>
                )}
              </div>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {courses.map((c) => (
                  <CourseCard
                    key={c._id}
                    course={c}
                    onViewDetails={(course) => setSelectedCourseForDetails(course)}
                    onBook={(course) => setSelectedCourseForBooking(course)}
                  />
                ))}
              </div>
              <Pagination pagination={pagination} onLoadMore={handleLoadMore} loadingMore={loadingMore} />
            </>
          )}
        </div>
      </div>

      {/* Course Detail Modal */}
      {selectedCourseForDetails && (
        <CourseDetailModal
          course={selectedCourseForDetails}
          onClose={() => setSelectedCourseForDetails(null)}
          onBook={(course) => {
            setSelectedCourseForDetails(null);
            setSelectedCourseForBooking(course);
          }}
        />
      )}

      {/* Book Course Modal */}
      {selectedCourseForBooking && (
        <BookCourseModal
          course={selectedCourseForBooking}
          onClose={() => setSelectedCourseForBooking(null)}
          onBookingSuccess={(booking) => {
            if (onBookingUpdated) onBookingUpdated(booking);
          }}
        />
      )}
    </section>
  );
};

export default CourseSearch;

