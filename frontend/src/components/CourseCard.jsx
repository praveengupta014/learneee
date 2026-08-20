const subjectColor = {
  Mathematics: "bg-indigo",
  Science: "bg-sage",
  English: "bg-amber",
  Coding: "bg-ink",
  Art: "bg-coral",
  Music: "bg-sage",
};

const RatingMeter = ({ value = 5 }) => (
  <div className="flex items-center gap-1" aria-label={`Rated ${value} out of 5`}>
    {Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`w-1.5 h-3.5 rounded-sm ${i < Math.round(value) ? "bg-amber" : "bg-line"}`}
      />
    ))}
    <span className="text-xs font-mono text-slate ml-1">{(value || 5).toFixed(1)}</span>
  </div>
);

const CourseCard = ({ course, onViewDetails, onBook }) => {
  const tab = subjectColor[course.subject] || "bg-indigo";

  return (
    <div className="relative bg-white border border-line rounded-card p-5 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition group">
      <div className={`absolute top-0 left-6 w-9 h-1.5 rounded-b-sm ${tab}`} />

      <div className="flex items-start justify-between gap-2 pt-1">
        <span className="text-xs font-mono uppercase tracking-wide text-slate">{course.subject}</span>
        <span className="text-xs font-mono bg-paper border border-line rounded px-2 py-0.5 text-slate">
          {course.grade}
        </span>
      </div>

      <div className="cursor-pointer" onClick={() => onViewDetails && onViewDetails(course)}>
        <h3 className="font-display text-lg font-semibold text-ink leading-snug group-hover:text-sage transition">
          {course.name}
        </h3>
        <p className="text-sm text-slate line-clamp-2 mt-1">{course.description}</p>
      </div>

      {course.duration && (
        <div className="flex items-center gap-2 text-xs text-slate font-mono">
          <span>⏱️ {course.duration}</span>
        </div>
      )}

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-line">
        <div>
          <p className="text-[11px] text-slate font-mono uppercase">Teacher</p>
          <p className="text-sm font-medium text-ink">{course.teacher}</p>
        </div>
        <RatingMeter value={course.teacherRating} />
      </div>

      <div className="flex items-center justify-between gap-2 pt-1">
        <div>
          <p className="text-[10px] text-slate font-mono uppercase">Total Fee</p>
          <span className="font-mono text-lg font-bold text-ink">
            ₹{course.price?.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails && onViewDetails(course)}
            className="text-xs font-medium border border-line bg-paper hover:bg-line/60 text-ink rounded-md px-3 py-2 transition"
          >
            Details
          </button>
          <button
            onClick={() => onBook && onBook(course)}
            className="text-xs font-medium bg-indigo text-paper rounded-md px-3.5 py-2 hover:bg-ink transition shadow-sm"
          >
            Book
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;

