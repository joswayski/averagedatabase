import { useState, useEffect } from "react";
import {
  Container,
  Title,
  Text,
  Paper,
  Code,
  Stack,
  Group,
  Badge,
  Divider,
  Box,
  Grid,
  Accordion,
} from "@mantine/core";
import {
  IconBrandGithub,
  IconDatabase,
  IconLock,
  IconChevronRight,
  IconTrash,
} from "@tabler/icons-react";
import { useLocation } from "react-router";

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
  method: "GET" | "POST";
  path: string;
  description: string;
  request: null | string | Record<string, any>;
  response: Record<string, any> | string;
  category: "database" | "auth" | "storage";
};

const databaseEndpoints: Endpoint[] = [
  {
    method: "GET",
    path: "/u-up",
    description: "Health check endpoint",
    request: null,
    response: {
      message: "Yeah",
      brought_to_you_by: getRandomAd(),
    },
    category: "database",
  },
  {
    method: "POST",
    path: "/SECRET_INTERNAL_ENDPOINT_DO_NOT_USE_OR_YOU_WILL_BE_FIRED_add_item",
    description: "Add an item to the database",
    request: {
      data: "add your data here",
    },
    response: {
      message: "Great success!",
      key: "442104:m0OSzCNyCifpj3mAHGUd",
      brought_to_you_by: getRandomAd(),
    },
    category: "database",
  },
  {
    method: "GET",
    path: "/gibs-item",
    description: "Retrieve an item from the database",
    request: "?key=442104:m0OSzCNyCifpj3mAHGUd",
    response: {
      value: "add your data here",
      brought_to_you_by: getRandomAd(),
    },
    category: "database",
  },
  {
    method: "POST",
    path: "/gibs-key",
    description: "Get a new API key",
    request: null,
    response: {
      api_key: "123456",
      brought_to_you_by: getRandomAd(),
    },
    category: "database",
  },
];

const authEndpoints: Endpoint[] = [
  {
    method: "POST",
    path: "/increase-valuation",
    description: "Create a new user",
    request: {
      email: "user@example.com",
      password: "password",
      subscription_tier: "poor",
    },
    response: {
      message: "User Created!",
      user_id: "random_user_id",
      subscription_tier: "poor",
      brought_to_you_by: getRandomAd(),
    },
    category: "auth",
  },
  {
    method: "POST",
    path: "/let-me-in",
    description: "Login endpoint",
    request: {
      email: "user@example.com",
      password: "password",
    },
    response: {
      message: "Login successful! Don't share this session token with anyone!",
      token: "user_id:random_string",
      expires_at: 1234567890,
      brought_to_you_by: getRandomAd(),
    },
    category: "auth",
  },
  {
    method: "POST",
    path: "/get-out",
    description: "Logout endpoint",
    request: {
      user_id: "random_user_id",
    },
    response: {
      message: "Successfully logged out!",
      brought_to_you_by: getRandomAd(),
    },
    category: "auth",
  },
  {
    method: "GET",
    path: "/gibs-user",
    description: "Get user information",
    request: "?user_id=random_user_id",
    response: {
      user: {
        id: "random_user_id",
        email: "user@example.com",
        subscription_tier: "poor",
        is_logged_out: false,
      },
      brought_to_you_by: getRandomAd(),
    },
    category: "auth",
  },
  {
    method: "GET",
    path: "/gibs-all-users",
    description: "Get all users in organization",
    request: null,
    response: {
      users: [
        {
          id: "random_user_id",
          email: "user@example.com",
          subscription_tier: "poor",
        },
      ],
      brought_to_you_by: getRandomAd(),
      message:
        "If you're exporting your data to roll your own auth you gotta pay $1,000 per user you export",
    },
    category: "auth",
  },
  {
    method: "POST",
    path: "/validate-session",
    description: "Validate a session token",
    request: {
      token: "user_id:random_string",
    },
    response: {
      is_valid: true,
      user_id: "random_user_id",
      expires_at: 1234567890,
      message: "Session is valid",
      brought_to_you_by: getRandomAd(),
    },
    category: "auth",
  },
];

const storageEndpoints: Endpoint[] = [
  {
    method: "POST",
    path: "/yeet",
    description:
      "Upload files to our ultra-secure storage ASS. Public files can be accessed at: https://api.averagedatabase.com/ass/{file_id}",
    request:
      "multipart/form-data with file field(s) and optional public=true/false",
    response: {
      message: "Successfully stored 2 file(s) in our ultra-secure ASS!",
      files: [
        {
          file_id: "m0OSzCNyCifpj3mAHGUd",
          file_url: "https://api.averagedatabase.com/ass/m0OSzCNyCifpj3mAHGUd",
          filename: "document.pdf",
          size_bytes: 1048576,
        },
        {
          file_id: "a1BCdefGHIjkLMnoPQr",
          file_url: "https://api.averagedatabase.com/ass/a1BCdefGHIjkLMnoPQr",
          filename: "image.jpg",
          size_bytes: 1048576,
        },
      ],
      brought_to_you_by: getRandomAd(),
    },
    category: "storage",
  },
  {
    method: "GET",
    path: "/ass/:file_id",
    description:
      "Retrieve files from ASS. Public files don't require an API key, and private files can only be retrieved by the API key that uploaded it.",
    request: "Replace :file_id with your file ID",
    response: "Your file will be returned here!",
    category: "storage",
  },
];

const allEndpoints = [
  ...databaseEndpoints,
  ...authEndpoints,
  ...storageEndpoints,
];

const categories = [
  {
    label: "Database",
    icon: IconDatabase,
    endpoints: databaseEndpoints,
    description: "Core database operations for storing and retrieving data",
  },
  {
    label: "Authentication",
    icon: IconLock,
    endpoints: authEndpoints,
    description: "User management, authentication, and session handling",
  },
  {
    label: "Storage (ASS)",
    icon: IconTrash,
    endpoints: storageEndpoints,
    description:
      "Average Storage Service (ASS) - State-of-the-art object storage",
  },
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
              {typeof endpoint.request === "string"
                ? endpoint.request
                : JSON.stringify(endpoint.request, null, 2)}
            </Code>
          </>
        )}
        <Divider label="Response" labelPosition="left" />
        <Code block>{JSON.stringify(endpoint.response, null, 2)}</Code>
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
      const endpoint = allEndpoints.find((e) => e.path === `/${hash}`);
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

  const currentEndpoint =
    allEndpoints.find((e) => e.path === selectedEndpoint) ||
    databaseEndpoints[0];

  const renderEndpointButton = (endpoint: Endpoint) => (
    <Box
      key={endpoint.path}
      component="button"
      onClick={() => handleEndpointClick(endpoint.path)}
      className={`w-full px-4 py-2 text-left rounded-md transition-colors duration-150 cursor-pointer flex items-center
        ${
          selectedEndpoint === endpoint.path
            ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
            : "hover:bg-gray-50 active:bg-gray-100"
        }`}
    >
      <div className="flex items-center w-full min-w-0">
        <div className="w-16 flex-shrink-0 flex justify-center">
          <Badge color={endpoint.method === "GET" ? "green" : "blue"} size="sm">
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
              <Text size="sm" fw={700}>
                {category.label}
              </Text>
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
    <Container size="xl" py="xl" className="min-h-[calc(100vh-200px)]">
      <Grid>
        {/* Sidebar */}
        <Grid.Col span={{ base: 12, md: 3 }}>
          <Paper p="md" withBorder className="sticky top-8">
            {/* Desktop view */}
            <div className="hidden md:block">{sidebarContent}</div>

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
                          <Text size="sm" fw={700}>
                            {category.label}
                          </Text>
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
              <Title order={1} mb="md">
                API Documentation
              </Title>
              <Text size="lg" mb="md">
                Send requests to <Code>https://api.averagedatabase.com</Code>{" "}
                with the header <Code>x-averagedb-api-key</Code> containing your
                API key.
              </Text>
              <Text size="lg" mb="md">
                Enterprise customers can bring their own API keys! Simply insert
                any items with whatever key that you want prefixed with{" "}
                <Code>enterprise-</Code>
              </Text>
            </div>

            <div>
              <Group mb="md">
                <div className="w-20">
                  <Badge
                    color={currentEndpoint.method === "GET" ? "green" : "blue"}
                    size="lg"
                    fullWidth
                  >
                    {currentEndpoint.method}
                  </Badge>
                </div>
                <Title order={2} className="break-all">
                  {currentEndpoint.path}
                </Title>
              </Group>
              <Text mb="xl" c="dimmed">
                {currentEndpoint.description}
              </Text>

              <EndpointCard endpoint={currentEndpoint} />

              {currentEndpoint.path === "/yeet" && (
                <Paper p="md" withBorder mt="md">
                  <Stack gap="md">
                    <Divider label="Example Usage" labelPosition="left" />
                    <Code block>
                      {`# Upload a single PRIVATE file (default)
curl -X POST https://api.averagedatabase.com/yeet \\
  -H "x-averagedb-api-key: YOUR_API_KEY" \\
  -F "file=@/path/to/your/file.pdf"

# Upload a PUBLIC file (accessible without API key)
curl -X POST https://api.averagedatabase.com/yeet \\
  -H "x-averagedb-api-key: YOUR_API_KEY" \\
  -F "public=true" \\
  -F "file=@/path/to/your/file.pdf"

# Upload multiple files (all public)
curl -X POST https://api.averagedatabase.com/yeet \\
  -H "x-averagedb-api-key: YOUR_API_KEY" \\
  -F "public=true" \\
  -F "file1=@/path/to/file1.jpg" \\
  -F "file2=@/path/to/file2.png" \\
  -F "file3=@/path/to/file3.mp4"

# Response will include an array of file IDs and URLs:
{
  "message": "Successfully stored 3 file(s) in our ultra-secure ASS!",
  "files": [
    { "file_id": "abc123", "file_url": "https://api.averagedatabase.com/ass/abc123", "filename": "file1.jpg", "size_bytes": 1024000 },
    { "file_id": "def456", "file_url": "https://api.averagedatabase.com/ass/def456", "filename": "file2.png", "size_bytes": 2048000 },
    { "file_id": "ghi789", "file_url": "https://api.averagedatabase.com/ass/ghi789", "filename": "file3.mp4", "size_bytes": 73728 }
  ],
  "brought_to_you_by": "Ad message here"
}`}
                    </Code>
                  </Stack>
                </Paper>
              )}

              {currentEndpoint.path === "/ass/:file_id" && (
                <Paper p="md" withBorder mt="md">
                  <Stack gap="md">
                    <Divider label="Example Usage" labelPosition="left" />
                    <Code block>
                      {`# Retrieve a public file (no API key required)
curl -X GET "https://api.averagedatabase.com/ass/abc123"

# Retrieve a private file (requires API key)
curl -X GET "https://api.averagedatabase.com/ass/abc123" \\
  -H "x-averagedb-api-key: YOUR_API_KEY"
`}
                    </Code>
                  </Stack>
                </Paper>
              )}
            </div>
          </Stack>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
