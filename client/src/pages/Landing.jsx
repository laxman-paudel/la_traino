import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Landing() {
  const { isAuthenticated, user } = useAuth();

  const dashboardLink = user?.role
    ? `/${user.role.toLowerCase()}/dashboard`
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 overflow-hidden">
      <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-indigo-700 tracking-tight">
          La Traino
        </h1>
        <nav className="flex gap-3">
          {isAuthenticated && dashboardLink ? (
            <Link
              to={dashboardLink}
              className="px-5 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm font-medium shadow-sm shadow-indigo-200"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-5 py-2 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition text-sm font-medium"
              >
                Login
              </Link>
              <Link
                to="/choose-role"
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm font-medium shadow-sm shadow-indigo-200"
              >
                Create Account
              </Link>
            </>
          )}
        </nav>
      </header>

      <section className="flex flex-col items-center justify-center px-6 pt-20 pb-16 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-200 rounded-full text-sm text-indigo-600 font-medium mb-8">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Your All-in-One Fitness Platform
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-[1.1] tracking-tight">
          Train Smarter.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            Coach Better.
          </span>
          <br />
          Progress Together.
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-gray-500 max-w-2xl leading-relaxed">
          A modern fitness coaching platform connecting trainers and trainees through personalized workouts, nutrition plans, progress tracking and coaching feedback.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link
            to="/choose-role"
            className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 font-semibold text-base shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300 active:scale-[0.98]"
          >
            Create Account
          </Link>
          <Link
            to="/login"
            className="px-8 py-3.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-semibold text-base"
          >
            Login
          </Link>
        </div>
      </section>

      <section className="py-16 lg:py-20 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900">
            Everything You Need In One Fitness Platform
          </h2>
          <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
            Built for both trainers and trainees — all the tools you need to succeed, without the clutter.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Personalized Workouts",
              desc: "Custom exercise plans tailored to individual goals, fitness levels, and preferences.",
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 6.75V3.5a.5.5 0 00-.5-.5h-8a.5.5 0 00-.5.5v3.25m9 0l3 3v7.5l-3 3m-9-13.5L4.5 9.75v7.5l3 3m9-13.5V3.5m0 3.25H7.5m9 0v7.5m-9-7.5v7.5" />
              ),
            },
            {
              title: "Nutrition Planning",
              desc: "Structured diet plans with macros, meal timing, and calorie tracking built in.",
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
              ),
            },
            {
              title: "Progress Analytics",
              desc: "Detailed reports, personal bests, and comparison charts to track improvement over time.",
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              ),
            },
            {
              title: "Coaching Feedback",
              desc: "Direct communication between trainers and trainees with comments on every workout and meal.",
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
              ),
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="w-11 h-11 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {feature.icon}
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-1.5">{feature.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
