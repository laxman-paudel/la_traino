import { useState, useEffect, useCallback, useRef } from "react";
import { getTraineeCalendar } from "../../api/calendar";
import { useToast } from "../../context/ToastContext";
import Calendar from "../../components/Calendar";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { SkeletonCard } from "../../components/Skeleton";

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

export default function TraineeCalendar() {
  const { addToast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mode, setMode] = useState("month");
  const [events, setEvents] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const mountedRef = useRef(true);

  const fetchMonth = useCallback(async (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const monthKey = `${year}-${month}`;
    setLoading(true);
    try {
      const res = await getTraineeCalendar(monthKey);
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
    return () => { mountedRef.current = false; };
  }, []);

  function renderDayContent(dateKey, eventData, isDetailed) {
    if (!eventData) {
      if (isDetailed) {
        return (
          <div className="flex items-center gap-2 py-4">
            <span className="w-2 h-2 rounded-full bg-gray-300" />
            <span className="text-sm text-gray-400">No workout assigned</span>
          </div>
        );
      }
      return null;
    }

    const { hasWorkout, workoutName, exerciseCount, completed } = eventData;

    if (isDetailed) {
      if (!hasWorkout) {
        return (
          <div className="flex items-center gap-2 py-4">
            <span className="w-2 h-2 rounded-full bg-gray-300" />
            <span className="text-sm text-gray-400">No workout assigned</span>
          </div>
        );
      }
      return (
        <div className="space-y-2 py-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">{workoutName || "Workout"}</p>
            <StatusBadge status={completed ? "completed" : "pending"} />
          </div>
          <p className="text-xs text-gray-500">{exerciseCount} exercise{exerciseCount !== 1 ? "s" : ""}</p>
        </div>
      );
    }

    return (
      <div className="mt-1">
        {hasWorkout ? (
          <div className="flex items-center gap-1">
            <span className={`inline-block w-2 h-2 rounded-full ${completed ? "bg-green-500" : "bg-amber-400"}`} />
            <span className="text-[10px] text-gray-600 truncate block">{workoutName || "Workout"}</span>
          </div>
        ) : (
          <span className="text-[10px] text-gray-300">No workout</span>
        )}
      </div>
    );
  }

  const selectedDateKey = selectedDate ? formatDateKey(selectedDate) : null;
  const selectedEventData = selectedDateKey ? events[selectedDateKey] : null;

  const detailPanel = selectedDate ? (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-sm font-bold text-gray-900">
          {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </h3>
      </div>
      <div className="p-6">
        {selectedEventData && selectedEventData.hasWorkout ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{selectedEventData.workoutName || "Workout"}</p>
                <p className="text-xs text-gray-500">{selectedEventData.exerciseCount} exercise{selectedEventData.exerciseCount !== 1 ? "s" : ""}</p>
              </div>
              <StatusBadge status={selectedEventData.completed ? "completed" : "pending"} />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 py-4">
            <span className="w-2 h-2 rounded-full bg-gray-300" />
            <span className="text-sm text-gray-400">No workout assigned for this date</span>
          </div>
        )}
      </div>
    </div>
  ) : null;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <PageHeader title="Calendar" description="View your assigned workouts" />
        <CalendarSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader title="Calendar" description="View your assigned workouts" />
      <Calendar
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        mode={mode}
        onModeChange={setMode}
        events={events}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        renderDayContent={renderDayContent}
        detailPanel={detailPanel}
      />
    </div>
  );
}
