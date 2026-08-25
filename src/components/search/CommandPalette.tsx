import {
  startTransition,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as stylex from "@stylexjs/stylex";
import { useRouter } from "@tanstack/react-router";
import {
  ArrowUpRight,
  BookOpen,
  Briefcase,
  FileText,
  FolderKanban,
  Github,
  GraduationCap,
  Home,
  Linkedin,
  Mail,
  Search,
} from "lucide-react";

import { personalInfo, socialUrls } from "@/components/Info";
import { Kbd } from "@/components/ui/kbd";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { scrollToHashTarget } from "@/lib/hash-scroll";
import type { SearchItem } from "@/components/search/search-index";

type SearchIndexModule = typeof import("@/components/search/search-index");

function itemIcon(item: SearchItem) {
  if (item.type === "action") {
    if (item.action === "email") return Mail;
    if (item.action === "github") return Github;
    return Linkedin;
  }

  if (item.group === "Blog") return FileText;

  const title = item.title.toLowerCase();
  if (title.includes("experience")) return Briefcase;
  if (title.includes("project")) return FolderKanban;
  if (title.includes("education")) return GraduationCap;
  if (title.includes("book")) return BookOpen;
  if (title === "home") return Home;

  return Search;
}

const QUICK_ACTION_IDS = new Set([
  "action-email",
  "action-github",
  "action-linkedin",
  "nav-home",
  "nav-blog",
  "nav-connections",
]);

function PaletteItem({
  item,
  preview,
  onSelect,
}: {
  item: SearchItem;
  preview?: string;
  onSelect: () => void;
}) {
  const Icon = itemIcon(item);
  return (
    <CommandItem value={item.id} onSelect={onSelect}>
      <Icon {...stylex.props(styles.itemIcon)} aria-hidden="true" />
      <div {...stylex.props(styles.itemText)}>
        <p {...stylex.props(styles.itemTitle)}>{item.title}</p>
        {preview ? (
          <p {...stylex.props(styles.itemPreview)}>{preview}</p>
        ) : item.subtitle ? (
          <p {...stylex.props(styles.itemSubtitle)}>{item.subtitle}</p>
        ) : null}
      </div>

      {item.type === "action" ? (
        <CommandShortcut>
          <ArrowUpRight {...stylex.props(styles.actionIcon)} aria-hidden="true" />
        </CommandShortcut>
      ) : null}
    </CommandItem>
  );
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isMac, setIsMac] = useState(false);
  const [selectedValue, setSelectedValue] = useState("");
  const [index, setIndex] = useState<SearchItem[] | null>(null);
  const [searchModule, setSearchModule] = useState<SearchIndexModule | null>(null);
  const deferredQuery = useDeferredValue(query);
  const searchModulePromiseRef = useRef<Promise<SearchIndexModule> | null>(null);

  const isSearching = deferredQuery.trim().length > 0;
  const matches = useMemo(
    () =>
      isSearching && index && searchModule
        ? searchModule.searchIndex(index, deferredQuery)
        : [],
    [deferredQuery, index, isSearching, searchModule]
  );
  const quickActions = useMemo(
    () => (index ?? []).filter((item) => QUICK_ACTION_IDS.has(item.id)),
    [index]
  );

  const ensureSearchIndex = useCallback(async () => {
    if (searchModule && index) {
      return;
    }

    const modulePromise =
      searchModulePromiseRef.current ??=
        import("@/components/search/search-index");
    const loadedModule = await modulePromise;

    startTransition(() => {
      setSearchModule(loadedModule);
      setIndex((current) => current ?? loadedModule.buildSearchIndex());
    });
  }, [index, searchModule]);

  const openPalette = useCallback(() => {
    void ensureSearchIndex();
    setOpen(true);
  }, [ensureSearchIndex]);

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

  useEffect(() => {
    if (!open) {
      return;
    }

    void ensureSearchIndex();
  }, [ensureSearchIndex, open]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setSelectedValue("");
    }
  }, [open]);

  useEffect(() => {
    if (isSearching) {
      setSelectedValue(matches[0]?.item.id ?? "");
      return;
    }

    setSelectedValue(quickActions[0]?.id ?? "");
  }, [isSearching, matches, quickActions]);

  const runAction = (item: SearchItem) => {
    if (item.type === "action") {
      if (item.action === "email") {
        window.location.href = `mailto:${personalInfo.email}`;
      } else if (item.action === "github") {
        window.open(socialUrls.github, "_blank", "noopener,noreferrer");
      } else if (item.action === "linkedin") {
        window.open(socialUrls.linkedin, "_blank", "noopener,noreferrer");
      }

      setOpen(false);
      return;
    }

    const navigateResult = router.navigate({
      to: item.to,
      params: item.params,
    });

    Promise.resolve(navigateResult).finally(() => {
      if (item.hash) {
        void scrollToHashTarget(item.hash, { updateHistory: true });
      }
    });

    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={openPalette}
        onMouseEnter={() => void ensureSearchIndex()}
        onFocus={() => void ensureSearchIndex()}
        aria-label="Open command menu"
        {...stylex.props(styles.trigger)}
      >
        <Search {...stylex.props(styles.triggerIcon)} aria-hidden="true" />
        <span {...stylex.props(styles.triggerLabel)}>Search</span>
        <Kbd stylexStyle={styles.triggerKbd}>
          {isMac ? "⌘K" : "Ctrl+K"}
        </Kbd>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        stylexStyle={styles.dialog}
        title="Search site"
        description="Search pages, blog posts, and quick actions"
      >
        <Command
          shouldFilter={false}
          value={selectedValue}
          onValueChange={setSelectedValue}
        >
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder="Search anything…"
            aria-label="Search site"
          />

          <CommandList stylexStyle={styles.list}>
            {!index ? (
              <div {...stylex.props(styles.loading)}>Loading search…</div>
            ) : null}
            {index ? (
              <CommandEmpty stylexStyle={styles.empty}>
                Nothing found.
              </CommandEmpty>
            ) : null}

            {isSearching ? (
              <CommandGroup heading="Best matches">
                {matches.map((match) => (
                  <PaletteItem
                    key={match.item.id}
                    item={match.item}
                    preview={match.preview}
                    onSelect={() => runAction(match.item)}
                  />
                ))}
              </CommandGroup>
            ) : (
              <CommandGroup heading="Quick actions">
                {quickActions.map((item) => (
                  <PaletteItem key={item.id} item={item} onSelect={() => runAction(item)} />
                ))}
              </CommandGroup>
            )}
          </CommandList>

          <div {...stylex.props(styles.footer)}>
            <span {...stylex.props(styles.footerHint)}>
              <Kbd stylexStyle={styles.footerKbd}>↑</Kbd>
              <Kbd stylexStyle={styles.footerKbd}>↓</Kbd>
              Navigate
            </span>
            <span {...stylex.props(styles.footerHint)}>
              <Kbd stylexStyle={styles.footerKbd}>↵</Kbd>
              Open
            </span>
            <span {...stylex.props(styles.closeHint)}>
              <Kbd stylexStyle={styles.footerKbd}>esc</Kbd>
              Close
            </span>
          </div>
        </Command>
      </CommandDialog>
    </>
  );
}

const styles = stylex.create({
  itemIcon: {
    width: "1rem",
    height: "1rem",
    color: "var(--muted-foreground)",
  },
  itemText: {
    minWidth: 0,
  },
  itemTitle: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: "var(--foreground)",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },
  itemPreview: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: "color-mix(in oklab, var(--muted-foreground) 90%, transparent)",
    fontSize: "0.75rem",
    lineHeight: "1rem",
  },
  itemSubtitle: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: "var(--muted-foreground)",
    fontSize: "0.75rem",
    lineHeight: "1rem",
  },
  actionIcon: {
    width: "0.875rem",
    height: "0.875rem",
  },
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
  dialog: {
    maxWidth: {
      default: "calc(100% - 2rem)",
      "@media (min-width: 640px)": "580px",
    },
  },
  list: {
    maxHeight: "400px",
    padding: "0.375rem",
  },
  loading: {
    paddingInline: "1rem",
    paddingBlock: "1.5rem",
    color: "var(--muted-foreground)",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },
  empty: {
    color: "var(--muted-foreground)",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: "var(--border)",
    paddingInline: "0.875rem",
    paddingBlock: "0.5rem",
    color: "var(--dim)",
    fontSize: "11px",
  },
  footerHint: {
    display: "flex",
    alignItems: "center",
    gap: "0.375rem",
  },
  closeHint: {
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    gap: "0.375rem",
  },
  footerKbd: {
    height: "1rem",
    minWidth: "1rem",
    paddingInline: "0.25rem",
    fontSize: "10px",
  },
});
