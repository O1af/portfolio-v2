import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { personalInfo } from "@/components/Info";

export function Header() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-background/70 border-b border-border"
    >
      <nav className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          to="/"
          className="text-base font-semibold tracking-tight text-foreground hover:text-foreground/80 transition-colors"
        >
          {personalInfo.name}
        </Link>

        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Home
          </Link>
          <Link
            to="/blog"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Blog
          </Link>
          <ThemeToggle />
        </div>
      </nav>
    </motion.header>
  );
}
