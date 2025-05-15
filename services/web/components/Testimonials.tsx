import { Container, Text, Title } from "@mantine/core";
const testimonials = [
  {
    featured: true,
    body: "im an AvgDB power user",
    name: "Sam Lambert",
    handle: "isamlambert",
    imageUrl: "https://pbs.twimg.com/profile_images/1913800449234518016/5a6mJS5S_400x400.jpg",
    logoUrl: "https://svgmix.com/uploads/7ab8a3-planetscale.svg",
    xeet: "https://x.com/isamlambert/status/1858310132071039208",
  },
  {
    featured: true,
    body: "Hard to compete with this...",
    name: "Paul Copplestone",
    handle: "kiwicopple",
    imageUrl: "https://pbs.twimg.com/profile_images/1664343166630109202/xcBMGPSE_400x400.jpg",
    logoUrl: "https://lsvp.com/wp-content/uploads/2023/03/Supabase.png?1708195445",
    xeet: "https://x.com/kiwicopple/status/1885081081592123556",
  },
  {
    featured: true,
    body: "These guys know what they are doing",
    name: "Søren Schmidt",
    handle: "sorenbs",
    imageUrl: "https://pbs.twimg.com/profile_images/1796990572965613569/aJIPcp4r_400x400.jpg",
    logoUrl: "https://cdn.worldvectorlogo.com/logos/prisma-2.svg",
    xeet: "https://x.com/sorenbs/status/1887389446569373940"
  },
  {
    body: "best database platform i've ever used! kept my grandpa's pacemaker going.",
    name: "Christian Lewis",
    handle: "ctjlewis",
    imageUrl: "https://avatars.githubusercontent.com/u/1657236?v=4",
    xeet: "https://x.com/ctjlewis/status/1809784717065220454",
  },
  {
    body: "I personally choose all my technology based on how handsome the CEO is.",
    name: "Josh Manders",
    handle: "joshmanders",
    imageUrl: "https://pbs.twimg.com/profile_images/1354238836331732992/WV8pJR0U_400x400.jpg",
    xeet: "https://x.com/joshmanders/status/1806401347178090718",
  },
  {
    body: "Can't hardly wait to go all in on AvgDB IPO",
    name: "DefaultBlameAcceptor",
    handle: "database_comedy",
    imageUrl: "https://pbs.twimg.com/profile_images/1799057903808032768/opeDf-i__400x400.jpg",
    xeet: "https://x.com/database_comedy/status/1824371789943677372",
  },
  {
    body: "Being a CEO is the most stunning and brave thing an individual can do",
    name: "Average Database CEO",
    handle: "AvgDatabaseCEO",
    imageUrl: "https://pbs.twimg.com/profile_images/1779203735991758848/OipJE-5A_400x400.jpg",
    xeet: "https://x.com/AvgDatabaseCEO/status/1863426042137858269",
  },
  {
    body: "...every query ran against AvgDB is O(1)...",
    name: "Shayan Taslim",
    handle: "ImSh4yy",
    imageUrl: "https://pbs.twimg.com/profile_images/1891066554634113025/RCPW1bUD_400x400.jpg",
    xeet: "https://x.com/ImSh4yy/status/1801410641908977837",
  },
  {
    body: "wow rust so fast",
    name: "Simon Eskildsen",
    handle: "Sirupsen",
    imageUrl: "https://pbs.twimg.com/profile_images/1066398389464555520/zockiRAy_400x400.jpg",
    xeet: "https://x.com/Sirupsen/status/1809781108306821407",
  },
];

export function Testimonials() {
  const featured = testimonials.filter(t => t.featured);
  const regular = testimonials.filter(t => !t.featured);

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <Container size={700} className="py-20 pb-12">

        <Title className="leading-none text-center mt-8" order={2}>
          AvgDB is <span className="bg-rose-100 px-1.5 rounded-sm inline-block ">loved</span> by everyone
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
            className="group bg-white rounded-2xl shadow-lg px-4 py-7 flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:bg-yellow-50/10"
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
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {regular.map(t => (
          <a
            key={t.handle}
            href={t.xeet}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white rounded-2xl shadow p-6 flex flex-col items-start transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:bg-yellow-50/10"
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
