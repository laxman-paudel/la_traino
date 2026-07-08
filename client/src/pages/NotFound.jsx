import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLE_LINKS } from "../constants";

export default function NotFound() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const homePath = isAuthenticated ? ROLE_LINKS[user?.role] || "/" : "/";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl font-bold text-indigo-600">404</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
        <p className="text-gray-500 mb-8">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <button
          type="button"
          onClick={() => navigate(homePath)}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-semibold text-sm shadow-sm shadow-indigo-200"
        >
          {isAuthenticated ? "Go to Dashboard" : "Go to Home"}
        </button>
      </div>
    </div>
  );
}
