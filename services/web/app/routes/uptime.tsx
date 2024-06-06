import { Outlet } from "@remix-run/react";

export default function UptimeLayout() {
  return (
    <div className="bg-white   flex justify-center py-8">
      <Outlet />;
    </div>
  );
}
