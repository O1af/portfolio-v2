import { motion } from "motion/react";
import * as stylex from "@stylexjs/stylex";
import { Image } from "@unpic/react";
import { personalInfo, socialLinks } from "@/components/Info";

export function Hero() {
  return (
    <section id="hero" {...stylex.props(styles.section)}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Image
          src={personalInfo.avatarImage}
          alt={personalInfo.name}
          width={96}
          height={96}
          layout="fixed"
          loading="eager"
          fetchPriority="high"
          {...stylex.props(styles.avatar)}
        />

        <h1 {...stylex.props(styles.heading)}>
          Hi, I'm {personalInfo.name.split(" ")[0]}
        </h1>

        <p {...stylex.props(styles.bio)}>
          {personalInfo.bio}
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
      </motion.div>
    </section>
  );
}

const styles = stylex.create({
  section: {
    scrollMarginTop: "6rem",
  },
  avatar: {
    width: "6rem",
    height: "6rem",
    borderRadius: "9999px",
    borderWidth: "1px",
    borderColor: "var(--border)",
    objectFit: "cover",
  },
  heading: {
    marginTop: "1.5rem",
    color: "var(--foreground)",
    fontSize: "1.875rem",
    lineHeight: "2.25rem",
    fontWeight: 600,
    letterSpacing: "-0.025em",
  },
  bio: {
    marginTop: "0.875rem",
    color: "var(--muted-foreground)",
    fontSize: "15.5px",
    lineHeight: "1.625",
    textWrap: "pretty",
  },
  links: {
    display: "flex",
    marginTop: "1.25rem",
    gap: "1.25rem",
  },
  link: {
    borderRadius: "0.125rem",
    color: {
      default: "var(--muted-foreground)",
      ":hover": "var(--foreground)",
    },
    fontSize: "13.5px",
    fontWeight: 500,
    transitionProperty: "color, background-color, border-color, text-decoration-color, fill, stroke",
    transitionDuration: "150ms",
    outline: "none",
    boxShadow: {
      default: "none",
      ":focus-visible":
        "0 0 0 2px var(--background), 0 0 0 4px var(--ring)",
    },
  },
});
