import { motion } from "motion/react";
import { experiences } from "@/components/Info";

export function Experience() {
  return (
    <section className="py-8 px-6 relative">
      <div className="absolute inset-0 bg-linear-to-b from-muted/20 via-background to-background" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground mb-2">
            Experience
          </h2>
          <p className="text-sm text-muted-foreground">
            What I've been up to lately
          </p>
        </motion.div>

        <div className="space-y-3">
          {experiences.map((exp, index) => (
            <motion.div
              key={`${exp.company}-${exp.period}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <div className="group p-5 rounded-2xl bg-card/50 border border-border hover:bg-card hover:shadow-sm transition-all duration-200">
                <div className="flex gap-4">
                  <div className="shrink-0">
                    <img
                      src={exp.logo}
                      alt={`${exp.company} logo`}
                      className="w-12 h-12 rounded-xl object-cover ring-1 ring-border"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <div>
                        <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                          {exp.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {exp.company}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-muted-foreground">
                          {exp.period}
                        </p>
                        {exp.location && (
                          <p className="text-xs text-muted-foreground/70">
                            {exp.location}
                          </p>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground/90 leading-relaxed mt-2">
                      {exp.description}
                    </p>
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
