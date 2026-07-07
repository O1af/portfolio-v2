import { motion } from "motion/react";
import { Github, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { projects } from "@/components/Info";
import { compareMonthYearDesc } from "@/lib/date";
import { useScrollCarousel } from "@/lib/use-scroll-carousel";
import type { Project } from "@/lib/types/project";

const sortedProjects = [...projects].sort((a, b) => compareMonthYearDesc(a.date, b.date));

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className="shrink-0 w-80 snap-start"
    >
      <div className="group h-full flex flex-col p-5 rounded-2xl bg-card/50 border border-border hover:border-primary/25 hover:bg-card hover:shadow-md hover:-translate-y-1 transition-[background-color,border-color,box-shadow,transform] duration-300">
        <div className="flex items-center justify-between mb-4">
          <div>
            {project.date && (
              <span className="text-[11px] text-muted-foreground/70">
                {project.date}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-border/60 bg-secondary/50 p-2 text-muted-foreground/85 hover:bg-secondary hover:text-foreground transition-[background-color,color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label={`${project.title} on GitHub`}
              >
                <Github className="w-4 h-4" aria-hidden="true" />
              </a>
            )}
            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-border/60 bg-secondary/50 p-2 text-muted-foreground/85 hover:bg-secondary hover:text-foreground transition-[background-color,color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label={`Visit ${project.title}`}
              >
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>

        <div className="mb-3">
          <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
            {project.title}
          </h3>
          {project.highlight && (
            <Badge
              variant="default"
              className="text-[10px] font-medium mt-1.5"
            >
              {project.highlight}
            </Badge>
          )}
        </div>

        <p className="text-sm text-muted-foreground/80 leading-relaxed line-clamp-3 mb-4 flex-1">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-md bg-secondary/50 text-[11px] text-muted-foreground font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function Projects() {
  const { scrollRef, canScrollLeft, canScrollRight, scrollByItem } = useScrollCarousel();

  return (
    <section id="projects" className="scroll-mt-24 py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <div className="mb-3 h-1 w-8 rounded-full bg-primary/70" />
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
              Projects
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              A few things I've built
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button
              type="button"
              aria-label="Scroll left"
              disabled={!canScrollLeft}
              onClick={() => scrollByItem("left")}
              className={`flex items-center justify-center w-9 h-9 rounded-full border border-border transition-[border-color,color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                canScrollLeft
                  ? "text-muted-foreground hover:text-foreground hover:border-foreground/20"
                  : "text-muted-foreground/25 border-border/50 cursor-default"
              }`}
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Scroll right"
              disabled={!canScrollRight}
              onClick={() => scrollByItem("right")}
              className={`flex items-center justify-center w-9 h-9 rounded-full border border-border transition-[border-color,color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                canScrollRight
                  ? "text-muted-foreground hover:text-foreground hover:border-foreground/20"
                  : "text-muted-foreground/25 border-border/50 cursor-default"
              }`}
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </motion.div>

        <div
          ref={scrollRef}
          className="flex items-stretch gap-4 overflow-x-auto pb-4 snap-x snap-proximity scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {sortedProjects.map((project, index) => (
            <ProjectCard
              key={project.title}
              project={project}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
