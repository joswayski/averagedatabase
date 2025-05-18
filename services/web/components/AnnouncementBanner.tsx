import { Link } from 'react-router';

export function AnnouncementBanner() {
  return (
    <Link to="/blog/oops-we-did-it-again" className="block w-full bg-orange-500 hover:bg-orange-600 transition-colors">
      <div className="container mx-auto px-4 py-2 text-center text-white flex items-center justify-center gap-2">
        <span>🎉 We just raised $100M Series B to add auth. No really, we did lol.</span>
        <span className="underline font-medium">Read about it →</span>
      </div>
    </Link>
  );
} 
