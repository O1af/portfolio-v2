import { createFileRoute, Link } from "@tanstack/react-router";
import * as stylex from "@stylexjs/stylex";
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
      <main id="main-content" {...stylex.props(styles.main)}>
        <div {...stylex.props(styles.content)}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 {...stylex.props(styles.heading)}>
              Blog
            </h1>
            <p {...stylex.props(styles.description)}>
              {siteMetadata.blogDescription}
            </p>
          </motion.div>

          <div {...stylex.props(styles.posts)}>
            {sortedPosts.map((post, index) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                {...stylex.props(
                  index < sortedPosts.length - 1 && styles.divider,
                )}
              >
                <Link
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  {...stylex.props(styles.postLink)}
                >
                  {post.image ? (
                    <div {...stylex.props(styles.thumbnail)}>
                      <Image
                        src={post.image}
                        alt=""
                        width={336}
                        height={210}
                        layout="constrained"
                        loading="lazy"
                        decoding="async"
                        {...stylex.props(styles.image)}
                      />
                    </div>
                  ) : (
                    <div {...stylex.props(styles.thumbnail, styles.monogram)}>
                      {monogram(post.title)}
                    </div>
                  )}

                  <div {...stylex.props(styles.postContent)}>
                    <h2 {...stylex.props(styles.postTitle)}>
                      {post.title}
                    </h2>
                    {post.summary && (
                      <p {...stylex.props(styles.summary)}>
                        {post.summary}
                      </p>
                    )}
                    <p {...stylex.props(styles.meta)}>
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

const styles = stylex.create({
  main: {
    minHeight: "100vh",
    padding: "8rem 1.5rem 4rem",
  },
  content: {
    maxWidth: "42rem",
    marginInline: "auto",
  },
  heading: {
    color: "var(--foreground)",
    fontSize: "1.875rem",
    lineHeight: "2.25rem",
    fontWeight: 600,
    letterSpacing: "-0.025em",
  },
  description: {
    marginTop: "0.875rem",
    color: "var(--muted-foreground)",
    fontSize: "15.5px",
    lineHeight: "1.625",
    textWrap: "pretty",
  },
  posts: {
    display: "flex",
    marginTop: "2.5rem",
    flexDirection: "column",
  },
  divider: {
    borderBottomWidth: "1px",
    borderColor: "var(--border)",
  },
  postLink: {
    "--post-decoration": {
      default: "none",
      ":hover": "underline",
      ":focus-visible": "underline",
    },
    display: "flex",
    flexDirection: {
      default: "column",
      "@media (min-width: 640px)": "row",
    },
    alignItems: {
      default: "stretch",
      "@media (min-width: 640px)": "center",
    },
    gap: {
      default: "1rem",
      "@media (min-width: 640px)": "1.25rem",
    },
    paddingBlock: "1.25rem",
    outline: "none",
  },
  thumbnail: {
    width: {
      default: "100%",
      "@media (min-width: 640px)": "168px",
    },
    flexShrink: 0,
    aspectRatio: "16 / 10",
    overflow: "hidden",
    borderRadius: "0.5rem",
    borderWidth: "1px",
    borderColor: "var(--border)",
    backgroundColor: "color-mix(in oklab, var(--muted) 30%, transparent)",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  monogram: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "var(--secondary)",
    color: "var(--dim)",
    fontFamily:
      '"Geist Mono Variable", Menlo, Monaco, Consolas, "Courier New", monospace',
    fontSize: "22px",
    fontWeight: 600,
  },
  postContent: {
    minWidth: 0,
    flex: 1,
  },
  postTitle: {
    color: "var(--foreground)",
    fontSize: "15.5px",
    lineHeight: "1.375",
    fontWeight: 500,
    textDecorationLine: "var(--post-decoration)",
    textWrap: "pretty",
  },
  summary: {
    marginTop: "0.375rem",
    color: "var(--muted-foreground)",
    fontSize: "13px",
    lineHeight: "1.625",
  },
  meta: {
    marginTop: "0.5rem",
    color: "var(--dim)",
    fontSize: "0.75rem",
    lineHeight: "1rem",
  },
});
