import * as stylex from "@stylexjs/stylex";
import { socialLinks } from "@/components/Info";

export function Footer() {
  return (
    <footer {...stylex.props(styles.footer)}>
      <div {...stylex.props(styles.content)}>
        <p {...stylex.props(styles.quote)}>
          "Believe you can and you're halfway there" — Teddy Roosevelt
        </p>

        <div {...stylex.props(styles.links)}>
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              {...stylex.props(styles.link)}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

const styles = stylex.create({
  footer: {
    paddingInline: "1.5rem",
  },
  content: {
    display: "flex",
    maxWidth: "42rem",
    marginInline: "auto",
    flexDirection: {
      default: "column",
      "@media (min-width: 640px)": "row",
    },
    alignItems: "center",
    gap: {
      default: "0.75rem",
      "@media (min-width: 640px)": "1rem",
    },
    borderTopWidth: "1px",
    borderColor: "var(--border)",
    paddingTop: "1.5rem",
    paddingBottom: "2.5rem",
  },
  quote: {
    color: "var(--dim)",
    fontSize: "0.75rem",
    lineHeight: "1rem",
    textAlign: {
      default: "center",
      "@media (min-width: 640px)": "left",
    },
  },
  links: {
    display: "flex",
    marginLeft: {
      default: 0,
      "@media (min-width: 640px)": "auto",
    },
    alignItems: "center",
    gap: "1rem",
  },
  link: {
    borderRadius: "0.125rem",
    color: {
      default: "var(--dim)",
      ":hover": "var(--foreground)",
    },
    fontSize: "0.75rem",
    lineHeight: "1rem",
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
});
