import { Link } from "@tanstack/react-router";

export function AnnouncementBanner() {
  return (
    <Link
      to="/blog/route-53"
      className="block w-full bg-orange-500 hover:bg-orange-600 transition-colors"
    >
      <div className="container mx-auto px-4 py-2 text-center text-white flex items-center justify-center gap-2">
        <span>
          🎉 AvgDB now runs on Route 53. That's right: a 100% SLA.
        </span>
        <span className="underline font-medium">Read about it →</span>
      </div>
    </Link>
  );
}
