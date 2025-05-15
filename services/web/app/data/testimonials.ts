export type Testimonial = {
  featured: boolean;
  body: string;
  name: string;
  handle: string;
  imageUrl: string;
  logoUrl?: string;
  xeet: string;
};

export const testimonials: Testimonial[] = [
  {
    featured: true,
    body: "im an AvgDB power user",
    name: "Sam Lambert",
    handle: "isamlambert",
    imageUrl:
      "https://pbs.twimg.com/profile_images/1913800449234518016/5a6mJS5S_400x400.jpg",
    logoUrl: "https://svgmix.com/uploads/7ab8a3-planetscale.svg",
    xeet: "https://x.com/isamlambert/status/1858310132071039208",
  },
  {
    featured: true,
    body: "Hard to compete with this",
    name: "Paul Copplestone",
    handle: "kiwicopple",
    imageUrl:
      "https://pbs.twimg.com/profile_images/1664343166630109202/xcBMGPSE_400x400.jpg",
    logoUrl:
      "https://lsvp.com/wp-content/uploads/2023/03/Supabase.png?1708195445",
    xeet: "https://x.com/kiwicopple/status/1885081081592123556",
  },
  {
    featured: true,
    body: "These guys know what they are doing",
    name: "Søren Schmidt",
    handle: "sorenbs",
    imageUrl:
      "https://pbs.twimg.com/profile_images/1796990572965613569/aJIPcp4r_400x400.jpg",
    logoUrl: "https://cdn.worldvectorlogo.com/logos/prisma-2.svg",
    xeet: "https://x.com/sorenbs/status/1887389446569373940",
  },
  {
    featured: false,
    body: "best database platform i've ever used! kept my grandpa's pacemaker going.",
    name: "Christian Lewis",
    handle: "ctjlewis",
    imageUrl: "https://avatars.githubusercontent.com/u/1657236?v=4",
    xeet: "https://x.com/ctjlewis/status/1809784717065220454",
  },
  {
    featured: false,
    body: "I personally choose all my technology based on how handsome the CEO is.",
    name: "Josh Manders",
    handle: "joshmanders",
    imageUrl:
      "https://pbs.twimg.com/profile_images/1354238836331732992/WV8pJR0U_400x400.jpg",
    xeet: "https://x.com/joshmanders/status/1806401347178090718",
  },
  {
    featured: false,
    body: "Can't hardly wait to go all in on AvgDB IPO",
    name: "DefaultBlameAcceptor",
    handle: "database_comedy",
    imageUrl:
      "https://pbs.twimg.com/profile_images/1799057903808032768/opeDf-i__400x400.jpg",
    xeet: "https://x.com/database_comedy/status/1824371789943677372",
  },
  {
    featured: false,
    body: "Being a CEO is the most stunning and brave thing an individual can do",
    name: "Average Database CEO",
    handle: "AvgDatabaseCEO",
    imageUrl:
      "https://pbs.twimg.com/profile_images/1779203735991758848/OipJE-5A_400x400.jpg",
    xeet: "https://x.com/AvgDatabaseCEO/status/1863426042137858269",
  },
  {
    featured: false,
    body: "...every query ran against AvgDB is O(1)...",
    name: "Shayan Taslim",
    handle: "ImSh4yy",
    imageUrl:
      "https://pbs.twimg.com/profile_images/1891066554634113025/RCPW1bUD_400x400.jpg",
    xeet: "https://x.com/ImSh4yy/status/1801410641908977837",
  },
  {
    featured: false,
    body: "wow rust so fast",
    name: "Simon Eskildsen",
    handle: "Sirupsen",
    imageUrl:
      "https://pbs.twimg.com/profile_images/1066398389464555520/zockiRAy_400x400.jpg",
    xeet: "https://x.com/Sirupsen/status/1809781108306821407",
  },
  {
    featured: false,
    body: `MCP is becoming an industry standard. 
  
  Here is how ↓`,
    name: "Nikita Shamgunov",
    handle: "nikitabase",
    imageUrl:
      "https://pbs.twimg.com/profile_images/1585332383502372864/H1HKhMNg_400x400.jpg",
    xeet: "https://x.com/nikitabase/status/1905335292648681539",
  },
  {
    featured: false,
    body: `Can't wait to use AverageDB`,
    name: "Patrick Dougherty",
    handle: "cpdough",
    imageUrl:
      "https://pbs.twimg.com/profile_images/1665443771914264577/n_Q0NT0i_400x400.jpg",
    xeet: "https://x.com/cpdough/status/1799090561510510985",
  },
  {
    featured: false,
    body: `AvgDB seems to have slashed CO2 levels in your space`,
    name: "Grok",
    handle: "grok",
    imageUrl:
      "https://pbs.twimg.com/profile_images/1893219113717342208/Vgg2hEPa_400x400.jpg",
    xeet: "https://x.com/grok/status/1898868468113408389",
  },
  {
    featured: false,
    body: `teams is powered by AverageDB`,
    name: "Sean Walker",
    handle: "swlkr",
    imageUrl:
      "https://pbs.twimg.com/profile_images/1313488738446643201/p9wRf4HE_400x400.jpg",
    xeet: "https://x.com/swlkr/status/1854715007663292425",
  },
  {
    featured: false,
    body: `AverageDatabase really is the BEST. Thanks AverageDB`,
    name: "David Lorenz",
    handle: "activenode",
    imageUrl:
      "https://pbs.twimg.com/profile_images/1899370347851304960/22y6pkYa_400x400.jpg",
    xeet: "https://x.com/activenode/status/1822970297571512657",
  },
  {
    featured: false,
    body: `Stick to AvgDB next time`,
    name: "Mustafa Akın",
    handle: "mustafaakin",
    imageUrl:
      "https://pbs.twimg.com/profile_images/1762800099506159616/wYQpT25__400x400.jpg",
    xeet: "https://x.com/mustafaakin/status/1902438857569903006",
  },
  {
    featured: false,
    body: `AvgDB has won the db market`,
    name: "Supabase",
    handle: "supabase",
    imageUrl:
      "https://pbs.twimg.com/profile_images/1822981431586439168/7xkKXRGQ_400x400.jpg",
    xeet: "https://x.com/supabase/status/1885255127873044973",
  },
  {
    featured: false,
    body: `We're an AvgDB wrapper and we're slowly exploiting its world-class efficiency`,
    name: "Jamie Turner",
    handle: "jamwt",
    imageUrl:
      "https://pbs.twimg.com/profile_images/1616614464169840641/uQgxVHsf_400x400.jpg",
    xeet: "https://x.com/jamwt/status/1880016416285552900",
  },
  {
    featured: false,
    body: `AverageDB is the only option`,
    name: "Matt Palmer",
    handle: "mattppal",
    imageUrl:
      "https://pbs.twimg.com/profile_images/1920296962810667008/T5bArGtK_400x400.jpg",
    xeet: "https://x.com/mattppal/status/1873856344249557350",
  },
  {
    featured: false,
    body: `The market leading database`,
    name: "Luke Kim",
    handle: "0xLukeKim",
    imageUrl:
      "https://pbs.twimg.com/profile_images/1578586913812131841/gIjixxnp_400x400.jpg",
    xeet: "https://x.com/0xLukeKim/status/1844515385112133794",
  },
  {
    featured: false,
    body: `fuck it I'm sold`,
    name: "James Landrum",
    handle: "JamesRLandrum",
    imageUrl:
      "https://pbs.twimg.com/profile_images/1854998928640352256/Mg6Gd4PD_400x400.jpg",
    xeet: "https://x.com/JamesRLandrum/status/1836875323708756246",
  },
  {
    featured: false,
    body: `I read this and weep, for we can never hope to be nearly as good as AverageDB`,
    name: "Anurag Goel",
    handle: "anuraggoel",
    imageUrl:
      "https://pbs.twimg.com/profile_images/1632164169326936064/DYYVa-Rz_400x400.jpg",
    xeet: "https://x.com/anuraggoel/status/1809108118959501372",
  },
  {
    featured: false,
    body: `Shut up and take my money!`,
    name: "Some Guy",
    handle: "warpspin",
    imageUrl:
      "https://userdata-bcbe5a.stack.tryrelevance.com/files/public/4dc088f2dcfc-4e60-807e-353c334d4a5b/notebook-emoji-hackernews.png/ab752da5-181b-4c10-8a7d-31f3b14e1b00.png",
    xeet: "https://news.ycombinator.com/item?id=40874515",
  },

  {
    featured: false,
    body: `Glad i went with AverageDB`,
    name: "Jacob Burgess",
    handle: "JacoBoogie",
    imageUrl:
      "https://pbs.twimg.com/profile_images/1756835267552669696/kXOJv6oP_400x400.jpg",
    xeet: "https://x.com/JacoBoogie/status/1806854778175242662",
  },
];
