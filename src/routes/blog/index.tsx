import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { allPosts } from "content-collections";
import { Image } from "@unpic/react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { format } from "date-fns";
import { siteUrl, personalInfo, siteMetadata } from "@/components/Info";
import { buildSocialMeta, jsonLd } from "@/lib/seo";

const sortedPosts = [...allPosts].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
);

export const Route = createFileRoute("/blog/")({
  head: () => ({
    title: siteMetadata.blogTitle,
    meta: [
      { name: "description", content: siteMetadata.blogDescription },
      { name: "author", content: personalInfo.name },
      ...buildSocialMeta({
        title: siteMetadata.blogTitle,
        description: siteMetadata.blogDescription,
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
        description: siteMetadata.blogDescription,
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
      <main className="min-h-screen pt-20 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground mb-4">
              Blog
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              {siteMetadata.blogDescription}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sortedPosts.map((post, index) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
              >
                <Link
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="group block h-full"
                >
                  <article className="h-full rounded-xl bg-card/50 border border-border overflow-hidden hover:bg-card hover:shadow-md hover:shadow-black/5 dark:hover:shadow-black/20 transition-all duration-300 hover:-translate-y-0.5">
                    {post.image && (
                      <div className="aspect-[3/2] overflow-hidden bg-muted/30 flex items-center justify-center">
                        <Image
                          src={post.image}
                          alt={post.title}
                          width={600}
                          height={400}
                          layout="constrained"
                          loading="lazy"
                          decoding="async"
                          style={{ objectFit: "contain" }}
                          className="max-w-full max-h-full object-contain group-hover:scale-[1.02] transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <time className="text-xs text-muted-foreground/70">
                        {format(new Date(post.date), "MMM d, yyyy")}
                      </time>
                      <h2 className="text-base font-semibold text-foreground mt-1.5 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h2>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {post.summary}
                      </p>
                    </div>
                  </article>
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
