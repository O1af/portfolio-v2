import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "motion/react";
import { allPosts } from "content-collections";
import { MDXContent } from "@content-collections/mdx/react";
import { Image } from "@unpic/react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { format } from "date-fns";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { siteUrl, personalInfo } from "@/components/Info";
import { buildSocialMeta, jsonLd } from "@/lib/seo";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = allPosts.find((p) => p.slug === params.slug);
    if (!post) {
      throw notFound();
    }
    return post;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};

    const post = loaderData;
    const postUrl = `${siteUrl}/blog/${post.slug}`;
    const imageUrl = post.image
      ? `${siteUrl}${post.image}`
      : `${siteUrl}${personalInfo.profileImage}`;

    return {
      title: `${post.title} | ${personalInfo.name}`,
      meta: [
        { name: "description", content: post.summary },
        { name: "author", content: post.author },
        { property: "article:author", content: post.author },
        {
          property: "article:published_time",
          content: new Date(post.date).toISOString(),
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
          datePublished: new Date(post.date).toISOString(),
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
        }),
      ],
    };
  },
  component: BlogPost,
});

function BlogPost() {
  const post = Route.useLoaderData();

  return (
    <>
      <Header />
      <main className="min-h-screen pt-20 pb-16 px-6">
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
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to blog
            </Link>

            <header className="mb-10">
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-4 leading-tight">
                {post.title}
              </h1>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {post.author}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(post.date), "MMMM d, yyyy")}
                </span>
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
                  style={{ objectFit: "contain" }}
                  className="w-full max-h-[320px] sm:max-h-[420px] lg:max-h-[520px] object-contain"
                />
              </div>
            )}

            <div className="prose">
              <MDXContent code={post.mdx} />
            </div>
          </motion.div>
        </article>
        <ScrollProgress />
      </main>
      <Footer />
    </>
  );
}
