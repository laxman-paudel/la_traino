import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { linkTrainer } from "../../api/trainee";
import { fetchMe } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import PageHeader from "../../components/PageHeader";

export default function LinkTrainer() {
  const navigate = useNavigate();
  const { loginAction, user } = useAuth();
  const { addToast } = useToast();

  const [trainerCode, setTrainerCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await linkTrainer(trainerCode.trim());
      const res = await fetchMe();
      const token = localStorage.getItem("token");
      loginAction(token, res.data.user);
      setSuccess("Successfully linked to trainer!");
      addToast("Successfully linked to trainer", "success");
      setTimeout(() => navigate("/trainee/dashboard", { replace: true }), 1200);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to link trainer");
      addToast(err.response?.data?.error || "Failed to link trainer", "error");
    } finally {
      setSubmitting(false);
    }
  }

  const linkedTrainer = user?.traineeLinks?.[0]?.trainer;

  if (linkedTrainer) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Already Linked
          </h1>
          <p className="text-gray-500 mb-6">
            You are linked to trainer <strong className="text-gray-900">{linkedTrainer.name}</strong>.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6 inline-block text-left">
            <p className="text-xs text-gray-500 mb-1">Trainer Code</p>
            <p className="text-gray-900 font-mono font-bold text-lg tracking-wider">
              {linkedTrainer.trainerProfile.trainerCode}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/trainee/workouts")}
            className="w-full py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-semibold text-sm shadow-sm shadow-indigo-200"
          >
            View Workouts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Link to Trainer"
        subtitle="Enter your trainer's unique code to get connected"
      />

      {error && (
        <div
          role="alert"
          className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2.5"
        >
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-start gap-2.5"
        >
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-medium">{success}</p>
            <p className="text-green-600/80 text-xs mt-0.5">Redirecting to dashboard...</p>
          </div>
        </div>
      )}

      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Enter Your Trainer Code
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Enter the 6-character code provided by your trainer to connect and receive personalized workout and diet plans.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Trainer Code <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={trainerCode}
                onChange={(e) => setTrainerCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength={6}
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-center text-2xl font-mono tracking-[0.3em] uppercase placeholder:text-gray-300 placeholder:tracking-[0.3em]"
              />
              <p className="mt-1.5 text-xs text-gray-400 text-center">
                Enter the 6-character code your trainer shared with you
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting || trainerCode.length !== 6}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold text-sm shadow-sm shadow-indigo-200"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Linking...
                </span>
              ) : "Link Trainer"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
