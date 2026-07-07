import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/sections/Hero";
import { Footer } from "@/components/layout/Footer";
import {
  siteUrl,
  personalInfo,
  siteMetadata,
  socialUrls,
} from "@/components/Info";
import { buildSocialMeta, jsonLd } from "@/lib/seo";
import { scrollToHashTarget } from "@/lib/hash-scroll";

const Experience = lazy(() =>
  import("@/components/sections/Experience").then((module) => ({
    default: module.Experience,
  }))
);
const Education = lazy(() =>
  import("@/components/sections/Education").then((module) => ({
    default: module.Education,
  }))
);
const Books = lazy(() =>
  import("@/components/sections/Books").then((module) => ({
    default: module.Books,
  }))
);
const Projects = lazy(() =>
  import("@/components/sections/Projects").then((module) => ({
    default: module.Projects,
  }))
);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: siteMetadata.title },
      { name: "description", content: siteMetadata.description },
      { name: "author", content: personalInfo.name },
      ...buildSocialMeta({
        title: siteMetadata.title,
        description: siteMetadata.description,
        url: siteUrl,
        image: `${siteUrl}${personalInfo.profileImage}`,
        siteName: personalInfo.name,
        type: "website",
      }),
    ],
    links: [{ rel: "canonical", href: siteUrl }],
    scripts: [
      jsonLd({
        "@context": "https://schema.org",
        "@type": "Person",
        name: personalInfo.name,
        url: siteUrl,
        image: `${siteUrl}${personalInfo.profileImage}`,
        jobTitle: personalInfo.title,
        worksFor: {
          "@type": "Organization",
          name: "University of Michigan",
        },
        alumniOf: {
          "@type": "CollegeOrUniversity",
          name: "University of Michigan",
        },
        sameAs: [socialUrls.github, socialUrls.linkedin],
        knowsAbout: [
          "Operating Systems",
          "Distributed Systems",
          "Large Language Models",
          "Software Engineering",
        ],
      }),
    ],
  }),
  component: App,
});

function App() {
  useEffect(() => {
    const scrollToCurrentHash = () => {
      const hash = window.location.hash.slice(1);
      if (!hash) {
        return;
      }

      void scrollToHashTarget(hash);
    };

    scrollToCurrentHash();
    window.addEventListener("hashchange", scrollToCurrentHash);

    return () => {
      window.removeEventListener("hashchange", scrollToCurrentHash);
    };
  }, []);

  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen">
        <Hero />
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
        <Suspense fallback={null}>
          <Education />
        </Suspense>
        <Suspense fallback={null}>
          <Books />
        </Suspense>
        <Suspense fallback={null}>
          <Projects />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
