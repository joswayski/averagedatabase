import { useState } from 'react';
import { Burger, Container, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

const links = [
  { link: '/docs', label: 'Docs' },
  { link: '/pricing', label: 'Pricing' },
  { link: '/blog', label: 'Blog' }];

export function HeaderSimple() {
  const [opened, { toggle }] = useDisclosure(false);
  const [active, setActive] = useState(links[0].link);

  const items = links.map((link) => (
    <a
      key={link.label}
      href={link.link}
      className={`block leading-none px-3 py-2 rounded-md no-underline text-gray-700 text-sm font-medium transition-colors ${active === link.link ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
      data-active={active === link.link || undefined}
      onClick={(event) => {
        event.preventDefault();
        setActive(link.link);
      }}
    >
      {link.label}
    </a>
  ));

  return (
    <header className="h-14 mb-4 bg-white border-b border-gray-200 w-full shadow-sm">
      <Container size="lg" className="h-14 flex justify-between items-center">
        <img src="/logo-small.png" alt="AvgDB logo small" className="h-10 w-40 object-contain mr-2" />
        <Group gap={5} visibleFrom="xs">
          {items}
        </Group>
        <Burger opened={opened} onClick={toggle} hiddenFrom="xs" size="sm" />
      </Container>
    </header>
  );
}
