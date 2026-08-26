import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import * as stylex from "@stylexjs/stylex";
import { motion } from "motion/react";
import { Image } from "@unpic/react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { ArrowLeft } from "lucide-react";
import { siteUrl, personalInfo } from "@/components/Info";
import { formatPublishedDate, publishedDateToISOString } from "@/lib/date";
import { sortedPosts } from "@/lib/posts";
import { countWords, estimateReadingMinutes } from "@/lib/reading-time";
import { buildSocialMeta, jsonLd } from "@/lib/seo";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = sortedPosts.find((p) => p.slug === params.slug);
    if (!post) {
      throw notFound();
    }
    return {
      post,
      readingMinutes: estimateReadingMinutes(post.content),
      wordCount: countWords(post.content),
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};

    const { post, readingMinutes, wordCount } = loaderData;
    const postUrl = `${siteUrl}/blog/${post.slug}`;
    const imageUrl = post.image
      ? `${siteUrl}${post.image}`
      : `${siteUrl}${personalInfo.profileImage}`;

    return {
      meta: [
        { title: `${post.title} | ${personalInfo.name}` },
        { name: "description", content: post.summary },
        { name: "author", content: post.author },
        { property: "article:author", content: post.author },
        {
          property: "article:published_time",
          content: publishedDateToISOString(post.date),
        },
        ...buildSocialMeta({
          title: post.title,
          description: post.summary,
          url: postUrl,
          image: imageUrl,
          siteName: personalInfo.name,
          type: "article",
        }),
      ],
      links: [{ rel: "canonical", href: postUrl }],
      scripts: [
        jsonLd({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.summary,
          image: imageUrl,
          datePublished: publishedDateToISOString(post.date),
          author: {
            "@type": "Person",
            name: post.author,
          },
          publisher: {
            "@type": "Person",
            name: personalInfo.name,
            url: siteUrl,
          },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": postUrl,
          },
          wordCount,
          timeRequired: `PT${readingMinutes}M`,
        }),
        jsonLd({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
            { "@type": "ListItem", position: 2, name: "Blog", item: `${siteUrl}/blog` },
            { "@type": "ListItem", position: 3, name: post.title, item: postUrl },
          ],
        }),
      ],
    };
  },
  component: BlogPost,
});

function BlogPost() {
  const { post, readingMinutes } = Route.useLoaderData();
  const postIndex = sortedPosts.findIndex((p) => p.slug === post.slug);
  const nextPost = postIndex >= 0 ? sortedPosts[postIndex + 1] : undefined;

  return (
    <>
      <Header />
      <main id="main-content" {...stylex.props(styles.main)}>
        <article {...stylex.props(styles.article)}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              to="/blog"
              {...stylex.props(styles.backLink)}
            >
              <ArrowLeft {...stylex.props(styles.backIcon)} aria-hidden="true" />
              Back to blog
            </Link>

            <header {...stylex.props(styles.header)}>
              <h1 {...stylex.props(styles.heading)}>
                {post.title}
              </h1>
              <div {...stylex.props(styles.meta)}>
                <span {...stylex.props(styles.author)}>{post.author}</span>
                <span aria-hidden="true">·</span>
                <span>{formatPublishedDate(post.date, "long")}</span>
                <span aria-hidden="true">·</span>
                <span>{readingMinutes} min read</span>
              </div>
            </header>

            {post.image && (
              <div {...stylex.props(styles.imageFrame)}>
                <Image
                  src={post.image}
                  alt={post.title}
                  width={1200}
                  height={800}
                  layout="constrained"
                  loading="eager"
                  fetchPriority="high"
                  {...stylex.props(styles.image)}
                />
              </div>
            )}

            <div
              className={`prose ${stylex.props(styles.prose).className}`}
              dangerouslySetInnerHTML={{ __html: post.html }}
            />

            {nextPost && (
              <Link
                to="/blog/$slug"
                params={{ slug: nextPost.slug }}
                {...stylex.props(styles.nextLink)}
              >
                <div {...stylex.props(styles.nextContent)}>
                  <p {...stylex.props(styles.nextLabel)}>Next post</p>
                  <p {...stylex.props(styles.nextTitle)}>
                    {nextPost.title}
                  </p>
                </div>
                <span {...stylex.props(styles.readLink)}>
                  Read →
                </span>
              </Link>
            )}
          </motion.div>
        </article>
        <ScrollProgress />
      </main>
      <Footer />
    </>
  );
}

const styles = stylex.create({
  main: {
    minHeight: "100vh",
    padding: "7rem 1.5rem 4rem",
  },
  article: {
    maxWidth: "42rem",
    marginInline: "auto",
  },
  backLink: {
    "--back-transform": {
      default: "translateX(0)",
      ":hover": "translateX(-0.125rem)",
    },
    display: "inline-flex",
    alignItems: "center",
    gap: "0.375rem",
    color: {
      default: "var(--muted-foreground)",
      ":hover": "var(--foreground)",
    },
    fontSize: "13px",
    fontWeight: 500,
    transitionProperty: "color, background-color, border-color, text-decoration-color, fill, stroke",
    transitionDuration: "150ms",
  },
  backIcon: {
    width: "0.875rem",
    height: "0.875rem",
    transform: "var(--back-transform)",
    transitionProperty: "transform, translate, scale, rotate",
    transitionDuration: "150ms",
  },
  header: {
    marginTop: "1.5rem",
  },
  heading: {
    color: "var(--foreground)",
    fontSize: {
      default: "1.875rem",
      "@media (min-width: 640px)": "34px",
    },
    lineHeight: "1.25",
    fontWeight: 600,
    letterSpacing: "-0.025em",
    textWrap: "pretty",
  },
  meta: {
    display: "flex",
    marginTop: "0.875rem",
    flexWrap: "wrap",
    alignItems: "center",
    columnGap: "0.5rem",
    rowGap: "0.25rem",
    color: "var(--dim)",
    fontSize: "13.5px",
  },
  author: {
    color: "var(--muted-foreground)",
  },
  imageFrame: {
    marginTop: "1.75rem",
    overflow: "hidden",
    borderRadius: "10px",
    borderWidth: "1px",
    borderColor: "var(--border)",
    backgroundColor: "color-mix(in oklab, var(--muted) 30%, transparent)",
  },
  image: {
    width: "100%",
    maxHeight: {
      default: "320px",
      "@media (min-width: 640px)": "420px",
      "@media (min-width: 1024px)": "520px",
    },
    objectFit: "contain",
  },
  prose: {
    marginTop: "1.75rem",
  },
  nextLink: {
    "--read-color": {
      default: "var(--muted-foreground)",
      ":hover": "var(--foreground)",
    },
    display: "flex",
    marginTop: "2.25rem",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
    borderRadius: "10px",
    borderWidth: "1px",
    borderColor: {
      default: "var(--border)",
      ":hover": "color-mix(in oklab, var(--ring) 50%, transparent)",
    },
    backgroundColor: "var(--card)",
    padding: "1.125rem 1.25rem",
    transitionProperty: "color, background-color, border-color, text-decoration-color, fill, stroke",
    transitionDuration: "150ms",
    outline: "none",
    boxShadow: {
      default: "none",
      ":focus-visible": "0 0 0 2px var(--ring)",
    },
  },
  nextContent: {
    minWidth: 0,
  },
  nextLabel: {
    color: "var(--dim)",
    fontSize: "0.75rem",
    lineHeight: "1rem",
  },
  nextTitle: {
    marginTop: "0.125rem",
    overflow: "hidden",
    color: "var(--foreground)",
    fontSize: "14.5px",
    fontWeight: 500,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  readLink: {
    flexShrink: 0,
    color: "var(--read-color)",
    fontSize: "13px",
    fontWeight: 500,
    transitionProperty: "color, background-color, border-color, text-decoration-color, fill, stroke",
    transitionDuration: "150ms",
  },
});
