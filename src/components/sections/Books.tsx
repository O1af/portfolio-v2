import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Image } from "@unpic/react";
import { books } from "@/components/Info";
import { useScrollCarousel } from "@/lib/use-scroll-carousel";

export function Books() {
  const { scrollRef, canScrollLeft, canScrollRight, scrollByItem } = useScrollCarousel();

  return (
    <section id="books" className="scroll-mt-24 py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-12"
        >
          <div className="mb-3 h-1 w-8 rounded-full bg-primary/70" />
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
            disabled={!canScrollLeft}
            onClick={() => scrollByItem("left")}
            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 hidden rounded-full border border-border/50 bg-background/80 shadow-sm backdrop-blur-sm transition-[opacity,color,border-color,background-color] duration-200 md:flex items-center justify-center w-10 h-10 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
              canScrollLeft
                ? "text-muted-foreground hover:text-foreground hover:border-border opacity-0 group-hover:opacity-100"
                : "text-muted-foreground/25 border-border/30 opacity-0 group-hover:opacity-40 cursor-default"
            }`}
          >
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          </button>

          <button
            type="button"
            aria-label="Scroll right"
            disabled={!canScrollRight}
            onClick={() => scrollByItem("right")}
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 hidden rounded-full border border-border/50 bg-background/80 shadow-sm backdrop-blur-sm transition-[opacity,color,border-color,background-color] duration-200 md:flex items-center justify-center w-10 h-10 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
              canScrollRight
                ? "text-muted-foreground hover:text-foreground hover:border-border opacity-0 group-hover:opacity-100"
                : "text-muted-foreground/25 border-border/30 opacity-0 group-hover:opacity-40 cursor-default"
            }`}
          >
            <ChevronRight className="w-5 h-5" aria-hidden="true" />
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
                <div className="relative aspect-2/3 rounded-lg overflow-hidden bg-muted/30 shadow-sm group-hover/card:shadow-lg group-hover/card:-translate-y-1 transition-[box-shadow,transform] duration-300">
                  <Image
                    src={book.cover}
                    alt={`${book.title} cover`}
                    width={176}
                    height={264}
                    layout="constrained"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                  {book.status && (
                    <div
                      className="absolute bottom-0 left-0 right-0 h-1 bg-black/20"
                      role="progressbar"
                      aria-label={`${book.title} reading progress`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={book.status === "completed" ? 100 : book.progressPercent}
                    >
                      <div
                        className="h-full bg-blue-500 transition-[width] duration-500"
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
