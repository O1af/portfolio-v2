import { Moon, Sun } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "@/components/theme/ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-full bg-secondary/50 hover:bg-secondary transition-colors"
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === "dark" ? 0 : 180 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {theme === "dark" ? (
          <Moon className="w-4 h-4 text-foreground" />
        ) : (
          <Sun className="w-4 h-4 text-foreground" />
        )}
      </motion.div>
    </button>
  );
}
