import { AspectRatio, Card, Container, Image, SimpleGrid, Text, Title } from '@mantine/core';
import { Link } from 'react-router';

const blogPosts = [
  {
    title: '✨Announcing our $50m Series A funding round✨',
    image:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=720&q=80',
    date: 'October 26, 2023',
    slug: 'we-rich-lmao',
    excerpt: 'Become Humbled 🙏 We just connedvinced our wonderful VCs to give us a bridge round...',
  },
  {
    title: 'Top 10 places to visit in Norway this summer',
    image:
      'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=720&q=80',
    date: 'August 18, 2022',
    slug: 'top-10-norway',
    excerpt: 'Discover the breathtaking beauty of Norway with our top 10 summer destinations.',
  },
  {
    title: 'Best forests to visit in North America',
    image:
      'https://images.unsplash.com/photo-1448375240586-882707db888b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=720&q=80',
    date: 'August 27, 2022',
    slug: 'best-forests-na',
    excerpt: 'Explore the most majestic forests across North America for your next adventure.',
  },
];

export function Blog() {
  const cards = blogPosts.map((article) => (
    <Card
      key={article.title}
      p="md"
      radius="md"
      component={Link}
      to={`/blog/${article.slug}`}
      className="border border-transparent relative transition-all duration-150 ease-in-out hover:z-10 hover:scale-101 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700 no-underline"
    >
      <AspectRatio ratio={1920 / 1080}>
        <Image src={article.image} radius="md" />
      </AspectRatio>
      <Text className="uppercase font-medium text-gray-500 text-xs mt-2">{article.date}</Text>
      <Text className="font-['Outfit',_theme(fontFamily.sans)] font-medium text-lg text-gray-900 dark:text-white">{article.title}</Text>
      <Text size="sm" className="text-gray-600 dark:text-gray-400 mt-1">{article.excerpt}</Text>
    </Card>
  ));

  return (
    <Container py="xl" id="blog">
      <Title order={2} className="text-center mb-10 text-3xl font-bold text-gray-900 dark:text-white">
        From the Blog
      </Title>
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing={{ base: 'md', sm: 'lg' }}>
        {cards}
      </SimpleGrid>
    </Container>
  );
} 
