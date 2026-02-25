import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Toaster } from "sonner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ConnectionsGame } from "@/components/connections/game";
import { useTheme } from "@/components/theme/ThemeProvider";
import { siteUrl } from "@/components/Info";

export const Route = createFileRoute("/connections")({
  head: () => ({
    title: "Connections | Olaf Dsouza",
    meta: [
      {
        name: "description",
        content: "A word puzzle game — find four groups of four.",
      },
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
      <main className="min-h-screen pt-20 pb-16 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10 text-center"
          >
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground mb-3">
              Connections
            </h1>
            <p className="text-base text-muted-foreground">
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
