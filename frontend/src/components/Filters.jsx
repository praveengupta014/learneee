const Filters = ({ meta, filters, setFilters, onReset }) => {
  const update = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.value, page: 1 }));

  return (
    <div className="bg-white border border-line rounded-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-sm font-semibold text-ink uppercase tracking-wide">Filters</h2>
        <button onClick={onReset} className="text-xs font-mono text-slate hover:text-coral transition">
          Reset
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">Grade</label>
          <select
            value={filters.grade}
            onChange={update("grade")}
            className="w-full rounded-md border border-line px-3 py-2 text-sm bg-white focus:border-sage outline-none"
          >
            <option value="">All grades</option>
            {meta.grades.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">Subject</label>
          <select
            value={filters.subject}
            onChange={update("subject")}
            className="w-full rounded-md border border-line px-3 py-2 text-sm bg-white focus:border-sage outline-none"
          >
            <option value="">All subjects</option>
            {meta.subjects.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">Price range (₹)</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              placeholder="Min"
              value={filters.minPrice}
              onChange={update("minPrice")}
              className="w-1/2 rounded-md border border-line px-3 py-2 text-sm focus:border-sage outline-none"
            />
            <span className="text-slate text-sm">–</span>
            <input
              type="number"
              min="0"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={update("maxPrice")}
              className="w-1/2 rounded-md border border-line px-3 py-2 text-sm focus:border-sage outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">
            Min. teacher rating
          </label>
          <select
            value={filters.minRating}
            onChange={update("minRating")}
            className="w-full rounded-md border border-line px-3 py-2 text-sm bg-white focus:border-sage outline-none"
          >
            <option value="">Any rating</option>
            <option value="3">3.0+</option>
            <option value="3.5">3.5+</option>
            <option value="4">4.0+</option>
            <option value="4.5">4.5+</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Filters;
