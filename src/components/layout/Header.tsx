import { Link } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { personalInfo } from "@/components/Info";
import { CommandPalette } from "@/components/search/CommandPalette";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/blog", label: "Blog" },
  { to: "/connections", label: "Connections" },
] as const;

const navLinkClass =
  "inline-flex min-h-9 items-center rounded-lg px-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary data-[status=active]:bg-secondary data-[status=active]:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background touch-manipulation sm:px-3";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-background/80 border-b border-border">
      <nav className="mx-auto flex h-14 max-w-6xl items-center gap-1 px-4 sm:gap-2 sm:px-8">
        <Link
          to="/"
          className="mr-2 inline-flex min-h-9 items-center rounded-lg px-2 text-sm font-semibold tracking-tight text-foreground transition-colors hover:text-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background touch-manipulation sm:mr-4"
        >
          {personalInfo.name}
        </Link>

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

        <div className="ml-auto flex items-center gap-2">
          <CommandPalette />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
