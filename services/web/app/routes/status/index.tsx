import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/status/")({
  head: () => ({
    meta: [{ title: "Status - Average Database" }],
  }),
  component: Status,
});

export default function Status() {
  return (
    <div className="my-40">
      <h1 className="text-9xl text-center font-bold">UP</h1>
    </div>
  );
}
