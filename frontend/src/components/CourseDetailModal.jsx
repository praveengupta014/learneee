const subjectColor = {
  Mathematics: "bg-indigo",
  Science: "bg-sage",
  English: "bg-amber",
  Coding: "bg-ink",
  Art: "bg-coral",
  Music: "bg-sage",
};

const CourseDetailModal = ({ course, onClose, onBook }) => {
  if (!course) return null;

  const tab = subjectColor[course.subject] || "bg-indigo";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative bg-white border border-line rounded-card w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`absolute top-0 left-8 w-16 h-2 rounded-b-sm ${tab}`} />

        {/* Header */}
        <div className="p-6 pb-4 border-b border-line flex items-start justify-between gap-4 pt-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono uppercase tracking-wide text-slate">{course.subject}</span>
              <span className="text-xs font-mono bg-paper border border-line rounded px-2 py-0.5 text-slate">
                {course.grade}
              </span>
              <span className="text-xs font-mono bg-sage/10 text-sage border border-sage/30 rounded px-2 py-0.5">
                ⭐ {course.teacherRating?.toFixed(1)} / 5.0
              </span>
            </div>
            <h2 className="font-display text-2xl font-semibold text-ink leading-tight">
              {course.name}
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
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Metadata Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-paper p-4 rounded-lg border border-line">
            <div>
              <p className="text-xs font-mono uppercase text-slate">Duration</p>
              <p className="text-sm font-medium text-ink mt-0.5">{course.duration || "4 Weeks"}</p>
            </div>
            <div>
              <p className="text-xs font-mono uppercase text-slate">Schedule</p>
              <p className="text-sm font-medium text-ink mt-0.5">{course.schedule || "Live Weekly"}</p>
            </div>
            <div>
              <p className="text-xs font-mono uppercase text-slate">Teacher</p>
              <p className="text-sm font-medium text-ink mt-0.5">{course.teacher}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wide text-slate mb-2">Course Overview</h3>
            <p className="text-ink text-sm leading-relaxed">{course.description}</p>
          </div>

          {/* Highlights */}
          {course.highlights && course.highlights.length > 0 && (
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wide text-slate mb-2.5">Key Highlights</h3>
              <div className="grid sm:grid-cols-2 gap-2">
                {course.highlights.map((h, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-ink bg-white border border-line p-2.5 rounded-md">
                    <span className="text-sage font-bold">✓</span>
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Syllabus */}
          {course.syllabus && course.syllabus.length > 0 && (
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wide text-slate mb-2.5">Weekly Syllabus</h3>
              <div className="space-y-2.5">
                {course.syllabus.map((s, idx) => (
                  <div key={idx} className="border border-line rounded-lg p-3 bg-paper/50">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-mono font-semibold text-indigo">{s.week}</span>
                      <span className="text-sm font-semibold text-ink">{s.topic}</span>
                    </div>
                    <p className="text-xs text-slate">{s.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 border-t border-line bg-paper/40 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate font-mono uppercase">Fee</p>
            <p className="font-mono text-2xl font-bold text-ink">₹{course.price?.toLocaleString("en-IN")}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="text-sm font-medium border border-line bg-white hover:bg-paper px-4 py-2.5 rounded-md text-slate transition"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onBook(course);
              }}
              className="text-sm font-medium bg-indigo text-paper px-6 py-2.5 rounded-md hover:bg-ink transition shadow-sm"
            >
              Book course now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailModal;
