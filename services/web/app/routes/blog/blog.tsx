import { Container, Paper, Text, Title, UnstyledButton } from '@mantine/core';
import { HeaderSimple } from '../../../components/HeaderSimple';
import { Blog as BlogListing } from '../../../components/Blog';
import { Link } from 'react-router';
import { IconArrowRight } from '@tabler/icons-react';

export function meta() {
  return [
    { title: "Blog - Average Database" },
    { name: "description", content: "Latest news and articles from Average Database." },
  ];
}

export default function BlogIndexPage() {
  return (
    <>
      <Container size="lg" className="my-8"> 
        <BlogListing />
      </Container>
    </>
  );
} 
