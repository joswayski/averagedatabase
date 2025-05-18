import { useState, useEffect, useRef } from 'react';
import { Burger, Container, Group, Box, Overlay, ActionIcon } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { NavLink, useLocation, useNavigation } from 'react-router';
import { IconX } from '@tabler/icons-react';

const links = [
  { link: '#benchmarks', label: 'Benchmarks' },
  { link: '#testimonials', label: 'Testimonials' },
  { link: '#pricing', label: 'Pricing' },
  { link: '/blog', label: 'Blog' },
  { link: '/docs', label: 'Docs' }];

export function HeaderSimple() {
  const [opened, { toggle }] = useDisclosure(false);
  const [activeHash, setActiveHash] = useState<string | null>(null);
  const location = useLocation();
  const navigation = useNavigation();
  const previousNavigation = useRef(navigation);

  // Update active hash when location changes
  useEffect(() => {
    if (location.hash) {
      setActiveHash(location.hash);
    } else if (location.pathname === '/' && !location.hash) {
      setActiveHash(null);
    }
    previousNavigation.current = navigation;
  }, [location, navigation]);

  const items = links.map((link) => {
    const isHashLink = link.link.startsWith('#');
    const to = isHashLink
      ? (location.pathname === '/' ? link.link : `/${link.link}`)
      : link.link;

    return (
      <NavLink
        key={link.label}
        to={to}
        prefetch={"render"}
        onClick={(e) => {
          if (isHashLink && location.pathname === '/') {
            e.preventDefault();
            const element = document.querySelector(link.link);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
              setActiveHash(link.link);
            }
          }
        }}
        className={({ isActive }) => {
          const currentLinkIsActive = isHashLink
            ? activeHash === link.link
            : isActive;
          const activeClasses = 'bg-blue-600 text-white';
          const inactiveClasses = 'text-gray-700 hover:bg-stone-200';
          return `block leading-none px-3 py-2 rounded-md no-underline text-sm font-medium transition-colors cursor-pointer ${
            currentLinkIsActive ? activeClasses : inactiveClasses
          }`;
        }}
        end={!isHashLink}
      >
        {link.label}
      </NavLink>
    );
  });

  return (
    <header className="sticky top-0 z-50 h-14 bg-stone-50 border-b border-gray-200 w-full shadow-sm">
      <Container size="lg" className="h-14 flex justify-between items-center">
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            `flex items-center cursor-pointer ${isActive ? 'opacity-80' : ''}`
          }
          end
        >
          <img src="/logo-small.png" alt="AvgDB logo small" className="h-10 w-40 object-contain mr-2" />
        </NavLink>
        <Group gap={5} visibleFrom="xs">
          {items}
        </Group>
        {opened ? (
          <ActionIcon 
            onClick={toggle}
            variant="subtle"
            size="lg"
            radius="xl"
            hiddenFrom="xs"
            className="cursor-pointer"
          >
            <IconX size={20} />
          </ActionIcon>
        ) : (
          <Burger opened={opened} onClick={toggle} hiddenFrom="xs" size="sm" className="cursor-pointer" />
        )}
      </Container>
      
      {/* Mobile menu with overlay - only show on mobile */}
      {opened && (
        <Box hiddenFrom="xs">
          <Overlay opacity={0.5} onClick={toggle} fixed zIndex={49} />
          <Box className="fixed inset-x-0 top-14 bg-white border-b border-gray-200 shadow-lg z-50">
            <Container size="lg" p={0}>
              <div className="flex flex-col divide-y divide-gray-100 m-0 p-0">
                {links.map((link, index) => {
                  const isHashLink = link.link.startsWith('#');
                  const to = isHashLink
                    ? (location.pathname === '/' ? link.link : `/${link.link}`)
                    : link.link;
                  
                  // Mobile specific active check
                  const mobileLinkIsActive = isHashLink
                    ? activeHash === link.link
                    : location.pathname === link.link || (link.link === "/blog" && location.pathname.startsWith("/blog/"));
                  
                  const textColor = mobileLinkIsActive ? 'text-white' : 'text-gray-700';
                  const bgColor = mobileLinkIsActive
                    ? 'bg-blue-600'
                    : (index % 2 === 0 ? 'bg-gray-50' : 'bg-white');
                  
                  // Need to pass isActive to NavLink for its own internal logic if not overriding completely
                  return (
                    <NavLink
                      key={link.label}
                      to={to}
                      prefetch={"render"}
                      onClick={(e) => {
                        if (isHashLink && location.pathname === '/') {
                          e.preventDefault();
                          const element = document.querySelector(link.link);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth' });
                            setActiveHash(link.link);
                          }
                        }
                        toggle(); // Close mobile menu on click
                      }}
                      // For mobile, we use the explicit bgColor and textColor
                      className={({ isActive }) => {
                         // Re-evaluate active for mobile, as NavLink's isActive might be different from our definition
                         const currentMobileActive = isHashLink
                           ? activeHash === link.link
                           : isActive; // Use NavLink's isActive for non-hash links on mobile too for consistency
                        
                         const mobileTextColor = currentMobileActive ? 'text-white' : 'text-gray-700';
                         const mobileBgColor = currentMobileActive
                           ? 'bg-blue-600'
                           : (index % 2 === 0 ? 'bg-gray-50' : 'bg-white');

                        return `block w-full py-3 px-4 text-xl font-semibold text-left transition-colors cursor-pointer ${mobileBgColor} ${mobileTextColor} hover:bg-stone-200`;
                      }}
                      end={!isHashLink}
                    >
                      {link.label}
                    </NavLink>
                  );
                })}
              </div>
            </Container>
          </Box>
        </Box>
      )}
    </header>
  );
}
