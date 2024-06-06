import { useState } from "react";
import { Radio, RadioGroup } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/20/solid";

const frequencies = [
  { value: "monthly", label: "Monthly", priceSuffix: "/month" },
  { value: "annually", label: "Annually", priceSuffix: "/year" },
];
const tiers = [
  {
    name: "Indie Hackers (le poors)",
    id: "tier-freelancer",
    href: "#",
    price: {
      monthly: "$0",
      annually: "$0",
    },
    hideFrequency: false,
    priceSubtext: "IF we have compute leftover we'll serve your requests",
    description:
      "Just enough to put a side project on your resume before your next FAANG gig",
    features: [
      "1kb payloads",
      "Discord / Twitter reply guy support",
      "Ads in your results",
    ],
    featured: false,
    cta: "Get API key (coming soon)",
  },
  {
    name: (
      <span>
        &quot;Startups&quot; <span className="text-orange-500">PRO</span>
      </span>
    ),
    id: "tier-startup",
    href: "#",
    price: { monthly: "$39", annually: "$299" },
    description:
      "You're trying to get into YC and haven't setup proper accounting yet",
    priceSubtext: "1/256th vCPU & 4mb RAM. Don't use it all up now!",
    features: [
      "4kb payloads",
      "Dashboard to login & view your account info",
      "More data types (number, boolean)",
      "AverageDB Boost™ - Reduce random request delay by up to 50%",
      "ACID compliance available as a paid addon",
    ],
    featured: false,
    cta: "Get API key (coming soon)",
  },
  {
    name: "Enterprise",
    id: "tier-enterprise",
    href: "#",
    price: "Custom",
    priceSubtext: "Tell us what you can afford and we will tell you our price",
    description:
      "Send us the stupid questionnaire from your legal team we don't have SOC2 if it isn't obvious",
    features: [
      "$2,000/mo SSO addon (required)",
      "Dedicated email support\n\n\n(Mon-Fri 9am-12pm & 2pm-4pm Tokyo time)",
      "Indexes available as a paid addon ($100/per)",
      "Backups",
    ],
    featured: true,
    cta: "Get API key (coming soon)",
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export const Pricing = () => {
  const [frequency, setFrequency] = useState(frequencies[0]);

  return (
    <div
      className="  py-24 sm:py-32 bg-gradient-to-b from-white to-slate-300"
      id="pricing"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Pricing plans for teams of all sizes
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
          Get in now before we IPO because it&apos;s going to be a shitshow
        </p>
        <div className="mt-16 flex justify-center">
          <fieldset aria-label="Payment frequency">
            <RadioGroup
              value={frequency}
              onChange={setFrequency}
              className="grid grid-cols-2 gap-x-1 rounded-full p-1 text-center text-xs font-semibold leading-5 ring-1 ring-inset ring-gray-200"
            >
              {frequencies.map((option) => (
                <Radio
                  key={option.value}
                  value={option}
                  className={({ checked }: { checked: boolean }) =>
                    classNames(
                      checked ? "bg-indigo-600 text-white" : "text-gray-500",
                      "cursor-pointer rounded-full px-2.5 py-1"
                    )
                  }
                >
                  {option.label}
                </Radio>
              ))}
            </RadioGroup>
          </fieldset>
        </div>
        <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={classNames(
                tier.featured
                  ? "bg-gray-900 ring-gray-900"
                  : "ring-gray-200 bg-gray-50",
                "rounded-3xl py-8 px-6 ring-1 xl:py-10 0"
              )}
            >
              <h3
                id={tier.id}
                className={classNames(
                  tier.featured ? "text-white" : "text-gray-900",
                  "text-lg font-semibold leading-8"
                )}
              >
                {tier.name}
              </h3>
              <p
                className={classNames(
                  tier.featured ? "text-gray-300" : "text-gray-600",
                  "mt-4 text-sm leading-6"
                )}
              >
                {tier.description}
              </p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span
                  className={classNames(
                    tier.featured ? "text-white" : "text-gray-900",
                    "text-4xl font-bold tracking-tight"
                  )}
                >
                  {typeof tier.price === "string"
                    ? tier.price
                    : tier.price[frequency.value]}
                </span>

                {tier?.hideFrequency ? null : typeof tier.price !== "string" ? (
                  <span
                    className={classNames(
                      tier.featured ? "text-gray-300" : "text-gray-600",
                      "text-sm font-semibold leading-6"
                    )}
                  >
                    {frequency.priceSuffix}
                  </span>
                ) : null}
              </p>
              {tier.priceSubtext ? (
                <span className="text-gray-500 text-xs">
                  {tier.priceSubtext}
                </span>
              ) : null}
              <a
                href={tier.href}
                onClick={(e) => e.preventDefault()}
                aria-describedby={tier.id}
                className={classNames(
                  tier.featured
                    ? "bg-white/10 text-white hover:bg-white/20 focus-visible:outline-white"
                    : "bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-indigo-600",
                  "mt-6 hover:cursor-not-allowed block rounded-md py-2 px-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                )}
              >
                {tier.cta}
              </a>
              <ul
                className={classNames(
                  tier.featured ? "text-gray-300" : "text-gray-600",
                  "mt-8 space-y-3 text-sm leading-6 xl:mt-10"
                )}
              >
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <CheckIcon
                      className={classNames(
                        tier.featured ? "text-white" : "text-indigo-600",
                        "h-6 w-5 flex-none"
                      )}
                      aria-hidden="true"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {/* <div className="flex flex-col items-start gap-x-8 gap-y-6 rounded-3xl p-8 ring-1 ring-gray-900/10 sm:gap-y-10 sm:p-10 lg:col-span-2 lg:flex-row lg:items-center">
          <div className="lg:min-w-0 lg:flex-1">
            <h3 className="text-lg font-semibold leading-8 tracking-tight text-indigo-600">
              Discounted
            </h3>
            <p className="mt-1 text-base leading-7 text-gray-600">
              Dolor dolores repudiandae doloribus. Rerum sunt aut eum. Odit
              omnis non voluptatem sunt eos nostrum.
            </p>
          </div>
          <a
            href="https://github.com/joswayski/averagedatabase"
            className="rounded-md px-3.5 py-2 text-sm font-semibold leading-6 text-indigo-600 ring-1 ring-inset ring-indigo-200 hover:ring-indigo-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Buy discounted license <span aria-hidden="true">&rarr;</span>
          </a>
        </div> */}
      </div>
    </div>
  );
};
