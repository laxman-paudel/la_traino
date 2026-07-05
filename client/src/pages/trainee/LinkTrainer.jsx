import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { linkTrainer } from "../../api/trainee";
import { fetchMe } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";

export default function LinkTrainer() {
  const navigate = useNavigate();
  const { loginAction, user } = useAuth();

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
      setTimeout(() => navigate("/trainee/dashboard", { replace: true }), 1200);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to link trainer");
    } finally {
      setSubmitting(false);
    }
  }

  const linkedTrainer = user?.traineeLinks?.[0]?.trainer;

  if (linkedTrainer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-green-500 text-5xl mb-4">&#10003;</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Already Linked
          </h1>
          <p className="text-gray-500 mb-6">
            You are linked to trainer <strong>{linkedTrainer.name}</strong>.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left text-sm">
            <div className="text-gray-500">Trainer Code</div>
            <div className="text-gray-900 font-mono font-bold text-lg">
              {linkedTrainer.trainerProfile.trainerCode}
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/trainee/workouts")}
            className="w-full py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm"
          >
            View Workouts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Link to Your Trainer
          </h1>
          <p className="mt-2 text-gray-500 text-sm">
            Enter the trainer code provided by your trainer to connect and
            receive personalised workout and diet plans.
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

        {success && (
          <div
            role="status"
            className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm"
          >
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trainer Code
            </label>
            <input
              type="text"
              required
              value={trainerCode}
              onChange={(e) => setTrainerCode(e.target.value.toUpperCase())}
              placeholder="e.g. ABC123"
              maxLength={6}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm font-mono uppercase tracking-widest text-center"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || trainerCode.length !== 6}
            className="w-full py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-sm"
          >
            {submitting ? "Linking..." : "Link Trainer"}
          </button>
        </form>
      </div>
    </div>
  );
}
