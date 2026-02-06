import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { siteUrl, personalInfo, siteMetadata, socialUrls } from "@/components/Info";
import { jsonLd } from "@/lib/seo";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    title: siteMetadata.title,
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "robots", content: "index, follow" },
      { name: "googlebot", content: "index, follow" },
      { name: "description", content: siteMetadata.description },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.png" },
    ],
    scripts: [
      {
        defer: true,
        src: "https://olaf-mv3.vercel.app/x.js",
        "data-website-id": "678d097c-e83c-4f9f-940d-e47bbd679f5e",
      },
      jsonLd({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: personalInfo.name,
        url: siteUrl,
        publisher: {
          "@type": "Person",
          name: personalInfo.name,
          url: siteUrl,
          sameAs: [socialUrls.github, socialUrls.linkedin],
        },
      }),
    ],
  }),

  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider>
          <main className="min-h-screen">{children}</main>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
