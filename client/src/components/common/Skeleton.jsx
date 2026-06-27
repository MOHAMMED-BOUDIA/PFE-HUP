const shimmer = 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded';

export const CardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm space-y-4">
    <div className={`${shimmer} h-4 w-3/4`} />
    <div className={`${shimmer} h-3 w-1/2`} />
    <div className="flex gap-2">
      <div className={`${shimmer} h-8 w-20`} />
      <div className={`${shimmer} h-8 w-20`} />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
    <div className="border-b border-gray-200 dark:border-gray-700 p-4">
      <div className={`${shimmer} h-4 w-1/4`} />
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 p-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
        {Array.from({ length: cols }).map((__, j) => (
          <div key={j} className={`${shimmer} h-4 flex-1`} />
        ))}
      </div>
    ))}
  </div>
);

export const StatSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm space-y-3">
    <div className={`${shimmer} h-3 w-1/3`} />
    <div className={`${shimmer} h-8 w-1/2`} />
    <div className={`${shimmer} h-3 w-2/3`} />
  </div>
);
