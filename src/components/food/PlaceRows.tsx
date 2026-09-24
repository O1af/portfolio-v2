import { Link } from "@tanstack/react-router";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef, useState } from "react";
import type { Row } from "@/lib/food";
import { photoUrl } from "@/lib/food-core";
import { formatScore } from "@/lib/food-format";

const MONOGRAM_STOPWORDS = new Set(["the", "of", "and", "&", "a"]);

export function monogram(name: string): string {
  const words = name.split(/\s+/).filter((w) => /^[a-z0-9]/i.test(w) && !MONOGRAM_STOPWORDS.has(w.toLowerCase()));
  return ((words[0]?.[0] ?? "") + (words[1]?.[0] ?? words[0]?.[1] ?? "")).toUpperCase();
}

export function Thumb({ photo, name }: { photo?: string; name: string }) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  // An image that failed before hydration never fires onError for React; check once mounted.
  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth === 0) setFailed(true);
  }, []);
  return (
    <span {...stylex.props(styles.thumb)} aria-hidden="true">
      {photo && !failed ? (
        <img
          ref={ref}
          src={photoUrl(photo, "sq")}
          srcSet={`${photoUrl(photo, "sq128")} 128w, ${photoUrl(photo, "sq")} 192w`}
          sizes="(min-width: 640px) 84px, 64px"
          alt=""
          width={192}
          height={192}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          {...stylex.props(styles.thumbImage)}
        />
      ) : (
        monogram(name)
      )}
    </span>
  );
}

function RowBody({ row }: { row: Row }) {
  const sub = [row.area, row.dish, row.closed && "Closed"].filter(Boolean).join(" · ");
  return (
    <>
      <span {...stylex.props(styles.rank)}>{row.rank}</span>
      <Thumb photo={row.photo} name={row.name} />
      <span {...stylex.props(styles.body)}>
        <span {...stylex.props(styles.name, row.hasPage && styles.linkedName)}>{row.name}</span>
        {sub && <span {...stylex.props(styles.sub)}>{sub}</span>}
        {row.note && <span {...stylex.props(styles.note)}>{row.note}</span>}
      </span>
      <span {...stylex.props(styles.score)}>{formatScore(row.score)}</span>
    </>
  );
}

/** Ranked list. Places with a page link to it; score-only places are plain rows. */
export function PlaceRows({ rows, focused = -1 }: { rows: Row[]; focused?: number }) {
  return (
    <ol {...stylex.props(styles.rows)}>
      {rows.map((row, i) => {
        const rowStyle = {
          ...stylex.props(styles.row, i === rows.length - 1 && styles.lastRow, row.closed && styles.closed, i === focused && styles.focused),
          "data-food-row": "",
        };
        return (
          <li key={row.slug}>
            {row.hasPage ? (
              <Link to="/food/place/$slug" params={{ slug: row.slug }} {...rowStyle}>
                <RowBody row={row} />
              </Link>
            ) : (
              <div {...rowStyle}>
                <RowBody row={row} />
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

const styles = stylex.create({
  rows: {
    display: "flex",
    flexDirection: "column",
    marginTop: "0.5rem",
    listStyle: "none",
  },
  row: {
    "--name-decoration": { default: "none", ":hover": "underline", ":focus-visible": "underline" },
    display: "grid",
    gridTemplateColumns: {
      default: "1.25rem 64px 1fr auto",
      "@media (min-width: 640px)": "1.5rem 84px 1fr auto",
    },
    alignItems: "start",
    gap: { default: "0.75rem", "@media (min-width: 640px)": "1rem" },
    marginInline: "-0.5rem",
    padding: "1rem 0.5rem",
    borderRadius: "0.5rem",
    borderBottomWidth: "1px",
    borderColor: "var(--border)",
    outline: "none",
    boxShadow: {
      default: "none",
      ":focus-visible": "0 0 0 2px var(--background), 0 0 0 4px var(--ring)",
    },
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  focused: {
    backgroundColor: "var(--secondary)",
    boxShadow: "inset 2px 0 0 var(--foreground)",
  },
  closed: {
    opacity: 0.6,
  },
  rank: {
    paddingTop: "0.15rem",
    color: "var(--dim)",
    fontSize: "12px",
    fontVariantNumeric: "tabular-nums",
  },
  thumb: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: { default: "64px", "@media (min-width: 640px)": "84px" },
    aspectRatio: "1",
    overflow: "hidden",
    borderRadius: "0.5rem",
    borderWidth: "1px",
    borderColor: "var(--border)",
    backgroundColor: "var(--secondary)",
    color: "var(--dim)",
    fontFamily: "var(--font-mono)",
    fontSize: "16px",
    fontWeight: 600,
  },
  thumbImage: {
    display: "block",
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  body: {
    minWidth: 0,
  },
  name: {
    display: "block",
    color: "var(--foreground)",
    fontSize: "15.5px",
    fontWeight: 500,
    lineHeight: "1.375",
    textWrap: "pretty",
  },
  linkedName: {
    textDecorationLine: "var(--name-decoration)",
  },
  sub: {
    display: "block",
    marginTop: "0.25rem",
    color: "var(--dim)",
    fontSize: "12.5px",
    lineHeight: "1.4",
  },
  note: {
    display: "-webkit-box",
    marginTop: "0.375rem",
    overflow: "hidden",
    color: "var(--muted-foreground)",
    fontSize: "13px",
    lineHeight: "1.55",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
  },
  score: {
    paddingTop: "0.1rem",
    color: "var(--foreground)",
    fontFamily: "var(--font-mono)",
    fontSize: "15px",
    fontWeight: 600,
    letterSpacing: "-0.02em",
    fontVariantNumeric: "tabular-nums",
  },
});
