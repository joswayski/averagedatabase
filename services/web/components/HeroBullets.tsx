import { IconCheck } from '@tabler/icons-react';
import { Button, Container, Group, Image, List, Text, ThemeIcon, Title } from '@mantine/core';

export function HeroBullets() {
  return (
    <Container size="lg">
      <div className="flex flex-col-reverse items-center justify-center gap-8 md:flex-row md:items-center md:justify-between md:gap-16 py-16">
        <div className="max-w-xl w-full md:mr-12 flex-1">
          <h1 className="text-black font-outfit text-4xl md:text-5xl font-medium leading-tight mb-4">
            The world's <span className="relative bg-blue-100/70 rounded px-3 py-1">fastest</span>, <span className="relative bg-green-100/70 rounded px-3 py-1">most secure</span>, <span className="relative bg-purple-100/70 rounded px-3 py-1">scalable</span>, <span className="relative bg-orange-100/70 rounded px-3 py-1">reliable</span>, <span className="relative bg-yellow-100/70 rounded px-3 py-1">free-est</span>, <span className="relative bg-rose-100/70 rounded px-3 py-1">open source</span> database platform<br />
          </h1>
          <Text c="dimmed" mt="md">
            Build fully functional accessible web applications faster than ever – Mantine includes
            more than 120 customizable components and hooks to cover you in any situation
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
            <List.Item>
              <b>Written in Rust</b> – blazingly fast and 0 bugs guaranteed
            </List.Item>
            <List.Item>
              <b>Hundreds of millions in funding</b> – free tier rugpull delayed
            </List.Item>
            <List.Item>
              <b>Serverless</b> – don't worry about scaling, just add your credit card
            </List.Item>
          </List>

          <Group mt={30}>
            <Button radius="xl" size="md" className="text-base px-6 py-2 rounded-full font-medium">
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
        <img src="/logo.png" alt="AvgDB logo" className="w-64 h-64 md:w-[28rem] md:h-[28rem] max-w-full object-contain flex-1 mb-8 md:mb-0 hidden md:block" />
      </div>
    </Container>
  );
}
