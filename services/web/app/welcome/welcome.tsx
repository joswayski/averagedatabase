import { HeaderSimple } from "../../components/HeaderSimple";
import { HeroBullets } from "../../components/HeroBullets";
import { Testimonials } from "../../components/Testimonials";
export function Welcome() {
  return (
    <>
      <HeaderSimple />
      <main className="">
        <HeroBullets />
        <Testimonials />
      </main>
    </>
  );
}
