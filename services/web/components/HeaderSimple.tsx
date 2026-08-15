import { Link, useLocation } from "@tanstack/react-router";
import {
  ActionIcon,
  Box,
  Burger,
  Container,
  Group,
  Overlay,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";

const links = [
  { link: "#benchmarks", label: "Benchmarks" },
  { link: "#testimonials", label: "Testimonials" },
  { link: "#pricing", label: "Pricing" },
  { link: "/blog", label: "Blog" },
  { link: "/docs", label: "Docs" },
  { link: "/status", label: "Status" },
];

export function HeaderSimple() {
  const [opened, { toggle }] = useDisclosure(false);
  const [activeHash, setActiveHash] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    setActiveHash(location.hash || null);
  }, [location.hash, location.pathname]);

  const isRouteActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const scrollToSection = (
    event: React.MouseEvent<HTMLAnchorElement>,
    hash: string,
  ) => {
    if (location.pathname !== "/") {
      return;
    }

    event.preventDefault();
    const element = document.querySelector(hash);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      window.history.replaceState(null, "", hash);
      setActiveHash(hash);
    }
  };

  return (
    <header className="sticky top-0 z-50 h-14 bg-stone-50 border-b border-gray-200 w-full shadow-sm">
      <Container size="lg" className="h-14 flex justify-between items-center">
        <Link
          to="/"
          className={`flex items-center cursor-pointer ${
            location.pathname === "/" ? "opacity-80" : ""
          }`}
        >
          <img
            src="/logo-small.png"
            alt="AvgDB logo small"
            className="h-10 w-40 object-contain mr-2"
          />
        </Link>
        <Group gap={5} visibleFrom="xs">
          {links.map((link) => {
            const isHashLink = link.link.startsWith("#");
            const active = isHashLink
              ? activeHash === link.link
              : isRouteActive(link.link);
            const className = `block leading-none px-3 py-2 rounded-md no-underline text-sm font-medium transition-colors cursor-pointer ${
              active
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-stone-200"
            }`;

            if (isHashLink) {
              return (
                <a
                  key={link.label}
                  href={location.pathname === "/" ? link.link : `/${link.link}`}
                  onClick={(event) => scrollToSection(event, link.link)}
                  className={className}
                >
                  {link.label}
                </a>
              );
            }

            return (
              <Link key={link.label} to={link.link} className={className}>
                {link.label}
              </Link>
            );
          })}
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
          <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom="xs"
            size="sm"
            className="cursor-pointer"
          />
        )}
      </Container>

      {opened && (
        <Box hiddenFrom="xs">
          <Overlay opacity={0.5} onClick={toggle} fixed zIndex={49} />
          <Box className="fixed inset-x-0 top-14 bg-white border-b border-gray-200 shadow-lg z-50">
            <Container size="lg" p={0}>
              <div className="flex flex-col divide-y divide-gray-100 m-0 p-0">
                {links.map((link, index) => {
                  const isHashLink = link.link.startsWith("#");
                  const active = isHashLink
                    ? activeHash === link.link
                    : isRouteActive(link.link);
                  const className = `block w-full py-3 px-4 text-xl font-semibold text-left transition-colors cursor-pointer ${
                    active
                      ? "bg-blue-600 text-white"
                      : `${
                          index % 2 === 0 ? "bg-gray-50" : "bg-white"
                        } text-gray-700 hover:bg-stone-200`
                  }`;
                  const onClick = (
                    event: React.MouseEvent<HTMLAnchorElement>,
                  ) => {
                    if (isHashLink) {
                      scrollToSection(event, link.link);
                    }
                    toggle();
                  };

                  if (isHashLink) {
                    return (
                      <a
                        key={link.label}
                        href={
                          location.pathname === "/"
                            ? link.link
                            : `/${link.link}`
                        }
                        onClick={onClick}
                        className={className}
                      >
                        {link.label}
                      </a>
                    );
                  }

                  return (
                    <Link
                      key={link.label}
                      to={link.link}
                      onClick={onClick}
                      className={className}
                    >
                      {link.label}
                    </Link>
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
