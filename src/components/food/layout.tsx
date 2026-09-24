import { Link } from "@tanstack/react-router";
import * as stylex from "@stylexjs/stylex";
import { Fragment, type ReactNode } from "react";
import type { GuideLink } from "@/lib/food";

export function FoodMain({ children }: { children: ReactNode }) {
  return (
    <main id="main-content" {...stylex.props(styles.main)}>
      <div {...stylex.props(styles.content)}>{children}</div>
    </main>
  );
}

/** Breadcrumb trail; the last item is the current page and isn't linked. */
export function Crumbs({ children }: { children: ReactNode[] }) {
  return (
    <nav aria-label="Breadcrumb" {...stylex.props(styles.crumbs)}>
      {children.map((child, i) => (
        <Fragment key={i}>
          {i > 0 && <span aria-hidden="true"> / </span>}
          {child}
        </Fragment>
      ))}
    </nav>
  );
}

export function PageTitle({ children }: { children: ReactNode }) {
  return <h1 {...stylex.props(styles.title)}>{children}</h1>;
}

export function Lead({ children }: { children: ReactNode }) {
  return <p {...stylex.props(styles.lead)}>{children}</p>;
}

export function SectionHeading({ title, meta, as: Tag = "h2" }: { title: string; meta?: ReactNode; as?: "h2" | "h3" }) {
  return (
    <div {...stylex.props(styles.sectionHeading)}>
      <Tag {...stylex.props(styles.sectionTitle)}>{title}</Tag>
      {meta && <span {...stylex.props(styles.sectionMeta)}>{meta}</span>}
    </div>
  );
}

export function GuideList({ region, guides }: { region: string; guides: GuideLink[] }) {
  return (
    <div {...stylex.props(styles.list)}>
      {guides.map((guide, i) => (
        <Link
          key={guide.segment}
          to="/food/$region/$guide"
          params={{ region, guide: guide.segment }}
          {...stylex.props(styles.item, i < guides.length - 1 && styles.divider)}
        >
          <span {...stylex.props(styles.itemName)}>{guide.label}</span>
          <span {...stylex.props(styles.itemCount)}>{guide.count}</span>
        </Link>
      ))}
    </div>
  );
}

export function HowIRate() {
  return (
    <p {...stylex.props(styles.method)}>
      <strong {...stylex.props(styles.methodLead)}>How I rate.</strong> Scores come from Beli's pairwise ranking,
      so a 10 means it beat everything else I've had in the category, not that it's perfect. Nothing here is
      sponsored.
    </p>
  );
}

/** Spread `stylex.props(crumbStyles.link)` onto links inside <Crumbs>. */
export const crumbStyles = stylex.create({
  link: {
    color: { default: "inherit", ":hover": "var(--foreground)" },
    textDecorationLine: { default: "none", ":hover": "underline" },
  },
});

const styles = stylex.create({
  main: {
    minHeight: "100vh",
    padding: {
      default: "7rem 1.25rem 4rem",
      "@media (min-width: 640px)": "8rem 1.5rem 4rem",
    },
  },
  content: {
    maxWidth: "42rem",
    marginInline: "auto",
  },
  crumbs: {
    marginBottom: "0.75rem",
    color: "var(--dim)",
    fontSize: "13px",
  },
  title: {
    color: "var(--foreground)",
    fontSize: "1.875rem",
    lineHeight: "2.25rem",
    fontWeight: 600,
    letterSpacing: "-0.025em",
    textWrap: "pretty",
  },
  lead: {
    marginTop: "0.875rem",
    color: "var(--muted-foreground)",
    fontSize: "15.5px",
    lineHeight: "1.625",
    textWrap: "pretty",
  },
  sectionHeading: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "baseline",
    columnGap: "0.625rem",
  },
  sectionTitle: {
    whiteSpace: "nowrap",
    color: "var(--foreground)",
    fontSize: "15px",
    fontWeight: 600,
    letterSpacing: "-0.025em",
  },
  sectionMeta: {
    color: "var(--dim)",
    fontSize: "13px",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    marginTop: "0.25rem",
  },
  item: {
    "--item-decoration": { default: "none", ":hover": "underline" },
    display: "flex",
    alignItems: "baseline",
    gap: "0.5rem",
    paddingBlock: "0.875rem",
    outline: "none",
    boxShadow: {
      default: "none",
      ":focus-visible": "0 0 0 2px var(--background), 0 0 0 4px var(--ring)",
    },
  },
  divider: {
    borderBottomWidth: "1px",
    borderColor: "var(--border)",
  },
  itemName: {
    color: "var(--foreground)",
    fontSize: "14.5px",
    fontWeight: 500,
    textDecorationLine: "var(--item-decoration)",
  },
  itemCount: {
    marginLeft: "auto",
    color: "var(--dim)",
    fontSize: "0.75rem",
    lineHeight: "1rem",
    fontVariantNumeric: "tabular-nums",
  },
  method: {
    marginTop: "2.5rem",
    paddingTop: "1.5rem",
    borderTopWidth: "1px",
    borderColor: "var(--border)",
    color: "var(--muted-foreground)",
    fontSize: "13px",
    lineHeight: "1.625",
  },
  methodLead: {
    color: "var(--foreground)",
    fontWeight: 500,
  },
});
