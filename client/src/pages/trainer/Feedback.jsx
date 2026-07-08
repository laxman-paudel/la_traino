import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getFeedback, saveFeedback } from "../../api/trainer";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import EmptyState from "../../components/EmptyState";
import { SkeletonCard } from "../../components/Skeleton";

export default function Feedback() {
  const { id } = useParams();

  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [weekStart, setWeekStart] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState("");

  useEffect(() => {
    getFeedback(id)
      .then((res) => setFeedbackList(res.data))
      .catch((err) =>
        setError(err.response?.data?.error || "Failed to load feedback"),
      )
      .finally(() => setLoading(false));
  }, [id]);

  function validate() {
    const errs = {};
    if (!weekStart) errs.weekStart = "Week start date is required";
    if (!message.trim()) errs.message = "Feedback message is required";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaveError("");
    setSuccess("");
    if (!validate()) return;

    setSaving(true);
    try {
      await saveFeedback(id, { weekStart, message: message.trim() });
      setWeekStart("");
      setMessage("");
      setSuccess("Feedback saved successfully!");
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
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <SkeletonCard rows={4} />
        <SkeletonCard rows={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Weekly Feedback"
        subtitle="Provide feedback for this trainee"
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

      {feedbackList.length > 0 ? (
        <SectionCard title="Previous Feedback">
          <div className="space-y-4">
            {feedbackList.map((fb, index) => (
              <div
                key={index}
                className="border border-gray-100 rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full" />
                  <p className="text-xs font-medium text-gray-500">
                    Week of {new Date(fb.weekStart).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{fb.message}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      ) : (
        <EmptyState
          icon="clipboard"
          title="No feedback yet"
          message="Previous feedback entries will appear here."
          compact
        />
      )}

      <SectionCard
        title={feedbackList.length > 0 ? "Add / Update Feedback" : "New Feedback"}
      >
        {saveError && (
          <div
            role="alert"
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2"
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <span>{saveError}</span>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-start gap-2"
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="weekStart"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Week Start <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              id="weekStart"
              value={weekStart}
              onChange={(e) => { setWeekStart(e.target.value); setFieldErrors((prev) => ({ ...prev, weekStart: "" })); }}
              className={`w-full max-w-xs px-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900 ${
                fieldErrors.weekStart ? "border-red-300 bg-red-50" : "border-gray-300"
              }`}
            />
            {fieldErrors.weekStart && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.weekStart}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Feedback Message <span className="text-red-400">*</span>
            </label>
            <textarea
              id="message"
              rows={4}
              value={message}
              onChange={(e) => { setMessage(e.target.value); setFieldErrors((prev) => ({ ...prev, message: "" })); }}
              placeholder="Write your feedback for this week..."
              className={`w-full px-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900 resize-none ${
                fieldErrors.message ? "border-red-300 bg-red-50" : "border-gray-300"
              }`}
            />
            {fieldErrors.message && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold text-sm shadow-sm shadow-indigo-200"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </span>
            ) : "Save Feedback"}
          </button>
        </form>
      </SectionCard>
    </div>
  );
}
