import { useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ChevronIcon({ open }) {
  return (
    <svg className={`w-3.5 h-3.5 transition ${open ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
    </svg>
  );
}

const ICONS = {
  Dashboard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  ),
  Clients: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  Training: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  Calendar: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
    </svg>
  ),
  Nutrition: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
    </svg>
  ),
  Progress: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
  Users: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  Presets: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Account: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  Coaching: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
    </svg>
  ),
  Star: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  ),
};

function NavItem({ label, path, icon, isActive, collapsed, onClick, badge }) {
  return (
    <Link
      to={path}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
        isActive
          ? "bg-indigo-50 text-indigo-700"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
      }`}
      title={collapsed ? label : undefined}
    >
      <span className="shrink-0">{ICONS[icon] || ICONS.Star}</span>
      {!collapsed && (
        <>
          <span className="truncate">{label}</span>
          {badge && (
            <span className="ml-auto text-[10px] font-semibold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full">{badge}</span>
          )}
        </>
      )}
    </Link>
  );
}

function NavGroup({ label, icon, children, collapsed, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen !== false);
  const location = useLocation();
  const isChildActive = children.some((c) => location.pathname === c.path);
  const show = open || isChildActive;

  if (collapsed) {
    return (
      <div className="space-y-0.5">
        {children.map((child) => (
          <NavItem key={child.path} {...child} collapsed={collapsed} icon={child.icon || icon} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase transition ${
          isChildActive ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"
        }`}
      >
        <span className="shrink-0 opacity-50">{ICONS[icon]}</span>
        <span className="truncate">{label}</span>
        <ChevronIcon open={show} />
      </button>
      {show && <div className="ml-2 mt-0.5 space-y-0.5 border-l-2 border-gray-100 pl-2">{children.map((child) => (
        <NavItem key={child.path} {...child} collapsed={false} />
      ))}</div>}
    </div>
  );
}

function SidebarGroup({ group, collapsed }) {
  const { label, icon, items } = group;
  if (!items || items.length === 0) return null;

  if (items.length === 1 && !items[0].children) {
    const item = items[0];
    return <NavItem key={item.path} {...item} collapsed={collapsed} icon={item.icon || icon} />;
  }

  if (items.some((i) => i.children)) {
    return items.map((item) => {
      if (item.children) {
        return <NavGroup key={item.label} label={item.label} icon={item.icon || icon} children={item.children} collapsed={collapsed} />;
      }
      return <NavItem key={item.path} {...item} collapsed={collapsed} icon={item.icon || icon} />;
    });
  }

  return (
    <div>
      {!collapsed && (
        <div className="px-3 py-1.5 text-[10px] font-semibold tracking-wider uppercase text-gray-400">{label}</div>
      )}
      <div className="space-y-0.5">
        {items.map((item) => (
          <NavItem key={item.path} {...item} collapsed={collapsed} icon={item.icon || icon} />
        ))}
      </div>
    </div>
  );
}

function Divider({ collapsed }) {
  if (collapsed) return <div className="border-t border-gray-100 my-2 mx-3" />;
  return <div className="border-t border-gray-100 my-3" />;
}

const ACCOUNT_ITEMS = [
  { label: "Profile", path: "/profile", icon: "Account" },
  { label: "Settings", path: "/settings", icon: "Star" },
];

const ADMIN_GROUPS = [
  {
    label: "", icon: "Dashboard",
    items: [{ label: "Dashboard", path: "/admin/dashboard", icon: "Dashboard" }],
  },
  {
    label: "Users", icon: "Users",
    items: [{ label: "Users", path: "/admin/users", icon: "Users" }],
  },
  {
    label: "Presets", icon: "Presets",
    items: [
      { label: "Workout Presets", path: "/admin/presets", icon: "Star" },
      { label: "Global Library", path: "/admin/global-presets", icon: "Star" },
    ],
  },
  {
    label: "Account", icon: "Account",
    items: ACCOUNT_ITEMS,
  },
];

const TRAINER_GROUPS = [
  {
    label: "", icon: "Dashboard",
    items: [{ label: "Dashboard", path: "/trainer/dashboard", icon: "Dashboard" }],
  },
  {
    label: "Clients", icon: "Clients",
    items: [
      { label: "My Trainees", path: "/trainer/dashboard", icon: "Users" },
      { label: "Coaching Hub", path: "/trainer/coaching", icon: "Coaching" },
    ],
  },
  {
    label: "Training", icon: "Training",
    items: [
      { label: "Calendar", path: "/trainer/calendar", icon: "Calendar" },
      { label: "Exercise Library", path: "/trainer/exercises", icon: "Star" },
      { label: "Workout Templates", path: "/trainer/templates", icon: "Star" },
      { label: "Assign Workout", path: "/trainer/dashboard", icon: "Star" },
    ],
  },
  {
    label: "Nutrition", icon: "Nutrition",
    items: [
      { label: "Food Library", path: "/trainer/foods", icon: "Star" },
      { label: "Diet Templates", path: "/trainer/diet-templates", icon: "Star" },
      { label: "Assign Diet", path: "/trainer/dashboard", icon: "Star" },
    ],
  },
  {
    label: "Progress", icon: "Progress",
    items: [
      { label: "Analytics", path: "/trainer/analytics", icon: "Progress" },
      { label: "History", path: "/trainer/history", icon: "Star" },
    ],
  },

  {
    label: "Account", icon: "Account",
    items: ACCOUNT_ITEMS,
  },
];

const TRAINEE_GROUPS = [
  {
    label: "", icon: "Dashboard",
    items: [{ label: "Dashboard", path: "/trainee/dashboard", icon: "Dashboard" }],
  },
  {
    label: "Training", icon: "Training",
    items: [
      { label: "Calendar", path: "/trainee/calendar", icon: "Calendar" },
      { label: "Today's Workout", path: "/trainee/workouts", icon: "Star" },
      { label: "Weekly Progress", path: "/trainee/progress", icon: "Progress" },
    ],
  },
  {
    label: "Nutrition", icon: "Nutrition",
    items: [
      { label: "Today's Diet", path: "/trainee/diet", icon: "Star" },
    ],
  },
  {
    label: "Setup", icon: "Presets",
    items: [
      { label: "Link Trainer", path: "/trainee/link-trainer", icon: "Users" },
      { label: "Presets", path: "/trainee/presets", icon: "Presets" },
    ],
  },
  {
    label: "Account", icon: "Account",
    items: ACCOUNT_ITEMS,
  },
];

export default function Sidebar({ collapsed, mobile, onNavigate }) {
  const { user } = useAuth();
  const location = useLocation();

  const role = user?.role;
  let groups = [];
  if (role === "ADMIN") groups = ADMIN_GROUPS;
  else if (role === "TRAINER") groups = TRAINER_GROUPS;
  else if (role === "TRAINEE") {
    groups = TRAINEE_GROUPS.map((g) => ({
      ...g,
      items: g.items.filter((item) => {
        if (item.path === "/trainee/link-trainer" || item.path === "/trainee/presets") {
          return !user?.traineeLinks?.[0]?.trainer;
        }
        return true;
      }),
    }));
  }

  const wrapper = mobile ? "space-y-1 px-3 py-4" : collapsed ? "space-y-1 py-4 px-2" : "space-y-1 py-4";

  return (
    <nav className={wrapper} aria-label="Sidebar navigation">
      {groups.map((group, i) => {
        if (group.items.length === 0) return null;
        return (
          <div key={group.label || i}>
            {!group.label && !collapsed && i > 0 && <Divider collapsed={collapsed} />}
            {group.label ? (
              <SidebarGroup group={group} collapsed={collapsed} />
            ) : (
              group.items.map((item) => (
                <NavItem
                  key={item.path}
                  {...item}
                  collapsed={collapsed}
                  isActive={location.pathname === item.path}
                  onClick={onNavigate}
                />
              ))
            )}
          </div>
        );
      })}
    </nav>
  );
}
