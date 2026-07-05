import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Landing() {
  const { isAuthenticated, user } = useAuth();

  const dashboardLink = user?.role
    ? `/${user.role.toLowerCase()}/dashboard`
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-indigo-700 tracking-tight">
          La Traino
        </h1>
        <nav className="flex gap-4">
          {isAuthenticated && dashboardLink ? (
            <Link
              to={dashboardLink}
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-5 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition text-sm font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="flex flex-col items-center justify-center px-6 pt-24 pb-32 max-w-4xl mx-auto text-center">
        <h2 className="text-5xl font-extrabold text-gray-900 leading-tight sm:text-6xl">
          Your Personal
          <span className="text-indigo-600"> Physical Training</span> System
        </h2>
        <p className="mt-6 text-lg text-gray-600 max-w-2xl leading-relaxed">
          La Traino connects trainers and trainees through a digital platform.
          Follow preset workouts, get personalised plans, and track your
          progress — all in one place.
        </p>
        <div className="mt-10 flex gap-4">
          <Link
            to="/register"
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold text-base shadow-md"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold text-base"
          >
            Sign In
          </Link>
        </div>
      </main>
    </div>
  );
}
