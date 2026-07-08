import { Link } from "react-router-dom";

function CrumbIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

export default function Breadcrumbs({ items }) {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-1" aria-label="Breadcrumb">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <CrumbIcon />}
            {isLast || !item.path ? (
              <span className={isLast ? "text-gray-600 font-medium" : ""}>{item.label}</span>
            ) : (
              <Link to={item.path} className="hover:text-gray-600 transition">{item.label}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
