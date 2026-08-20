import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't log you in. Check your details.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2">
            <span className="w-8 h-8 rounded-md bg-indigo flex items-center justify-center font-display text-paper text-sm font-semibold">
              L
            </span>
            <span className="font-display text-2xl font-semibold text-ink">Learniee</span>
          </div>
          <p className="text-slate text-sm mt-2 font-mono">parent sign-in</p>
        </div>

        <div className="relative bg-white border border-line rounded-card shadow-sm p-8">
          <div className="absolute top-0 left-6 w-9 h-1.5 bg-sage rounded-b-sm" />
          <h1 className="font-display text-xl font-semibold text-ink mb-1">Welcome back</h1>
          <p className="text-slate text-sm mb-6">Log in to search and book courses for your child.</p>

          {error && (
            <div className="mb-4 text-sm text-coral bg-coral/10 border border-coral/30 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
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
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-md border border-line px-3 py-2.5 text-sm text-ink focus:border-sage outline-none transition"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo text-paper font-medium text-sm rounded-md py-2.5 hover:bg-ink transition disabled:opacity-60"
            >
              {submitting ? "Logging in…" : "Log in"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate mt-6">
          New to Learniee?{" "}
          <Link to="/signup" className="text-sage font-medium hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
