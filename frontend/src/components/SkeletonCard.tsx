// SkeletonCard — shimmer placeholder for ProductCard
const SkeletonCard = () => (
  <article className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-100">
    {/* Image area */}
    <div className="aspect-[1/1.05] animate-shimmer bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 bg-[length:400%_100%]" />
    {/* Info area */}
    <div className="space-y-3 p-4">
      <div className="h-3 w-16 animate-shimmer rounded-full bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 bg-[length:400%_100%]" />
      <div className="h-4 w-full animate-shimmer rounded-full bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 bg-[length:400%_100%]" />
      <div className="h-4 w-4/5 animate-shimmer rounded-full bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 bg-[length:400%_100%]" />
      <div className="flex items-center gap-3 pt-1">
        <div className="h-5 w-24 animate-shimmer rounded-full bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 bg-[length:400%_100%]" />
        <div className="h-3 w-16 animate-shimmer rounded-full bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 bg-[length:400%_100%]" />
      </div>
      <div className="flex items-center gap-1.5">
        <div className="h-2 w-2 rounded-full bg-slate-100" />
        <div className="h-3 w-14 animate-shimmer rounded-full bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 bg-[length:400%_100%]" />
      </div>
    </div>
  </article>
);

// SkeletonGrid — grid of N skeleton cards
export const SkeletonGrid = ({ count = 10 }: { count?: number }) => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export default SkeletonCard;
