import { Alert } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';

export function NoDataAlert() {
  return (
    <Alert
      icon={<IconInfoCircle size="1.1rem" />}
      title="No databases selected"
      color="blue"
      variant="light"
    >
      Please select at least one database to view the comparison chart.
    </Alert>
  );
} 
