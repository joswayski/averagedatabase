import { useEffect, useState } from "react";

interface PaywallOverlayProps {
  children: React.ReactNode;
  previewHeight?: string;
}

export function PaywallOverlay({
  children,
  previewHeight = "400px",
}: PaywallOverlayProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 12,
    hours: 18,
    minutes: 15,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((current) => {
        if (current.minutes > 0) {
          return { ...current, minutes: current.minutes - 1 };
        } else if (current.hours > 0) {
          return { ...current, hours: current.hours - 1, minutes: 59 };
        } else if (current.days > 0) {
          return { ...current, days: current.days - 1, hours: 23, minutes: 59 };
        }
        return current;
      });
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative">
      <div
        style={{ maxHeight: previewHeight }}
        className="overflow-hidden relative"
      >
        {children}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 to-white" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-8">
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-xl p-8 mx-4 w-full max-w-lg">
          <div className="flex flex-col items-center justify-center space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Unlocks for everyone in
            </h2>
            <div className="flex gap-4 text-xl text-gray-900">
              <span>
                <strong>{timeLeft.days}</strong> Days
              </span>
              <span>
                <strong>{timeLeft.hours}</strong> Hours
              </span>
              <span>
                <strong>{timeLeft.minutes}</strong> Minutes
              </span>
            </div>
            <div className="text-gray-500">Or</div>

            <button
              className="bg-emerald-400 hover:bg-emerald-500 text-black font-bold py-4 px-8 rounded-lg text-xl transition-colors w-full sm:w-auto"
              onClick={() =>
                (window.location.href =
                  "https://www.youtube.com/watch?v=dQw4w9WgXcQ")
              }
            >
              Get instant access
            </button>
            <p className="text-gray-500">One-time payment, no subscription</p>
          </div>
        </div>
      </div>
    </div>
  );
}
