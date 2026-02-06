import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/sections/Hero";
import { Education } from "@/components/sections/Education";
import { Experience } from "@/components/sections/Experience";
import { Footer } from "@/components/layout/Footer";
import { Books } from "@/components/sections/Books";
import { Projects } from "@/components/sections/Projects";
import {
  siteUrl,
  personalInfo,
  siteMetadata,
  socialUrls,
} from "@/components/Info";

export const Route = createFileRoute("/")({
  head: () => ({
    title: siteMetadata.title,
    meta: [
      { name: "description", content: siteMetadata.description },
      { name: "author", content: personalInfo.name },
      { property: "og:type", content: "website" },
      { property: "og:url", content: siteUrl },
      { property: "og:title", content: siteMetadata.title },
      { property: "og:description", content: siteMetadata.description },
      { property: "og:image", content: `${siteUrl}${personalInfo.profileImage}` },
      { property: "og:site_name", content: personalInfo.name },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:url", content: siteUrl },
      { name: "twitter:title", content: siteMetadata.title },
      { name: "twitter:description", content: siteMetadata.description },
      { name: "twitter:image", content: `${siteUrl}${personalInfo.profileImage}` },
    ],
    links: [{ rel: "canonical", href: siteUrl }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
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
      },
    ],
  }),
  component: App,
});

function App() {
  return (
    <>
      <Header />
      <Hero />
      <Experience />
      <Books />
      <Education />
      <Projects />
      <Footer />
    </>
  );
}
