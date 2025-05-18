import { IconCheck } from '@tabler/icons-react';
import { Button, Container, Group, Image, List, Text, ThemeIcon, Title } from '@mantine/core';
import { Link } from 'react-router';

const factsheet = [
    {
        title: "Hundreds of millions in funding",
        description: "Free tier rugpull delayed"
    },
    {
        title: "Serverless",
        description: "Don't worry about scaling, just add your credit card"
    },
    {
        title: "Written in Rust",
        description: "Blazing fast and 0 bugs guaranteed"
    },
    {
        title: "True open source",
        description: "No AGPL/SSPL BS, you can host it and try to compete with us (good luck)"
    },
    {
        title: "AI",
        description: "yeah why not  "
    }
]
export function HeroBullets() {
  return (
    <Container size="lg" >
      <div className="flex flex-col-reverse items-center justify-center gap-8 md:flex-row md:items-center md:justify-between md:gap-15 py-16">
        <div className="max-w-6xl w-full md:mr-12 flex-1 ">
          <h1 className="text-black font-outfit text-4xl md:text-5xl font-medium leading-tight mb-4">
            The world's most <span className="relative bg-blue-100/70 rounded px-3 py-1">performant</span>, <span className="relative bg-green-100/70 rounded px-3 py-1">secure</span>, <span className="relative bg-purple-100/70 rounded px-3 py-1">scalable</span>, <span className="relative bg-orange-100/70 rounded px-3 py-1">reliable</span>, <span className="relative bg-yellow-100/70 rounded px-3 py-1">freest</span>, <span className="relative bg-rose-100/70 rounded px-3 py-1"> open source</span> data platform<br />
          </h1>
          <Text c="dimmed" mt="md">
            AvgDB is the only database built from the ground up to meet the needs of the average developer.
          </Text>

          <List
            mt={30}
            spacing="sm"
            size="sm"
            icon={
              <ThemeIcon size={20} radius="xl">
                <IconCheck size={12} stroke={1.5} />
              </ThemeIcon>
            }
          >
            {factsheet.map((fact) => (
              <List.Item key={fact.title}>
                <b>{fact.title}</b> – {fact.description}
              </List.Item>
            ))}
          </List>


          <Group mt={30}>
            <Button
              radius="xl"
              size="md"
              className="text-base px-6 py-2 rounded-full font-medium"
              component={Link}
              to="/docs"
            >
              View Docs
            </Button>
            <Button
              variant="default"
              radius="xl"
              size="md"
              className="text-base px-6 py-2 rounded-full font-medium"
              component="a"
              href="https://github.com/joswayski/averagedatabase"
              target="_blank"
              rel="noopener noreferrer"
            >
              Source code
            </Button>
          </Group>
        </div>
        <img src="/logo.png" alt="AvgDB logo" className="w-24 h-24 md:w-[22rem] md:h-[22rem] max-w-lg object-contain flex-1 mb-8 md:mb-0 hidden md:block" />
      </div>
    </Container>
  );
}
