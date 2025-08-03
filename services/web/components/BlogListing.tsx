import {
  AspectRatio,
  Card,
  Container,
  Image,
  SimpleGrid,
  Text,
  Title,
  Badge,
  Group,
  Stack,
  Overlay,
  Box,
} from "@mantine/core";
import { Link } from "react-router";
import { IconCalendar } from "@tabler/icons-react";

const blogPosts = [
  {
    title: "Average Storage System (ASS) is now available in AvgDB",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/b/bc/Amazon-S3-Logo.svg",
    date: "August 03, 2025",
    slug: "ass",
    excerpt:
      "We've raised $21.97 from @AvgDatabaseCEO and @notjoswayski to build the future of Average Storage System (ASS)",
  },
  {
    title: `They asked us what we would do if we couldn't raise another round..`,
    image: "https://i.redd.it/jv3d8mb9f2mb1.jpg",
    date: "May 18, 2025",
    slug: "oops-we-did-it-again",
    excerpt: `I guess we'll never know`,
  },
  {
    title: "✨Announcing our $50m Series A funding round✨",
    image:
      "https://i.pinimg.com/736x/84/c6/7d/84c67dfb0c53de176a87ed97f50b67a1.jpg",
    date: "June 8, 2024",
    slug: "we-rich-lmao",
    excerpt:
      "We just connedvinced our wonderful VCs to give us a bridge round...",
  },
];

export function BlogListing() {
  const cards = blogPosts.map((article) => (
    <Card
      key={article.title}
      p={0}
      radius="lg"
      component={Link}
      to={`/blog/${article.slug}`}
      className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 no-underline bg-white"
    >
      <Box className="relative overflow-hidden">
        <AspectRatio ratio={16 / 9}>
          <div className="relative w-full h-full">
            <Image
              src={article.image}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent transition-opacity duration-300 group-hover:opacity-0" />
          </div>
        </AspectRatio>
      </Box>

      <Stack p="md" gap="xs">
        <Group gap="xs" align="center">
          <IconCalendar size={14} className="text-gray-400" />
          <Text size="xs" c="dimmed" className="uppercase tracking-wider">
            {article.date}
          </Text>
        </Group>

        <Title
          order={3}
          className="font-['Outfit'] text-xl font-semibold text-gray-800"
        >
          {article.title}
        </Title>

        <Text size="sm" c="dimmed" className="line-clamp-2 text-gray-600">
          {article.excerpt}
        </Text>
      </Stack>
    </Card>
  ));

  return (
    <Container size="xl" py="xl" id="blog">
      <Title
        order={2}
        className="text-center mb-12 text-4xl font-bold text-gray-800"
      >
        From the Blog
      </Title>
      <div className=" p-8">
        <SimpleGrid
          cols={{ base: 1, sm: 2, lg: 3 }}
          spacing={{ base: "md", sm: "xl" }}
          verticalSpacing={{ base: "md", sm: "xl" }}
        >
          {cards}
        </SimpleGrid>
      </div>
    </Container>
  );
}
