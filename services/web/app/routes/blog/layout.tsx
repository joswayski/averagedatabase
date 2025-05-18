import { HeaderSimple } from "components/HeaderSimple";
import { Outlet } from "react-router";

export default function DocsLayout() {
  return (
    <div>
      <HeaderSimple />
      <Outlet />
    </div>
  );
}
