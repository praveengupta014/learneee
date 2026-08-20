import { useAuth } from "../context/AuthContext.jsx";

const Navbar = ({ onOpenBookings, onOpenProfile, bookingCount = 0 }) => {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-line bg-white/80 backdrop-blur sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-md bg-indigo flex items-center justify-center font-display text-paper text-sm font-semibold shadow-sm">
            L
          </span>
          <div>
            <span className="font-display text-xl font-semibold text-ink tracking-tight">
              Learniee
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-mono uppercase tracking-wider bg-paper border border-line px-1.5 py-0.5 rounded text-slate">
              Parent Portal
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          <button
            onClick={onOpenBookings}
            className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wide text-ink bg-white border border-line hover:border-sage rounded-md px-3 py-2 transition"
          >
            <span>My Bookings</span>
            {bookingCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-sage text-white text-[10px] flex items-center justify-center font-bold">
                {bookingCount}
              </span>
            )}
          </button>

          <div
            onClick={onOpenProfile}
            className="flex items-center gap-2.5 cursor-pointer p-1 rounded-md hover:bg-paper transition"
            title="Click to edit profile"
          >
            <div className="text-right hidden md:block">
              <p className="text-xs font-medium text-ink leading-tight">{user?.name}</p>
              <p className="text-[11px] text-slate leading-tight font-mono">{user?.childName ? `${user.childName}'s Parent` : "Parent"}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-sage/15 border border-sage/40 flex items-center justify-center font-display text-sage text-sm font-semibold">
              {user?.name?.[0]?.toUpperCase() || "P"}
            </div>
          </div>

          <button
            onClick={logout}
            className="text-xs font-mono uppercase tracking-wide text-slate hover:text-coral transition border border-line rounded-md px-2.5 sm:px-3 py-2"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

