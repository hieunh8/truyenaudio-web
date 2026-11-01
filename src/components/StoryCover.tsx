import CoverArt from "./CoverArt";

/**
 * Procedural cover. The wrapper has a fixed 3:4 aspect ratio so it never shifts layout.
 * Decorative (aria-hidden): the adjacent text already carries the story title.
 */
export default function StoryCover({
  slug,
  title,
  className = "",
  showTitle = true,
}: {
  slug: string;
  title: string;
  className?: string;
  showTitle?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={`relative aspect-[3/4] w-full overflow-hidden rounded-[10px] bg-surface2 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.55)] ring-1 ring-white/10 ${className}`}
      style={{ containerType: "inline-size" }}
    >
      <div className="absolute inset-0">
        <CoverArt slug={slug} />
      </div>
      {showTitle && (
        <>
          <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-[7cqw]">
            <div className="mb-[3cqw] h-px w-[14cqw] bg-[#D9B25F]" />
            <p
              className="line-clamp-3 font-display font-bold leading-[1.15] text-[#F5EFE0] [text-shadow:0_1px_6px_rgba(0,0,0,0.6)]"
              style={{ fontSize: "9cqw" }}
            >
              {title}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
