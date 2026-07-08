import { useMemo } from "react";

function SimpleBarChart({ data, dataKey, label, color, unit }) {
  const maxVal = useMemo(() => Math.max(...data.map((d) => d[dataKey] || 0), 1), [data, dataKey]);
  const height = 180;

  if (data.length === 0) {
    return (
      <div className="text-center text-gray-400 text-sm py-6">No {label.toLowerCase()} data to chart.</div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-gray-700">{label}</h4>
      <div className="relative" style={{ height }}>
        <svg width="100%" height={height} className="overflow-visible">
          {data.map((d, i) => {
            const val = d[dataKey] || 0;
            const pct = val / maxVal;
            const barWidth = Math.max(8, Math.min(40, (100 / data.length) - 4));
            const x = `${(i / data.length) * 100 + (100 / data.length / 2 - barWidth / 2)}%`;
            const barH = pct * (height - 30);
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={height - 20 - barH}
                  width={barWidth}
                  height={barH}
                  rx={3}
                  fill={color || "#6366f1"}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <title>{d.day}: {val}{unit ? ` ${unit}` : ""}</title>
                </rect>
                <text
                  x={x}
                  y={height - 5}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#9ca3af"
                  transform={`rotate(-45, ${parseFloat(x) + barWidth / 2}, ${height - 5})`}
                >
                  {d.day?.slice(5) || ""}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function processChartData(history, field) {
  return history
    .filter((h) => {
      const val = field === "sets"
        ? h.actual.setsCompleted
        : field === "reps"
          ? (Array.isArray(h.sets) ? Math.max(...h.sets.map((s) => parseInt(s.reps, 10) || 0)) : 0)
          : parseFloat(h.actual[field]);
      return !isNaN(val) && val > 0;
    })
    .map((h) => ({
      day: h.day,
      [field === "reps" ? "reps" : field === "sets" ? "setsCompleted" : field]: (
        field === "sets"
          ? h.actual.setsCompleted
          : field === "reps"
            ? (Array.isArray(h.sets) ? Math.max(...h.sets.map((s) => parseInt(s.reps, 10) || 0)) : 0)
            : parseFloat(h.actual[field])
      ),
    }))
    .reverse();
}

export default function ExerciseChart({ history }) {
  const weightData = useMemo(() => processChartData(history, "weight"), [history]);
  const repsData = useMemo(() => processChartData(history, "reps"), [history]);
  const setsData = useMemo(() => processChartData(history, "sets"), [history]);
  const durationData = useMemo(() => processChartData(history, "duration"), [history]);
  const distanceData = useMemo(() => processChartData(history, "distance"), [history]);

  const hasWeight = weightData.length > 0;
  const hasReps = repsData.length > 0;
  const hasSets = setsData.length > 0;
  const hasDuration = durationData.length > 0;
  const hasDistance = distanceData.length > 0;

  if (!hasWeight && !hasReps && !hasSets && !hasDuration && !hasDistance) {
    return (
      <div className="text-center text-gray-400 text-sm py-6">
        No progression data available yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {hasWeight && (
        <SimpleBarChart data={weightData} dataKey="weight" label="Weight Over Time" color="#f97316" unit="kg" />
      )}
      {hasReps && (
        <SimpleBarChart data={repsData} dataKey="reps" label="Max Reps Over Time" color="#6366f1" unit="reps" />
      )}
      {hasSets && (
        <SimpleBarChart data={setsData} dataKey="setsCompleted" label="Sets Completed" color="#22c55e" unit="sets" />
      )}
      {hasDuration && (
        <SimpleBarChart data={durationData} dataKey="duration" label="Duration Over Time" color="#a855f7" unit="min" />
      )}
      {hasDistance && (
        <SimpleBarChart data={distanceData} dataKey="distance" label="Distance Over Time" color="#14b8a6" unit="km" />
      )}
    </div>
  );
}
