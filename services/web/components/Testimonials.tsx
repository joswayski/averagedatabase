import { Container, Text, Title } from "@mantine/core";
import { testimonials } from "../app/data/testimonials"

export function Testimonials() {
  const featured = testimonials.filter(t => t.featured);
  const regular = testimonials.filter(t => !t.featured);

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <Container size={700} className="py-20 pb-12">

        <Title className="leading-none text-center mt-8" order={2}>
          AvgDB is <span className="bg-rose-100 px-1.5 rounded-sm inline-block ">loved</span> by everyone ❤️
        </Title>

        <Container size={660} p={0}>
          <Text c="dimmed" className="text-center mt-2">
            Its lungs contain an organ that creates electricity. The crackling sound of electricity
            can be heard when it exhales. Azurill's tail is large and bouncy. It is packed full of the
            nutrients this Pokémon needs to grow.
          </Text>
        </Container>
      </Container>
      {/* Featured */}
      <div className="max-w-[1600px] mx-auto   grid grid-cols-1 lg:grid-cols-3 gap-10 mb-12">
        {featured.map(t => (
          <a
            key={t.handle}
            href={t.xeet}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white rounded-2xl shadow-lg p-6 flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:bg-yellow-50/10"
          >
            <div className="flex flex-row items-center justify-between gap-2 mb-6 w-full">
              <div className="flex items-center gap-4">
                <img src={t.imageUrl} alt={t.name} className="w-14 h-14 rounded-full flex-shrink-0" />
                <div className="flex flex-col items-start">
                  <div className="font-semibold text-base md:text-lg text-left whitespace-normal break-words">{t.name}</div>
                  <div className="text-gray-600 text-sm text-left whitespace-normal break-words">@{t.handle}</div>
                </div>
              </div>
              {t.logoUrl && (
                <div className="flex justify-end items-center max-w-[50%]">
                  <img
                    src={t.logoUrl}
                    alt=""
                    className={
                      t.logoUrl.includes('prisma')
                        ? 'object-contain h-12 w-auto max-w-full'
                        : 'object-contain h-10 w-auto max-w-full'
                    }
                  />
                </div>
              )}
            </div>
            <blockquote className="text-2xl font-bold text-gray-900">
              "{t.body}"
            </blockquote>
          </a>
        ))}
      </div>
      {/* Regular */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {regular.map(t => (
          <a
            key={t.handle}
            href={t.xeet}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white rounded-2xl shadow px-5 py-4 flex flex-col items-start transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:bg-yellow-50/10"
          >
            <div className="flex items-center gap-4 mb-4 w-full">
              <img src={t.imageUrl} alt={t.name} className="w-10 h-10 rounded-full flex-shrink-0" />
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
