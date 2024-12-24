const featuredTestimonial = {
  body: "im an AvgDB power user",
  author: {
    name: "Sam Lambert",
    handle: "isamlambert",
    imageUrl:
      "https://pbs.twimg.com/profile_images/1868470061398454272/YNu8-mE6_400x400.jpg",
    logoUrl: "https://svgmix.com/uploads/7ab8a3-planetscale.svg",
  },
  xeet: "https://x.com/isamlambert/status/1858310132071039208",
};
const testimonials = [
  [
    [
      {
        body: "best database platform i’ve ever used! kept my grandpa’s pacemaker going.",
        author: {
          name: "Christian Lewis",
          handle: "ctjlewis",
          imageUrl: "https://avatars.githubusercontent.com/u/1657236?v=4",
          logoUrl:
            "https://tailwindui.com/plus/img/logos/savvycal-logo-gray-900.svg",
        },
        xeet: "https://x.com/ctjlewis/status/1809784717065220454",
      },
      {
        body: "...every query ran against AvgDB is O(1)...",
        author: {
          name: "Shayan Taslim",
          handle: "ImSh4yy",
          imageUrl:
            "https://pbs.twimg.com/profile_images/1697511202908188672/hfMoNTSw_400x400.jpg",
        },
        xeet: "https://x.com/ImSh4yy/status/1801410641908977837",
      },
    ],
    [
      {
        body: "I personally choose all my technology based on how handsome the CEO is.",
        author: {
          name: "Josh Manders",
          handle: "joshmanders",
          imageUrl:
            "https://pbs.twimg.com/profile_images/1354238836331732992/WV8pJR0U_400x400.jpg",
        },
        xeet: "https://x.com/joshmanders/status/1806401347178090718",
      },
    ],
    [
      {
        body: "Can't hardly wait to go all in on AvgDB IPO",
        author: {
          name: "DefaultBlameAcceptor",
          handle: "database_comedy",
          imageUrl:
            "https://pbs.twimg.com/profile_images/1799057903808032768/opeDf-i__400x400.jpg",
        },
        xeet: "https://x.com/database_comedy/status/1824371789943677372",
      },
    ],
  ],
  [
    [
      {
        body: "Being a CEO is the most stunning and brave thing an individual can do",
        author: {
          name: "Average Database CEO",
          handle: "AvgDatabaseCEO",
          imageUrl:
            "https://pbs.twimg.com/profile_images/1779203735991758848/OipJE-5A_400x400.jpg",
        },
        xeet: "https://x.com/AvgDatabaseCEO/status/1863426042137858269",
      },
      {
        body: "wow rust so fast",
        author: {
          name: "Simon Eskildsen",
          handle: "Sirupsen",
          imageUrl:
            "https://pbs.twimg.com/profile_images/1066398389464555520/zockiRAy_400x400.jpg",
        },
        xeet: "https://x.com/Sirupsen/status/1809781108306821407",
      },
    ],
  ],
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export const Testimonials = () => {
  return (
    <div className="relative isolate bg-white pb-32 pt-24 sm:pt-32">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 transform-gpu overflow-hidden opacity-30 blur-3xl"
      >
        <div
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
          className="ml-[max(50%,38rem)] aspect-[1313/771] w-[82.0625rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc]"
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 flex transform-gpu overflow-hidden pt-32 opacity-25 blur-3xl sm:pt-40 xl:justify-end"
      >
        <div
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
          className="ml-[-22rem] aspect-[1313/771] w-[82.0625rem] flex-none origin-top-right rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] xl:ml-0 xl:mr-[calc(50%-12rem)]"
        />
      </div>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mt-2 text-balance text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
            Testimonials
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 grid-rows-1 gap-8 text-sm/6 text-gray-900 sm:mt-20 sm:grid-cols-2 xl:mx-0 xl:max-w-none xl:grid-flow-col xl:grid-cols-4">
          <figure className="rounded-2xl bg-white shadow-lg ring-1 ring-gray-900/5 sm:col-span-2 xl:col-start-2 xl:row-end-1">
            <blockquote className="p-6 text-lg font-semibold tracking-tight text-gray-900 sm:p-12 sm:text-xl/8">
              <p>{`“${featuredTestimonial.body}”`}</p>
            </blockquote>
            <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-4 border-t border-gray-900/10 px-6 py-4 sm:flex-nowrap">
              <img
                alt=""
                src={featuredTestimonial.author.imageUrl}
                className="size-10 flex-none rounded-full bg-gray-50"
              />
              <div className="flex-auto">
                <div className="font-semibold">
                  {featuredTestimonial.author.name}
                </div>
                <div className="text-gray-600">{`@${featuredTestimonial.author.handle}`}</div>
              </div>
              <img
                alt=""
                src={featuredTestimonial.author.logoUrl}
                className="h-10 w-auto flex-none"
              />
            </figcaption>
          </figure>

          {testimonials.map((columnGroup, columnGroupIdx) => (
            <div
              key={columnGroupIdx}
              className="space-y-8 xl:contents xl:space-y-0"
            >
              {columnGroup.map((column, columnIdx) => (
                <div
                  key={columnIdx}
                  className={classNames(
                    (columnGroupIdx === 0 && columnIdx === 0) ||
                      (columnGroupIdx === testimonials.length - 1 &&
                        columnIdx === columnGroup.length - 1)
                      ? "xl:row-span-2"
                      : "xl:row-start-1",
                    "space-y-8"
                  )}
                >
                  {column.map((testimonial) => (
                    <a
                      key={testimonial.author.handle}
                      href={testimonial.xeet}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <figure className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-900/5">
                        <blockquote className="text-gray-900">
                          <p>{`“${testimonial.body}”`}</p>
                        </blockquote>
                        <figcaption className="mt-6 flex items-center gap-x-4">
                          <img
                            alt=""
                            src={testimonial.author.imageUrl}
                            className="size-10 rounded-full bg-gray-50"
                          />
                          <div>
                            <div className="font-semibold">
                              {testimonial.author.name}
                            </div>
                            <div className="text-gray-600">{`@${testimonial.author.handle}`}</div>
                          </div>
                        </figcaption>
                      </figure>
                    </a>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
