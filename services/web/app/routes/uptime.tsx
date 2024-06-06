import { Outlet } from "@remix-run/react";

export const UptimeLayout = () => {
  return (
    <div className="bg-white  mt-40 border border-red-400">
      <Outlet />;
    </div>
  );
};
