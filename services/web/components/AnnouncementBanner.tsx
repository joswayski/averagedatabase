import { Link } from "@tanstack/react-router";

export function AnnouncementBanner() {
  return (
    <Link
      to="/blog/ass"
      className="block w-full bg-orange-500 hover:bg-orange-600 transition-colors"
    >
      <div className="container mx-auto px-4 py-2 text-center text-white flex items-center justify-center gap-2">
        <span>
          🎉 Put your files in our ASS! Average Storage Service now generally
          available.
        </span>
        <span className="underline font-medium">Read about it →</span>
      </div>
    </Link>
  );
}
