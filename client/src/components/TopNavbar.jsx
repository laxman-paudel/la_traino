import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const role = user?.role;
  const displayRole = role?.charAt(0) + role?.slice(1).toLowerCase();

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition"
      >
        <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-semibold">
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-gray-900 leading-tight">{user?.name}</p>
          <p className="text-xs text-gray-500">{displayRole}</p>
        </div>
        <svg className="w-4 h-4 text-gray-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
          <div className="px-4 py-2 border-b border-gray-50 sm:hidden">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">{displayRole}</p>
          </div>
          <button
            type="button"
            onClick={() => { setOpen(false); onLogout(); }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition font-medium"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

function SidebarToggle({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
      aria-label="Toggle sidebar"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );
}

export default function TopNavbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-30">
      <div className="h-full flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <SidebarToggle onClick={onToggleSidebar} />
          <span className="text-xl font-bold text-indigo-700 tracking-tight">La Traino</span>
        </div>

        <UserMenu user={user} onLogout={handleLogout} />
      </div>
    </header>
  );
}
