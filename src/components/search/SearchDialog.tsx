// The search dialog (cmdk + base-ui dialog + the search index). Loaded on
// demand by CommandPalette, so none of it ships with the initial page.
import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
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

export default function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedValue, setSelectedValue] = useState("");
  const [index, setIndex] = useState<SearchItem[] | null>(null);
  const [searchIndex, setSearchIndex] = useState<typeof import("@/components/search/search-index").searchIndex>();
  const deferredQuery = useDeferredValue(query);

  const isSearching = deferredQuery.trim().length > 0;
  const matches = useMemo(
    () => (isSearching && index && searchIndex ? searchIndex(index, deferredQuery) : []),
    [deferredQuery, index, isSearching, searchIndex]
  );
  const quickActions = useMemo(
    () => (index ?? []).filter((item) => QUICK_ACTION_IDS.has(item.id)),
    [index]
  );

  useEffect(() => {
    void import("@/components/search/search-index").then((module) =>
      startTransition(() => {
        setSearchIndex(() => module.searchIndex);
        setIndex(module.buildSearchIndex());
      })
    );
  }, []);

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

      onOpenChange(false);
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

    onOpenChange(false);
  };

  return (
    <>
      <CommandDialog
        open={open}
        onOpenChange={onOpenChange}
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
