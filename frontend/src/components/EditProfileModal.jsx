import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

const EditProfileModal = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    childName: user?.childName || "",
    childGrade: user?.childGrade || "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await updateProfile(form);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative bg-white border border-line rounded-card w-full max-w-md shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-8 w-16 h-2 bg-amber rounded-b-sm" />

        {/* Header */}
        <div className="p-6 pb-4 border-b border-line flex items-start justify-between gap-4 pt-8">
          <div>
            <span className="text-xs font-mono uppercase tracking-wide text-amber font-semibold">
              Account Settings
            </span>
            <h2 className="font-display text-xl font-semibold text-ink mt-0.5">
              Edit Parent Profile
            </h2>
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

          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">
              Parent Name
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-md border border-line px-3 py-2 text-sm text-ink focus:border-sage outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">
              Child's Name
            </label>
            <input
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
              className="flex-1 text-sm font-medium bg-indigo text-paper py-2.5 rounded-md hover:bg-ink transition shadow-sm disabled:opacity-60"
            >
              {submitting ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
