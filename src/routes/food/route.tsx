import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const Route = createFileRoute("/food")({
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
