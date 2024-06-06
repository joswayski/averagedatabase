import { CheckIcon } from "@heroicons/react/20/solid";

const features = [
  {
    name: "Serverless",
    description: "This one keyword got us an extra 10 million in funding",
  },
  //   {
  //     name: "Search",
  //     description:
  //       "You're going to %like% the way your results look, we guarantee it",
  //   },
  //   {
  //     name: "Vectors/Embeddings",
  //     description:
  //       "Sam somehow got involved in our cap table so we have add this in to keep feeding his god machine",
  //   },
  //   {
  //     name: "GraphQL",
  //     description: "Look at you you little freak.. you got giddy didn't you..",
  //   },

  {
    name: "Written in 100% Rust",
    description: "Blazingly fast",
  },
  {
    name: "Real-time*",
    description:
      "*Within a few hundred milliseconds you'll see your data as long as you make a properly formatted request most of the time if it's still there",
  },
  {
    name: "K/V",
    description:
      "It's like Redis®* (*Redis is a registered trademark of Redis Ltd. Any rights therein are reserved to Redis Ltd. Any use by Average Labs LLC is for referential purposes only and does not indicate any sponsorship, endorsement or affiliation between Redis and Average Labs LLC) but less ********",
  },
];

export const Features = () => {
  return (
    <div className="bg-slate-100 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          <div>
            <h2 className="text-base font-semibold leading-7 text-indigo-600">
              Everything you need
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              All-in-one platform
            </p>
            <p className="mt-6 text-base leading-7 text-gray-600">
              Look, we get it..
            </p>
          </div>
          <dl className="col-span-2 grid grid-cols-1 gap-x-8 gap-y-10 text-base leading-7 text-gray-600 sm:grid-cols-2 lg:gap-y-16">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-9">
                <dt className="font-semibold text-gray-900">
                  <CheckIcon
                    className="absolute left-0 top-1 h-5 w-5 text-indigo-500"
                    aria-hidden="true"
                  />
                  {feature.name}
                </dt>
                <dd className="mt-2">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};
