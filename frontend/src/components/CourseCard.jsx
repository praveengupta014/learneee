const subjectColor = {
  Mathematics: "bg-indigo",
  Science: "bg-sage",
  English: "bg-amber",
  Coding: "bg-ink",
  Art: "bg-coral",
  Music: "bg-sage",
};

const RatingMeter = ({ value }) => (
  <div className="flex items-center gap-1" aria-label={`Rated ${value} out of 5`}>
    {Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`w-1.5 h-4 rounded-sm ${i < Math.round(value) ? "bg-amber" : "bg-line"}`}
      />
    ))}
    <span className="text-xs font-mono text-slate ml-1">{value.toFixed(1)}</span>
  </div>
);

const CourseCard = ({ course }) => {
  const tab = subjectColor[course.subject] || "bg-indigo";
  return (
    <div className="relative bg-white border border-line rounded-card p-5 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition">
      <div className={`absolute top-0 left-6 w-9 h-1.5 rounded-b-sm ${tab}`} />

      <div className="flex items-start justify-between gap-2 pt-1">
        <span className="text-xs font-mono uppercase tracking-wide text-slate">{course.subject}</span>
        <span className="text-xs font-mono bg-paper border border-line rounded px-2 py-0.5 text-slate">
          {course.grade}
        </span>
      </div>

      <h3 className="font-display text-lg font-semibold text-ink leading-snug">{course.name}</h3>
      <p className="text-sm text-slate line-clamp-2">{course.description}</p>

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-line">
        <div>
          <p className="text-xs text-slate">Taught by</p>
          <p className="text-sm font-medium text-ink">{course.teacher}</p>
        </div>
        <RatingMeter value={course.teacherRating} />
      </div>

      <div className="flex items-center justify-between">
        <span className="font-mono text-lg font-semibold text-ink">₹{course.price.toLocaleString("en-IN")}</span>
        <button className="text-sm font-medium bg-indigo text-paper rounded-md px-4 py-2 hover:bg-ink transition">
          Book course
        </button>
      </div>
    </div>
  );
};

export default CourseCard;
