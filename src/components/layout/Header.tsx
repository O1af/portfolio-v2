import { Link } from "@tanstack/react-router";
import * as stylex from "@stylexjs/stylex";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { personalInfo } from "@/components/Info";
import { CommandPalette } from "@/components/search/CommandPalette";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/blog", label: "Blog" },
  { to: "/connections", label: "Connections" },
] as const;

export function Header() {
  return (
    <header {...stylex.props(styles.header)}>
      <nav {...stylex.props(styles.nav)}>
        <Link
          to="/"
          {...stylex.props(styles.brand)}
        >
          {personalInfo.name}
        </Link>

        {NAV_LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            {...stylex.props(styles.navLink)}
            activeOptions={{ exact: link.to === "/" }}
          >
            {link.label}
          </Link>
        ))}

        <div {...stylex.props(styles.actions)}>
          <CommandPalette />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}

const styles = stylex.create({
  header: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    borderBottomWidth: "1px",
    borderColor: "var(--border)",
    backgroundColor: "color-mix(in oklab, var(--background) 80%, transparent)",
    backdropFilter: "blur(40px)",
  },
  nav: {
    display: "flex",
    height: "3.5rem",
    maxWidth: "72rem",
    marginInline: "auto",
    alignItems: "center",
    gap: {
      default: "0.25rem",
      "@media (min-width: 640px)": "0.5rem",
    },
    paddingInline: {
      default: "1rem",
      "@media (min-width: 640px)": "2rem",
    },
  },
  brand: {
    display: "inline-flex",
    minHeight: "2.25rem",
    marginRight: {
      default: "0.5rem",
      "@media (min-width: 640px)": "1rem",
    },
    alignItems: "center",
    borderRadius: "0.5rem",
    paddingInline: "0.5rem",
    color: {
      default: "var(--foreground)",
      ":hover": "color-mix(in oklab, var(--foreground) 80%, transparent)",
    },
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    fontWeight: 600,
    letterSpacing: "-0.025em",
    transitionProperty: "color, background-color, border-color, text-decoration-color, fill, stroke",
    transitionDuration: "150ms",
    outline: "none",
    boxShadow: {
      default: "none",
      ":focus-visible":
        "0 0 0 2px var(--background), 0 0 0 4px var(--ring)",
    },
    touchAction: "manipulation",
  },
  navLink: {
    display: "inline-flex",
    minHeight: "2.25rem",
    alignItems: "center",
    borderRadius: "0.5rem",
    paddingInline: {
      default: "0.5rem",
      "@media (min-width: 640px)": "0.75rem",
    },
    backgroundColor: {
      default: "transparent",
      ":hover": "var(--secondary)",
      ":is([data-status='active'])": "var(--secondary)",
    },
    color: {
      default: "var(--muted-foreground)",
      ":hover": "var(--foreground)",
      ":is([data-status='active'])": "var(--foreground)",
    },
    fontSize: "13px",
    fontWeight: 500,
    transitionProperty: "color, background-color, border-color, text-decoration-color, fill, stroke",
    transitionDuration: "150ms",
    outline: "none",
    boxShadow: {
      default: "none",
      ":focus-visible":
        "0 0 0 2px var(--background), 0 0 0 4px var(--ring)",
    },
    touchAction: "manipulation",
  },
  actions: {
    display: "flex",
    marginLeft: "auto",
    alignItems: "center",
    gap: "0.5rem",
  },
});
