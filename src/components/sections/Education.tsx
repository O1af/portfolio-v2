import { motion } from "motion/react";
import { Image } from "@unpic/react";
import { education } from "@/components/Info";

export function Education() {
  return (
    <section id="education" className="scroll-mt-24 mt-14">
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
        className="text-[15px] font-semibold tracking-tight text-foreground"
      >
        Education
      </motion.h2>

      <div className="flex flex-col">
        {education.map((edu, index) => (
          <motion.div
            key={`${edu.degree}-${edu.period}`}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.4, delay: index * 0.03 }}
            className={`flex gap-4 py-4.5 ${
              index < education.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <Image
              src={edu.logo}
              alt={`${edu.school} logo`}
              width={36}
              height={36}
              layout="fixed"
              loading="lazy"
              decoding="async"
              className="h-9 w-9 shrink-0 rounded-[9px] border border-border object-cover"
            />

            <div className="min-w-0 flex-1">
              <div className="flex gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="text-[14.5px] font-medium text-foreground">
                    {edu.degree} {edu.field}
                  </h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                    {edu.school}
                    {edu.gpa ? ` · GPA: ${edu.gpa}` : null}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-dim">{edu.period}</p>
                  <p className="mt-1 text-xs text-dim">{edu.location}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
