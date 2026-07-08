export default function WorkoutSummary({ exercises }) {
  const total = exercises.length;
  const totalSets = exercises.reduce((sum, ex) => sum + (parseInt(ex.sets, 10) || 0), 0);
  const totalReps = exercises.reduce((sum, ex) => sum + (parseInt(ex.reps, 10) || 0), 0);

  const estMinutes = exercises.reduce((sum, ex) => {
    const sets = parseInt(ex.sets, 10) || 3;
    const rest = ex.restTime ? parseInt(ex.restTime, 10) || 60 : 60;
    return sum + sets * (rest + 30) / 60;
  }, 0);
  const estDuration = Math.round(estMinutes);

  const diffCounts = {};
  exercises.forEach((ex) => {
    const d = ex._difficulty || ex.difficulty;
    if (d) diffCounts[d] = (diffCounts[d] || 0) + 1;
  });
  const difficulty =
    diffCounts.Advanced >= total / 2
      ? "Advanced"
      : diffCounts.Intermediate >= total / 2
        ? "Intermediate"
        : total === 0 ? "—" : "Beginner";

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        { label: "Exercises", value: total, color: "text-indigo-600", bg: "bg-indigo-50" },
        { label: "Total Sets", value: totalSets, color: "text-purple-600", bg: "bg-purple-50" },
        { label: "Est. Duration", value: `${estDuration} min`, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Difficulty", value: difficulty, color: "text-amber-600", bg: "bg-amber-50" },
      ].map((s) => (
        <div key={s.label} className={`${s.bg} rounded-xl p-3`}>
          <p className="text-[10px] font-medium text-gray-500 mb-0.5">{s.label}</p>
          <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}
