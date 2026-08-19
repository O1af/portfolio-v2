import { motion } from "motion/react";
import { Image } from "@unpic/react";
import { experiences } from "@/components/Info";

export function Experience() {
  return (
    <section id="experience" className="scroll-mt-24 mt-18">
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
        className="text-[15px] font-semibold tracking-tight text-foreground"
      >
        Experience
      </motion.h2>

      <div className="flex flex-col">
        {experiences.map((exp, index) => (
          <motion.div
            key={`${exp.company}-${exp.period}`}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.4, delay: index * 0.03 }}
            className={`flex gap-4 py-4.5 ${
              index < experiences.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <Image
              src={exp.logo}
              alt={`${exp.company} logo`}
              width={36}
              height={36}
              layout="fixed"
              loading="lazy"
              decoding="async"
              className="h-9 w-9 shrink-0 rounded-[9px] border border-border bg-white object-cover"
            />

            <div className="min-w-0 flex-1">
              <div className="flex gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <h3 className="text-[14.5px] font-medium text-foreground">
                      {exp.title}
                    </h3>
                    {exp.link ? (
                      <a
                        href={exp.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-sm text-[13.5px] text-muted-foreground transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        {exp.company}
                      </a>
                    ) : (
                      <span className="text-[13.5px] text-muted-foreground">
                        {exp.company}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                    {exp.description}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-dim">{exp.period}</p>
                  {exp.location && (
                    <p className="mt-1 text-xs text-dim">{exp.location}</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
