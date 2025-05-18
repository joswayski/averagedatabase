import { Container, Paper, Text, Title, UnstyledButton } from '@mantine/core';
import { HeaderSimple } from '../../../components/HeaderSimple';
import { BlogListing } from '../../../components/BlogListing';

export function meta() {
  return [
    { title: "Blog - Average Database" },
    { name: "description", content: "Latest news and articles from Average Database." },
  ];
}

export default function BlogIndexPage() {
  return (
    <div className="flex-grow">
      <Container size="lg" className="my-8"> 
        <BlogListing />
      </Container>
    </div>
  );
} 
