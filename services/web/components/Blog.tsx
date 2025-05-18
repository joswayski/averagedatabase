import { AspectRatio, Card, Container, Image, SimpleGrid, Text, Title } from '@mantine/core';
import { Link } from 'react-router';

const blogPosts = [

  {
    title: `They asked us what we would do if we couldn't raise another round..`,
    image:
      'https://i.redd.it/jv3d8mb9f2mb1.jpg',
    date: 'August 18, 2022',
    slug: 'top-10-norway',
    excerpt: `I guess we'll never know`,
  },
  {
    title: '✨Announcing our $50m Series A funding round✨',
    image:
      'https://i.pinimg.com/736x/84/c6/7d/84c67dfb0c53de176a87ed97f50b67a1.jpg',
    date: 'October 26, 2023',
    slug: 'we-rich-lmao',
    excerpt: 'Become Humbled 🙏 We just connedvinced our wonderful VCs to give us a bridge round...',
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
