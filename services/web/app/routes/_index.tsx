import { type MetaFunction } from "@remix-run/node";
import { Toaster } from "react-hot-toast";
import { BarCharts } from "../components/benchmarks";
import { Features } from "../components/features";
import Footer from "../components/footer";
import { Hero } from "../components/hero";
import Logos from "../components/logos";
import { Pricing } from "../components/pricing";
import { Testimonials } from "../components/testimonials";

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
    <>
      <Toaster position="top-center" reverseOrder={false} />

      <div className="relative overflow-hidden before:absolute before:top-0 before:start-1/2 before:bg-[url('https://preline.co/assets/svg/examples/squared-bg-element.svg')] before:bg-no-repeat before:bg-top before:size-full before:-z-[1] before:transform before:-translate-x-1/2">
        <Hero />
        <BarCharts />
        <Testimonials />
        <Features />
        <Logos />
        <Pricing />
        <Footer />
      </div>
    </>
  );
}
