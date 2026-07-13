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

  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen pt-20 pb-16 px-6">
        <article className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
              Back to blog
            </Link>

            <header className="mb-10">
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-4 leading-tight">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                <span>{post.author}</span>
                <span aria-hidden="true">·</span>
                <span>{formatPublishedDate(post.date, "long")}</span>
                <span aria-hidden="true">·</span>
                <span>{readingMinutes} min read</span>
              </div>
            </header>

            {post.image && (
              <div className="mb-10 bg-muted/30 rounded-2xl ring-1 ring-border overflow-hidden">
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

            <div className="prose" dangerouslySetInnerHTML={{ __html: post.html }} />
          </motion.div>
        </article>
        <ScrollProgress />
      </main>
      <Footer />
    </>
  );
}
