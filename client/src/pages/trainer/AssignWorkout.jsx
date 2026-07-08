import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { assignWorkout } from "../../api/trainer";
import { useToast } from "../../context/ToastContext";
import PageHeader from "../../components/PageHeader";
import ExercisePicker from "../../components/ExercisePicker";
import ExerciseConfigCard from "../../components/ExerciseConfigCard";
import WorkoutSummary from "../../components/WorkoutSummary";
import WorkoutPreview from "../../components/WorkoutPreview";

const DAYS = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
];

let keyCounter = 0;
function nextKey() {
  return `ex_${++keyCounter}_${Date.now()}`;
}

function makeExercise(libEx) {
  return {
    _key: nextKey(),
    _name: libEx.name,
    _category: libEx.category,
    _difficulty: libEx.difficulty,
    _exerciseId: libEx.id,
    _imageUrl: libEx.imageUrl,
    sets: "3",
    reps: "10",
    weight: "",
    restTime: "",
    tempo: "",
    notes: "",
    _error: {},
  };
}

function cloneExercise(ex) {
  return { ...ex, _key: nextKey(), _error: {} };
}

function validateExercises(list) {
  let valid = true;
  const next = list.map((ex) => {
    const err = {};
    const sets = parseInt(ex.sets, 10);
    const reps = parseInt(ex.reps, 10);
    if (!ex.sets || !Number.isInteger(sets) || sets <= 0) {
      err.sets = "Must be > 0";
      valid = false;
    }
    if (!ex.reps || !Number.isInteger(reps) || reps <= 0) {
      err.reps = "Must be > 0";
      valid = false;
    }
    return { ...ex, _error: err };
  });
  return { exercises: next, valid };
}

export default function AssignWorkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state: locationState } = useLocation();
  const { addToast } = useToast();

  const [day, setDay] = useState(locationState?.prefillDay || "");
  const [exercises, setExercises] = useState([]);
  const [step, setStep] = useState("builder"); // builder | mobile-pick
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const addedIds = exercises.map((ex) => ex._exerciseId);

  const handleAdd = useCallback((libEx) => {
    setExercises((prev) => [...prev, makeExercise(libEx)]);
    addToast(`Added ${libEx.name}`, "info");
  }, [addToast]);

  const handleChange = useCallback((index, field, value) => {
    setExercises((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value, _error: { ...next[index]._error, [field]: "" } };
      return next;
    });
  }, []);

  const handleRemove = useCallback((index) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleDuplicate = useCallback((index) => {
    setExercises((prev) => {
      const next = [...prev];
      next.splice(index + 1, 0, cloneExercise(next[index]));
      return next;
    });
  }, []);

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setExercises((prev) => {
      const oldIdx = prev.findIndex((ex) => ex._key === active.id);
      const newIdx = prev.findIndex((ex) => ex._key === over.id);
      if (oldIdx === -1 || newIdx === -1) return prev;
      return arrayMove(prev, oldIdx, newIdx);
    });
  }, []);

  const handlePreview = () => {
    const { exercises: validated, valid } = validateExercises(exercises);
    setExercises(validated);
    if (!valid) {
      addToast("Fix validation errors before saving", "error");
      return;
    }
    if (!day.trim()) {
      setError("Please select a day");
      return;
    }
    setError("");
    setShowPreview(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await assignWorkout(id, {
        day,
        exercises: exercises.map((ex) => ({
          name: ex._name,
          sets: parseInt(ex.sets, 10),
          reps: parseInt(ex.reps, 10),
          weight: ex.weight || undefined,
          restTime: ex.restTime || undefined,
          tempo: ex.tempo || undefined,
          notes: ex.notes || undefined,
          order: exercises.indexOf(ex),
        })),
      });
      addToast("Workout assigned successfully", "success");
      navigate("/trainer/dashboard");
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to assign workout";
      setError(msg);
      addToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const keys = exercises.map((ex) => ex._key);

  const pickerPanel = (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <h3 className="text-sm font-bold text-gray-900 mb-3">Exercise Library</h3>
      <ExercisePicker onAdd={handleAdd} addedIds={addedIds} />
    </div>
  );

  const builderPanel = (
    <div className="space-y-4">
      {/* Day selector */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <label htmlFor="builder-day" className="block text-sm font-semibold text-gray-900 mb-2">
          Day
        </label>
        <select
          id="builder-day"
          value={day}
          onChange={(e) => { setDay(e.target.value); setError(""); }}
          className={`w-full max-w-xs px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none ${
            error ? "border-red-300 bg-red-50" : "border-gray-200"
          }`}
        >
          <option value="">Choose a day</option>
          {DAYS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>

      {/* Summary */}
      <WorkoutSummary exercises={exercises} />

      {/* Selected exercises */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900">
            Workout ({exercises.length} exercise{exercises.length !== 1 ? "s" : ""})
          </h3>
          {exercises.length === 0 && (
            <p className="text-xs text-gray-400">Pick exercises from the library</p>
          )}
        </div>

        {exercises.length > 0 ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={keys} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {exercises.map((ex, i) => (
                  <ExerciseConfigCard
                    key={ex._key}
                    exercise={ex}
                    index={i}
                    onChange={handleChange}
                    onRemove={handleRemove}
                    onDuplicate={handleDuplicate}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="py-8 text-center">
            <svg className="w-10 h-10 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
            </svg>
            <p className="text-sm text-gray-400">No exercises added yet.</p>
            <p className="text-xs text-gray-300 mt-1">Search and click "Add" from the library panel.</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => navigate("/trainer/dashboard")}
          className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium text-sm"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handlePreview}
          disabled={exercises.length === 0}
          className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold text-sm shadow-sm shadow-indigo-200"
        >
          Preview & Save
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assign Workout"
        subtitle="Build a workout using the exercise library"
      />

      {/* Mobile step indicator */}
      <div className="flex lg:hidden gap-2">
        <button
          type="button"
          onClick={() => setStep("mobile-pick")}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
            step === "mobile-pick"
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          1. Pick Exercises
        </button>
        <button
          type="button"
          onClick={() => setStep("builder")}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
            step === "builder"
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          2. Build Workout
        </button>
      </div>

      {/* Desktop: two columns */}
      <div className="hidden lg:grid lg:grid-cols-5 gap-6 items-start">
        <div className="lg:col-span-3">
          {pickerPanel}
        </div>
        <div className="lg:col-span-2">
          {builderPanel}
        </div>
      </div>

      {/* Tablet: stacked */}
      <div className="hidden md:block lg:hidden space-y-6">
        {pickerPanel}
        {builderPanel}
      </div>

      {/* Mobile: stepper */}
      <div className="md:hidden">
        {step === "mobile-pick" ? pickerPanel : builderPanel}
      </div>

      {/* Preview modal */}
      <WorkoutPreview
        open={showPreview}
        day={day}
        exercises={exercises}
        onClose={() => setShowPreview(false)}
        onConfirm={handleSave}
        saving={saving}
      />
    </div>
  );
}
