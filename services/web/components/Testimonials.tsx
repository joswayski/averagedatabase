import { Container, Image, Text, Title, Avatar } from '@mantine/core';

const data = [
  {
    featured: true,
    testimonial: 'im an AvgDB power user',
    name: 'Sam Lambert',
    handle: 'isamlambert',
    personImage: '/people/sam.jpg',
    companyLogo: '/logos/planetscale.png',
    company: 'PlanetScale',
    link: 'https://x.com/isamlambert/status/1858310132071039208',
  },
  {
    featured: true,
    testimonial: 'Hard to compete with this...',
    name: 'Paul Copplestone',
    handle: 'kiwicopple',
    personImage: '/people/paul.jpg',
    companyLogo: '/logos/supabase.png',
    company: 'supabase',
    link: 'https://x.com/kiwicopple/status/1885081081592123556',
  },
  {
    featured: true,
    testimonial: 'These guysknow what they are doing',
    name: 'Søren Schmidt',
    handle: 'sorenbs',
    personImage: '/people/paul.jpg',
    companyLogo: '/logos/supabase.png',
    company: 'Prisma',
    link: 'https://x.com/sorenbs/status/1887389446569373940',
  },
  {
    testimonial: `best database platform i've ever used! kept my grandpa's pacemaker going.`,
    name: 'Christian Lewis',
    handle: 'ctjlewis',
    personImage: '/people/christian.jpg',
    companyLogo: '/logos/laptop.png',
    link: 'https://x.com/ctjlewis/status/1809784717065220454',
  },
  {
    testimonial: 'I personally choose all my technology based on how handsome the CEO is.',
    name: 'Josh Manders',
    handle: 'joshmanders',
    personImage: '/people/josh.jpg',
    link: 'https://x.com/joshmanders/status/1806401347178090718'
  },
  {
    testimonial: `Can't hardly wait to go all in on AvgDB IPO`,
    name: 'DefaultBlameAcceptor',
    handle: 'database_comedy',
    personImage: '/people/default.jpg',
    link: 'https://x.com/database_comedy/status/1824371789943677372'
  },
  {
    testimonial: 'Being a CEO is the most stunning and brave thing an individual can do',
    name: 'Average Database CEO',
    handle: 'AvgDatabaseCEO',
    personImage: '/people/ceo.jpg',
    link: 'https://x.com/AvgDatabaseCEO/status/1863426042137858269'
  },
  {
    testimonial: '...every query ran against AvgDB is O(1)...',
    name: 'Shayan Taslim',
    handle: 'ImSh4yy',
    personImage: '/people/shayan.jpg',
    link: 'https://x.com/ImSh4yy/status/1801410641908977837'
  },
  {
    testimonial: 'wow rust so fast',
    name: 'Simon Eskildsen',
    handle: 'Sirupsen',
    personImage: '/people/simon.jpg',
    link: 'https://x.com/Sirupsen/status/1809781108306821407'
  },
];

export function Testimonials() {
  const featured = data.filter((t) => t.featured);
  const regular = data.filter((t) => !t.featured);

  return (
    <Container className="pt-20 pb-12 max-w-8xl mx-auto " size={"xl"}>
      <Text className="text-center uppercase font-extrabold text-sm text-blue-300 tracking-wide mb-8">TESTIMONIALS</Text>
      <div className="flex flex-col md:flex-row gap-6 mb-10">
        {featured.map((item, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow p-8 flex flex-col w-full md:w-1/2 lg:w-1/3">
            <span className="text-2xl md:text-2xl font-semibold text-gray-800 text-center mb-6">"{item.testimonial}"</span>
            <div className="flex w-full items-center justify-center gap-4">
              <div className="flex flex-1 flex-col items-center lg:items-end justify-center text-center lg:text-right">
                {item.personImage && <Avatar src={item.personImage} alt={item.name} size={48} radius="xl" className="mx-auto lg:mx-0" />}
                <span className="font-semibold text-gray-900 mt-2">{item.name}</span>
                <span className="text-gray-500 text-sm">@{item.handle}</span>
              </div>
              {item.companyLogo && (
                <div className="flex-1 flex items-center justify-center lg:justify-start">
                  <img src={item.companyLogo} alt={item.company} className="h-10 w-auto object-contain" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-6 justify-center">
        {regular.map((item, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow p-6 flex flex-col w-full sm:w-[340px] max-w-full items-center text-center">
            <span className="text-lg font-medium text-gray-800 mb-4">"{item.testimonial}"</span>
            {item.personImage && <Avatar src={item.personImage} alt={item.name} size={36} radius="xl" className="mx-auto" />}
            <span className="font-semibold text-gray-900 text-sm mt-2">{item.name}</span>
            <span className="text-gray-500 text-xs">@{item.handle}</span>
            {item.companyLogo && (
              <img src={item.companyLogo} alt={item.company} className="h-7 w-auto object-contain mx-auto mt-2" />
            )}
          </div>
        ))}
      </div>
    </Container>
  );
}
