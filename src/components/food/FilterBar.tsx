import { Link, useNavigate } from "@tanstack/react-router";
import * as stylex from "@stylexjs/stylex";
import type { ListFilters } from "@/lib/food-core";

type Props = {
  region: string;
  guide: string;
  filters: ListFilters;
  hasTea: boolean;
  areas: string[];
};

export const hasFilters = (f: ListFilters) => Boolean(f.kind || f.nbhd || f.min);

export function describeFilters(f: ListFilters): string {
  return [f.kind && (f.kind === "tea" ? "Tea & boba" : "Coffee"), f.nbhd, f.min && `${f.min}+`]
    .filter(Boolean)
    .join(" · ");
}

/** Chips are plain links (work without JS); the neighborhood select navigates on change. */
export function FilterBar({ region, guide, filters, hasTea, areas }: Props) {
  const navigate = useNavigate();
  const params = { region, guide };
  const chip = (label: string, next: ListFilters, on: boolean) => (
    <Link
      to="/food/$region/$guide"
      params={params}
      search={next}
      replace
      resetScroll={false}
      // Link would mark these "current page" by path alone; they're toggles, so
      // match the exact search (never true for a toggle) and announce state instead.
      activeOptions={{ includeSearch: true, exact: true }}
      aria-label={on ? `${label}, selected` : label}
      {...stylex.props(styles.chip, on && styles.chipOn)}
    >
      {label}
    </Link>
  );

  return (
    <div {...stylex.props(styles.bar)} role="group" aria-label="Filters">
      {hasTea && (
        <>
          {chip("All", { ...filters, kind: undefined }, !filters.kind)}
          {chip("Coffee", { ...filters, kind: "coffee" }, filters.kind === "coffee")}
          {chip("Tea & boba", { ...filters, kind: "tea" }, filters.kind === "tea")}
        </>
      )}
      {chip("9+", { ...filters, min: filters.min === 9 ? undefined : 9 }, filters.min === 9)}
      {chip("8+", { ...filters, min: filters.min === 8 ? undefined : 8 }, filters.min === 8)}
      {areas.length > 1 && (
        <select
          aria-label="Neighborhood"
          value={filters.nbhd ?? ""}
          onChange={(e) =>
            void navigate({
              to: "/food/$region/$guide",
              params,
              search: { ...filters, nbhd: e.target.value || undefined },
              replace: true,
              resetScroll: false,
            })
          }
          {...stylex.props(styles.chip, styles.select, Boolean(filters.nbhd) && styles.chipOn)}
        >
          <option value="">Any neighborhood</option>
          {areas.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>
      )}
      {hasFilters(filters) && (
        <Link
          to="/food/$region/$guide"
          params={params}
          search={{}}
          replace
          resetScroll={false}
          activeOptions={{ includeSearch: true, exact: true }}
          {...stylex.props(styles.clear)}
        >
          Clear
        </Link>
      )}
    </div>
  );
}

const chevron =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath d='M2 4l3 3 3-3' fill='none' stroke='%23888' stroke-width='1.4'/%3E%3C/svg%3E\")";

const styles = stylex.create({
  bar: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "0.375rem",
    marginTop: "1.75rem",
  },
  chip: {
    padding: "0.3rem 0.7rem",
    borderRadius: "999px",
    borderWidth: "1px",
    borderColor: "var(--border)",
    backgroundColor: { default: "transparent", ":hover": "var(--secondary)" },
    color: { default: "var(--muted-foreground)", ":hover": "var(--foreground)" },
    fontFamily: "inherit",
    fontSize: "12.5px",
    fontWeight: 500,
    lineHeight: "1.4",
    cursor: "pointer",
    outline: "none",
    boxShadow: {
      default: "none",
      ":focus-visible": "0 0 0 2px var(--background), 0 0 0 4px var(--ring)",
    },
  },
  chipOn: {
    borderColor: "var(--foreground)",
    backgroundColor: { default: "var(--foreground)", ":hover": "var(--foreground)" },
    color: { default: "var(--background)", ":hover": "var(--background)" },
  },
  select: {
    maxWidth: "12rem",
    paddingRight: "1.4rem",
    appearance: "none",
    backgroundImage: chevron,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 0.6rem center",
  },
  clear: {
    padding: "0.3rem 0",
    color: { default: "var(--dim)", ":hover": "var(--foreground)" },
    fontSize: "12px",
    textDecorationLine: "underline",
  },
});
