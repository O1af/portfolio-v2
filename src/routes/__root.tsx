import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { MotionConfig } from "motion/react";
import { ThemeProvider, themeInitScript } from "@/components/theme/ThemeProvider";
import { siteUrl, personalInfo, siteMetadata, socialUrls } from "@/components/Info";
import { jsonLd } from "@/lib/seo";

import appCss from "../styles.css?url";

const analyticsInitScript = `(() => {
  const scriptSrc = "https://olaf-mv3.vercel.app/x.js";
  const websiteId = "678d097c-e83c-4f9f-940d-e47bbd679f5e";

  const loadAnalytics = () => {
    if (document.querySelector('script[src="' + scriptSrc + '"]')) {
      return;
    }

    const script = document.createElement("script");
    script.defer = true;
    script.src = scriptSrc;
    script.dataset.websiteId = websiteId;
    document.head.appendChild(script);
  };

  const scheduleLoad = () => {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(loadAnalytics, { timeout: 2000 });
      return;
    }

    window.setTimeout(loadAnalytics, 1500);
  };

  if (document.readyState === "complete") {
    scheduleLoad();
    return;
  }

  window.addEventListener("load", scheduleLoad, { once: true });
})();`;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { title: siteMetadata.title },
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "robots", content: "index, follow" },
      { name: "googlebot", content: "index, follow" },
      { name: "description", content: siteMetadata.description },
      { name: "theme-color", content: "#242528" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.png" },
    ],
    scripts: [
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
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script dangerouslySetInnerHTML={{ __html: analyticsInitScript }} />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <a
          href="#main-content"
          className="sr-only fixed left-4 top-4 z-[60] rounded-full bg-background px-4 py-2 text-sm font-medium text-foreground shadow-lg ring-1 ring-border focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Skip to Content
        </a>
        <ThemeProvider>
          <MotionConfig reducedMotion="user">
            <div className="min-h-screen">{children}</div>
          </MotionConfig>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
