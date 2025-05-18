import { useState, useEffect } from 'react';
import { Burger, Container, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link, useNavigate, useLocation } from 'react-router';

const links = [
  { link: '#benchmarks', label: 'Benchmarks' },
  { link: '#testimonials', label: 'Testimonials' },
  { link: '#pricing', label: 'Pricing' },
  { link: '/docs', label: 'Docs' }];

export function HeaderSimple() {
  const [opened, { toggle }] = useDisclosure(false);
  const [active, setActive] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Update active state when location changes
  useEffect(() => {
    // If we're on a specific page, set that as active
    if (location.pathname === '/docs') {
      setActive('/docs');
    } else if (location.pathname === '/') {
      // If we're on home and there's a hash, set that as active
      if (location.hash) {
        setActive(location.hash);
      } else {
        setActive(''); // Clear active state if no hash
      }
    }
  }, [location]);

  const handleSectionClick = (section: string) => {
    setActive(section);
    // If we're not on the home page, navigate to home with the section hash
    if (location.pathname !== '/') {
      navigate(`/${section}`);
    } else {
      // If we're already on home, just scroll
      const element = document.querySelector(section);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const items = links.map((link) => (
    link.link.startsWith('#') ? (
      <button
        key={link.label}
        onClick={() => handleSectionClick(link.link)}
        className={`block leading-none px-3 py-2 rounded-md no-underline text-gray-700 text-sm font-medium transition-colors cursor-pointer ${active === link.link ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
        data-active={active === link.link || undefined}
      >
        {link.label}
      </button>
    ) : (
      <Link
        key={link.label}
        to={link.link}
        className={`block leading-none px-3 py-2 rounded-md no-underline text-gray-700 text-sm font-medium transition-colors cursor-pointer ${active === link.link ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
      >
        {link.label}
      </Link>
    )
  ));

  return (
    <header className="sticky top-0 z-50 h-14 mb-4 bg-stone-50 border-b border-gray-200 w-full shadow-sm">
      <Container size="lg" className="h-14 flex justify-between items-center">
        <Link to="/" className="flex items-center cursor-pointer">
          <img src="/logo-small.png" alt="AvgDB logo small" className="h-10 w-40 object-contain mr-2" />
        </Link>
        <Group gap={5} visibleFrom="xs">
          {items}
        </Group>
        <Burger opened={opened} onClick={toggle} hiddenFrom="xs" size="sm" className="cursor-pointer" />
      </Container>
    </header>
  );
}
