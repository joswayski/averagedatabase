import { Container, Title, Text, Paper, Image } from '@mantine/core';
import { HeaderSimple } from '../../../components/HeaderSimple';

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
        <Paper shadow="sm" p="xl" radius="md" withBorder>
          <Title order={1} className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            ✨Announcing our $50m Series A funding round✨
          </Title>
          <Text c="dimmed" className="mb-6 text-sm">
            October 26, 2023
          </Text>

          <Text className="text-lg mb-4 text-gray-700 dark:text-gray-300">
            Become Humbled 🙏
          </Text>

          <Text className="mb-4 text-gray-700 dark:text-gray-300">
            What up broke boi? We just connedvinced our wonderful VCs to give us a bridge round before our free users put us in the dirt for good. You might be wondering what we're going to use the money for, so this poast is to explain exactly that:
          </Text>

          <ul className="list-disc list-inside mb-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Dark mode. There is literally nothing on the roadmap more important. We have 16 sprints planned to get this done.</li>
            <li>Bribing Youtubers. I mean devrel. I mean community. I mean oh sorry uhm marketing.</li>
            <li>Meaningful integrations. You know that framework that came out 3 weeks ago? No, the other one.. No the one with 30 users. We need SDKs for that one.</li>
            <li>Jepsen testing/audit. Look, we don't have to PASS it.. we just need to be able to claim that we've done it.</li>
            <li>Lambos.</li>
          </ul>

          <Text className="mb-4 text-gray-700 dark:text-gray-300">
            I hope this makes it clear what our roadmap is going forward. These last few years haven't been the greatest on the industry as a whole. We almost had to do a license rugpull to stay afloat! Luckily, due to our amazing and wonderful ENTERPRISE CUSTOMERS (you know who you are!!), things are looking great going forward. I'll leave you with some internal numbers our data science team (Jake (Stanford (Dropout))) put together using Databricks ($43k/mo):
          </Text>

          <Image
            src="https://i.imgur.com/YfGBR3G.png" // Placeholder image, you can replace this
            alt="Databricks chart showing massive growth"
            radius="md"
            className="mb-6 shadow-md"
          />
          
          <Text className="text-gray-700 dark:text-gray-300">
            Stay tuned for more mediocrity!
          </Text>
        </Paper>
      </Container>
    </>
  );
} 
