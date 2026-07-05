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
  },
  {
    value: "TRAINER",
    label: "Trainer",
    desc: "Create plans and manage trainees",
  },
];

export default function Register() {
  const navigate = useNavigate();
  const { user, loginAction, isAuthenticated } = useAuth();
  const googleInitRef = useRef(false);
  const roleRef = useRef("TRAINEE");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("TRAINEE");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    roleRef.current = role;
  }, [role]);

  useEffect(() => {
    if (isAuthenticated || !window.google || googleInitRef.current) return;
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
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    if (!trimmedName) return "Full name is required";
    if (!trimmedEmail) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail))
      return "Invalid email format";
    if (!trimmedPassword) return "Password is required";
    if (trimmedPassword.length < 6)
      return "Password must be at least 6 characters";
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="mt-2 text-gray-500 text-sm">
            Join La Traino as a trainee or trainer
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex gap-2">
            {ROLES.map((r) => (
              <button
                type="button"
                key={r.value}
                onClick={() => setRole(r.value)}
                className={`flex-1 p-3 rounded-xl border-2 text-center transition cursor-pointer ${
                  role === r.value
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                    : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                }`}
              >
                <div className="font-semibold text-sm">{r.label}</div>
                <div className="text-xs mt-0.5 opacity-80">{r.desc}</div>
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm"
              placeholder="At least 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-sm"
          >
            {submitting ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-sm text-gray-400">or</span>
          </div>
        </div>

        <div id="google-register-button" className="flex justify-center" />

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
