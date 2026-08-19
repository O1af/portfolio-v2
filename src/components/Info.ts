import { Github, Linkedin, Mail } from "lucide-react";
import type { SocialLink } from "@/lib/types/social";
import type { Experience } from "@/lib/types/experience";
import type { Education } from "@/lib/types/education";
import type { PersonalInfo } from "@/lib/types/personal";
import type { Project } from "@/lib/types/project";
import type { Book } from "@/lib/types/book";

export const siteUrl = "https://olafdsouza.com";

export const personalInfo: PersonalInfo = {
  name: "Olaf Dsouza",
  title: "Software Engineer",
  bio: "Umich alum interested in food, emergence, and LLMs.",
  email: "site@olafdsouza.com",
  avatarImage: "/pfp-avatar.jpg",
  profileImage: "/pfp-social.jpg",
};

export const siteMetadata = {
  title: `${personalInfo.name} | ${personalInfo.title}`,
  description:
    "Software engineer at Netflix and University of Michigan CS alum, writing about operating systems, LLMs, and distributed systems.",
  blogTitle: `Blog | ${personalInfo.name}`,
  // Shown on the blog page itself
  blogDescription: "Ramblings",
  // Used for search engines and link previews
  blogMetaDescription:
    "Writing about operating systems, LLMs, distributed systems, and CS at the University of Michigan: projects, class reviews, and ideas.",
};

export const socialLinks: SocialLink[] = [
  {
    icon: Github,
    href: "https://github.com/o1af",
    label: "GitHub",
  },
  {
    icon: Linkedin,
    href: "https://linkedin.com/in/olafdsouza",
    label: "LinkedIn",
  },
  {
    icon: Mail,
    href: "mailto:site@olafdsouza.com",
    label: "Email",
  },
];

export const socialUrls = {
  github: "https://github.com/o1af",
  linkedin: "https://linkedin.com/in/olafdsouza",
};

export const experiences: Experience[] = [
  {
    title: "Software Engineer",
    company: "Netflix",
    logo: "/logo/netflix.jpeg",
    period: "Aug 2026 - Present",
    location: "Los Gatos, CA",
    description: "Ads Metrics",
  },
  {
    title: "Founding Engineer",
    company: "August Law",
    logo: "/logo/august.png",
    period: "May 2026 - Jul 2026",
    location: "New York, NY",
    description: "Helped make legal work better, faster, and cheaper",
    link: "https://www.august.law",
  },
  {
    title: "Software Engineer Intern",
    company: "Netflix",
    logo: "/logo/netflix.jpeg",
    period: "May 2025 - Aug 2025",
    location: "Los Gatos, CA",
    description:
      "Ads Metrics",
  },
  {
    title: "Co-Founder & Engineer",
    company: "Quail AI",
    logo: "/logo/quail.png",
    period: "Dec 2024 - May 2025",
    location: "Ann Arbor, MI",
    description:
      "AI for BI",
    link: "https://quailbi.com",
  },
  {
    title: "Operating Systems TA",
    company: "University of Michigan",
    logo: "/logo/umich.jpeg",
    period: "Aug 2024 - Dec 2024",
    location: "Ann Arbor, MI",
    description:
      "Taught core OS concepts to 300+ students",
  },
  {
    title: "Software Engineer Intern",
    company: "MeetYourClass",
    logo: "/logo/meetyourclass.jpeg",
    period: "May 2024 - Aug 2024",
    location: "Ann Arbor, MI",
    description:
      "Connecting Classmates",
    link: "https://www.meetyourclass.com/",
  },
  {
    title: "Research Project Lead",
    company: "University of Michigan",
    logo: "/logo/umich.jpeg",
    period: "Apr 2023 - Aug 2024",
    location: "Ann Arbor, MI",
    description: "Air Quality Monitoring",
  },
  {
    title: "Software Engineer Intern",
    company: "Infinite Degrees",
    logo: "/logo/idx.jpeg",
    period: "Aug 2022 - Dec 2022",
    location: "Ann Arbor, MI",
    description:
      "Scraping",
  },
];

export const education: Education[] = [
  {
    degree: "M.S.",
    field: "Computer Science & Engineering",
    school: "University of Michigan",
    logo: "/logo/umich.jpeg",
    period: "Aug 2025 - May 2026",
    location: "Ann Arbor, MI",
  },
  {
    degree: "B.S.",
    field: "Computer Science",
    school: "University of Michigan",
    logo: "/logo/umich.jpeg",
    period: "Aug 2022 - May 2025",
    location: "Ann Arbor, MI",
  },
];

export const projects: Project[] = [
  {
    title: "Flash Chat",
    description:
      "Built the world's fastest AI chatbot. Utilized Cloudflare Workers for minimal latency (60ms) and Groq for maximum inference speed (3000 tokens/s).",
    tags: ["Remix", "Groq", "Vercel AI SDK"],
    github: "https://github.com/O1af/flash-chat",
    date: "Aug 2025",
    category: "AI / ML",
  },
  {
    title: "Azure AI Adapter",
    description:
      "Open-source npm package for the Vercel AI SDK with 4000+ weekly downloads",
    tags: ["TypeScript", "Azure AI", "Vercel AI SDK", "NPM"],
    github: "https://github.com/QuailAI/azure-ai-provider",
    highlight: "4000+ weekly downloads",
    date: "Jan 2025",
    category: "AI / ML",
  },
  {
    title: "Distributed Key-Value Stores",
    description:
      "Created 5 complex distributed key-value stores exploring fault tolerance, replication, and consensus.",
    tags: ["Go", "Dafny", "Paxos", "2PC", "Sharding"],
    category: "Systems",
    date: "Dec 2024",
  },
  {
    title: "Multithreaded Network File Server",
    description:
      "Heavily concurrent, crash-consistent network fileserver utilizing committing writes, Boost threads, R/W locks for concurrency, and POSIX sockets for network communication.",
    tags: ["C++", "Fault Tolerance"],
    category: "Systems",
    date: "May 2024",
  },
  {
    title: "Chrome Counter",
    description: "A Chrome extension that counts how many tabs you have (and encourages you to cut down :)",
    github: "https://github.com/O1af/chrome-counter",
    date: "Jan 2022",
    category: "Web Development",
    link: "https://chromewebstore.google.com/detail/mjddiojooncnbaiibiagioncjmabfhfd?utm_source=item-share-cb",
    tags: ["JavaScript", "HTML", "CSS"],
  },
  {
    title: "IronThief",
    description: "A minecraft server plugin that tracks the movement of iron in your world.",
    tags: ["Java"],
    category: "Games",
    date: "Feb 2022",
    github: "https://github.com/O1af/ironThief",
  },
  {
    title: "Gamepigeon Tanks Solver",
    description: "A solver for the Gamepigeon Tanks game using computer vision.",
    tags: ["Python", "Computer Vision"],
    category: "Games",
    date: "Sep 2021",
    github: "https://github.com/O1af/gamepigeon",
  },
  {
    title: "SnakeBot",
    description: "A discord social credit system",
    github: "https://github.com/O1af/snakeBot",
    date: "Feb 2021",
    category: "Games",
    tags: ["Python"],
  },
  {
    title: "Quail",
    description: "Quail was an AI Powered BI Platform/ SQL Editor.",
    github: "https://github.com/O1af/quail",
    date: "Jan 2025",
    category: "AI / ML",
    link: "https://quailbi.com",
    tags: ["TypeScript", "SQL", "AI"],
  }
];

export type FavoriteBlog = {
  name: string;
  href: string;
  domain: string;
};

// Bookshelf section — favorite engineering blogs
export const favoriteBlogs: FavoriteBlog[] = [
  {
    name: "Dynamic Context Discovery",
    href: "https://cursor.com/blog/dynamic-context-discovery",
    domain: "cursor.com/blog",
  },
  {
    name: "Code Mode: The Better Way to Use MCP",
    href: "https://blog.cloudflare.com/code-mode/",
    domain: "blog.cloudflare.com",
  },
  {
    name: "Scaling PostgreSQL to Power 800M ChatGPT Users",
    href: "https://openai.com/index/scaling-postgresql/",
    domain: "openai.com",
  },
  {
    name: "Treat Agent Output Like Compiler Output",
    href: "https://skiplabs.io/blog/codegen_as_compiler",
    domain: "skiplabs.io",
  },
  {
    name: "A Field Guide to Fable: Finding Your Unknowns",
    href: "https://x.com/trq212/article/2073100352921215386",
    domain: "x.com/@trq212",
  },
];

export const books: Book[] = [
  {
    title: "Designing Data-Intensive Applications",
    cover: "/covers/ddia.jpg",
    progressLabel: "100%",
    progressPercent: 100,
    status: "completed",
  },
  {
    title: "Effective Modern C++",
    cover: "/covers/emcpp.jpg",
    progressLabel: "Page 31",
    progressPercent: 10,
    status: "reading",
  },

  {
    title: "Computer Architecture: A Quantitative Approach",
    cover: "/covers/caqa.jpg",
    progressLabel: "Page 10",
    progressPercent: 5,
    status: "reading",
  }, {
    title: "Modern Java in Action",
    cover: "/covers/mjia.jpg",
    progressLabel: "100%",
    progressPercent: 100,
    status: "completed",
  },
  {
    title: "The Adtech Book",
    cover: "/covers/tab.webp",
    progressLabel: "100%",
    progressPercent: 100,
    status: "completed",
  }
];
