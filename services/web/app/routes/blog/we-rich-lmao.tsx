import { Container, Title, Text, Paper, Image, List, ThemeIcon, Divider, Badge } from '@mantine/core';
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
      <div className="bg-gradient-to-b from-blue-50 to-white">
        <Container size="md" className="py-16">
          <Paper shadow="md" p={0} radius="lg" withBorder className="overflow-hidden">
            {/* Header Image/Banner */}
            <div className="bg-blue-600 p-8 text-white">
              <Badge color="yellow" size="lg" variant="filled" className="mb-4">Series A Announcement</Badge>
              <Title order={1} className="text-4xl lg:text-5xl font-bold mb-3">
                ✨Announcing our $50m Series A funding round✨
              </Title>
              <div className="flex items-center gap-4">
                <Text className="text-blue-100">October 26, 2023</Text>
                <Divider orientation="vertical" className="bg-blue-400" />
                <Text className="text-blue-100">2 min read</Text>
              </div>
            </div>

            <div className="p-8 lg:p-12">
              <Title order={2} className="text-3xl font-bold text-gray-900 mb-6">
                What up broke boi
              </Title>

              <p className="text-lg text-gray-700 leading-relaxed mb-10">
                We just con<span  className="line-through text-stone-200">ned</span>vinced our wonderful VCs to give us a bridge round before our free users put us in the dirt for good. You might be wondering what we're going to use the money for, so this poast is to explain exactly that:
              </p>

              <div className="space-y-4 mb-10">
                <List
                  spacing="md"
                  size="md"
                  className="list-none"
                >
                  <List.Item>
                    <div className="flex items-start gap-3">
                      <Text className="text-gray-900" fw={700}>Dark Mode Initiative:</Text>
                    </div>
                    <Text className="text-gray-700 mt-1">There is literally nothing on the roadmap more important. We have 16 sprints planned to get this done.</Text>
                  </List.Item>
                  
                  <List.Item>
                    <div className="flex items-start gap-3">
                      <Text className="text-gray-900" fw={700}>Community Building:</Text>
                    </div>
                    <Text className="text-gray-700 mt-1">Bribing Youtubers. I mean devrel. I mean community. I mean oh sorry uhm marketing.</Text>
                  </List.Item>
                  
                  <List.Item>
                    <div className="flex items-start gap-3">
                      <Text className="text-gray-900" fw={700}>Framework Integration:</Text>
                    </div>
                    <Text className="text-gray-700 mt-1">Meaningful integrations. You know that framework that came out 3 weeks ago? No, the other one.. No the one with 30 users. We need SDKs for that one.</Text>
                  </List.Item>
                  
                  <List.Item>
                    <div className="flex items-start gap-3">
                      <Text className="text-gray-900" fw={700}>Security Audit:</Text>
                    </div>
                    <Text className="text-gray-700 mt-1">Jepsen testing/audit. Look, we don't have to PASS it.. we just need to be able to claim that we've done it.</Text>
                  </List.Item>
                  
                  <List.Item>
                    <div className="flex items-start gap-3">
                      <Text className="text-gray-900" fw={700}>Team Benefits:</Text>
                    </div>
                    <Text className="text-gray-700 mt-1">Lambos.</Text>
                  </List.Item>
                </List>
              </div>

              <Text className="text-lg text-gray-700 leading-relaxed mb-24">
                I hope this makes it clear what our roadmap is going forward. These last few years haven't been the greatest on the industry as a whole. We almost had to do a license rugpull to stay afloat! Luckily, due to our amazing and wonderful ENTERPRISE CUSTOMERS (you know who you are!!), things are looking great going forward. I'll leave you with some internal numbers our data science team (Jake (Stanford (Dropout))) put together using Databricks ($43k/mo):
              </Text>

              <Paper shadow="sm" withBorder className="mb-10 p-4 mt-8">
                <Image
                  src="/ebitda.png" 
                  alt="Hypothetical Illustration of EBITDA"
                  radius="md"
                  className="w-full"
                />
              </Paper>
              
              <Divider className="my-8" />
              
              <Text className="text-xl text-gray-700 leading-relaxed text-center italic">
                Stay tuned for more mediocrity!
              </Text>
            </div>
          </Paper>
        </Container>
      </div>
  );
} 
