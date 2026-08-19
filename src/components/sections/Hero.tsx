import { motion } from "motion/react";
import { Image } from "@unpic/react";
import { personalInfo, socialLinks } from "@/components/Info";

export function Hero() {
  return (
    <section id="hero" className="scroll-mt-24">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Image
          src={personalInfo.avatarImage}
          alt={personalInfo.name}
          width={96}
          height={96}
          layout="fixed"
          priority
          className="h-24 w-24 rounded-full border border-border object-cover"
        />

        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground">
          Hi, I'm {personalInfo.name.split(" ")[0]}
        </h1>

        <p className="mt-3.5 text-[15.5px] leading-relaxed text-muted-foreground text-pretty">
          {personalInfo.bio}
        </p>

        <div className="mt-5 flex gap-5">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm text-[13.5px] font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {link.label}
            </a>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
