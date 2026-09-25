import { useEffect, useState } from "react";

const ROW_SELECTOR = "[data-food-row]";

/**
 * j / k move through the ranked rows, Enter opens the focused one, Escape clears.
 * Ignored while typing in a field or when a modifier key is held (⌘K etc.).
 */
export function useRowKeys(rowCount: number, resetKey: string) {
  const [focused, setFocused] = useState(-1);

  useEffect(() => setFocused(-1), [resetKey]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.target instanceof HTMLElement && event.target.closest("input, textarea, select, [contenteditable], [role=dialog]")) return;
      const rows = document.querySelectorAll<HTMLElement>(ROW_SELECTOR);
      if (event.key === "j" || event.key === "k") {
        event.preventDefault();
        setFocused((current) => {
          const next = Math.max(0, Math.min(rowCount - 1, current + (event.key === "j" ? 1 : -1)));
          rows[next]?.scrollIntoView({ block: "nearest" });
          return next;
        });
      } else if (event.key === "Enter" && focused >= 0) {
        const row = rows[focused];
        if (row instanceof HTMLAnchorElement) {
          event.preventDefault();
          row.click();
        }
      } else if (event.key === "Escape") {
        setFocused(-1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [focused, rowCount]);

  return focused;
}
