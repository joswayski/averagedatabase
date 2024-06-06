import { Outlet } from "@remix-run/react";

export default function UptimeLayout() {
  return (
    <div className="bg-white  mt-34 border border-red-400">
      <Outlet />;
    </div>
  );
}
