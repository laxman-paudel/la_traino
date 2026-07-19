import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboard } from "../../api/trainer";
import { getTimeline, getCoachingNotes } from "../../api/coaching";
import { useToast } from "../../context/ToastContext";
import PageHeader from "../../components/PageHeader";
import CoachingTimeline from "../../components/CoachingTimeline";
import CoachingNoteForm from "../../components/CoachingNoteForm";
import ExerciseCommentForm from "../../components/ExerciseCommentForm";
import DietCommentForm from "../../components/DietCommentForm";
import { SkeletonCard } from "../../components/Skeleton";

export default function CoachingHub() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [trainees, setTrainees] = useState([]);
  const [selectedTrainee, setSelectedTrainee] = useState(null);
  const [loadingTrainees, setLoadingTrainees] = useState(true);
  const [timeline, setTimeline] = useState([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [timelineError, setTimelineError] = useState("");
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showExerciseCommentForm, setShowExerciseCommentForm] = useState(false);
  const [showDietCommentForm, setShowDietCommentForm] = useState(false);

  useEffect(() => {
    getDashboard()
      .then((res) => {
        const all = res.data?.trainees || [];
        setTrainees(all);
        if (all.length > 0) setSelectedTrainee(all[0]);
      })
      .catch(() => addToast("Failed to load trainees", "error"))
      .finally(() => setLoadingTrainees(false));
  }, [addToast]);

  const loadTimeline = useCallback(async () => {
    if (!selectedTrainee) return;
    setLoadingTimeline(true);
    setTimelineError("");
    try {
      const res = await getTimeline(selectedTrainee.id, { limit: 100 });
      setTimeline(res.data?.items || []);
    } catch {
      setTimeline([]);
      setTimelineError("Unable to load coaching activity");
    } finally {
      setLoadingTimeline(false);
    }
  }, [selectedTrainee]);

  useEffect(() => {
    loadTimeline();
  }, [loadTimeline]);

  async function handleRefresh() {
    await loadTimeline();
    addToast("Timeline refreshed", "success");
  }

  function handleNoteUpdate(noteId, read) {
    setTimeline((prev) =>
      prev.map((item) =>
        item.id === noteId && item._type === "feedback"
          ? { ...item, read }
          : item,
      ),
    );
  }

  if (loadingTrainees) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <SkeletonCard rows={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Coaching Hub" />

      {trainees.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No Trainees Linked</h3>
          <p className="text-sm text-gray-500">Share your trainer code to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Trainee sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900">Trainees</h3>
                <p className="text-xs text-gray-400 mt-0.5">{trainees.length} linked</p>
              </div>
              <div className="divide-y divide-gray-50 max-h-[60vh] overflow-y-auto">
                {trainees.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTrainee(t)}
                    className={`w-full text-left px-4 py-3 transition ${
                      selectedTrainee?.id === t.id
                        ? "bg-indigo-50 border-l-2 border-indigo-500"
                        : "hover:bg-gray-50 border-l-2 border-transparent"
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-900 truncate">{t.name}</p>
                    <p className="text-xs text-gray-400 truncate">{t.email}</p>
                  </button>
                ))}
              </div>

              {/* Quick links for selected trainee */}
              {selectedTrainee && (
                <div className="p-4 border-t border-gray-100 space-y-1.5">
                  <button
                    type="button"
                    onClick={() => navigate(`/trainer/trainees/${selectedTrainee.id}/workout`)}
                    className="w-full text-left text-xs text-indigo-600 hover:text-indigo-700 font-medium py-1"
                  >
                    Assign Workout
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/trainer/trainees/${selectedTrainee.id}/diet`)}
                    className="w-full text-left text-xs text-indigo-600 hover:text-indigo-700 font-medium py-1"
                  >
                    Assign Diet
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/trainer/trainees/${selectedTrainee.id}/logs`)}
                    className="w-full text-left text-xs text-indigo-600 hover:text-indigo-700 font-medium py-1"
                  >
                    View Logs
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Main timeline area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Trainee header */}
            {selectedTrainee && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{selectedTrainee.name}</h2>
                    <p className="text-sm text-gray-500">{selectedTrainee.email}</p>
                  </div>
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold">
                    {selectedTrainee.preset?.name || "No Preset"}
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowNoteForm(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-xs font-semibold"
                  >
                    Send Feedback
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowExerciseCommentForm(true)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition text-xs font-semibold"
                  >
                    Exercise Comment
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDietCommentForm(true)}
                    className="px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition text-xs font-semibold"
                  >
                    Diet Comment
                  </button>
                  <button
                    type="button"
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-white text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-xs font-semibold"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            )}

            {/* Timeline */}
            <CoachingTimeline
              traineeId={selectedTrainee?.id}
              items={timeline}
              loading={loadingTimeline}
              error={timelineError}
              onRefresh={handleRefresh}
              onNoteUpdate={handleNoteUpdate}
            />
          </div>
        </div>
      )}

      {/* Modals */}
      {showNoteForm && selectedTrainee && (
        <CoachingNoteForm
          traineeId={selectedTrainee.id}
          onClose={() => setShowNoteForm(false)}
          onSaved={handleRefresh}
        />
      )}
      {showExerciseCommentForm && selectedTrainee && (
        <ExerciseCommentForm
          traineeId={selectedTrainee.id}
          onClose={() => setShowExerciseCommentForm(false)}
          onSaved={handleRefresh}
        />
      )}
      {showDietCommentForm && selectedTrainee && (
        <DietCommentForm
          traineeId={selectedTrainee.id}
          onClose={() => setShowDietCommentForm(false)}
          onSaved={handleRefresh}
        />
      )}
    </div>
  );
}
