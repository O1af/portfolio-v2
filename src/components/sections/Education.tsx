import { motion } from "motion/react";
import * as stylex from "@stylexjs/stylex";
import { Image } from "@unpic/react";
import { education } from "@/components/Info";

export function Education() {
  return (
    <section id="education" {...stylex.props(styles.section)}>
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
        {...stylex.props(styles.heading)}
      >
        Education
      </motion.h2>

      <div {...stylex.props(styles.list)}>
        {education.map((edu, index) => (
          <motion.div
            key={`${edu.degree}-${edu.period}`}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.4, delay: index * 0.03 }}
            {...stylex.props(
              styles.item,
              index < education.length - 1 && styles.divider,
            )}
          >
            <Image
              src={edu.logo}
              alt={`${edu.school} logo`}
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
                  <h3 {...stylex.props(styles.title)}>
                    {edu.degree} {edu.field}
                  </h3>
                  <p {...stylex.props(styles.description)}>
                    {edu.school}
                    {edu.gpa ? ` · GPA: ${edu.gpa}` : null}
                  </p>
                </div>
                <div {...stylex.props(styles.meta)}>
                  <p {...stylex.props(styles.metaText)}>{edu.period}</p>
                  <p {...stylex.props(styles.metaText, styles.metaSecond)}>
                    {edu.location}
                  </p>
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
    marginTop: "3.5rem",
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
  title: {
    color: "var(--foreground)",
    fontSize: "14.5px",
    fontWeight: 500,
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
