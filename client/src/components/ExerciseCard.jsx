import OverflowMenu from "./OverflowMenu";
import StatusBadge from "./StatusBadge";

const categoryColors = {
  chest: "bg-red-100 text-red-700",
  back: "bg-blue-100 text-blue-700",
  legs: "bg-purple-100 text-purple-700",
  glutes: "bg-pink-100 text-pink-700",
  calves: "bg-teal-100 text-teal-700",
  shoulders: "bg-orange-100 text-orange-700",
  biceps: "bg-cyan-100 text-cyan-700",
  triceps: "bg-indigo-100 text-indigo-700",
  forearms: "bg-amber-100 text-amber-700",
  core: "bg-green-100 text-green-700",
  cardio: "bg-rose-100 text-rose-700",
  mobility: "bg-sky-100 text-sky-700",
  stretching: "bg-lime-100 text-lime-700",
  neck: "bg-gray-100 text-gray-700",
  "full-body": "bg-violet-100 text-violet-700",
};

const difficultyVariants = {
  Beginner: "success",
  Intermediate: "warning",
  Advanced: "danger",
};

export default function ExerciseCard({ exercise, onView, onEdit, onDelete }) {
  const isCustom = !!exercise.trainerId;
  const muscles = exercise.primaryMuscles
    ? (Array.isArray(exercise.primaryMuscles) ? exercise.primaryMuscles : [exercise.primaryMuscles]).slice(0, 2)
    : [];

  const menuItems = [
    { label: "View", onClick: () => onView(exercise) },
    ...(isCustom ? [
      { label: "Edit", onClick: () => onEdit(exercise) },
      { label: "Delete", danger: true, onClick: () => onDelete(exercise) },
    ] : []),
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group">
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-sm truncate">{exercise.name}</h3>
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {isCustom && <StatusBadge variant="primary">Custom</StatusBadge>}
            <OverflowMenu items={menuItems} />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-2">
          {exercise.category && (
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${categoryColors[exercise.category] || "bg-gray-100 text-gray-700"}`}>
              {exercise.category}
            </span>
          )}
          {exercise.difficulty && (
            <StatusBadge variant={difficultyVariants[exercise.difficulty] || "gray"}>{exercise.difficulty}</StatusBadge>
          )}
        </div>

        {exercise.equipment && (
          <p className="text-xs text-gray-500 mb-2">{exercise.equipment}</p>
        )}
        {muscles.length > 0 && (
          <p className="text-xs text-gray-400 truncate">{muscles.join(", ")}</p>
        )}
      </div>
    </div>
  );
}
