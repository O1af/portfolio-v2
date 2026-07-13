import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Image } from "@unpic/react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { siteUrl, personalInfo, siteMetadata } from "@/components/Info";
import { formatPublishedDate } from "@/lib/date";
import { sortedPosts } from "@/lib/posts";
import { buildSocialMeta, jsonLd } from "@/lib/seo";

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
      <main id="main-content" className="min-h-screen pt-28 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {sortedPosts.map((post, index) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
              >
                <Link
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="group block focus-visible:outline-none"
                >
                  {post.image && (
                    <div className="h-[198px] flex items-center justify-center overflow-hidden rounded bg-muted/30 mb-4">
                      <Image
                        src={post.image}
                        alt={post.title}
                        width={600}
                        height={400}
                        layout="constrained"
                        loading="lazy"
                        decoding="async"
                        className={
                          post.imageOrientation === "portrait"
                            ? "h-full w-auto transition-transform duration-500 group-hover:scale-[1.03] group-focus-visible:scale-[1.03]"
                            : "w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03] group-focus-visible:scale-[1.03]"
                        }
                      />
                    </div>
                  )}
                  <time className="block text-sm text-muted-foreground">
                    {formatPublishedDate(post.date)}
                  </time>
                  <h2 className="text-xl text-foreground mt-2 leading-snug">
                    {post.title}
                  </h2>
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
