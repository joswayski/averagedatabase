import { useLoaderData, useActionData } from "react-router";
import { HeaderSimple } from "../../components/HeaderSimple";
import { HeroBullets } from "../../components/HeroBullets";
import { Testimonials } from "../../components/Testimonials";
import { Benchmarks } from "../../components/benchmarks/Benchmarks";
import { Pricing } from "../../components/Pricing";
import { testimonials as allTestimonialsData } from "../data/testimonials";
import { Footer } from "components/Footer";
import { AnnouncementBanner } from "../../components/AnnouncementBanner";

import axios from "axios";
import type { ShouldRevalidateFunctionArgs } from "react-router";

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Remove module-level pre-processing if it exists
// const featuredTestimonials = allTestimonialsData.filter(t => t.featured);
// const regularTestimonialsRaw = allTestimonialsData.filter(t => !t.featured);
// const shuffledRegularTestimonials = shuffleArray(regularTestimonialsRaw);
// const stableTestimonialList = [...featuredTestimonials, ...shuffledRegularTestimonials];

export async function loader() {
  const featured = allTestimonialsData.filter((t) => t.featured);
  const regular = allTestimonialsData.filter((t) => !t.featured);
  const shuffledRegular = shuffleArray(regular);

  return {
    testimonials: [...featured, ...shuffledRegular],
  };
}

export function meta() {
  return [
    { title: "Average Database" },
    {
      name: "description",
      content:
        "The world's most performant, secure, scalable, reliable, free-est, open source data platform",
    },
  ];
}

export function shouldRevalidate({
  formData,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  if (formData && formData.get("_action") === "getApiKey") {
    return false;
  }
  return defaultShouldRevalidate;
}

export async function action({ request }: { request: Request }) {
  const body = await request.formData();
  const { _action, ...values } = Object.fromEntries(body);

  if (_action === "getApiKey") {
    try {
      const response = await axios.post(
        `${
          process.env.AVGDB_API_DOMAIN || "https://api.averagedatabase.com"
        }/gibs-key`,
        {}
      );
      return response.data;
    } catch (error) {
      console.error(`error man :/`);
      console.error(error);
      return { error: "sorry bruh we messed up :/" };
    }
  }

  return null;
}

export default function Home() {
  const { testimonials } = useLoaderData<typeof loader>();

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
