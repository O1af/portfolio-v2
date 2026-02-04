import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Github } from "lucide-react";
import { projects } from "@/components/Info";

export function Projects() {
  return (
    <section className="py-32 px-6 relative">
      <div className="absolute inset-0 bg-linear-to-b from-slate-950 via-slate-900/30 to-slate-950" />

      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-primary font-medium mb-4 tracking-wide text-sm uppercase">
            Projects
          </p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            What I've built
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="group h-full p-6 rounded-2xl bg-white/3 border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                  <div className="flex gap-2">
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                    {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                {project.highlight && (
                  <p className="text-primary text-sm font-medium mb-3">
                    {project.highlight}
                  </p>
                )}

                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2 mt-auto">
                  {project.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-white/5 text-slate-400 border-0 text-xs"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
