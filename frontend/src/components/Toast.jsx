import { useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";

const Toast = () => {
  const { toast, hideToast } = useAuth();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      hideToast();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, hideToast]);

  if (!toast) return null;

  const bgStyles = {
    success: "bg-sage text-white border-sage/40 shadow-lg shadow-sage/20",
    error: "bg-coral text-white border-coral/40 shadow-lg shadow-coral/20",
    info: "bg-indigo text-white border-indigo/40 shadow-lg shadow-indigo/20",
  };

  const icons = {
    success: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
          bgStyles[toast.type] || bgStyles.info
        }`}
      >
        <span>{icons[toast.type] || icons.info}</span>
        <span>{toast.message}</span>
        <button
          onClick={hideToast}
          className="ml-2 opacity-80 hover:opacity-100 transition text-xs font-mono"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default Toast;
