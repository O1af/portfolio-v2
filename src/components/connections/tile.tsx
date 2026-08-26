import * as stylex from "@stylexjs/stylex";
import { motion } from "motion/react";

interface WordTileProps {
  word: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

function getWordSizeStyle(word: string): stylex.StyleXStyles {
  if (word.length >= 9) {
    return styles.wordLong;
  }

  if (word.length >= 7) {
    return styles.wordMedium;
  }

  return styles.wordShort;
}

export function WordTile({ word, selected, onClick, disabled = false }: WordTileProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`${selected ? "Deselect" : "Select"} ${word}`}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      animate={selected ? { scale: [1, 1.05, 1] } : { scale: 1 }}
      transition={{ duration: 0.2 }}
      {...stylex.props(
        styles.tile,
        selected ? styles.selected : styles.unselected,
        disabled ? styles.disabled : styles.enabled
      )}
    >
      <div {...stylex.props(styles.word, getWordSizeStyle(word))}>
        {word}
      </div>
    </motion.button>
  );
}

const styles = stylex.create({
  tile: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: "1px",
    borderStyle: "solid",
    borderRadius: "var(--radius)",
    padding: "0.25rem",
    fontWeight: 600,
    letterSpacing: "0.025em",
    transitionProperty: "color, background-color, border-color, text-decoration-color, fill, stroke",
    transitionDuration: "150ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    touchAction: "manipulation",
    outline: {
      default: null,
      ":focus-visible": "2px solid transparent",
    },
    outlineOffset: {
      default: null,
      ":focus-visible": "2px",
    },
    boxShadow: {
      default: null,
      ":focus-visible":
        "0 0 0 2px var(--background), 0 0 0 4px var(--ring)",
    },
  },
  selected: {
    backgroundColor: "var(--foreground)",
    color: "var(--background)",
    borderColor: "var(--foreground)",
  },
  unselected: {
    backgroundColor: {
      default: "var(--secondary)",
      ":hover": "var(--accent)",
    },
    color: "var(--foreground)",
    borderColor: "var(--border)",
  },
  disabled: {
    cursor: "not-allowed",
    opacity: 0.7,
  },
  enabled: {
    cursor: "pointer",
  },
  word: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    textAlign: "center",
    lineHeight: 1.25,
  },
  wordLong: {
    fontSize: {
      default: "10px",
      "@media (min-width: 640px)": "0.75rem",
    },
  },
  wordMedium: {
    fontSize: {
      default: "11px",
      "@media (min-width: 640px)": "0.875rem",
    },
  },
  wordShort: {
    fontSize: {
      default: "0.75rem",
      "@media (min-width: 640px)": "1rem",
    },
  },
});
