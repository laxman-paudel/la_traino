import { useMemo } from "react";

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

const difficultyColors = {
  Beginner: "bg-emerald-100 text-emerald-700",
  Intermediate: "bg-amber-100 text-amber-700",
  Advanced: "bg-red-100 text-red-700",
};

function toChipList(arr) {
  if (!arr) return [];
  const list = Array.isArray(arr) ? arr : [arr];
  return list.filter(Boolean);
}

function parseNumberedSteps(text) {
  if (!text) return null;
  const lines = text.split("\n").filter(Boolean);
  const stepRegex = /^\d+[.)]\s*/;
  const hasSteps = lines.some((l) => stepRegex.test(l));
  if (!hasSteps) return <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{text}</p>;

  const steps = lines
    .filter((l) => stepRegex.test(l))
    .map((l) => l.replace(stepRegex, "").trim());

  return (
    <ol className="space-y-3">
      {steps.map((step, i) => (
        <li key={i} className="flex gap-3 text-sm text-gray-600 leading-relaxed">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold shrink-0 mt-0.5">
            {i + 1}
          </span>
          <span className="pt-0.5">{step}</span>
        </li>
      ))}
    </ol>
  );
}

function WarningCard({ text }) {
  if (!text) return null;
  const items = text
    .split("\n")
    .map((l) => l.replace(/^-\s*/, "").replace(/^\d+[.)]\s*/, ""))
    .filter(Boolean);

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200">
          <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <span className="text-sm text-amber-800">{item}</span>
        </div>
      ))}
    </div>
  );
}

function TipCard({ text }) {
  if (!text) return null;
  const items = text
    .split("\n")
    .map((l) => l.replace(/^-\s*/, "").replace(/^\d+[.)]\s*/, ""))
    .filter(Boolean);

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
          <svg className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          <span className="text-sm text-emerald-800">{item}</span>
        </div>
      ))}
    </div>
  );
}

function PlaceholderImage() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
      <div className="text-center">
        <svg className="w-14 h-14 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
        </svg>
        <p className="text-xs text-gray-400 font-medium">No image available</p>
      </div>
    </div>
  );
}

export default function ExerciseDetail({ exercise, onClose }) {
  const primaryList = useMemo(() => toChipList(exercise?.primaryMuscles), [exercise?.primaryMuscles]);
  const secondaryList = useMemo(() => toChipList(exercise?.secondaryMuscles), [exercise?.secondaryMuscles]);

  if (!exercise) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true">
        {/* Header image */}
        <div className="h-56 sm:h-64 relative overflow-hidden">
          {exercise.imageUrl ? (
            <img
              src={exercise.imageUrl}
              alt={exercise.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.nextElementSibling?.classList.remove("hidden");
              }}
            />
          ) : null}
          <div className={exercise.imageUrl ? "hidden absolute inset-0" : "w-full h-full"}>
            <PlaceholderImage />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-sm transition z-10"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Title + badges */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{exercise.name}</h2>
            <div className="flex flex-wrap gap-2">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${categoryColors[exercise.category] || "bg-gray-100 text-gray-700"}`}>
                {exercise.category}
              </span>
              {exercise.difficulty && (
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${difficultyColors[exercise.difficulty] || "bg-gray-100 text-gray-700"}`}>
                  {exercise.difficulty}
                </span>
              )}
              {exercise.equipment && (
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                  {exercise.equipment}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {exercise.description && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Description</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{exercise.description}</p>
            </div>
          )}

          {/* Primary Muscles */}
          {primaryList.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Primary Muscles</h4>
              <div className="flex flex-wrap gap-2">
                {primaryList.map((m) => (
                  <span key={m} className="inline-flex items-center gap-1.5 text-xs font-medium bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Secondary Muscles */}
          {secondaryList.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Secondary Muscles</h4>
              <div className="flex flex-wrap gap-2">
                {secondaryList.map((m) => (
                  <span key={m} className="inline-flex items-center gap-1.5 text-xs font-medium bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          {exercise.instructions && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Instructions</h4>
              {parseNumberedSteps(exercise.instructions)}
            </div>
          )}

          {/* Trainer Tips */}
          {exercise.tips && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Trainer Tips</h4>
              <TipCard text={exercise.tips} />
            </div>
          )}

          {/* Common Mistakes */}
          {exercise.commonMistakes && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Common Mistakes</h4>
              <WarningCard text={exercise.commonMistakes} />
            </div>
          )}

          {/* YouTube Button */}
          {exercise.youtubeUrl && (
            <div className="pt-2">
              <a
                href={exercise.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition shadow-sm shadow-red-200"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                Watch Tutorial
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
