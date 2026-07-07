import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "@/components/theme/ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="relative inline-flex size-10 items-center justify-center rounded-full bg-secondary/50 transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background touch-manipulation"
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
    >
      <motion.div
        initial={false}
        animate={{ rotate: mounted && theme === "light" ? 180 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        suppressHydrationWarning
      >
        {!mounted || theme === "dark" ? (
          <Moon className="w-4 h-4 text-foreground" aria-hidden="true" />
        ) : (
          <Sun className="w-4 h-4 text-foreground" aria-hidden="true" />
        )}
      </motion.div>
    </button>
  );
}
