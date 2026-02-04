import { motion } from "motion/react";
import { education } from "@/components/Info";

export function Education() {
  return (
    <section className="py-8 px-6 relative">
      <div className="absolute inset-0 bg-linear-to-b from-background via-muted/10 to-background" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground mb-2">
            Education
          </h2>
        </motion.div>

        <div className="space-y-3">
          {education.map((edu, index) => (
            <motion.div
              key={`${edu.degree}-${edu.period}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <div className="group p-5 rounded-2xl bg-card/50 border border-border hover:bg-card hover:shadow-sm transition-all duration-200">
                <div className="flex gap-4">
                  <div className="shrink-0">
                    <img
                      src={edu.logo}
                      alt={`${edu.school} logo`}
                      className="w-12 h-12 rounded-xl object-cover ring-1 ring-border"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <div>
                        <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                          {edu.degree}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {edu.field}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {edu.school}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-muted-foreground">
                          {edu.period}
                        </p>
                        <p className="text-xs text-muted-foreground/70">
                          {edu.location}
                        </p>
                        {edu.gpa && (
                          <p className="text-xs text-primary/80 mt-1 font-medium">
                            GPA: {edu.gpa}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
