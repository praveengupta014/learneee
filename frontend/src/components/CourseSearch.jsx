import { useEffect, useState, useCallback, useRef } from "react";
import api from "../api/axios.js";
import Filters from "./Filters.jsx";
import CourseCard from "./CourseCard.jsx";
import Pagination from "./Pagination.jsx";

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

const CourseSearch = () => {
  const [meta, setMeta] = useState({ subjects: [], grades: [] });
  const [filters, setFilters] = useState(emptyFilters);
  const [searchInput, setSearchInput] = useState("");
  const [courses, setCourses] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  // Guards against React 18 Strict Mode's dev-only double effect invocation
  // (and any genuine race between overlapping requests) so the same page
  // of results can never be appended twice.
  const requestIdRef = useRef(0);

  useEffect(() => {
    api.get("/courses/meta").then((res) => setMeta(res.data)).catch(() => {});
  }, []);

  // Debounce the free-text search so we don't fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((f) => ({ ...f, q: searchInput, page: 1 }));
    }, 400);
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

      // If a newer request has started since this one went out (Strict
      // Mode's double-invoke, or the user changed filters mid-flight),
      // drop this stale response instead of applying it.
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
      setError("Couldn't load courses right now. Please try again.");
    } finally {
      if (thisRequestId === requestIdRef.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Refetch from page 1 whenever a filter/sort/search value changes.
  useEffect(() => {
    fetchCourses(filters.page > 1 ? true : false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleLoadMore = () => {
    setFilters((f) => ({ ...f, page: f.page + 1 }));
  };

  const handleReset = () => {
    setSearchInput("");
    setFilters(emptyFilters);
  };

  return (
    <section>
      <div className="mb-6">
        <h2 className="font-display text-2xl font-semibold text-ink">Find a course</h2>
        <p className="text-slate text-sm mt-1">
          Search by name or subject, then narrow down with filters on the left.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search course name or subject…"
            className="w-full rounded-md border border-line px-4 py-3 text-sm bg-white focus:border-sage outline-none"
          />
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
        <div className="md:col-span-1">
          <Filters meta={meta} filters={filters} setFilters={setFilters} onReset={handleReset} />
        </div>

        <div className="md:col-span-3">
          {error && (
            <div className="text-sm text-coral bg-coral/10 border border-coral/30 rounded-md px-4 py-3 mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="h-52 rounded-card bg-white border border-line animate-pulse" />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center bg-white border border-dashed border-line rounded-card py-16 px-6">
              <p className="font-display text-lg font-semibold text-ink mb-1">No courses match yet</p>
              <p className="text-slate text-sm mb-4">
                Try widening your price range, clearing a filter, or searching a different subject.
              </p>
              <button
                onClick={handleReset}
                className="text-sm font-medium bg-indigo text-paper rounded-md px-5 py-2.5 hover:bg-ink transition"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <p className="text-xs font-mono text-slate mb-3">
                {pagination?.total} course{pagination?.total === 1 ? "" : "s"} found
              </p>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {courses.map((c) => (
                  <CourseCard key={c._id} course={c} />
                ))}
              </div>
              <Pagination pagination={pagination} onLoadMore={handleLoadMore} loadingMore={loadingMore} />
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default CourseSearch;
