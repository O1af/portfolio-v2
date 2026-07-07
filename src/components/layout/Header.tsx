import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { personalInfo } from "@/components/Info";
import { CommandPalette } from "@/components/search/CommandPalette";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/blog", label: "Blog" },
  { to: "/connections", label: "Connections" },
] as const;

const navLinkClass =
  "inline-flex min-h-10 items-center rounded-full px-2 text-sm text-muted-foreground transition-colors hover:text-foreground data-[status=active]:bg-secondary/60 data-[status=active]:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background touch-manipulation sm:px-3";

export function Header() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-background/70 border-b border-border"
    >
      <nav className="max-w-6xl mx-auto px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
        <Link
          to="/"
          className="inline-flex min-h-10 items-center rounded-full px-2 text-base font-semibold tracking-tight text-foreground transition-colors hover:text-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background touch-manipulation sm:px-3"
        >
          {personalInfo.name}
        </Link>

        <div className="flex items-center gap-1 sm:gap-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={navLinkClass}
              activeOptions={{ exact: link.to === "/" }}
            >
              {link.label}
            </Link>
          ))}
          <CommandPalette />
          <ThemeToggle />
        </div>
      </nav>
    </motion.header>
  );
}
