interface EmptyStateProps {
  folderName?: string;
}

export default function EmptyState({ folderName }: EmptyStateProps) {
  return (
    <div className="max-w-md mx-auto my-16 p-8 sm:p-12 text-center bg-album-surface border border-album-border rounded-lg shadow-card">
      <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-full bg-album-muted text-album-ink-muted">
        <svg
          className="w-6 h-6 stroke-current"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
          />
        </svg>
      </div>

      <h2 className="font-serif text-xl sm:text-2xl text-album-ink font-normal mb-2">
        Album is Empty
      </h2>

      <p className="text-xs sm:text-sm text-album-ink-muted leading-relaxed font-sans mb-6">
        No photographs have been uploaded to this album yet. Add your pictures in Cloudinary
        {folderName ? ` inside the "${folderName}" folder` : ""}, and they will automatically appear here.
      </p>

      <div className="p-3 bg-album-bg border border-album-border-light rounded text-[11px] text-album-ink-faint text-left leading-normal font-mono">
        Cloudinary folder: <span className="text-album-ink">{folderName || "(root)"}</span>
      </div>
    </div>
  );
}
