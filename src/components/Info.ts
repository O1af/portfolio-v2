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
  bio: "I'm currently a student at the University of Michigan interested in Operating Systems, LLMs, and Distributed Systems",
  email: "site@olafdsouza.com",
  profileImage: "/pfp.png",
};

export const siteMetadata = {
  title: `${personalInfo.name} | ${personalInfo.title}`,
  description: `${personalInfo.bio}. Previously at Netflix, and a few startups.`,
  blogTitle: `Blog | ${personalInfo.name}`,
  blogDescription: "A collection of my thoughts, stories, and ideas",
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
    title: "Software Engineer Intern",
    company: "Netflix",
    logo: "/logo/netflix.jpeg",
    period: "May 2025 - Aug 2025",
    location: "Los Gatos, CA",
    description:
      "Expanded Ads Visualization API to improve monitoring of Ad contract performance. Engineered Delivery Obligation Metrics pipeline processing 500M daily events using Kafka, Flink, and Druid.",
  },
  {
    title: "Co-Founder & Engineer",
    company: "Quail AI",
    logo: "/logo/quail.png",
    period: "Dec 2024 - May 2025",
    location: "Ann Arbor, MI",
    description:
      "Created AI-Powered SQL Editor and BI Platform with NextJS and TypeScript. Built AI Agent enabling 87% faster database querying with 50+ MAUs.",
  },
  {
    title: "Operating Systems TA",
    company: "University of Michigan",
    logo: "/logo/umich.jpeg",
    period: "Aug 2024 - Dec 2024",
    location: "Ann Arbor, MI",
    description:
      "Taught core OS concepts to 300+ students including concurrency, memory management, and distributed systems. Conducted weekly office hours and lab sessions.",
  },
  {
    title: "Software Engineer Intern",
    company: "MeetYourClass",
    logo: "/logo/meetyourclass.jpeg",
    period: "May 2024 - Aug 2024",
    location: "Ann Arbor, MI",
    description:
      "Led migration of entire backend from Google Firestore to NestJS. Reduced cloud costs by 14% through infrastructure consolidation.",
  },
  {
    title: "Software Engineer Intern",
    company: "Infinite Degrees",
    logo: "/logo/idx.jpeg",
    period: "Aug 2022 - Dec 2022",
    location: "Ann Arbor, MI",
    description:
      "Built data pipeline to scrape and process stats for 200+ athletes. Created internal API endpoints to support data team operations.",
  },
];

export const education: Education[] = [
  {
    degree: "Master of Science",
    field: "Computer Science and Engineering",
    school: "University of Michigan",
    logo: "/logo/umich.jpeg",
    period: "Aug 2025 - May 2026",
    location: "Ann Arbor, MI",
  },
  {
    degree: "Bachelor of Science",
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
      "Built the world's fastest AI chatbot, benchmarked 10x faster than ChatGPT and DeepSeek. Utilized Cloudflare Workers for minimal latency (60ms) and Groq for maximum inference speed (3000 tokens/s).",
    tags: ["Remix", "Cloudflare Workers", "Groq", "Vercel AI SDK"],
    highlight: "10x faster than ChatGPT",
  },
  {
    title: "Azure AI Adapter",
    description:
      "Open-source npm package for the Vercel AI SDK with 1500+ weekly downloads. Abstracts the Azure AI API simplifying access to 1,800+ models including DeepSeek-R1 & Meta Llama.",
    tags: ["TypeScript", "Azure AI", "Vercel AI SDK", "NPM"],
    github: "https://github.com/o1af/azure-ai-adapter",
    highlight: "1500+ weekly downloads",
  },
  {
    title: "Distributed Key-Value Stores",
    description:
      "Five complex distributed key-value stores exploring fault tolerance, replication, and consensus. Implementations include primary-backup, Paxos consensus, and Paxos with dynamic sharding.",
    tags: ["Go", "Dafny", "Paxos", "2PC", "Sharding"],
  },
  {
    title: "Multithreaded Network File Server",
    description:
      "Heavily concurrent, crash-consistent network fileserver utilizing committing writes, Boost threads, R/W locks for concurrency, and POSIX sockets for network communication.",
    tags: ["C++", "Threading", "Sockets", "Fault Tolerance"],
  },
];

export const books: Book[] = [
  {
    title: "Designing Data-Intensive Applications",
    cover: "/covers/ddia.png",
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
