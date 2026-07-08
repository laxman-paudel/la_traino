import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { register, googleLogin } from "../api/auth";
import { ROLE_LINKS } from "../constants";

const ROLES = [
  {
    value: "TRAINEE",
    label: "Trainee",
    desc: "Follow workouts and track progress",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 6.75V3.5a.5.5 0 00-.5-.5h-8a.5.5 0 00-.5.5v3.25m9 0l3 3v7.5l-3 3m-9-13.5L4.5 9.75v7.5l3 3m9-13.5V3.5m0 3.25H7.5m9 0v7.5m-9-7.5v7.5" />
      </svg>
    ),
  },
  {
    value: "TRAINER",
    label: "Trainer",
    desc: "Create plans and manage trainees",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
];

function PasswordInput({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        required
        minLength={6}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2.5 pr-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm"
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
      </button>
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const { user, loginAction, isAuthenticated } = useAuth();
  const googleInitRef = useRef(false);
  const googleEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  const roleRef = useRef("TRAINEE");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("TRAINEE");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    roleRef.current = role;
  }, [role]);

  useEffect(() => {
    if (isAuthenticated || !window.google || googleInitRef.current || !googleEnabled) return;
    googleInitRef.current = true;

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleGoogleCredential,
    });

    window.google.accounts.id.renderButton(
      document.getElementById("google-register-button"),
      { type: "standard", shape: "pill", theme: "outline", size: "large" },
    );
  }, [isAuthenticated]);

  if (isAuthenticated) {
    return <Navigate to={ROLE_LINKS[user?.role] || "/"} replace />;
  }

  function validate() {
    const errs = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    if (!trimmedName) errs.name = "Full name is required";
    if (!trimmedEmail) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail))
      errs.email = "Invalid email format";
    if (!trimmedPassword) errs.password = "Password is required";
    else if (trimmedPassword.length < 6)
      errs.password = "Password must be at least 6 characters";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await register(
        name.trim(),
        email.trim(),
        password.trim(),
        role,
      );
      const { token, user } = res.data;
      loginAction(token, user);
      navigate(ROLE_LINKS[user.role] || "/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  function handleGoogleCredential(googleResponse) {
    setError("");
    googleLogin(googleResponse.credential, roleRef.current)
      .then((res) => {
        const { token, user } = res.data;
        loginAction(token, user);
        navigate(ROLE_LINKS[user.role] || "/", { replace: true });
      })
      .catch((err) => {
        setError(err.response?.data?.error || "Google registration failed");
      });
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 relative overflow-hidden items-center justify-center">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/5 rounded-full" />
        <div className="absolute -bottom-32 -right-20 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute top-1/3 right-10 w-32 h-32 bg-white/10 rounded-full" />
        <div className="relative z-10 px-12 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 6.75V3.5a.5.5 0 00-.5-.5h-8a.5.5 0 00-.5.5v3.25m9 0l3 3v7.5l-3 3m-9-13.5L4.5 9.75v7.5l3 3m9-13.5V3.5m0 3.25H7.5m9 0v7.5m-9-7.5v7.5" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">La Traino</h1>
          <p className="text-indigo-200 text-lg max-w-sm mx-auto">
            Join thousands of trainees and trainers on their fitness journey.
          </p>
          <div className="mt-10 space-y-4 max-w-xs mx-auto">
            {[
              { title: "Personalized Workouts", desc: "Tailored exercise plans designed for your goals" },
              { title: "Track Progress", desc: "Monitor your achievements with detailed weekly reports" },
              { title: "Trainer Guidance", desc: "Connect with trainers for expert feedback" },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3 text-left">
                <div className="w-6 h-6 bg-emerald-400/30 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{item.title}</p>
                  <p className="text-indigo-300 text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white py-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 6.75V3.5a.5.5 0 00-.5-.5h-8a.5.5 0 00-.5.5v3.25m9 0l3 3v7.5l-3 3m-9-13.5L4.5 9.75v7.5l3 3m9-13.5V3.5m0 3.25H7.5m9 0v7.5m-9-7.5v7.5" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">La Traino</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h2>
            <p className="text-gray-500 text-sm mb-6">Join as a trainee or trainer</p>

            {error && (
              <div
                role="alert"
                className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2.5"
              >
                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  I want to join as <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map((r) => (
                    <button
                      type="button"
                      key={r.value}
                      onClick={() => setRole(r.value)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition cursor-pointer ${
                        role === r.value
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                          : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        role === r.value ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-400"
                      }`}>
                        {r.icon}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{r.label}</div>
                        <div className="text-xs opacity-80">{r.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => { setName(e.target.value); setFieldErrors((prev) => ({ ...prev, name: "" })); }}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm ${
                    fieldErrors.name ? "border-red-300 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder="John Doe"
                />
                {fieldErrors.name && (
                  <p className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setFieldErrors((prev) => ({ ...prev, email: "" })); }}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm ${
                    fieldErrors.email ? "border-red-300 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder="you@example.com"
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password <span className="text-red-400">*</span>
                </label>
                <PasswordInput
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors((prev) => ({ ...prev, password: "" })); }}
                  placeholder="At least 6 characters"
                />
                {fieldErrors.password && (
                  <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>
                )}
                {!fieldErrors.password && (
                  <p className="mt-1 text-xs text-gray-400">Must be at least 6 characters</p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold text-sm shadow-sm shadow-indigo-200"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating account...
                  </span>
                ) : "Create Account"}
              </button>
            </form>

            {googleEnabled && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-sm text-gray-400">or continue with</span>
                  </div>
                </div>
                <div id="google-register-button" className="flex justify-center" />
              </>
            )}

            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
