import {
  Button,
  Container,
  Grid,
  Paper,
  Text,
  Title,
  rem,
  Group,
  CopyButton,
  ActionIcon,
} from "@mantine/core";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import { useState, useRef, useEffect } from "react";
import { useFetcher, Link } from "react-router";
import { notifications } from "@mantine/notifications";
import type { action } from "../app/routes/home";

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
      {
        text: "Email support (Mon-Fri 9am-12pm & 2pm-4pm Tokyo time)",
        included: true,
      },
      { text: "DB hosted on Google Cloud", included: true },
      { text: "Targeted and relevant ads in your results", included: true },
      {
        text: "Complimentary block on Twitter by the AverageDB CEO",
        included: true,
      },
    ],
  },
  {
    name: "Pay as you go",
    description:
      "You don't have an accounting team yet so you actually believe this is a good idea",
    price: "$10",
    buttonText: "Get API key",
    highlighted: true,
    features: [
      { text: "Support via X replies when you call us out", included: true },
      { text: "DB hosted on a real cloud like AWS", included: true },
      { text: "Targeted and relevant ads in your results", included: true },
      {
        text: "Create unlimited databases (we prefix the table names tbh)",
        included: true,
      },
    ],
  },
  {
    name: "Enterprise",
    description: "SOC2uah on dat thang",
    price: "Custom",
    buttonText: "Get API key",
    features: [
      { text: "We'll put your DB in a VPC", included: true },
      {
        text: "Access to AvgDB Metal™ and AvgDB Boost™ for Unlimited™ performance",
        included: true,
      },
      {
        text: "Indexes available on certain columns (contact us)",
        included: true,
      },
      {
        text: "Employee pinky promise to not look at customer data",
        included: true,
      },
      {
        text: "Bring Your Own API Key™ - use your own generated key",
        included: true,
      },
      { text: "No Ads in responses", included: true },
      { text: "$2,000/mo SSO addon (required)", included: true },
      { text: "ACID compliance available as a paid addon", included: true },
    ],
  },
];

export function Pricing() {
  const [submittedTier, setSubmittedTier] = useState<string | null>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const fetcher = useFetcher<typeof action>();

  useEffect(() => {
    if (fetcher.data && fetcher.state === "idle") {
      const data = fetcher.data as any;
      if (data.api_key) {
        notifications.show({
          title: "API Key Generated! 🎉",
          message: (
            <div>
              <Group wrap="nowrap" gap="xs" align="center">
                <Text size="sm">
                  Your API key:{" "}
                  <code className="font-bold">{data.api_key}</code>
                </Text>
                <CopyButton value={data.api_key} timeout={2000}>
                  {({ copied, copy }) => (
                    <ActionIcon
                      color={copied ? "teal" : "gray"}
                      onClick={copy}
                      title={copied ? "Copied API Key" : "Copy API Key"}
                      variant="subtle"
                    >
                      {copied ? (
                        <IconCheck
                          style={{ width: rem(16), height: rem(16) }}
                        />
                      ) : (
                        <IconCopy style={{ width: rem(16), height: rem(16) }} />
                      )}
                    </ActionIcon>
                  )}
                </CopyButton>
              </Group>
              <Text size="sm" mb="xs">
                Keep this key safe! You'll need it for all API requests.
              </Text>
              <Text
                size="sm"
                component={Link}
                to="/docs"
                className="!text-blue-600 !underline hover:!text-blue-700"
              >
                Click here to view the API documentation →
              </Text>
              {data.brought_to_you_by && (
                <Text
                  size="xs"
                  c="dimmed"
                  mt="xs"
                  style={{ fontStyle: "italic" }}
                >
                  {data.brought_to_you_by}
                </Text>
              )}
            </div>
          ),
          color: "blue",
          autoClose: false,
          withCloseButton: true,
          position: "top-center",
        });
      } else if (data.error) {
        notifications.show({
          title: "Error",
          message: data.error,
          color: "red",
          position: "top-center",
        });
      }
    }
  }, [fetcher.data, fetcher.state]);

  return (
    <Container id="pricing" size="lg" py="xl" ref={pricingRef}>
      <div className="text-center mb-12">
        <Title order={2} size={rem(40)} mb="md">
          Simple, "transparent" pricing
        </Title>
        <Text size="lg" c="dimmed" maw={600} mx="auto">
          Choose the plan that best fits your needs, the bigger the better.
        </Text>
      </div>

      <Grid gutter="xl">
        {tiers.map((tier) => {
          const isSubmitting =
            fetcher.state === "submitting" && submittedTier === tier.name;

          return (
            <Grid.Col key={tier.name} span={{ base: 12, md: 4 }}>
              <Paper
                shadow="md"
                p="xl"
                radius="md"
                withBorder
                className={`h-full flex flex-col ${
                  tier.highlighted ? "border-blue-500 border-2" : ""
                }`}
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
                        {tier.price === "$10"
                          ? " per million queries"
                          : "per month"}
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
                            className={`${
                              feature.included
                                ? "text-green-500"
                                : "text-gray-300"
                            }`}
                          />
                        </div>
                        <Text size="sm">{feature.text}</Text>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <div className="h-[42px]">
                    <fetcher.Form method="post">
                      <input type="hidden" name="_action" value="getApiKey" />
                      <Button
                        type="submit"
                        fullWidth
                        variant={tier.highlighted ? "filled" : "outline"}
                        size="lg"
                        radius="md"
                        loading={isSubmitting}
                        disabled={isSubmitting}
                        className={`h-[42px] flex items-center justify-center !bg-blue-600 hover:!bg-blue-700 !text-white ${
                          !tier.highlighted &&
                          "!border-blue-600 hover:!bg-blue-50"
                        }`}
                        onClick={() => setSubmittedTier(tier.name)}
                      >
                        {isSubmitting ? "Generating..." : tier.buttonText}
                      </Button>
                    </fetcher.Form>
                  </div>
                </div>
              </Paper>
            </Grid.Col>
          );
        })}
      </Grid>
    </Container>
  );
}
