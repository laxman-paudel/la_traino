import { useState } from "react";
import TopNavbar from "./TopNavbar";
import Sidebar from "./Sidebar";
import MobileSidebar from "./MobileSidebar";

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavbar onToggleSidebar={() => setSidebarOpen(true)} />

      <MobileSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <aside className="hidden lg:flex fixed left-0 top-16 bottom-0 w-64 border-r border-gray-200 bg-white overflow-y-auto z-20">
        <div className="w-full px-3">
          <Sidebar />
        </div>
      </aside>

      <main className="pt-16 lg:ml-64 min-h-screen">
        <div className="px-4 sm:px-6 lg:px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
