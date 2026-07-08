export default function SectionCard({ title, children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${className}`}>
      {title && (
        <div className="px-6 pt-6 pb-0">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        </div>
      )}
      <div className={title ? "p-6" : "p-6"}>{children}</div>
    </div>
  );
}
