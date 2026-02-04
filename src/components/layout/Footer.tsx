import { Separator } from "@/components/ui/separator";
import { personalInfo, socialLinks } from "@/components/Info";

export function Footer() {
  return (
    <footer className="relative py-8 px-6">
      <div className="absolute inset-0 bg-linear-to-b from-background to-muted/10" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <Separator className="mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-foreground font-medium mb-0.5">{personalInfo.name}</p>
            <p className="text-xs text-muted-foreground">
            "Believe you can and you're halfway there" - Teddy Roosevelt
            </p>
          </div>

          <div className="flex items-center gap-3">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200"
              >
                <link.icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
