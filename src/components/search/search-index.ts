import { allPosts } from "content-collections";
import {
  books,
  education,
  experiences,
  personalInfo,
  projects,
  socialUrls,
  siteMetadata,
} from "@/components/Info";

export type SearchGroup = "Actions" | "Navigate" | "Blog";

export type SearchItem = {
  id: string;
  title: string;
  subtitle?: string;
  keywords: string[];
  searchText?: string;
  group: SearchGroup;
  priority: number;
} & (
  | {
      type: "action";
      action: "email" | "github" | "linkedin";
    }
  | {
      type: "route";
      to: "/" | "/blog" | "/blog/$slug" | "/connections";
      params?: { slug: string };
      hash?: string;
    }
);

export type SearchMatch = {
  item: SearchItem;
  score: number;
  preview?: string;
};

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function snippetFromContent(content: string): string {
  const cleaned = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/[#*_`>\-\[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned.slice(0, 140);
}

function compactKeywords(...values: Array<string | undefined>): string[] {
  return values.filter((value): value is string => Boolean(value && value.trim()));
}

function plainText(value: string): string {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/[#*_~>\-\[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreItem(item: SearchItem, query: string): number {
  if (!query) {
    return item.priority;
  }

  const q = normalize(query);
  if (!q) {
    return item.priority;
  }

  const normalizedTitle = normalize(item.title);
  const normalizedSubtitle = normalize(item.subtitle ?? "");
  const normalizedKeywords = normalize(item.keywords.join(" "));
  const normalizedBody = normalize(item.searchText ?? "");
  const haystacks = [normalizedTitle, normalizedSubtitle, normalizedKeywords, normalizedBody];
  const tokens = q.split(" ").filter((token) => token.length >= 2);
  const hasPhraseMatch = haystacks.some((text) => text.includes(q));
  const hasTokenMatch = tokens.some((token) => haystacks.some((text) => text.includes(token)));

  if (!hasPhraseMatch && !hasTokenMatch) {
    return 0;
  }

  let score = 0;

  if (normalizedTitle === q) {
    score += 260;
  }
  if (normalizedTitle.startsWith(q)) {
    score += 120;
  }
  if (normalizedTitle.includes(q)) {
    score += 90;
  }
  if (normalizedSubtitle.includes(q)) {
    score += 70;
  }
  if (normalizedKeywords.includes(q)) {
    score += 55;
  }
  if (normalizedBody.includes(q)) {
    score += 40;
  }
  if (
    normalizedTitle.includes(q) ||
    normalizedSubtitle.includes(q) ||
    normalizedKeywords.includes(q) ||
    normalizedBody.includes(q)
  ) {
    score += 80;
  }

  for (const token of tokens) {
    if (normalizedTitle.includes(token)) {
      score += 30;
    } else if (normalizedSubtitle.includes(token)) {
      score += 20;
    } else if (normalizedKeywords.includes(token)) {
      score += 15;
    } else if (normalizedBody.includes(token)) {
      score += 12;
    }
  }

  return score + item.priority;
}

function buildMatchPreview(item: SearchItem, query: string): string | undefined {
  const q = normalize(query);
  if (!q) return undefined;

  const source = plainText(item.searchText ?? item.subtitle ?? "");
  if (!source) return undefined;

  const lower = source.toLowerCase();
  const phraseIndex = lower.indexOf(q);
  const tokens = q.split(" ").filter((token) => token.length >= 2);

  let matchIndex = phraseIndex;
  let matchLength = q.length;

  if (matchIndex < 0) {
    for (const token of tokens) {
      const idx = lower.indexOf(token);
      if (idx >= 0 && (matchIndex < 0 || idx < matchIndex)) {
        matchIndex = idx;
        matchLength = token.length;
      }
    }
  }

  if (matchIndex < 0) return undefined;

  const start = Math.max(0, matchIndex - 48);
  const end = Math.min(source.length, matchIndex + matchLength + 72);
  const excerpt = source.slice(start, end).trim();

  const prefix = start > 0 ? "... " : "";
  const suffix = end < source.length ? " ..." : "";

  return `${prefix}${excerpt}${suffix}`;
}

export function buildSearchIndex(): SearchItem[] {
  const actionItems: SearchItem[] = [
    {
      id: "action-email",
      type: "action",
      action: "email",
      title: "Send me an email",
      subtitle: personalInfo.email,
      keywords: ["email", "mail", "contact", "reach out"],
      group: "Actions",
      priority: 120,
    },
    {
      id: "action-github",
      type: "action",
      action: "github",
      title: "Open my GitHub",
      subtitle: socialUrls.github,
      keywords: ["github", "code", "repos", "open source"],
      group: "Actions",
      priority: 110,
    },
    {
      id: "action-linkedin",
      type: "action",
      action: "linkedin",
      title: "Open my LinkedIn",
      subtitle: socialUrls.linkedin,
      keywords: ["linkedin", "network", "profile", "contact"],
      group: "Actions",
      priority: 100,
    },
  ];

  const sectionItems: SearchItem[] = [
    {
      id: "nav-home",
      type: "route",
      title: "Home",
      subtitle: siteMetadata.description,
      keywords: ["home", "about", personalInfo.name],
      group: "Navigate",
      to: "/",
      hash: "hero",
      priority: 90,
    },
    {
      id: "nav-experience",
      type: "route",
      title: "Experience",
      subtitle: "Work, internships, and impact",
      keywords: ["experience", "work", "career", "internships", "netflix"],
      group: "Navigate",
      to: "/",
      hash: "experience",
      priority: 85,
    },
    {
      id: "nav-projects",
      type: "route",
      title: "Projects",
      subtitle: "What I have built",
      keywords: ["projects", "build", "portfolio", "github"],
      group: "Navigate",
      to: "/",
      hash: "projects",
      priority: 85,
    },
    {
      id: "nav-books",
      type: "route",
      title: "Bookshelf",
      subtitle: "Books I am reading and recommend",
      keywords: ["books", "reading", "recommendations"],
      group: "Navigate",
      to: "/",
      hash: "books",
      priority: 72,
    },
    {
      id: "nav-education",
      type: "route",
      title: "Education",
      subtitle: "Academic background",
      keywords: ["education", "university", "school", "michigan"],
      group: "Navigate",
      to: "/",
      hash: "education",
      priority: 72,
    },
    {
      id: "nav-blog",
      type: "route",
      title: "Blog",
      subtitle: siteMetadata.blogDescription,
      keywords: ["blog", "articles", "posts", "writing"],
      group: "Navigate",
      to: "/blog",
      priority: 84,
    },
    {
      id: "nav-connections",
      type: "route",
      title: "Connections",
      subtitle: "Word puzzle game — find four groups of four",
      keywords: ["connections", "game", "puzzle", "words", "nyt"],
      group: "Navigate",
      to: "/connections",
      priority: 80,
    },
  ];

  const contentItems: SearchItem[] = [
    ...projects.map((project, index) => ({
      id: `project-${project.title}-${index}`,
      type: "route" as const,
      title: project.title,
      subtitle: project.description,
      keywords: compactKeywords(
        "project",
        "portfolio",
        project.category,
        ...(project.tags ?? []),
        project.date
      ),
      searchText: plainText(project.description),
      group: "Navigate" as const,
      to: "/" as const,
      hash: "projects",
      priority: 55,
    })),
    ...experiences.map((experience, index) => ({
      id: `experience-${experience.company}-${index}`,
      type: "route" as const,
      title: `${experience.title} at ${experience.company}`,
      subtitle: experience.description,
      keywords: compactKeywords(
        "experience",
        "work",
        experience.company,
        experience.location,
        experience.period
      ),
      searchText: plainText(experience.description),
      group: "Navigate" as const,
      to: "/" as const,
      hash: "experience",
      priority: 52,
    })),
    ...education.map((item, index) => ({
      id: `education-${item.school}-${index}`,
      type: "route" as const,
      title: `${item.degree} - ${item.school}`,
      subtitle: `${item.field}${item.gpa ? `, GPA ${item.gpa}` : ""}`,
      keywords: compactKeywords("education", item.school, item.degree, item.field, item.location),
      searchText: plainText(`${item.degree} ${item.field} ${item.school} ${item.location}`),
      group: "Navigate" as const,
      to: "/" as const,
      hash: "education",
      priority: 50,
    })),
    ...books.map((book, index) => ({
      id: `book-${book.title}-${index}`,
      type: "route" as const,
      title: book.title,
      subtitle: `Bookshelf - ${book.progressLabel}`,
      keywords: compactKeywords("book", "reading", book.status, book.progressLabel),
      searchText: plainText(book.title),
      group: "Navigate" as const,
      to: "/" as const,
      hash: "books",
      priority: 40,
    })),
    ...allPosts.map((post) => ({
      id: `post-${post.slug}`,
      type: "route" as const,
      title: post.title,
      subtitle: post.summary || snippetFromContent(post.content),
      keywords: compactKeywords(
        "blog",
        "post",
        "article",
        post.author,
        post.slug
      ),
      searchText: plainText(post.content),
      group: "Blog" as const,
      to: "/blog/$slug" as const,
      params: { slug: post.slug },
      priority: 70,
    })),
  ];

  return [...actionItems, ...sectionItems, ...contentItems];
}

export function searchIndex(items: SearchItem[], query: string, limit = 16): SearchMatch[] {
  const q = query.trim();
  const scored = items
    .map((item) => ({
      item,
      score: scoreItem(item, q),
      preview: buildMatchPreview(item, q),
    }))
    .filter((entry) => entry.score > (q ? 40 : 0))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored;
}
