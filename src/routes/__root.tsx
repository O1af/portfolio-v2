import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import * as stylex from "@stylexjs/stylex";
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
      { name: "theme-color", content: "#ffffff" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      ...(import.meta.env.DEV
        ? [{ rel: "stylesheet", href: "/virtual:stylex.css" }]
        : []),
      { rel: "icon", href: "/favicon.png" },
    ],
    scripts: [
      ...(import.meta.env.DEV
        ? [{ type: "module", src: "/@id/virtual:stylex:runtime" }]
        : []),
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
      <body {...stylex.props(styles.body)}>
        <a
          href="#main-content"
          {...stylex.props(styles.skipLink)}
        >
          Skip to Content
        </a>
        <ThemeProvider>
          <MotionConfig reducedMotion="user">
            <div {...stylex.props(styles.page)}>{children}</div>
          </MotionConfig>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}

const styles = stylex.create({
  body: {
    minHeight: "100vh",
    backgroundColor: "var(--background)",
    color: "var(--foreground)",
    WebkitFontSmoothing: "antialiased",
    MozOsxFontSmoothing: "grayscale",
  },
  page: {
    minHeight: "100vh",
  },
  skipLink: {
    position: {
      default: "fixed",
      ":focus": "fixed",
    },
    top: "1rem",
    left: "1rem",
    zIndex: 60,
    width: {
      default: "1px",
      ":focus": "auto",
    },
    height: {
      default: "1px",
      ":focus": "auto",
    },
    margin: {
      default: "-1px",
      ":focus": 0,
    },
    overflow: {
      default: "hidden",
      ":focus": "visible",
    },
    clip: {
      default: "rect(0, 0, 0, 0)",
      ":focus": "auto",
    },
    whiteSpace: {
      default: "nowrap",
      ":focus": "normal",
    },
    borderRadius: "9999px",
    backgroundColor: "var(--background)",
    padding: {
      default: 0,
      ":focus": "0.5rem 1rem",
    },
    color: "var(--foreground)",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    fontWeight: 500,
    boxShadow: {
      default:
        "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1), 0 0 0 1px var(--border)",
      ":focus":
        "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1), 0 0 0 2px var(--ring)",
    },
    outline: "none",
  },
});
