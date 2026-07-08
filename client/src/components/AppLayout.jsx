import { useState, useEffect } from "react";
import TopNavbar from "./TopNavbar";
import Sidebar from "./Sidebar";

function SidebarToggle({ collapsed, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="hidden lg:flex items-center justify-center w-6 h-6 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition absolute -right-3 top-8 bg-white border border-gray-200 shadow-sm z-10"
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      <svg className={`w-3.5 h-3.5 transition ${collapsed ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  );
}

export default function AppLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved === "true";
  });

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", sidebarCollapsed);
  }, [sidebarCollapsed]);

  const sidebarWidth = sidebarCollapsed ? "w-16" : "w-64";

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavbar onToggleSidebar={() => setMobileOpen(true)} />

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile drawer */}
      <div className={`fixed top-0 left-0 bottom-0 w-72 bg-white z-50 transform transition-transform duration-200 ease-in-out lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <span className="text-xl font-bold text-indigo-700 tracking-tight">La Traino</span>
          <button type="button" onClick={() => setMobileOpen(false)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition" aria-label="Close menu">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-4rem)]">
          <Sidebar mobile onNavigate={() => setMobileOpen(false)} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex fixed left-0 top-16 bottom-0 ${sidebarWidth} border-r border-gray-200 bg-white overflow-y-auto z-20 transition-all duration-200`}>
        <div className="relative w-full">
          <Sidebar collapsed={sidebarCollapsed} />
          <SidebarToggle collapsed={sidebarCollapsed} onClick={() => setSidebarCollapsed(!sidebarCollapsed)} />
        </div>
      </aside>

      {/* Main content */}
      <main className={`pt-16 min-h-screen transition-all duration-200 ${sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"}`}>
        <div className="px-4 sm:px-6 lg:px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
