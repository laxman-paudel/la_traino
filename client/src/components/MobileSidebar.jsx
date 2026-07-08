import Sidebar from "./Sidebar";

export default function MobileSidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 left-0 bottom-0 w-72 bg-white z-50 transform transition-transform duration-200 ease-in-out lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <span className="text-xl font-bold text-indigo-700 tracking-tight">La Traino</span>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-3 overflow-y-auto h-[calc(100vh-4rem)]">
          <Sidebar mobile onNavigate={onClose} />
        </div>
      </div>
    </>
  );
}
