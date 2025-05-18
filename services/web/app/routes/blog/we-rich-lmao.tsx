import { Container, Title, Text, Paper, Image, List, ThemeIcon } from '@mantine/core';
import { HeaderSimple } from '../../../components/HeaderSimple';
import { IconCircleCheckFilled } from '@tabler/icons-react';

export function meta() {
  return [
    { title: "✨Announcing our $50m Series A funding round✨ - Average Database Blog" },
    { name: "description", content: "Read about our latest funding round and future plans!" },
  ];
}

export default function WeRichLmaoBlogPost() {
  return (
    <>
      <HeaderSimple />
      <Container size="md" className="py-10">
        <Paper shadow="sm" p={{ base: 'md', sm: 'xl' }} radius="md" withBorder className="bg-white">
          <Title order={1} className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2 text-center sm:text-left">
            ✨Announcing our $50m Series A funding round✨
          </Title>
          <Text c="dimmed" className="mb-6 text-sm text-center sm:text-left">
            October 26, 2023
          </Text>

          <Title order={2} className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
            What up broke boi
          </Title>

          <Text className="mb-4 text-gray-700 leading-relaxed">
            We just connedvinced our wonderful VCs to give us a bridge round before our free users put us in the dirt for good. You might be wondering what we're going to use the money for, so this poast is to explain exactly that:
          </Text>

          <List
            spacing="sm"
            size="md"
            center
            icon={
              <ThemeIcon color="blue" size={28} radius="xl">
                <IconCircleCheckFilled size="1.2rem" />
              </ThemeIcon>
            }
            className="mb-6 pl-4 sm:pl-0"
          >
            <List.Item><Text className="text-gray-800">Dark mode. There is literally nothing on the roadmap more important. We have 16 sprints planned to get this done.</Text></List.Item>
            <List.Item><Text className="text-gray-800">Bribing Youtubers. I mean devrel. I mean community. I mean oh sorry uhm marketing.</Text></List.Item>
            <List.Item><Text className="text-gray-800">Meaningful integrations. You know that framework that came out 3 weeks ago? No, the other one.. No the one with 30 users. We need SDKs for that one.</Text></List.Item>
            <List.Item><Text className="text-gray-800">Jepsen testing/audit. Look, we don't have to PASS it.. we just need to be able to claim that we've done it.</Text></List.Item>
            <List.Item><Text className="text-gray-800">Lambos.</Text></List.Item>
          </List>

          <Text className="mb-4 text-gray-700 leading-relaxed">
            I hope this makes it clear what our roadmap is going forward. These last few years haven't been the greatest on the industry as a whole. We almost had to do a license rugpull to stay afloat! Luckily, due to our amazing and wonderful ENTERPRISE CUSTOMERS (you know who you are!!), things are looking great going forward. I'll leave you with some internal numbers our data science team (Jake (Stanford (Dropout))) put together using Databricks ($43k/mo):
          </Text>

          <Image
            src="https://i.imgur.com/YfGBR3G.png" 
            alt="Hypothetical Illustration of EBITDA"
            radius="md"
            className="mb-6 shadow-md w-full max-w-lg mx-auto"
          />
          
          <Text className="text-gray-700 leading-relaxed">
            Stay tuned for more mediocrity!
          </Text>
        </Paper>
      </Container>
    </>
  );
} 
