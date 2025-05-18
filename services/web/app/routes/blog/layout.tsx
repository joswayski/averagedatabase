import { HeaderSimple } from "components/HeaderSimple";
import { Outlet } from "react-router";
import { Footer } from "components/Footer";

export default function BlogLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <HeaderSimple />
        <Outlet />
      <Footer />
    </div>
  );
}
