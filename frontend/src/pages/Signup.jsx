import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    childName: "",
    childGrade: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signup(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't create your account.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2">
            <span className="w-8 h-8 rounded-md bg-indigo flex items-center justify-center font-display text-paper text-sm font-semibold">
              L
            </span>
            <span className="font-display text-2xl font-semibold text-ink">Learniee</span>
          </div>
          <p className="text-slate text-sm mt-2 font-mono">create a parent account</p>
        </div>

        <div className="relative bg-white border border-line rounded-card shadow-sm p-8">
          <div className="absolute top-0 left-6 w-9 h-1.5 bg-amber rounded-b-sm" />
          <h1 className="font-display text-xl font-semibold text-ink mb-1">Get started</h1>
          <p className="text-slate text-sm mb-6">
            Tell us about you and your child so we can tailor course results.
          </p>

          {error && (
            <div className="mb-4 text-sm text-coral bg-coral/10 border border-coral/30 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">
                Your name
              </label>
              <input
                required
                value={form.name}
                onChange={update("name")}
                className="w-full rounded-md border border-line px-3 py-2.5 text-sm text-ink focus:border-sage outline-none transition"
                placeholder="Priya Mehta"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={update("email")}
                className="w-full rounded-md border border-line px-3 py-2.5 text-sm text-ink focus:border-sage outline-none transition"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={update("password")}
                className="w-full rounded-md border border-line px-3 py-2.5 text-sm text-ink focus:border-sage outline-none transition"
                placeholder="At least 6 characters"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">
                  Child's name
                </label>
                <input
                  value={form.childName}
                  onChange={update("childName")}
                  className="w-full rounded-md border border-line px-3 py-2.5 text-sm text-ink focus:border-sage outline-none transition"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">
                  Child's grade
                </label>
                <input
                  value={form.childGrade}
                  onChange={update("childGrade")}
                  className="w-full rounded-md border border-line px-3 py-2.5 text-sm text-ink focus:border-sage outline-none transition"
                  placeholder="e.g. Grade 5"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo text-paper font-medium text-sm rounded-md py-2.5 hover:bg-ink transition disabled:opacity-60"
            >
              {submitting ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-sage font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
