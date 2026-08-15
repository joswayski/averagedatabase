import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Footer } from "components/Footer";
import { HeaderSimple } from "components/HeaderSimple";

export const Route = createFileRoute("/docs")({
  component: DocsLayout,
});

export default function DocsLayout() {
  return (
    <div>
      <HeaderSimple />
      <Outlet />
      <Footer />
    </div>
  );
}
