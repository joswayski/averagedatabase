import { HeaderSimple } from "components/HeaderSimple";
import { Outlet } from "react-router";
import { Footer } from "components/Footer";

export default function DocsLayout() {
  return (
    <div>
      <HeaderSimple />
      <Outlet />
      <Footer />
    </div>
  );
}
