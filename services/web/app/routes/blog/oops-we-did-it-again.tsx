import { Container, Title, Text, Paper, Image, List, ThemeIcon, Divider, Badge } from '@mantine/core';

export function meta() {
  return [
    { title: "Announcing our $100M Series B funding round - Average Database Blog" },
    { name: "description", content: "Read about our latest funding round and our groundbreaking authentication plans!" },
  ];
}

export default function WeRichLmaoBlogPost() {
  return (
    <>
      <div className="bg-gradient-to-b from-blue-50 to-white">
        <Container size="md" className="py-16">
          <Paper shadow="md" p={0} radius="lg" withBorder className="overflow-hidden">
            {/* Header Image/Banner */}
            <div className="bg-blue-600 p-8 text-white">
              <Badge color="yellow" size="lg" variant="filled" className="mb-4">Company Update</Badge>
              <Title order={1} className="text-4xl lg:text-5xl font-bold mb-3">
              Announcing our $100M Series B funding round
              </Title>
              <div className="flex items-center gap-4">
                <Text className="text-blue-100">May 18, 2025</Text>
                <Divider orientation="vertical" className="bg-blue-400" />
                <Text className="text-blue-100">2 min read</Text>
              </div>
            </div>

            <div className="p-8 lg:p-12">
              <Title order={2} className="text-3xl font-bold text-gray-900 mb-6">
                Real Auth Has Never Been Tried
              </Title>

              <p className="text-lg text-gray-700 leading-relaxed mb-10">
                Our VCs have graciously bestowed upon us a whopping $100M (1 hundo milliyohn) Series B round to solve the most pressing issue in database technology today: user management and authentication.
              </p>

              <p className="text-lg text-gray-700 leading-relaxed mb-8">
             "Isn't $100M a lot of money to spend on auth?" You'd think so! But no, it's actually never enough. A large chunk is going to some Youtubers and threadbois on X dot com the everything app to promote our platform to users who complain about free tiers not being free enough.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-8">
              Nobody has actually done auth properly believe it or not so we're also first to market.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-8">
              We also do AI now I guess. Gotta IPO eventually.
              </p>
              <Paper shadow="sm" withBorder className="mb-10 p-30 pt-24">
                <Image
                  src="https://i.imgur.com/YfGBR3G.png" 
                  alt="Totally Real Auth Growth Projections"
                  radius="md"
                  className="w-full"
                />
              </Paper>
              
              <Divider className="my-8" />
              
              <Text className="text-xl text-gray-700 leading-relaxed text-center italic">
                Stay tuned for our next pivot!
              </Text>
            </div>
          </Paper>
        </Container>
      </div>
    </>
  );
} 
