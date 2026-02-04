import { useRef } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { books } from "@/components/Info";

export function Books() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;
    const amount = container.clientWidth * 0.6;
    container.scrollBy({
      left: direction === "left" ? -amount : amount,
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
          className="mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
            Bookshelf
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Things I'm currently reading or highly recommend!
          </p>
        </motion.div>

        <div className="relative group">
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => handleScroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 text-muted-foreground hover:text-foreground hover:border-border transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => handleScroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 text-muted-foreground hover:text-foreground hover:border-border transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {books.map((book, index) => (
              <motion.div
                key={`${book.title}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                className="shrink-0 w-44 snap-start group/card"
              >
                <div className="relative aspect-2/3 rounded-lg overflow-hidden bg-muted/30 shadow-sm hover:shadow-lg transition-shadow duration-300">
                  <img
                    src={book.cover}
                    alt={`${book.title} cover`}
                    className="w-full h-full object-cover"
                  />
                  {book.status && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                      <div
                        className="h-full bg-blue-500 transition-all duration-500"
                        style={{
                          width:
                            book.status === "completed"
                              ? "100%"
                              : `${book.progressPercent}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="mt-3 space-y-1">
                  <h3 className="text-sm font-medium text-foreground leading-tight line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {book.status === "completed"
                      ? "Finished"
                      : book.progressLabel}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
