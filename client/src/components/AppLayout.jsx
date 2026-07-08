import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROLE_LINKS = {
  ADMIN: [
    { label: "Dashboard", path: "/admin/dashboard" },
    { label: "Users", path: "/admin/users" },
    { label: "Presets", path: "/admin/presets" },
  ],
  TRAINER: [{ label: "Dashboard", path: "/trainer/dashboard" }],
};

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const role = user?.role;
  const baseLinks = ROLE_LINKS[role] || [];

  const links =
    role === "TRAINEE"
      ? [
          { label: "Dashboard", path: "/trainee/dashboard" },
          { label: "Workout", path: "/trainee/workouts" },
          { label: "Progress", path: "/trainee/progress" },
          ...(!user?.traineeLinks?.[0]?.trainer
            ? [{ label: "Presets", path: "/trainee/presets" }]
            : []),
        ]
      : baseLinks;

  function isActive(path) {
    return location.pathname === path;
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link
              to="/"
              className="text-xl font-bold text-indigo-700 tracking-tight shrink-0"
            >
              La Traino
            </Link>

            <div className="hidden sm:flex items-center gap-1">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive(link.path)
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="hidden sm:flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 leading-tight">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500">
                  {role?.charAt(0) + role?.slice(1).toLowerCase()}
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                Logout
              </button>
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="sm:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {menuOpen && (
            <div className="sm:hidden border-t border-gray-100 py-3 space-y-1">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive(link.path)
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-gray-100 pt-3 mt-3 px-3">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 mb-2">
                  {role?.charAt(0) + role?.slice(1).toLowerCase()}
                </p>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="flex-1">{children}</main>
    </div>
  );
}
