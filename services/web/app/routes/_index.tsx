import type { MetaFunction } from "@remix-run/node";
import { Features } from "~/components/features";
import { Hero } from "~/components/hero";
import { Pricing } from "~/components/pricing";

export const meta: MetaFunction = () => {
  return [
    { title: "AverageDB" },
    {
      name: "description",
      content: "The world's most advanced database platform",
    },
  ];
};

export default function Index() {
  return (
    <div className="relative overflow-hidden before:absolute before:top-0 before:start-1/2 before:bg-[url('https://preline.co/assets/svg/examples/squared-bg-element.svg')] before:bg-no-repeat before:bg-top before:size-full before:-z-[1] before:transform before:-translate-x-1/2">
      <Hero />
      <Features />
      <Pricing />
    </div>
  );
}
