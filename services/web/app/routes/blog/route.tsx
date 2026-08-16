import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Footer } from "components/Footer";
import { HeaderSimple } from "components/HeaderSimple";

export const Route = createFileRoute("/blog")({
  component: BlogLayout,
});

export default function BlogLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <HeaderSimple />
      <Outlet />
      <Footer />
    </div>
  );
}
