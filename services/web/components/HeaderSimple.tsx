import { useState, useEffect, useRef } from 'react';
import { Burger, Container, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link, useNavigate, useLocation, useNavigation } from 'react-router';

const links = [
  { link: '#benchmarks', label: 'Benchmarks' },
  { link: '#testimonials', label: 'Testimonials' },
  { link: '#pricing', label: 'Pricing' },
  { link: '/blog', label: 'Blog' },
  { link: '/docs', label: 'Docs' }];

export function HeaderSimple() {
  const [opened, { toggle }] = useDisclosure(false);
  const [active, setActive] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const navigation = useNavigation();
  const previousNavigation = useRef(navigation);

  // Update active state when location changes
  useEffect(() => {
    if (location.pathname === '/docs') {
      setActive('/docs');
    } else if (location.pathname === '/') {
      if (location.hash) {
        setActive(location.hash);
      } else {
        // If on home page with no hash, and not coming from a 'loaderSubmission' (form post)
        // that might clear the hash, keep it blank.
        // Or, if it was a navigation to just "/", clear active.
        if (navigation.state === 'idle' && previousNavigation.current?.state !== 'loading') {
            setActive('');
        }
      }
    }
    previousNavigation.current = navigation;
  }, [location, navigation]);

  const handleSectionClick = (section: string) => {
    // If the link is for a section on the current page (starts with #)
    if (section.startsWith('#')) {
      if (location.pathname === '/') {
        // We are on the home page, navigate to the hash
        navigate(section, { replace: true, preventScrollReset: true });
        setActive(section); // Set active state immediately
      } else {
        // We are on another page (e.g. /docs), navigate to home page with hash
        navigate(`/${section}`);
        // Active state will be updated by useEffect once navigation completes
      }
    } else {
      // It's a full path link (e.g., /docs)
      setActive(section);
      navigate(section);
    }
  };

  const items = links.map((link) => (
    link.link.startsWith('#') ? (
      <button
        key={link.label}
        onClick={() => handleSectionClick(link.link)}
        className={`block leading-none px-3 py-2 rounded-md no-underline text-gray-700 text-sm font-medium transition-colors cursor-pointer ${active === link.link ? 'bg-blue-600 text-white' : 'hover:bg-stone-200'}`}
        data-active={active === link.link || undefined}
      >
        {link.label}
      </button>
    ) : (
      <Link
        key={link.label}
        to={link.link}
        onClick={() => setActive(link.link)}
        className={`block leading-none px-3 py-2 rounded-md no-underline text-gray-700 text-sm font-medium transition-colors cursor-pointer ${active === link.link ? 'bg-blue-600 text-white' : 'hover:bg-stone-200'}`}
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
