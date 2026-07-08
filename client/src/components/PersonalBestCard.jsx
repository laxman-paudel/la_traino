const BEST_ICONS = {
  highestWeight: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  mostReps: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  longestDuration: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  longestDistance: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const BEST_LABELS = {
  highestWeight: "Heaviest Weight",
  mostReps: "Most Reps",
  longestDuration: "Longest Duration",
  longestDistance: "Longest Distance",
};

const BEST_COLORS = {
  highestWeight: "bg-orange-50 border-orange-200 text-orange-700",
  mostReps: "bg-blue-50 border-blue-200 text-blue-700",
  longestDuration: "bg-purple-50 border-purple-200 text-purple-700",
  longestDistance: "bg-emerald-50 border-emerald-200 text-emerald-700",
};

export default function PersonalBestCard({ bestKey, best }) {
  if (!best) return null;
  const color = BEST_COLORS[bestKey] || "bg-gray-50 border-gray-200 text-gray-700";

  return (
    <div className={`rounded-xl border-2 p-4 ${color}`}>
      <div className="flex items-center gap-3">
        <div className="shrink-0">{BEST_ICONS[bestKey]}</div>
        <div className="min-w-0">
          <p className="text-xs font-semibold opacity-75">{BEST_LABELS[bestKey] || bestKey}</p>
          <p className="text-lg font-bold">{best.value} <span className="text-sm font-normal opacity-75">{best.unit}</span></p>
          <p className="text-xs opacity-60">{best.day}</p>
        </div>
      </div>
    </div>
  );
}
