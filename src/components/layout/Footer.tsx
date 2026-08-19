import { socialLinks } from "@/components/Info";

export function Footer() {
  return (
    <footer className="px-6">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 border-t border-border py-6 pb-10 sm:flex-row sm:gap-4">
        <p className="text-xs text-dim text-center sm:text-left">
          "Believe you can and you're halfway there" — Teddy Roosevelt
        </p>

        <div className="flex items-center gap-4 sm:ml-auto">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm text-xs text-dim transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background touch-manipulation"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
