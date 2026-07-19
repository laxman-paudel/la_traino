import { useState, useEffect, useCallback, useRef } from "react";
import { getTrainerCalendar } from "../../api/calendar";
import { getDashboard } from "../../api/trainer";
import { getTemplates } from "../../api/templates";
import { assignTemplate } from "../../api/templates";
import { useToast } from "../../context/ToastContext";
import Calendar from "../../components/Calendar";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";

function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function CalendarSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
      <div className="grid grid-cols-7 gap-px">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-50 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function TrainerCalendar() {
  const { addToast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mode, setMode] = useState("month");
  const [events, setEvents] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const mountedRef = useRef(true);

  const [trainees, setTrainees] = useState([]);
  const [templates, setTemplates] = useState([]);

  const [selectedTraineeIds, setSelectedTraineeIds] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchMonth = useCallback(async (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const monthKey = `${year}-${month}`;
    setLoading(true);
    try {
      const res = await getTrainerCalendar(monthKey);
      if (mountedRef.current) setEvents(res.data.dates || {});
    } catch {
      if (mountedRef.current) addToast("Failed to load calendar", "error");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchMonth(currentDate);
  }, [currentDate, fetchMonth]);

  useEffect(() => {
    getDashboard()
      .then((res) => {
        if (mountedRef.current) setTrainees(res.data.trainees || []);
      })
      .catch(() => {});
    getTemplates({ archived: false })
      .then((res) => {
        if (mountedRef.current) setTemplates(res.data || []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (selectedDate && drawerOpen) {
      setSelectedTraineeIds([]);
      setSelectedTemplateId("");
    }
  }, [selectedDate, drawerOpen]);

  function handleDateClick(date) {
    setSelectedDate(date);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setSelectedTraineeIds([]);
    setSelectedTemplateId("");
  }

  function toggleTrainee(id) {
    setSelectedTraineeIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function selectAllTrainees() {
    if (selectedTraineeIds.length === trainees.length) {
      setSelectedTraineeIds([]);
    } else {
      setSelectedTraineeIds(trainees.map((t) => t.id));
    }
  }

  async function handleAssign() {
    if (selectedTraineeIds.length === 0) {
      addToast("Select at least one trainee", "error");
      return;
    }
    if (!selectedTemplateId) {
      addToast("Select a workout template", "error");
      return;
    }

    setAssigning(true);
    try {
      const dateStr = formatDateKey(selectedDate);
      await assignTemplate(Number(selectedTemplateId), {
        traineeIds: selectedTraineeIds,
        day: dateStr,
      });
      addToast("Workout assigned successfully", "success");
      closeDrawer();
      fetchMonth(currentDate);
    } catch (err) {
      addToast(err.response?.data?.error || "Failed to assign workout", "error");
    } finally {
      setAssigning(false);
    }
  }

  function renderDayContent(dateKey, eventData, isDetailed) {
    if (!eventData) return null;

    const { workoutCount, dietCount, traineeCount } = eventData;

    if (isDetailed) {
      return (
        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>&#x1F3CB;</span> Workouts
            </h4>
            {eventData.trainees && eventData.trainees.length > 0 ? (
              eventData.trainees.map((t, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.workoutName || "Workout"} &middot; {t.exerciseCount} exercises</p>
                  </div>
                  <StatusBadge status={t.completed ? "completed" : "pending"} />
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">No workouts assigned</p>
            )}
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>&#x1F957;</span> Diet Plans
            </h4>
            {eventData.dietTrainees && eventData.dietTrainees.length > 0 ? (
              eventData.dietTrainees.map((t, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.mealCount} meal{t.mealCount !== 1 ? "s" : ""}</p>
                  </div>
                  <StatusBadge status={t.completed ? "completed" : "pending"} />
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">No diet plans assigned</p>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="mt-1 space-y-0.5">
        <span className="block text-[11px] font-semibold text-indigo-600">&#x1F3CB; {workoutCount} workout{workoutCount !== 1 ? "s" : ""}</span>
        <span className="block text-[10px] font-semibold text-green-600">&#x1F957; {dietCount} diet{dietCount !== 1 ? "s" : ""}</span>
      </div>
    );
  }

  const selectedDateKey = selectedDate ? formatDateKey(selectedDate) : null;
  const selectedEventData = selectedDateKey ? events[selectedDateKey] : null;
  const selectedTemplate = templates.find((t) => t.id === Number(selectedTemplateId));
  const previewExerciseCount = selectedTemplate?.exercises?.length || 0;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <PageHeader title="Calendar" description="View and manage assigned workouts and diet plans" />
        <CalendarSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto relative">
      <PageHeader title="Calendar" description="View and manage assigned workouts and diet plans" />
      <Calendar
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        mode={mode}
        onModeChange={setMode}
        events={events}
        selectedDate={selectedDate}
        onSelectDate={handleDateClick}
        renderDayContent={renderDayContent}
      />

      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={closeDrawer} />
          <div className={`
            fixed z-50 bg-white shadow-xl transition-transform duration-300
            lg:top-16 lg:right-0 lg:bottom-0 lg:w-96 lg:translate-x-0 lg:rounded-none
            bottom-0 left-0 right-0 rounded-t-2xl max-h-[85vh] overflow-y-auto
            ${drawerOpen ? "translate-y-0" : "translate-y-full lg:translate-x-full lg:translate-y-0"}
          `}>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between z-10">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  {selectedDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                </h3>
                {selectedEventData && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    &#x1F3CB; {selectedEventData.workoutCount} workout{selectedEventData.workoutCount !== 1 ? "s" : ""} &middot; &#x1F957; {selectedEventData.dietCount} diet{selectedEventData.dietCount !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                aria-label="Close drawer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Trainees</label>
                  <button
                    type="button"
                    onClick={selectAllTrainees}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700 cursor-pointer"
                  >
                    {selectedTraineeIds.length === trainees.length ? "Deselect All" : "Select All"}
                  </button>
                </div>
                {trainees.length === 0 ? (
                  <p className="text-sm text-gray-400 py-2">No linked trainees</p>
                ) : (
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {trainees.map((t) => (
                      <label
                        key={t.id}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition ${
                          selectedTraineeIds.includes(t.id) ? "bg-indigo-50" : "hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedTraineeIds.includes(t.id)}
                          onChange={() => toggleTrainee(t.id)}
                          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{t.name}</p>
                          <p className="text-xs text-gray-400 truncate">{t.email}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {selectedTraineeIds.length} of {trainees.length} selected
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                  Workout Template
                </label>
                {templates.length === 0 ? (
                  <p className="text-sm text-gray-400 py-2">No templates available</p>
                ) : (
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white cursor-pointer"
                  >
                    <option value="">Select a template...</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {selectedTemplate && (
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Preview</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Trainees</span>
                    <span className="font-medium text-gray-900">{selectedTraineeIds.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Exercises</span>
                    <span className="font-medium text-gray-900">{previewExerciseCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Template</span>
                    <span className="font-medium text-gray-900 truncate ml-2">{selectedTemplate.name}</span>
                  </div>
                  {previewExerciseCount > 0 && (
                    <div className="pt-1">
                      <p className="text-[11px] font-medium text-gray-500 mb-1">Exercises:</p>
                      <div className="space-y-0.5">
                        {selectedTemplate.exercises.slice(0, 5).map((ex, i) => (
                          <p key={i} className="text-xs text-gray-600">
                            &bull; {ex.name} ({ex.sets}x{ex.reps})
                          </p>
                        ))}
                        {selectedTemplate.exercises.length > 5 && (
                          <p className="text-xs text-gray-400 italic">+{selectedTemplate.exercises.length - 5} more</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={handleAssign}
                disabled={assigning || selectedTraineeIds.length === 0 || !selectedTemplateId}
                className="w-full px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold text-sm cursor-pointer"
              >
                {assigning ? "Assigning..." : "Assign Workout"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
