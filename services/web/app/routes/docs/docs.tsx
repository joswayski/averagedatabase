import { useState, useEffect } from 'react';
import { Container, Title, Text, Paper, Code, Stack, Group, Badge, Divider, Box, Grid, Accordion } from '@mantine/core';
import { IconBrandGithub, IconDatabase, IconLock, IconChevronRight } from '@tabler/icons-react';
import { useLocation } from 'react-router';

// Import ads from main.rs
const ADS = [
  "Tempur-Pedic: Experience the ultimate comfort with Tempur-Pedic mattresses.",
  "Glade: Freshen up your home with Glade air fresheners.",
  "Starbucks: Upgrade your mornings with Starbucks' new iced caramel macchiato.",
  "Verizon: Stay connected with Verizon's unlimited data plans.",
  "IKEA: Transform your space with IKEA's stylish furniture.",
  "Subway: Taste the freshness of Subway's new avocado toast.",
  "The North Face: Get ready for adventure with The North Face gear.",
  "McDonald's: Enjoy the new crispy chicken sandwich at McDonald's.",
  "Best Buy: Discover the latest tech at Best Buy.",
  "Häagen-Dazs: Treat yourself to Häagen-Dazs' new summer flavors.",
  // ... add more ads as needed
];

function getRandomAd() {
  return ADS[Math.floor(Math.random() * ADS.length)];
}

type Endpoint = {
  method: 'GET' | 'POST';
  path: string;
  description: string;
  request: null | string | Record<string, any>;
  response: Record<string, any>;
  category: 'database' | 'auth';
};

const databaseEndpoints: Endpoint[] = [
  {
    method: 'GET',
    path: '/u-up',
    description: 'Health check endpoint',
    request: null,
    response: {
      message: 'Yeah',
      brought_to_you_by: getRandomAd()
    },
    category: 'database'
  },
  {
    method: 'POST',
    path: '/SECRET_INTERNAL_ENDPOINT_DO_NOT_USE_OR_YOU_WILL_BE_FIRED_add_item',
    description: 'Add an item to the database',
    request: {
      data: 'add your data here'
    },
    response: {
      message: 'Great success!',
      key: '442104:m0OSzCNyCifpj3mAHGUd',
      brought_to_you_by: getRandomAd()
    },
    category: 'database'
  },
  {
    method: 'GET',
    path: '/gibs-item',
    description: 'Retrieve an item from the database',
    request: '?key=442104:m0OSzCNyCifpj3mAHGUd',
    response: {
      value: 'add your data here',
      brought_to_you_by: getRandomAd()
    },
    category: 'database'
  },
  {
    method: 'POST',
    path: '/gibs-key',
    description: 'Get a new API key',
    request: null,
    response: {
      api_key: '123456',
      brought_to_you_by: getRandomAd()
    },
    category: 'database'
  }
];

const authEndpoints: Endpoint[] = [
  {
    method: 'POST',
    path: '/increase-valuation',
    description: 'Create a new user',
    request: {
      email: 'user@example.com',
      password: 'password',
      subscription_tier: 'poor'
    },
    response: {
      message: 'User Created!',
      user_id: 'random_user_id',
      subscription_tier: 'poor',
      brought_to_you_by: getRandomAd()
    },
    category: 'auth'
  },
  {
    method: 'POST',
    path: '/let-me-in',
    description: 'Login endpoint',
    request: {
      email: 'user@example.com',
      password: 'password'
    },
    response: {
      message: 'Login successful! Don\'t share this session token with anyone!',
      token: 'user_id:random_string',
      expires_at: 1234567890,
      brought_to_you_by: getRandomAd()
    },
    category: 'auth'
  },
  {
    method: 'POST',
    path: '/get-out',
    description: 'Logout endpoint. Requires user_id in the request body.',
    request: {
      user_id: 'random_user_id'
    },
    response: {
      message: 'Successfully logged out!',
      brought_to_you_by: getRandomAd()
    },
    category: 'auth'
  },
  {
    method: 'GET',
    path: '/gibs-user',
    description: 'Get user information',
    request: '?user_id=random_user_id',
    response: {
      user: {
        id: 'random_user_id',
        email: 'user@example.com',
        subscription_tier: 'poor',
        is_logged_out: false
      },
      brought_to_you_by: getRandomAd()
    },
    category: 'auth'
  },
  {
    method: 'GET',
    path: '/gibs-all-users',
    description: 'Get all users in organization',
    request: null,
    response: {
      users: [
        {
          id: 'random_user_id',
          email: 'user@example.com',
          subscription_tier: 'poor'
        }
      ],
      brought_to_you_by: getRandomAd(),
      message: 'If you\'re exporting your data to roll your own auth you gotta pay $1,000 per user you export'
    },
    category: 'auth'
  },
  {
    method: 'POST',
    path: '/validate-session',
    description: "Validate a session token. The x-averagedb-api-key header must contain the requester's API key. The request body should contain the token (e.g., 'user_id:random_string') received from the login endpoint.",
    request: {
      token: 'user_id:random_string'
    },
    response: {
      is_valid: true,
      user_id: 'random_user_id',
      expires_at: 1234567890,
      message: 'Session is valid',
      brought_to_you_by: getRandomAd()
    },
    category: 'auth'
  }
];

const allEndpoints = [...databaseEndpoints, ...authEndpoints];

const categories = [
  { 
    label: 'Database', 
    icon: IconDatabase,
    endpoints: databaseEndpoints,
    description: 'Core database operations for storing and retrieving data'
  },
  { 
    label: 'Authentication', 
    icon: IconLock,
    endpoints: authEndpoints,
    description: 'User management, authentication, and session handling'
  }
] as const;

export function meta() {
  return [
    { title: "Average Database - API Documentation" },
    { name: "description", content: "API documentation for Average Database" },
  ];
}

function EndpointCard({ endpoint }: { endpoint: Endpoint }) {
  return (
    <Paper p="md" withBorder>
      <Stack gap="md">

        {endpoint.request && (
          <>
            <Divider label="Request" labelPosition="left" />
            <Code block>
              {typeof endpoint.request === 'string' 
                ? endpoint.request 
                : JSON.stringify(endpoint.request, null, 2)}
            </Code>
          </>
        )}
        <Divider label="Response" labelPosition="left" />
        <Code block>
          {JSON.stringify(endpoint.response, null, 2)}
        </Code>
      </Stack>
    </Paper>
  );
}

export default function Docs() {
  const location = useLocation();
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);

  // Update selected endpoint based on hash
  useEffect(() => {
    const hash = location.hash.slice(1); // Remove the # from the hash
    if (hash) {
      const endpoint = allEndpoints.find(e => e.path === `/${hash}`);
      if (endpoint) {
        setSelectedEndpoint(endpoint.path);
      }
    } else {
      // Default to first endpoint if no hash
      setSelectedEndpoint(databaseEndpoints[0].path);
    }
  }, [location.hash]);

  const handleEndpointClick = (path: string) => {
    setSelectedEndpoint(path);
    window.location.hash = path.slice(1); // Remove the leading slash
  };

  const currentEndpoint = allEndpoints.find(e => e.path === selectedEndpoint) || databaseEndpoints[0];

  const renderEndpointButton = (endpoint: Endpoint) => (
    <Box
      key={endpoint.path}
      component="button"
      onClick={() => handleEndpointClick(endpoint.path)}
      className={`w-full px-4 py-2 text-left rounded-md transition-colors duration-150 cursor-pointer flex items-center
        ${selectedEndpoint === endpoint.path 
          ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' 
          : 'hover:bg-gray-50 active:bg-gray-100'}`}
    >
      <div className="flex items-center w-full min-w-0">
        <div className="w-16 flex-shrink-0 flex justify-center">
          <Badge 
            color={endpoint.method === 'GET' ? 'green' : 'blue'}
            size="sm"
          >
            {endpoint.method}
          </Badge>
        </div>
        <Text size="sm" className="truncate break-all flex-1 ml-8">
          {endpoint.path}
        </Text>
        <IconChevronRight size={16} className="flex-shrink-0 ml-2" />
      </div>
    </Box>
  );

  const sidebarContent = (
    <Stack gap="md">
      {categories.map((category) => {
        const CategoryIcon = category.icon;
        return (
          <div key={category.label}>
            <Group className="mb-2">
              <CategoryIcon size={18} stroke={1.5} />
              <Text size="sm" fw={700}>{category.label}</Text>
            </Group>
            <Stack gap={2}>
              {category.endpoints.map(renderEndpointButton)}
            </Stack>
          </div>
        );
      })}
    </Stack>
  );

  return (
    <Container size="xl" py="xl">
      <Grid>
        {/* Sidebar */}
        <Grid.Col span={{ base: 12, md: 3 }}>
          <Paper p="md" withBorder className="sticky top-8">
            {/* Desktop view */}
            <div className="hidden md:block">
              {sidebarContent}
            </div>

            {/* Mobile view */}
            <div className="block md:hidden">
              <Accordion>
                {categories.map((category) => {
                  const CategoryIcon = category.icon;
                  return (
                    <Accordion.Item key={category.label} value={category.label}>
                      <Accordion.Control>
                        <Group>
                          <CategoryIcon size={18} stroke={1.5} />
                          <Text size="sm" fw={700}>{category.label}</Text>
                        </Group>
                      </Accordion.Control>
                      <Accordion.Panel>
                        <Stack gap={2}>
                          {category.endpoints.map(renderEndpointButton)}
                        </Stack>
                      </Accordion.Panel>
                    </Accordion.Item>
                  );
                })}
              </Accordion>
            </div>
          </Paper>
        </Grid.Col>

        {/* Main content */}
        <Grid.Col span={{ base: 12, md: 9 }}>
          <Stack gap="xl">
            <div>
              <Title order={1} mb="md">API Documentation</Title>
              <Text size="lg" mb="md">
                Send requests to <Code>https://api.averagedatabase.com</Code> with the header <Code>x-averagedb-api-key</Code> containing your API key.
              </Text>
              <Text size="lg" mb="md">
                Enterprise customers can bring their own API keys! Simply insert any items with whatever key that you want prefixed with <Code>enterprise-</Code>
              </Text>
            </div>

            <div>
              <Group mb="md">
                <div className="w-20">
                  <Badge 
                    color={currentEndpoint.method === 'GET' ? 'green' : 'blue'}
                    size="lg"
                    fullWidth
                  >
                    {currentEndpoint.method}
                  </Badge>
                </div>
                <Title order={2} className="break-all">{currentEndpoint.path}</Title>
              </Group>
              <Text mb="xl" c="dimmed">{currentEndpoint.description}</Text>

              <EndpointCard endpoint={currentEndpoint} />
            </div>

            <Group justify="center" mt="xl">
              <a
                href="https://github.com/joswayski/averagedatabase"
                target="_blank"
                rel="noopener noreferrer"
                className="github-btn group flex items-center gap-2 text-inherit no-underline text-gray-500 hover:bg-[#24292f] transition-colors duration-100"
                style={{
                  fontSize: '0.95rem',
                  borderRadius: '6px',
                  padding: '0.5rem 1rem',
                  outline: '2px solid #24292f',
                }}
              >
                <IconBrandGithub className="github-icon transition-colors duration-100 group-hover:text-white" size={18} />
                <span className="transition-colors duration-100 group-hover:text-white">View on GitHub</span>
              </a>
            </Group>
          </Stack>
        </Grid.Col>
      </Grid>
    </Container>
  );
} 
