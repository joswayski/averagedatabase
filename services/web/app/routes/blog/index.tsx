import { createFileRoute } from "@tanstack/react-router";
import { Container } from "@mantine/core";
import { BlogListing } from "../../../components/BlogListing";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog - Average Database" },
      {
        name: "description",
        content: "Latest news and articles from Average Database.",
      },
    ],
  }),
  component: BlogIndexPage,
});

export default function BlogIndexPage() {
  return (
    <div className="flex-grow">
      <Container size="lg" className="my-8">
        <BlogListing />
      </Container>
    </div>
  );
}
