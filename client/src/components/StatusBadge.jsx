const STYLES = {
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  info: "bg-blue-100 text-blue-700",
  danger: "bg-red-100 text-red-700",
  primary: "bg-indigo-100 text-indigo-700",
  gray: "bg-gray-100 text-gray-600",
};

export default function StatusBadge({ variant = "gray", children, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${STYLES[variant] || STYLES.gray} ${className}`}>
      {children}
    </span>
  );
}
