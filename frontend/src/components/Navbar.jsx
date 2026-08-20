import { useAuth } from "../context/AuthContext.jsx";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-line bg-white/80 backdrop-blur sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-md bg-indigo flex items-center justify-center font-display text-paper text-sm font-semibold">
            L
          </span>
          <span className="font-display text-xl font-semibold text-ink">Learniee</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-ink leading-tight">{user?.name}</p>
            <p className="text-xs text-slate leading-tight">{user?.email}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-sage/15 border border-sage/40 flex items-center justify-center font-display text-sage font-semibold">
            {user?.name?.[0]?.toUpperCase() || "P"}
          </div>
          <button
            onClick={logout}
            className="text-xs font-mono uppercase tracking-wide text-slate hover:text-coral transition border border-line rounded-md px-3 py-2"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
