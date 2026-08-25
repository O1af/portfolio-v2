import { motion } from "motion/react";
import * as stylex from "@stylexjs/stylex";
import { Image } from "@unpic/react";
import { experiences } from "@/components/Info";

export function Experience() {
  return (
    <section id="experience" {...stylex.props(styles.section)}>
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
        {...stylex.props(styles.heading)}
      >
        Experience
      </motion.h2>

      <div {...stylex.props(styles.list)}>
        {experiences.map((exp, index) => (
          <motion.div
            key={`${exp.company}-${exp.period}`}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.4, delay: index * 0.03 }}
            {...stylex.props(
              styles.item,
              index < experiences.length - 1 && styles.divider,
            )}
          >
            <Image
              src={exp.logo}
              alt={`${exp.company} logo`}
              width={36}
              height={36}
              layout="fixed"
              loading="lazy"
              decoding="async"
              {...stylex.props(styles.logo)}
            />

            <div {...stylex.props(styles.details)}>
              <div {...stylex.props(styles.row)}>
                <div {...stylex.props(styles.details)}>
                  <div {...stylex.props(styles.titleRow)}>
                    <h3 {...stylex.props(styles.title)}>
                      {exp.title}
                    </h3>
                    {exp.link ? (
                      <a
                        href={exp.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        {...stylex.props(styles.companyLink)}
                      >
                        {exp.company}
                      </a>
                    ) : (
                      <span {...stylex.props(styles.company)}>
                        {exp.company}
                      </span>
                    )}
                  </div>
                  <p {...stylex.props(styles.description)}>
                    {exp.description}
                  </p>
                </div>
                <div {...stylex.props(styles.meta)}>
                  <p {...stylex.props(styles.metaText)}>{exp.period}</p>
                  {exp.location && (
                    <p {...stylex.props(styles.metaText, styles.metaSecond)}>
                      {exp.location}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

const styles = stylex.create({
  section: {
    marginTop: "4.5rem",
    scrollMarginTop: "6rem",
  },
  heading: {
    color: "var(--foreground)",
    fontSize: "15px",
    fontWeight: 600,
    letterSpacing: "-0.025em",
  },
  list: {
    display: "flex",
    flexDirection: "column",
  },
  item: {
    display: "flex",
    gap: "1rem",
    paddingBlock: "1.125rem",
  },
  divider: {
    borderBottomWidth: "1px",
    borderColor: "var(--border)",
  },
  logo: {
    width: "2.25rem",
    height: "2.25rem",
    flexShrink: 0,
    borderRadius: "9px",
    borderWidth: "1px",
    borderColor: "var(--border)",
    backgroundColor: "#ffffff",
    objectFit: "cover",
  },
  details: {
    minWidth: 0,
    flex: 1,
  },
  row: {
    display: "flex",
    gap: "1rem",
  },
  titleRow: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "baseline",
    columnGap: "0.5rem",
    rowGap: "0.125rem",
  },
  title: {
    color: "var(--foreground)",
    fontSize: "14.5px",
    fontWeight: 500,
  },
  company: {
    color: "var(--muted-foreground)",
    fontSize: "13.5px",
  },
  companyLink: {
    borderRadius: "0.125rem",
    color: {
      default: "var(--muted-foreground)",
      ":hover": "var(--foreground)",
    },
    fontSize: "13.5px",
    textDecorationLine: {
      default: "none",
      ":hover": "underline",
    },
    transitionProperty: "color, background-color, border-color, text-decoration-color, fill, stroke",
    transitionDuration: "150ms",
    outline: "none",
    boxShadow: {
      default: "none",
      ":focus-visible":
        "0 0 0 2px var(--background), 0 0 0 4px var(--ring)",
    },
  },
  description: {
    marginTop: "0.25rem",
    color: "var(--muted-foreground)",
    fontSize: "13px",
    lineHeight: "1.625",
  },
  meta: {
    flexShrink: 0,
    textAlign: "right",
  },
  metaText: {
    color: "var(--dim)",
    fontSize: "0.75rem",
    lineHeight: "1rem",
  },
  metaSecond: {
    marginTop: "0.25rem",
  },
});
