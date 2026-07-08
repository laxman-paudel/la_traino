import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const icons = {
  Dashboard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  Users: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Presets: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  Workout: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  Progress: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  Link: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
};

const ROLE_GROUPS = {
  ADMIN: [
    { label: "Dashboard", path: "/admin/dashboard", icon: "Dashboard" },
    { label: "Users", path: "/admin/users", icon: "Users" },
    { label: "Presets", path: "/admin/presets", icon: "Presets" },
  ],
  TRAINER: [
    { label: "Dashboard", path: "/trainer/dashboard", icon: "Dashboard" },
  ],
};

function NavItem({ link, isActive, onClick }) {
  return (
    <Link
      to={link.path}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
        isActive
          ? "bg-indigo-50 text-indigo-700"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
      }`}
    >
      <span className="shrink-0">{icons[link.icon]}</span>
      <span>{link.label}</span>
    </Link>
  );
}

export default function Sidebar({ mobile, onNavigate }) {
  const { user } = useAuth();
  const location = useLocation();

  const role = user?.role;
  const base = ROLE_GROUPS[role] || [];

  const links =
    role === "TRAINEE"
      ? [
          { label: "Dashboard", path: "/trainee/dashboard", icon: "Dashboard" },
          { label: "Today's Workout", path: "/trainee/workouts", icon: "Workout" },
          { label: "Weekly Progress", path: "/trainee/progress", icon: "Progress" },
          ...(!user?.traineeLinks?.[0]?.trainer
            ? [
                { label: "Link Trainer", path: "/trainee/link-trainer", icon: "Link" },
                { label: "Presets", path: "/trainee/presets", icon: "Presets" },
              ]
            : []),
        ]
      : base;

  function isActive(path) {
    return location.pathname === path;
  }

  const wrapper = mobile ? "space-y-1" : "space-y-1 py-4";

  return (
    <nav className={wrapper}>
      {links.map((link) => (
        <NavItem
          key={link.path}
          link={link}
          isActive={isActive(link.path)}
          onClick={onNavigate}
        />
      ))}
    </nav>
  );
}
