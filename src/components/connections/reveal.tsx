import * as stylex from "@stylexjs/stylex";
import { motion } from "motion/react";
import type { CategoryColor } from "./game";

interface CategoryRevealProps {
  category: {
    name: string;
    color: CategoryColor;
    words: string[];
  };
}

export function CategoryReveal({ category }: CategoryRevealProps) {
  return (
    <motion.div
      {...stylex.props(styles.container, colorStyle[category.color])}
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h3
        {...stylex.props(
          styles.heading,
          category.name.length > 25 ? styles.headingLong : styles.headingShort
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        {category.name}
      </motion.h3>
      <motion.p
        {...stylex.props(styles.words)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      >
        {category.words.join(", ")}
      </motion.p>
    </motion.div>
  );
}

const styles = stylex.create({
  container: {
    width: "100%",
    marginBottom: "0.5rem",
    padding: "0.75rem",
    borderRadius: "var(--radius)",
    color: "#1a1a1a",
  },
  yellow: {
    backgroundColor: "#f9df6d",
  },
  green: {
    backgroundColor: "#a0c35a",
  },
  blue: {
    backgroundColor: "#b0c4ef",
  },
  purple: {
    backgroundColor: "#ba81c5",
  },
  heading: {
    textAlign: "center",
    fontWeight: 700,
    lineHeight: 1.25,
  },
  headingLong: {
    fontSize: "1rem",
  },
  headingShort: {
    fontSize: "1.125rem",
  },
  words: {
    marginTop: "0.25rem",
    textAlign: "center",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    opacity: 0.75,
  },
});

const colorStyle: Record<CategoryColor, stylex.StyleXStyles> = {
  yellow: styles.yellow,
  green: styles.green,
  blue: styles.blue,
  purple: styles.purple,
};
