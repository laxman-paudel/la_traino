import OverflowMenu from "./OverflowMenu";
import StatusBadge from "./StatusBadge";

const difficultyColors = {
  Beginner: "success",
  Intermediate: "warning",
  Advanced: "danger",
};

export default function TemplateCard({ template, onPreview, onEdit, onDuplicate, onAssign, onArchive, onRestore, onDelete, onToggleFavorite }) {
  const exerciseCount = Array.isArray(template.exercises) ? template.exercises.length : 0;
  const isArchived = template.archived;
  const diffVariant = difficultyColors[template.difficulty] || "gray";

  const menuItems = [
    { label: "Preview", onClick: () => onPreview(template) },
    { label: "Edit", onClick: () => onEdit(template) },
    { label: "Duplicate", onClick: () => onDuplicate(template) },
    { divider: true },
    { label: "Assign", onClick: () => onAssign(template) },
    { label: template.favorited ? "Unfavorite" : "Favorite", onClick: () => onToggleFavorite(template) },
    { divider: true },
    ...(isArchived
      ? [{ label: "Restore", onClick: () => onRestore(template) }]
      : [{ label: "Archive", onClick: () => onArchive(template) }]),
    { label: "Delete", danger: true, onClick: () => onDelete(template) },
  ];

  return (
    <div className={`bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-md transition group ${isArchived ? "border-gray-200 opacity-70" : "border-gray-100"}`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm truncate">{template.name}</h3>
            {template.favorited && (
              <svg className="w-4 h-4 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            )}
          </div>
          {isArchived && <StatusBadge variant="gray">Archived</StatusBadge>}
          <OverflowMenu items={menuItems} />
        </div>

        {template.description && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2">{template.description}</p>
        )}

        <div className="flex flex-wrap gap-2 text-xs text-gray-400 mb-3">
          <span>{exerciseCount} exercise{exerciseCount !== 1 ? "s" : ""}</span>
          {template.difficulty && (
            <StatusBadge variant={diffVariant}>{template.difficulty}</StatusBadge>
          )}
          {template.estimatedDuration && <span>· ~{template.estimatedDuration} min</span>}
        </div>

        <div className="pt-3 border-t border-gray-50">
          <button type="button" onClick={() => onAssign(template)}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition">
            Assign to Trainees
          </button>
        </div>
      </div>
    </div>
  );
}
