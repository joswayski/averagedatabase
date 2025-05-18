import { Button, Container, Grid, Paper, Text, Title, rem } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { useState } from 'react';
import { Form, useNavigation } from 'react-router';
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
    description: "AKA Poors. You are most likely here.",
    price: "$0",
    buttonText: "Get API key",
    features: [
      { text: "Email support (Mon-Fri 9am-12pm & 2pm-4pm Tokyo time)", included: true },
      { text: "DB hosted on Google Cloud", included: true },
      { text: "Targeted and relevant ads in your results", included: true },
      { text: "Complimentary block on Twitter by the AverageDB CEO", included: true },
    ],
  },
  {
    name: "Pay as you go",
    description: "You don't have an accounting team yet so you actually believe this is a good idea",
    price: "$1",
    buttonText: "Get API key",
    highlighted: true,
    features: [
      { text: "Support via X replies when you call us out", included: true },
      { text: "DB hosted on a real cloud like AWS", included: true },
      { text: "Targeted and relevant ads in your results", included: true },
      { text: "Create unlimited databases (we prefix the table names tbh)", included: true },
    ],
  },
  {
    name: "Enterprise",
    description: "SOC2uah on dat thang",
    price: "Custom",
    buttonText: "Get API key",
    features: [
      { text: "We'll put your DB in a VPC", included: true },
      { text: "Access to AvgDB Metal™ and AvgDB Boost™ for Unlimited™ performance", included: true },
      { text: "Indexes available on certain columns (contact us)", included: true },
      { text: "Employee pinky promise to not look at customer data", included: true },
      { text: "Bring Your Own API Key™ - use your own generated key", included: true },
      { text: "No Ads in responses", included: true },
      { text: "$2,000/mo SSO addon (required)", included: true },
      { text: "ACID compliance available as a paid addon", included: true },
    ],
  },
];

export function Pricing() {
  const navigation = useNavigation();
  const [submittedTier, setSubmittedTier] = useState<string | null>(null);
  const isSubmitting = navigation.state === "submitting";

  return (
    <Container id="pricing" size="lg" py="xl">
      <div className="text-center mb-12">
        <Title order={2} size={rem(40)} mb="md">
          Simple, "transparent" pricing
        </Title>
        <Text size="lg" c="dimmed" maw={600} mx="auto">
          Choose the plan that best fits your needs, the bigger the better.
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
              <div className="mb-6 min-h-[120px]">
                <Title order={3} mb="xs">
                  {tier.name}
                </Title>
                <Text size="sm" c="dimmed" mb="md" className="min-h-[40px]">
                  {tier.description}
                </Text>
                <div className="flex items-baseline">
                  <Text size="xl" fw={700}>
                    {tier.price}
                  </Text>
                  {tier.price !== "Custom" && (
                    <Text size="sm" c="dimmed" ml={4}>
                    {tier.price === "$1" ? " per million queries" : "per month"}
                    </Text>
                  )}
                </div>
              </div>

              <div className="flex-grow">
                <ul className="space-y-3">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mr-2">
                        <IconCheck
                          size={16}
                          className={`${feature.included ? 'text-green-500' : 'text-gray-300'}`}
                        />
                      </div>
                      <Text size="sm">{feature.text}</Text>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <Form method="post" onSubmit={() => setSubmittedTier(tier.name)}>
                  <input type="hidden" name="_action" value="get_api_key" />
                  <input type="hidden" name="tier" value={tier.name} />
                  <Button
                    type="submit"
                    fullWidth
                    variant={tier.highlighted ? "filled" : "outline"}
                    size="lg"
                    radius="md"
                    loading={isSubmitting && submittedTier === tier.name}
                    disabled={isSubmitting}
                  >
                    {isSubmitting && submittedTier === tier.name ? "Generating..." : tier.buttonText}
                  </Button>
                </Form>
              </div>
            </Paper>
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  );
} 
