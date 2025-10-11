import { Container, Text, Title } from "@mantine/core";
import type { Testimonial } from "../app/data/testimonials";

type TestimonialsProps = {
  testimonials: Testimonial[];
};

export function Testimonials({ testimonials }: TestimonialsProps) {
  const featured = testimonials?.filter((t) => t.featured) ?? [];
  const regular = testimonials?.filter((t) => !t.featured) ?? [];

  return (
    <div
      id="testimonials"
      className="max-w-7xl mx-auto px-12 py-4 bg-stone-50 rounded-md"
    >
      <Container size={700} className="py-20 pb-12">
        <Title className="leading-none text-center mt-8" order={2} size={36}>
          AvgDB is{" "}
          <span className="bg-rose-100 px-1.5 rounded-sm inline-block ">
            loved
          </span>{" "}
          by everyone ❤️
        </Title>

        <Container size={660} p={0}>
          <Text c="dimmed" className="text-center mt-2">
            Even our competitors. Some more than others. It's mostly good
            though, we sue for defamation on the rest. These are real, unpaid
            testimonials.
          </Text>
        </Container>
      </Container>
      {/* Featured */}
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {featured.map((t) => (
          <a
            key={t.handle}
            href={t.xeet}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white rounded-2xl shadow-lg p-5 flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:bg-yellow-50/10"
          >
            <div className="flex items-center gap-3 mb-5">
              <img
                src={t.imageUrl}
                alt={t.name}
                className="w-12 h-12 rounded-full flex-shrink-0"
              />
              <div className="flex flex-col items-start min-w-0 flex-1">
                <div className="font-semibold text-sm text-left w-full">
                  {t.name}
                </div>
                <div className="text-gray-600 text-xs text-left w-full">
                  @{t.handle}
                </div>
              </div>
            </div>
            <blockquote className="text-lg font-bold text-gray-900 mb-4">
              "{t.body}"
            </blockquote>
            {t.logoUrl && (
              <div className="flex justify-start items-center mt-auto pt-2">
                <img
                  src={t.logoUrl}
                  alt=""
                  className={
                    t.logoUrl.includes("prisma")
                      ? "object-contain h-10 w-auto max-w-[160px]"
                      : "object-contain h-7 w-auto max-w-[140px]"
                  }
                />
              </div>
            )}
          </a>
        ))}
      </div>
      {/* Regular */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {regular.map((t) => (
          <a
            key={t.handle}
            href={t.xeet}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white rounded-2xl shadow px-5 py-4 flex flex-col items-start transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:bg-yellow-50/10"
          >
            <div className="flex items-center gap-4 mb-4 w-full">
              <img
                src={t.imageUrl}
                alt={t.name}
                className="w-10 h-10 rounded-full flex-shrink-0"
              />
              <div className="flex flex-col items-start">
                <div className="font-semibold text-base">{t.name}</div>
                <div className="text-gray-600 text-sm">@{t.handle}</div>
              </div>
            </div>
            <blockquote className="text-lg text-gray-900 text-left">
              "{t.body}"
            </blockquote>
          </a>
        ))}
      </div>
    </div>
  );
}
