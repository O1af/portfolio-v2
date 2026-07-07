import { useCallback, useEffect, useRef, useState } from "react";
import { getPreferredScrollBehavior } from "@/lib/hash-scroll";

/**
 * Tracks whether a horizontally scrollable container can scroll further in
 * either direction, and scrolls it by one item at a time.
 */
export function useScrollCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const scheduleUpdateScrollState = () => {
      animationFrameRef.current ??= window.requestAnimationFrame(() => {
        animationFrameRef.current = null;
        updateScrollState();
      });
    };

    updateScrollState();
    el.addEventListener("scroll", scheduleUpdateScrollState, { passive: true });
    window.addEventListener("resize", scheduleUpdateScrollState);

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }

      el.removeEventListener("scroll", scheduleUpdateScrollState);
      window.removeEventListener("resize", scheduleUpdateScrollState);
    };
  }, [updateScrollState]);

  const scrollByItem = useCallback((direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;
    const firstChild = container.children[0] as HTMLElement | undefined;
    if (!firstChild) return;
    const gap = parseFloat(getComputedStyle(container).gap) || 0;
    const step = firstChild.offsetWidth + gap;
    container.scrollBy({
      left: direction === "left" ? -step : step,
      behavior: getPreferredScrollBehavior(),
    });
  }, []);

  return { scrollRef, canScrollLeft, canScrollRight, scrollByItem };
}
