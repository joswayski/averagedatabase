import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/404")({
  component: StaticNotFoundPage,
});

function StaticNotFoundPage() {
  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>404</h1>
      <p>The requested page could not be found.</p>
      <a href="/">Return home →</a>
    </main>
  );
}
