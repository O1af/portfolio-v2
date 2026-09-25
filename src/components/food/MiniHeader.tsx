import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";

const SHOW_AFTER = 220;

/** Slim bar under the site header once the page title has scrolled away. */
export function MiniHeader({ title, detail }: { title: string; detail?: string }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const update = () => setShown(window.scrollY > SHOW_AFTER);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div {...stylex.props(styles.bar, shown && styles.shown)} aria-hidden={!shown}>
      <div {...stylex.props(styles.inner)}>
        <span {...stylex.props(styles.title)}>{title}</span>
        {detail && <span {...stylex.props(styles.detail)}>{detail}</span>}
        <button
          type="button"
          tabIndex={shown ? 0 : -1}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          {...stylex.props(styles.top)}
        >
          Top ↑
        </button>
      </div>
    </div>
  );
}

const styles = stylex.create({
  bar: {
    position: "fixed",
    top: "3.5rem",
    left: 0,
    right: 0,
    zIndex: 49,
    borderBottomWidth: "1px",
    borderColor: "var(--border)",
    backgroundColor: "color-mix(in oklab, var(--background) 85%, transparent)",
    backdropFilter: "blur(40px)",
    transform: "translateY(-110%)",
    visibility: "hidden",
    transitionProperty: "transform, visibility",
    transitionDuration: { default: "200ms", "@media (prefers-reduced-motion: reduce)": "0s" },
    transitionTimingFunction: "ease",
  },
  shown: {
    transform: "none",
    visibility: "visible",
  },
  inner: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    maxWidth: "42rem",
    height: "2.5rem",
    marginInline: "auto",
    paddingInline: "1.25rem",
    overflow: "hidden",
    fontSize: "13px",
  },
  title: {
    flexShrink: 0,
    color: "var(--foreground)",
    fontWeight: 500,
    whiteSpace: "nowrap",
  },
  detail: {
    minWidth: 0,
    overflow: "hidden",
    color: "var(--dim)",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  top: {
    marginLeft: "auto",
    flexShrink: 0,
    padding: 0,
    backgroundColor: "transparent",
    color: { default: "var(--muted-foreground)", ":hover": "var(--foreground)" },
    fontFamily: "inherit",
    fontSize: "13px",
    whiteSpace: "nowrap",
    cursor: "pointer",
  },
});
