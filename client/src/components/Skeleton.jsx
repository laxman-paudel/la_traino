export function SkeletonStatCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="h-3 w-20 bg-gray-200 rounded mb-3 animate-pulse" />
      <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
    </div>
  );
}

export function SkeletonCard({ rows = 3 }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="h-5 w-3/4 bg-gray-200 rounded mb-4 animate-pulse" />
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={`h-3 bg-gray-200 rounded mb-2 animate-pulse ${
            i === rows - 1 ? "w-1/2" : "w-full"
          }`}
        />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="divide-y divide-gray-50">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="px-6 py-4 flex gap-6">
            {Array.from({ length: cols }).map((_, c) => (
              <div
                key={c}
                className="h-4 bg-gray-200 rounded animate-pulse"
                style={{ width: `${40 + c * 15}px` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonLine() {
  return <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />;
}
