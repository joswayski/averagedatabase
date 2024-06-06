import { Outlet } from "@remix-run/react";

export default function UptimeLayout() {
  return (
    <div className="bg-white   flex justify-center border border-red-400 ">
      <Outlet />;
    </div>
  );
}
