export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-xl border border-border bg-card"
          />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-xl border border-border bg-card" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-72 animate-pulse rounded-xl border border-border bg-card" />
        <div className="h-72 animate-pulse rounded-xl border border-border bg-card" />
      </div>
    </div>
  );
}
