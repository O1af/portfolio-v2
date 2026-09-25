import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { IMAGE_HOST } from "@/lib/food-core";

export const Route = createFileRoute("/food")({
  // Start the image host's DNS + TLS handshake before the first photo is parsed.
  head: () => ({ links: [{ rel: "preconnect", href: IMAGE_HOST }] }),
  component: FoodLayout,
});

function FoodLayout() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}
