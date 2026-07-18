import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLE_LINKS } from "../constants";

const ROLES = [
  {
    value: "TRAINEE",
    title: "Transform Your Fitness Journey",
    description: "Access personalized workouts, track every rep, and stay motivated with expert guidance — all tailored to your goals.",
    features: ["Workout & Nutrition Plans", "Progress Tracking", "Trainer Feedback", "Exercise Library"],
    button: "Continue as Trainee",
    gradient: "from-indigo-600 via-indigo-700 to-purple-800",
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M16.5 6.75V3.5a.5.5 0 00-.5-.5h-8a.5.5 0 00-.5.5v3.25m9 0l3 3v7.5l-3 3m-9-13.5L4.5 9.75v7.5l3 3m9-13.5V3.5m0 3.25H7.5m9 0v7.5m-9-7.5v7.5" />
      </svg>
    ),
  },
  {
    value: "TRAINER",
    title: "Scale Your Coaching",
    description: "Create custom workout and diet plans, monitor client progress, and deliver professional feedback from one powerful dashboard.",
    features: ["Client Management", "Custom Workout & Diet Templates", "Coaching Dashboard", "Performance Reports"],
    button: "Continue as Trainer",
    gradient: "from-emerald-600 via-emerald-700 to-teal-800",
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
];

export default function ChooseRole() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={ROLE_LINKS[user?.role] || "/"} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-[1100px]">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
              Step 1 of 2
            </span>
          </div>
          <div className="flex items-center justify-center gap-0 max-w-[180px] mx-auto mb-1">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 ring-2 ring-indigo-200" />
            <div className="flex-1 h-0.5 bg-gradient-to-r from-indigo-600 to-gray-200" />
            <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
          </div>
          <div className="flex justify-center gap-[68px] text-[11px] font-medium text-gray-400 mb-6">
            <span className="text-indigo-600">Choose Role</span>
            <span>Create Account</span>
          </div>
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-md shadow-indigo-200">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 6.75V3.5a.5.5 0 00-.5-.5h-8a.5.5 0 00-.5.5v3.25m9 0l3 3v7.5l-3 3m-9-13.5L4.5 9.75v7.5l3 3m9-13.5V3.5m0 3.25H7.5m9 0v7.5m-9-7.5v7.5" />
            </svg>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-3">
            How will you use La Traino?
          </h1>
          <p className="text-lg text-gray-500 max-w-lg mx-auto">
            Choose your path to get started with the right tools and experience.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {ROLES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => navigate(`/register?role=${r.value}`)}
              className="group relative bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${r.gradient} opacity-[0.03] rounded-full -translate-y-1/2 translate-x-1/2 transition-opacity duration-300 group-hover:opacity-[0.06]`} />
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${r.gradient} text-white mb-6 shadow-lg shadow-indigo-200/50`}>
                {r.icon}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">{r.title}</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">{r.description}</p>
              <ul className="space-y-2.5 mb-8">
                {r.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <div className={`w-full py-3 rounded-xl bg-gradient-to-r ${r.gradient} text-white text-sm font-semibold text-center transition-all duration-300 shadow-md group-hover:shadow-lg group-hover:shadow-indigo-200/50`}>
                {r.button}
              </div>
            </button>
          ))}
        </div>

        <p className="text-center mt-8 text-sm text-gray-400">
          Already have an account?{" "}
          <a
            href="/login"
            onClick={(e) => { e.preventDefault(); navigate("/login"); }}
            className="text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}
