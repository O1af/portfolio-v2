import { createFileRoute } from "@tanstack/react-router";
import * as stylex from "@stylexjs/stylex";
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
const Bookshelf = lazy(() =>
  import("@/components/sections/Bookshelf").then((module) => ({
    default: module.Bookshelf,
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
          name: "Netflix",
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
      <main id="main-content" {...stylex.props(styles.main)}>
        <div {...stylex.props(styles.content)}>
          <Hero />
          <Suspense fallback={null}>
            <Experience />
          </Suspense>
          <Suspense fallback={null}>
            <Education />
          </Suspense>
          <Suspense fallback={null}>
            <Bookshelf />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}

const styles = stylex.create({
  main: {
    minHeight: "100vh",
    padding: "8rem 1.5rem 4.5rem",
  },
  content: {
    maxWidth: "42rem",
    marginInline: "auto",
  },
});
