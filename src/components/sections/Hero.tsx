import { motion } from "motion/react";
import { Image } from "@unpic/react";
import { personalInfo, socialLinks } from "@/components/Info";

export function Hero() {
  return (
    <section
      id="hero"
      className="scroll-mt-24 min-h-[85vh] flex flex-col items-center justify-center px-6 pt-20 pb-8 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-linear-to-b from-background via-background to-muted/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-6"
        >
          <div className="relative inline-block">
            <div className="absolute -inset-1 bg-linear-to-r from-primary/30 to-primary/20 rounded-full blur-lg opacity-50" />
            <Image
              src={personalInfo.avatarImage}
              alt={personalInfo.name}
              width={96}
              height={96}
              layout="fixed"
              priority
              className="relative w-24 h-24 rounded-full object-cover ring-1 ring-border"
            />
          </div>
        </motion.div>

        <motion.h1
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground mb-4"
        >
          Hi, I'm {personalInfo.name.split(" ")[0]}
        </motion.h1>

        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed"
        >
          {personalInfo.bio}
        </motion.p>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          className="flex items-center justify-center gap-3 mb-6"
        >
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
              className="rounded-full border border-border bg-secondary/50 p-2.5 text-muted-foreground hover:border-border/80 hover:bg-secondary hover:text-foreground transition-[background-color,border-color,color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <link.icon className="w-4 h-4" aria-hidden="true" />
            </a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
