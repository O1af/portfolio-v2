import { useRef } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { books } from "@/components/Info";

export function Books() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;
    const amount = container.clientWidth * 0.8;
    container.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="py-16 px-6 relative">
      <div className="absolute inset-0 bg-linear-to-b from-background via-muted/30 to-background" />

      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex items-end justify-between gap-4"
        >
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground mb-2">
              Reading List
            </h2>
            <p className="text-sm text-muted-foreground">
              Books I'm currently reading or have finished
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button
              type="button"
              aria-label="Scroll books left"
              onClick={() => handleScroll("left")}
              className="p-2 rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label="Scroll books right"
              onClick={() => handleScroll("right")}
              className="p-2 rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory"
        >
          {books.map((book, index) => (
            <motion.div
              key={book.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="shrink-0 w-60 sm:w-64 snap-start"
            >
              <div className="h-full rounded-2xl bg-card/60 border border-border overflow-hidden hover:shadow-sm transition-shadow">
                <div className="aspect-[3/4] bg-muted/30 flex items-center justify-center">
                  <img
                    src={book.cover}
                    alt={`${book.title} cover`}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-semibold text-foreground leading-snug">
                      {book.title}
                    </h3>
                    {book.status && (
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        {book.status === "completed" ? "Done" : "Reading"}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                      <div
                        className="h-full bg-primary transition-[width]"
                        style={{ width: `${book.progressPercent}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {book.progressLabel}
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
