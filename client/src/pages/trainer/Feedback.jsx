import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getFeedback, saveFeedback } from "../../api/trainer";

export default function Feedback() {
  const { id } = useParams();

  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [weekStart, setWeekStart] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    getFeedback(id)
      .then((res) => setFeedbackList(res.data))
      .catch((err) =>
        setError(err.response?.data?.error || "Failed to load feedback"),
      )
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaveError("");
    if (!weekStart) {
      setSaveError("Week start date is required");
      return;
    }
    if (!message.trim()) {
      setSaveError("Feedback message is required");
      return;
    }

    setSaving(true);
    try {
      await saveFeedback(id, { weekStart, message: message.trim() });
      setWeekStart("");
      setMessage("");
      const updated = await getFeedback(id);
      setFeedbackList(updated.data);
    } catch (err) {
      setSaveError(err.response?.data?.error || "Failed to save feedback");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Weekly Feedback
        </h1>
        <p className="text-gray-500 mb-8">Provide feedback for this trainee.</p>

        {error && (
          <div
            role="alert"
            className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
          >
            {error}
          </div>
        )}

        {feedbackList.length > 0 && (
          <>
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Previous Feedback
            </h2>
            <div className="space-y-3 mb-8">
              {feedbackList.map((fb, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
                >
                  <p className="text-sm text-gray-500 mb-1">
                    Week of {fb.weekStart}
                  </p>
                  <p className="text-gray-900">{fb.message}</p>
                </div>
              ))}
            </div>
          </>
        )}

        <h2 className="text-lg font-bold text-gray-900 mb-4">
          {feedbackList.length > 0 ? "Add / Update Feedback" : "New Feedback"}
        </h2>

        {saveError && (
          <div
            role="alert"
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
          >
            {saveError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="weekStart"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Week Start
            </label>
            <input
              type="date"
              id="weekStart"
              value={weekStart}
              onChange={(e) => setWeekStart(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900"
            />
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Feedback
            </label>
            <textarea
              id="message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your feedback..."
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
          >
            {saving ? "Saving..." : "Save Feedback"}
          </button>
        </form>
      </div>
    </div>
  );
}
