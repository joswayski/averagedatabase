import { useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import { Text } from '@mantine/core';
import { Link } from 'react-router';

interface ApiKeyNotificationProps {
  actionData: {
    api_key?: string;
    brought_to_you_by?: string;
    error?: string;
  } | undefined;
}

export function ApiKeyNotification({ actionData }: ApiKeyNotificationProps) {
  useEffect(() => {
    if (actionData?.api_key) {
      notifications.show({
        title: 'API Key Generated! 🎉',
        message: (
          <div>
            <Text size="sm" mb="xs">Your API key: <code>{actionData.api_key}</code></Text>
            <Text size="sm" mb="xs">Keep this key safe! You'll need it for all API requests.</Text>
            <Text size="sm" component={Link} to="/docs" style={{ color: 'var(--mantine-color-blue-6)', textDecoration: 'underline' }}>
              Click here to view the API documentation →
            </Text>
            {actionData.brought_to_you_by && (
              <Text size="xs" c="dimmed" mt="xs" style={{ fontStyle: 'italic' }}>
                {actionData.brought_to_you_by}
              </Text>
            )}
          </div>
        ),
        color: 'blue',
        autoClose: false,
        withCloseButton: true,
      });
    } else if (actionData?.error) {
      notifications.show({
        title: 'Error',
        message: actionData.error,
        color: 'red',
      });
    }
  }, [actionData]);

  return null;
} 
