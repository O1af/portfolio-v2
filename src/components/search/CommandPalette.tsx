import { useEffect, useMemo, useState } from "react";
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
import { buildSearchIndex, searchIndex, type SearchItem } from "@/components/search/search-index";

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

function getShortcutLabel(isMac: boolean): string {
  return isMac ? "⌘K" : "Ctrl+K";
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isMac, setIsMac] = useState(false);
  const [selectedValue, setSelectedValue] = useState("");

  const index = useMemo(() => buildSearchIndex(), []);
  const isSearching = query.trim().length > 0;
  const matches = useMemo(
    () => (isSearching ? searchIndex(index, query) : []),
    [index, isSearching, query]
  );
  const quickActions = useMemo(
    () =>
      index.filter(
        (item) =>
          item.id === "action-email" ||
          item.id === "action-github" ||
          item.id === "action-linkedin" ||
          item.id === "nav-home" ||
          item.id === "nav-blog" ||
          item.id === "nav-projects"
      ),
    [index]
  );

  useEffect(() => {
    setIsMac(navigator.platform.toLowerCase().includes("mac"));

    const onKeyDown = (event: KeyboardEvent) => {
      const isShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (!isShortcut) return;

      event.preventDefault();
      setOpen((current) => !current);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
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

      setOpen(false);
      return;
    }

    const navigateResult = router.navigate({
      to: item.to,
      params: item.params,
    });

    Promise.resolve(navigateResult).finally(() => {
      if (item.hash) {
        requestAnimationFrame(() => {
          const element = document.getElementById(item.hash!);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
            window.history.replaceState(null, "", `${window.location.pathname}#${item.hash}`);
          }
        });
      }
    });

    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open command menu"
        className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
      >
        <Search className="size-3.5" />
        <span className="hidden sm:inline">Search</span>
        <Kbd className="h-4 min-w-4 px-1 text-[10px]">{getShortcutLabel(isMac)}</Kbd>
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
              placeholder="Search anything..."
              aria-label="Search site"
            />
          </div>

          <CommandList className="max-h-[420px] p-1">
            <CommandEmpty className="text-muted-foreground">
              Nothing found.
            </CommandEmpty>

            {isSearching ? (
              <CommandGroup heading="Best matches">
                {matches.map((match) => {
                  const item = match.item;
                  const Icon = itemIcon(item);
                  return (
                    <CommandItem
                      key={item.id}
                      value={item.id}
                      onSelect={() => runAction(item)}
                    >
                      <Icon className="size-4 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="truncate text-sm text-foreground">{item.title}</p>
                        {match.preview ? (
                          <p className="truncate text-xs text-muted-foreground/90">{match.preview}</p>
                        ) : item.subtitle ? (
                          <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>
                        ) : null}
                      </div>

                      {item.type === "action" ? (
                        <CommandShortcut>
                          <ArrowUpRight className="size-3.5" />
                        </CommandShortcut>
                      ) : null}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ) : (
              <CommandGroup heading="Quick actions">
                {quickActions.map((item) => {
                  const Icon = itemIcon(item);
                  return (
                    <CommandItem
                      key={item.id}
                      value={item.id}
                      onSelect={() => runAction(item)}
                    >
                      <Icon className="size-4 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="truncate text-sm text-foreground">{item.title}</p>
                        {item.subtitle ? (
                          <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>
                        ) : null}
                      </div>

                      {item.type === "action" ? (
                        <CommandShortcut>
                          <ArrowUpRight className="size-3.5" />
                        </CommandShortcut>
                      ) : null}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
