import { motion } from "motion/react";
import * as stylex from "@stylexjs/stylex";
import { favoriteBlogs } from "@/components/Info";

export function Bookshelf() {
  return (
    <section id="bookshelf" {...stylex.props(styles.section)}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
        {...stylex.props(styles.headingRow)}
      >
        <h2 {...stylex.props(styles.heading)}>
          Bookshelf
        </h2>
        <span {...stylex.props(styles.subtitle)}>
          Some of my favorite Engineering Blogs
        </span>
      </motion.div>

      <div {...stylex.props(styles.list)}>
        {favoriteBlogs.map((blog, index) => (
          <motion.a
            key={blog.href}
            href={blog.href}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.4, delay: index * 0.03 }}
            {...stylex.props(
              styles.item,
              index < favoriteBlogs.length - 1 && styles.divider,
            )}
          >
            <span {...stylex.props(styles.name)}>
              {blog.name}
            </span>
            <span {...stylex.props(styles.domain)}>{blog.domain}</span>
          </motion.a>
        ))}
      </div>
    </section>
  );
}

const styles = stylex.create({
  section: {
    marginTop: "3.5rem",
    scrollMarginTop: "6rem",
  },
  headingRow: {
    display: "flex",
    alignItems: "baseline",
    gap: "0.625rem",
  },
  heading: {
    color: "var(--foreground)",
    fontSize: "15px",
    fontWeight: 600,
    letterSpacing: "-0.025em",
  },
  subtitle: {
    color: "var(--dim)",
    fontSize: "13px",
  },
  list: {
    display: "flex",
    flexDirection: "column",
  },
  item: {
    "--bookshelf-decoration": {
      default: "none",
      ":hover": "underline",
    },
    display: "flex",
    alignItems: "baseline",
    gap: "0.5rem",
    paddingBlock: "0.875rem",
    outline: "none",
    boxShadow: {
      default: "none",
      ":focus-visible":
        "0 0 0 2px var(--background), 0 0 0 4px var(--ring)",
    },
  },
  divider: {
    borderBottomWidth: "1px",
    borderColor: "var(--border)",
  },
  name: {
    color: "var(--foreground)",
    fontSize: "14.5px",
    fontWeight: 500,
    textDecorationLine: "var(--bookshelf-decoration)",
  },
  domain: {
    marginLeft: "auto",
    color: "var(--dim)",
    fontSize: "0.75rem",
    lineHeight: "1rem",
  },
});
