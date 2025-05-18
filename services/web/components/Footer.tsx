import { Anchor, Group, Text } from '@mantine/core';

export function Footer() {
  return (
    <div className="mt-30 border-t bg-stone-50 border-gray-200 dark:border-dark-5">
      <div className="flex flex-col items-center justify-center p-4 md:p-6 gap-6">
        <img 
          src="/logo-small.png" 
          alt="AvgDB logo" 
          className="w-16 h-16 md:w-24 md:h-24 object-contain" 
        />
        <Group className="flex justify-center items-center gap-2">
          <Text size="sm" c="dimmed">Average Labs LLC</Text>
          <Text size="sm" c="dimmed">•</Text>
          <Anchor 
            href="https://x.com/AvgDatabaseCEO" 
            target="_blank" 
            rel="noopener noreferrer"
            size="sm"
            className="hover:text-blue-500"
          >
            @AvgDatabaseCEO
          </Anchor>
          <Text size="sm" c="dimmed">•</Text>
          <Anchor 
            href="https://x.com/notjoswayski" 
            target="_blank" 
            rel="noopener noreferrer"
            size="sm"
            className="hover:text-blue-500"
          >
            @notjoswayski
          </Anchor>
        </Group>
      </div>
    </div>
  );
}
