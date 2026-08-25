import { createFileRoute } from "@tanstack/react-router";
import * as stylex from "@stylexjs/stylex";
import { motion } from "motion/react";
import { Toaster } from "sonner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ConnectionsGame } from "@/components/connections/game";
import { useTheme } from "@/components/theme/ThemeProvider";
import { siteUrl, personalInfo } from "@/components/Info";
import { buildSocialMeta } from "@/lib/seo";

export const Route = createFileRoute("/connections")({
  head: () => ({
    meta: [
      { title: "Connections | Olaf Dsouza" },
      {
        name: "description",
        content: "A word puzzle game — find four groups of four.",
      },
      ...buildSocialMeta({
        title: "Connections | Olaf Dsouza",
        description: "A word puzzle game — find four groups of four.",
        url: `${siteUrl}/connections`,
        image: `${siteUrl}${personalInfo.profileImage}`,
        siteName: personalInfo.name,
        type: "website",
      }),
    ],
    links: [{ rel: "canonical", href: `${siteUrl}/connections` }],
  }),
  component: ConnectionsPage,
});

function ConnectionsPage() {
  const { theme } = useTheme();

  return (
    <>
      <Header />
      <Toaster
        theme={theme}
        position="top-center"
        richColors
        expand={false}
        visibleToasts={1}
        closeButton
        offset="16px"
        gap={8}
        toastOptions={{ duration: 3000 }}
      />
      <main id="main-content" {...stylex.props(styles.main)}>
        <div {...stylex.props(styles.content)}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            {...stylex.props(styles.intro)}
          >
            <h1 {...stylex.props(styles.heading)}>
              Connections
            </h1>
            <p {...stylex.props(styles.description)}>
              Create four groups of four!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <ConnectionsGame />
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}

const styles = stylex.create({
  main: {
    minHeight: "100vh",
    padding: "7rem 1.5rem 2rem",
  },
  content: {
    maxWidth: "560px",
    marginInline: "auto",
  },
  intro: {
    marginBottom: "1.25rem",
    textAlign: "center",
  },
  heading: {
    marginBottom: "0.375rem",
    color: "var(--foreground)",
    fontSize: {
      default: "1.875rem",
      "@media (min-width: 768px)": "2.25rem",
    },
    lineHeight: {
      default: "2.25rem",
      "@media (min-width: 768px)": "2.5rem",
    },
    fontWeight: 600,
    letterSpacing: "-0.025em",
  },
  description: {
    color: "var(--muted-foreground)",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },
});
