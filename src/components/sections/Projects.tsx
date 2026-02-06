import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "motion/react";
import { Github, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { projects } from "@/components/Info";
import type { Project } from "@/lib/types/project";

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
      <div className="group h-full flex flex-col p-5 rounded-2xl bg-card/50 border border-border hover:bg-card hover:shadow-md hover:-translate-y-1 transition-all duration-300">
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
                className="p-2 rounded-xl text-muted-foreground/85 bg-secondary/50 border border-border/60 hover:text-foreground hover:bg-secondary transition-all"
                aria-label={`${project.title} on GitHub`}
              >
                <Github className="w-4 h-4" />
              </a>
            )}
            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl text-muted-foreground/85 bg-secondary/50 border border-border/60 hover:text-foreground hover:bg-secondary transition-all"
                aria-label={`Visit ${project.title}`}
              >
                <ArrowUpRight className="w-4 h-4" />
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const sortedProjects = useMemo(
    () =>
      [...projects].sort((a, b) => {
        const aTime = a.date ? new Date(a.date).getTime() : 0;
        const bTime = b.date ? new Date(b.date).getTime() : 0;
        return bTime - aTime;
      }),
    []
  );

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  const handleScroll = (direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;
    const firstChild = container.children[0] as HTMLElement | undefined;
    if (!firstChild) return;
    const gap = parseFloat(getComputedStyle(container).gap) || 0;
    const step = firstChild.offsetWidth + gap;
    container.scrollBy({
      left: direction === "left" ? -step : step,
      behavior: "smooth",
    });
  };

  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex items-end justify-between mb-10"
        >
          <div>
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
              onClick={() => handleScroll("left")}
              className={`flex items-center justify-center w-9 h-9 rounded-full border border-border transition-all duration-200 ${
                canScrollLeft
                  ? "text-muted-foreground hover:text-foreground hover:border-foreground/20"
                  : "text-muted-foreground/25 border-border/50 cursor-default"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label="Scroll right"
              disabled={!canScrollRight}
              onClick={() => handleScroll("right")}
              className={`flex items-center justify-center w-9 h-9 rounded-full border border-border transition-all duration-200 ${
                canScrollRight
                  ? "text-muted-foreground hover:text-foreground hover:border-foreground/20"
                  : "text-muted-foreground/25 border-border/50 cursor-default"
              }`}
            >
              <ChevronRight className="w-4 h-4" />
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
