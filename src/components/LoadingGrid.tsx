export default function LoadingGrid() {
  const dummyCards = Array.from({ length: 8 });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 lg:gap-8">
      {dummyCards.map((_, i) => (
        <div
          key={i}
          className="bg-album-surface border border-album-border rounded p-2.5 sm:p-3 shadow-card"
        >
          {/* Skeleton photo frame */}
          <div
            className="w-full bg-album-muted rounded-sm animate-pulse"
            style={{
              paddingBottom: `${i % 2 === 0 ? "75%" : "100%"}`,
            }}
          />
          {/* Skeleton caption */}
          <div className="mt-3 flex items-center justify-between gap-4">
            <div className="h-3 bg-album-muted rounded w-1/2 animate-pulse" />
            <div className="h-2.5 bg-album-muted rounded w-1/4 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
