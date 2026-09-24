import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { Search } from "lucide-react";
import { Kbd } from "@/components/ui/kbd";

// The dialog (cmdk, base-ui, the search index) is ~50 KB gzipped and most
// visitors never open it: fetch it on hover/focus, render it on first open.
// Warming the search index alongside the dialog means results are ready on open.
const loadDialog = () =>
  Promise.all([import("@/components/search/SearchDialog"), import("@/components/search/search-index")]).then(
    ([dialog]) => dialog
  );
const SearchDialog = lazy(loadDialog);

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [requested, setRequested] = useState(false);
  const [isMac, setIsMac] = useState(false);

  const openPalette = useCallback(() => {
    setRequested(true);
    setOpen(true);
  }, []);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad|iPod/i.test(navigator.userAgent));

    const onKeyDown = (event: KeyboardEvent) => {
      const isShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (!isShortcut) return;

      event.preventDefault();
      if (open) {
        setOpen(false);
        return;
      }

      openPalette();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, openPalette]);

  return (
    <>
      <button
        type="button"
        onClick={openPalette}
        onMouseEnter={() => void loadDialog()}
        onFocus={() => void loadDialog()}
        aria-label="Open command menu"
        {...stylex.props(styles.trigger)}
      >
        <Search {...stylex.props(styles.triggerIcon)} aria-hidden="true" />
        <span {...stylex.props(styles.triggerLabel)}>Search</span>
        <Kbd stylexStyle={styles.triggerKbd}>
          {isMac ? "⌘K" : "Ctrl+K"}
        </Kbd>
      </button>

      {requested && (
        <Suspense fallback={null}>
          <SearchDialog open={open} onOpenChange={setOpen} />
        </Suspense>
      )}
    </>
  );
}

const styles = stylex.create({
  trigger: {
    minHeight: "34px",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "var(--border)",
    borderRadius: "var(--radius)",
    backgroundColor: {
      default: "var(--background)",
      ":hover": "var(--secondary)",
    },
    paddingInline: "0.625rem",
    color: {
      default: "var(--dim)",
      ":hover": "var(--muted-foreground)",
    },
    fontSize: "13px",
    transitionProperty: "color, background-color, border-color, text-decoration-color, fill, stroke",
    transitionDuration: "150ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    touchAction: "manipulation",
    outline: {
      default: null,
      ":focus-visible": "2px solid transparent",
    },
    outlineOffset: {
      default: null,
      ":focus-visible": "2px",
    },
    boxShadow: {
      default: null,
      ":focus-visible":
        "0 0 0 2px var(--background), 0 0 0 4px var(--ring)",
    },
  },
  triggerIcon: {
    width: "0.875rem",
    height: "0.875rem",
    display: {
      default: "block",
      "@media (min-width: 640px)": "none",
    },
  },
  triggerLabel: {
    display: {
      default: "none",
      "@media (min-width: 640px)": "inline",
    },
  },
  triggerKbd: {
    display: {
      default: "none",
      "@media (min-width: 640px)": "inline-flex",
    },
    height: "1rem",
    minWidth: "1rem",
    marginLeft: {
      default: 0,
      "@media (min-width: 640px)": "1rem",
    },
    paddingInline: "0.25rem",
    fontFamily: "var(--font-mono)",
    fontSize: "10px",
  },
});
