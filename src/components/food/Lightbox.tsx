import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef, useState } from "react";
import { photoUrl, type Photo } from "@/lib/food-core";

/**
 * Full-screen, uncropped photo viewer. Slides are a horizontal scroll-snap track,
 * so swiping on touch is native; arrow keys and the side buttons scroll it by one.
 */
export function Lightbox({
  photos,
  name,
  index,
  onClose,
}: {
  photos: Photo[];
  name: string;
  /** The photo to open at; undefined keeps the viewer closed. */
  index?: number;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(index ?? 0);

  useEffect(() => {
    const el = dialog.current;
    if (!el || index === undefined) return;
    el.showModal();
    track.current?.scrollTo({ left: index * track.current.clientWidth, behavior: "instant" });
    setCurrent(index);
  }, [index]);

  const step = (by: number) => track.current?.scrollBy({ left: by * track.current.clientWidth, behavior: "smooth" });
  const photo = photos[current];

  return (
    <dialog
      ref={dialog}
      aria-label={`Photos from ${name}`}
      onClose={onClose}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") step(1);
        if (e.key === "ArrowLeft") step(-1);
      }}
      {...stylex.props(styles.dialog)}
    >
      <div
        ref={track}
        onScroll={(e) => setCurrent(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        {...stylex.props(styles.track)}
      >
        {photos.map((p) => (
          // Clicking the dark area around a photo closes the viewer.
          <div key={p.id} onClick={(e) => e.target === e.currentTarget && dialog.current?.close()} {...stylex.props(styles.slide)}>
            <img
              src={photoUrl(p.id, "1200")}
              width={p.w}
              height={p.h}
              alt={p.caption ? `${p.caption} at ${name}` : `Photo from ${name}`}
              loading="lazy"
              decoding="async"
              {...stylex.props(styles.image)}
            />
          </div>
        ))}
      </div>

      <div {...stylex.props(styles.bar)}>
        <span {...stylex.props(styles.caption)}>{photo?.caption}</span>
        <span {...stylex.props(styles.count)}>
          {current + 1} / {photos.length}
        </span>
      </div>

      <button type="button" aria-label="Close" onClick={() => dialog.current?.close()} {...stylex.props(styles.button, styles.close)}>
        ✕
      </button>
      {photos.length > 1 && (
        <>
          <button type="button" aria-label="Previous photo" onClick={() => step(-1)} {...stylex.props(styles.button, styles.side, styles.prev)}>
            ‹
          </button>
          <button type="button" aria-label="Next photo" onClick={() => step(1)} {...stylex.props(styles.button, styles.side, styles.next)}>
            ›
          </button>
        </>
      )}
    </dialog>
  );
}

const styles = stylex.create({
  dialog: {
    width: "100vw",
    height: "100dvh",
    maxWidth: "none",
    maxHeight: "none",
    margin: 0,
    padding: 0,
    borderWidth: 0,
    backgroundColor: "#0a0a0a",
    color: "#fff",
    overflow: "hidden",
  },
  track: {
    display: "flex",
    height: "100%",
    overflowX: "auto",
    scrollSnapType: "x mandatory",
    overscrollBehavior: "contain",
    scrollbarWidth: "none",
  },
  slide: {
    flex: "0 0 100%",
    display: "grid",
    placeItems: "center",
    padding: "3.5rem 1rem 4.5rem",
    scrollSnapAlign: "center",
  },
  image: {
    display: "block",
    maxWidth: "100%",
    maxHeight: "100%",
    width: "auto",
    height: "auto",
    objectFit: "contain",
    borderRadius: "0.5rem",
  },
  bar: {
    position: "absolute",
    insetInline: 0,
    bottom: 0,
    display: "flex",
    justifyContent: "space-between",
    gap: "1rem",
    padding: "1.25rem 1.25rem calc(1.25rem + env(safe-area-inset-bottom))",
    fontSize: "13px",
    pointerEvents: "none",
  },
  caption: {
    color: "rgba(255, 255, 255, 0.9)",
  },
  count: {
    color: "rgba(255, 255, 255, 0.5)",
    fontVariantNumeric: "tabular-nums",
  },
  button: {
    position: "absolute",
    display: "grid",
    placeItems: "center",
    width: "2.5rem",
    height: "2.5rem",
    borderRadius: "999px",
    borderWidth: 0,
    backgroundColor: { default: "rgba(255, 255, 255, 0.08)", ":hover": "rgba(255, 255, 255, 0.16)" },
    color: "#fff",
    cursor: "pointer",
  },
  close: {
    top: "0.75rem",
    right: "0.75rem",
    fontSize: "14px",
  },
  side: {
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "22px",
    lineHeight: 1,
    // Touch screens swipe instead.
    display: { default: "none", "@media (hover: hover)": "grid" },
  },
  prev: {
    left: "1rem",
  },
  next: {
    right: "1rem",
  },
});
