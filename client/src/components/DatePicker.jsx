function formatDateStr(value) {
  if (!value) return "";
  const d = new Date(value + "T00:00:00");
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function DatePicker({ value, onChange, label, required, error }) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type="date"
          value={value || ""}
          min={todayStr()}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full max-w-xs px-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900 appearance-none ${
            error ? "border-red-300 bg-red-50" : "border-gray-300"
          }`}
        />
      </div>
      {value && (
        <p className="text-xs text-gray-500 mt-1">{formatDateStr(value)}</p>
      )}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export { todayStr, formatDateStr };
