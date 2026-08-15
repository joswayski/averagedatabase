import { createFileRoute } from "@tanstack/react-router";
import { HeaderSimple } from "../../components/HeaderSimple";
import { HeroBullets } from "../../components/HeroBullets";
import { Testimonials } from "../../components/Testimonials";
import { Benchmarks } from "../../components/benchmarks/Benchmarks";
import { Pricing } from "../../components/Pricing";
import { testimonials as allTestimonialsData } from "../data/testimonials";
import { Footer } from "components/Footer";
import { AnnouncementBanner } from "../../components/AnnouncementBanner";

const testimonials = [
  ...allTestimonialsData.filter((testimonial) => testimonial.featured),
  ...allTestimonialsData.filter((testimonial) => !testimonial.featured),
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Average Database" },
      {
        name: "description",
        content:
          "The world's most performant, secure, scalable, reliable, free-est, open source data platform",
      },
    ],
  }),
  component: Home,
});

export default function Home() {
  return (
    <main className="">
      <AnnouncementBanner />
      <HeaderSimple />
      <div className="bg-gradient-to-b from-stone-50 to-white">
        <HeroBullets />
      </div>
      <Benchmarks />
      <Testimonials testimonials={testimonials} />
      <Pricing />
      <Footer />
    </main>
  );
}
