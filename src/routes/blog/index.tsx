import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Image } from "@unpic/react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { siteUrl, personalInfo, siteMetadata } from "@/components/Info";
import { formatPublishedDate } from "@/lib/date";
import { readingMinutesBySlug, sortedPosts } from "@/lib/posts";
import { buildSocialMeta, jsonLd } from "@/lib/seo";

const MONOGRAM_STOPWORDS = new Set(["a", "an", "the", "of", "in", "on", "at", "with"]);

function monogram(title: string): string {
  const words = title
    .split(/\s+/)
    .filter((word) => /[a-z0-9]/i.test(word) && !MONOGRAM_STOPWORDS.has(word.toLowerCase()));
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }
  return (words[0] ?? title).slice(0, 2).toUpperCase();
}

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: siteMetadata.blogTitle },
      { name: "description", content: siteMetadata.blogMetaDescription },
      { name: "author", content: personalInfo.name },
      ...buildSocialMeta({
        title: siteMetadata.blogTitle,
        description: siteMetadata.blogMetaDescription,
        url: `${siteUrl}/blog`,
        image: `${siteUrl}${personalInfo.profileImage}`,
        siteName: personalInfo.name,
        type: "website",
      }),
    ],
    links: [{ rel: "canonical", href: `${siteUrl}/blog` }],
    scripts: [
      jsonLd({
        "@context": "https://schema.org",
        "@type": "Blog",
        name: `${personalInfo.name}'s Blog`,
        description: siteMetadata.blogMetaDescription,
        url: `${siteUrl}/blog`,
        author: {
          "@type": "Person",
          name: personalInfo.name,
          url: siteUrl,
        },
        blogPost: sortedPosts.map((post) => ({
          "@type": "BlogPosting",
          headline: post.title,
          description: post.summary,
          datePublished: post.date,
          author: {
            "@type": "Person",
            name: post.author,
          },
          url: `${siteUrl}/blog/${post.slug}`,
        })),
      }),
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen px-6 pt-32 pb-16">
        <div className="mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Blog
            </h1>
            <p className="mt-3.5 text-[15.5px] leading-relaxed text-muted-foreground text-pretty">
              {siteMetadata.blogDescription}
            </p>
          </motion.div>

          <div className="mt-10 flex flex-col">
            {sortedPosts.map((post, index) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className={
                  index < sortedPosts.length - 1 ? "border-b border-border" : ""
                }
              >
                <Link
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="group flex flex-col gap-4 py-5 focus-visible:outline-none sm:flex-row sm:items-center sm:gap-5"
                >
                  {post.image ? (
                    <div className="aspect-[16/10] w-full shrink-0 overflow-hidden rounded-lg border border-border bg-muted/30 sm:w-[168px]">
                      <Image
                        src={post.image}
                        alt=""
                        width={336}
                        height={210}
                        layout="constrained"
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-[16/10] w-full shrink-0 items-center justify-center rounded-lg border border-border bg-secondary font-mono text-[22px] font-semibold text-dim sm:w-[168px]">
                      {monogram(post.title)}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h2 className="text-[15.5px] font-medium leading-snug text-foreground text-pretty group-hover:underline group-focus-visible:underline">
                      {post.title}
                    </h2>
                    {post.summary && (
                      <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                        {post.summary}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-dim">
                      {formatPublishedDate(post.date)} ·{" "}
                      {readingMinutesBySlug.get(post.slug)} min read
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
