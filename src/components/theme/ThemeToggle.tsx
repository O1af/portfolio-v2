import { useEffect, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { Moon, Sun } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "@/components/theme/ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = !mounted || theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      {...stylex.props(styles.button)}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "sun" : "moon"}
          initial={{ opacity: 0, rotate: -45, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 45, scale: 0.6 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          {...stylex.props(styles.iconContainer)}
          suppressHydrationWarning
        >
          {isDark ? (
            <Sun {...stylex.props(styles.icon)} aria-hidden="true" />
          ) : (
            <Moon {...stylex.props(styles.icon)} aria-hidden="true" />
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

const styles = stylex.create({
  button: {
    display: "inline-flex",
    width: "34px",
    height: "34px",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "0.5rem",
    borderWidth: "1px",
    borderColor: "var(--border)",
    backgroundColor: {
      default: "var(--background)",
      ":hover": "var(--secondary)",
    },
    color: {
      default: "var(--muted-foreground)",
      ":hover": "var(--foreground)",
    },
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
  iconContainer: {
    display: "flex",
  },
  icon: {
    width: "1rem",
    height: "1rem",
  },
});
