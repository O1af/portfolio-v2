import {
  startTransition,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  "nav-projects",
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
      <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
      <div className="min-w-0">
        <p className="truncate text-sm text-foreground">{item.title}</p>
        {preview ? (
          <p className="truncate text-xs text-muted-foreground/90">{preview}</p>
        ) : item.subtitle ? (
          <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>
        ) : null}
      </div>

      {item.type === "action" ? (
        <CommandShortcut>
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
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
        className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background touch-manipulation"
      >
        <Search className="size-3.5" aria-hidden="true" />
        <span className="hidden sm:inline">Search</span>
        <Kbd className="h-4 min-w-4 px-1 text-[10px]">{isMac ? "⌘K" : "Ctrl+K"}</Kbd>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        className="max-w-2xl"
        title="Search site"
        description="Search pages, blog posts, and quick actions"
      >
        <Command
          shouldFilter={false}
          value={selectedValue}
          onValueChange={setSelectedValue}
        >
          <div className="border-b border-border/70">
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder="Search anything…"
              aria-label="Search site"
            />
          </div>

          <CommandList className="max-h-[420px] p-1">
            {!index ? (
              <div className="px-4 py-6 text-sm text-muted-foreground">Loading search…</div>
            ) : null}
            {index ? (
              <CommandEmpty className="text-muted-foreground">
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
        </Command>
      </CommandDialog>
    </>
  );
}
