import { createFileRoute, Link, notFound } from "@tanstack/react-router";
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
      <main id="main-content" className="min-h-screen px-6 pt-28 pb-16">
        <article className="mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              to="/blog"
              className="group inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" aria-hidden="true" />
              Back to blog
            </Link>

            <header className="mt-6">
              <h1 className="text-3xl sm:text-[34px] font-semibold tracking-tight leading-tight text-foreground text-pretty">
                {post.title}
              </h1>
              <div className="mt-3.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13.5px] text-dim">
                <span className="text-muted-foreground">{post.author}</span>
                <span aria-hidden="true">·</span>
                <span>{formatPublishedDate(post.date, "long")}</span>
                <span aria-hidden="true">·</span>
                <span>{readingMinutes} min read</span>
              </div>
            </header>

            {post.image && (
              <div className="mt-7 overflow-hidden rounded-[10px] border border-border bg-muted/30">
                <Image
                  src={post.image}
                  alt={post.title}
                  width={1200}
                  height={800}
                  layout="constrained"
                  priority
                  className="w-full max-h-[320px] sm:max-h-[420px] lg:max-h-[520px] object-contain"
                />
              </div>
            )}

            <div className="prose mt-7" dangerouslySetInnerHTML={{ __html: post.html }} />

            {nextPost && (
              <Link
                to="/blog/$slug"
                params={{ slug: nextPost.slug }}
                className="group mt-9 flex items-center justify-between gap-4 rounded-[10px] border border-border bg-card px-5 py-4.5 transition-colors hover:border-ring/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="min-w-0">
                  <p className="text-xs text-dim">Next post</p>
                  <p className="mt-0.5 truncate text-[14.5px] font-medium text-foreground">
                    {nextPost.title}
                  </p>
                </div>
                <span className="shrink-0 text-[13px] font-medium text-muted-foreground transition-colors group-hover:text-foreground">
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
