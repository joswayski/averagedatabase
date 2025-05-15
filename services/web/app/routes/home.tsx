import { useLoaderData } from "react-router";
import { HeaderSimple } from "../../components/HeaderSimple";
import { HeroBullets } from "../../components/HeroBullets";
import { Testimonials } from "../../components/Testimonials";
import { Benchmarks } from "../../components/benchmarks/Benchmarks";
import { testimonials, type Testimonial } from "../data/testimonials";

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function loader() {
  const featured = testimonials.filter(t => t.featured);
  const regular = testimonials.filter(t => !t.featured);
  const shuffledRegular = shuffleArray(regular);

  return {
    testimonials: [...featured, ...shuffledRegular]
  };
}

export function meta() {
  return [
    { title: "Average Database" },
    { name: "description", content: "The world's most performant, secure, scalable, reliable, free-est, open source data platform" },
  ];
}

export default function Home() {
  const { testimonials } = useLoaderData<typeof loader>();

  return (
    <>
      <HeaderSimple />
      <main className="">
        <HeroBullets />
        <Benchmarks />
        <Testimonials testimonials={testimonials} />
      </main>
    </>
  );
}
