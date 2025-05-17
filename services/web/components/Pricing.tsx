import { Button, Container, Grid, Paper, Text, Title, rem } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingTier {
  name: string;
  description: string;
  price: string;
  features: PricingFeature[];
  buttonText: string;
  highlighted?: boolean;
}

const tiers: PricingTier[] = [
  {
    name: "Indie Hackers",
    description: "Just enough to put a side project on your resume before your next FAANG gig",
    price: "$0",
    buttonText: "Get API key",
    features: [
      { text: "IF we have compute leftover we'll serve your requests", included: true },
      { text: "1kb payloads", included: true },
      { text: "Discord / Twitter reply guy support", included: true },
      { text: "Targeted and relevant ads in your results", included: true },
      { text: "Dedicated microwave radiation interference", included: true },
      { text: "Complimentary block on Twitter by the AverageDB CEO", included: true },
    ],
  },
  {
    name: "Startups PRO",
    description: "You're trying to get into YC and haven't setup proper accounting yet",
    price: "$39",
    buttonText: "Get API key",
    highlighted: true,
    features: [
      { text: "1/256th vCPU & 4mb RAM. Don't use it all up now!", included: true },
      { text: "4kb payloads", included: true },
      { text: "Dashboard to login & view your account info", included: true },
      { text: "More data types (number, boolean)", included: true },
      { text: "AverageDB Boost™ - Reduce random request delay by up to 50%", included: true },
      { text: "ACID compliance available as a paid addon", included: true },
    ],
  },
  {
    name: "Enterprise",
    description: "Send us the stupid questionnaire from your legal team we don't have SOC2 if it isn't obvious",
    price: "Custom",
    buttonText: "Get API key",
    features: [
      { text: "Tell us what you can afford and we will tell you our price", included: true },
      { text: "$2,000/mo SSO addon (required)", included: true },
      { text: "Dedicated email support (Mon-Fri 9am-12pm & 2pm-4pm Tokyo time)", included: true },
      { text: "Indexes available as a paid addon ($100/index/mo)", included: true },
      { text: "Employee pinky promise to not look at customer data", included: true },
      { text: "Bring Your Own API Key™ - use your own generated key", included: true },
      { text: "No Ads in responses", included: true },
      { text: "Backups", included: true },
    ],
  },
];

export function Pricing() {
  return (
    <Container size="lg" py="xl">
      <div className="text-center mb-12">
        <Title order={2} size={rem(40)} mb="md">
          Simple, transparent pricing
        </Title>
        <Text size="lg" c="dimmed" maw={600} mx="auto">
          Choose the plan that best fits your needs. All plans include our core features.
        </Text>
      </div>

      <Grid gutter="xl">
        {tiers.map((tier) => (
          <Grid.Col key={tier.name} span={{ base: 12, md: 4 }}>
            <Paper
              shadow="md"
              p="xl"
              radius="md"
              withBorder
              className={`h-full flex flex-col ${tier.highlighted ? 'border-blue-500 border-2' : ''}`}
            >
              <div className="mb-6">
                <Title order={3} mb="xs">
                  {tier.name}
                </Title>
                <Text size="sm" c="dimmed" mb="md">
                  {tier.description}
                </Text>
                <div className="mb-4">
                  <Text size="xl" fw={700}>
                    {tier.price}
                    {tier.price !== "Custom" && <span className="text-sm font-normal text-gray-500">/month</span>}
                  </Text>
                </div>
              </div>

              <div className="flex-grow">
                <ul className="space-y-3">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <IconCheck
                        size={20}
                        className={`mr-2 mt-0.5 ${feature.included ? 'text-green-500' : 'text-gray-300'}`}
                      />
                      <Text size="sm">{feature.text}</Text>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <Button
                  fullWidth
                  variant={tier.highlighted ? "filled" : "outline"}
                  size="lg"
                  radius="md"
                >
                  {tier.buttonText}
                </Button>
              </div>
            </Paper>
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  );
} 
