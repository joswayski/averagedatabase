import { type MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "AverageDB" },
    {
      name: "description",
      content: "The world's most advanced database platform",
    },
  ];
};

export default function Index() {
  return (
    <div className="min-h-screen bg-[#0a1426] text-white flex flex-col items-center justify-center p-4 relative">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, #ffffff 2px, #ffffff 4px)",
          backgroundSize: "100% 8px",
        }}
      />

      <div className="max-w-6xl w-full text-center space-y-8 relative z-10">
        <div className="bg-[#cc0000] py-6 px-4 mb-12 ">
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-wider ">
            THIS WEBSITE HAS BEEN SEIZED
          </h1>
        </div>

        <div className="flex justify-center gap-24 mb-12">
          <img
            src="/doj.png"
            alt="Department of Justice Seal"
            className="w-44 h-44"
          />
          <img
            src="/fbi.png"
            alt="Federal Bureau of Investigation Seal"
            className="w-44 h-44"
          />
        </div>

        {/* Main Text */}
        <div className="space-y-8 px-4">
          <p className="text-xl leading-relaxed max-w-4xl mx-auto">
            This domain has been seized by the Federal Bureau of Investigation
            in accordance with a seizure warrant pursuant to 18 U.S.C. §§
            981(b), 982(b)(1), 2323(a)(2), 2323(b)(2), 21 U.S.C. § 853(f) issued
            by the United States District Court for the Eastern District of New
            York as part of a joint law enforcement operation and action by:
          </p>

          <div className="space-y-2 italic text-xl font-bold">
            <p>
              The United States Attorney&apos;s Office for the Eastern District
              of New York
            </p>
            <p>Federal Bureau of Investigation</p>

            <p className="text-sm text-gray-400 mt-8 normal-case">
              This database platform has been deemed too efficient and superior
              to its competitors, creating an unfair advantage in the market.
              The unprecedented performance metrics and exceptional user
              experience have disrupted the natural order of mediocre database
              solutions.
            </p>
          </div>
        </div>

        <div className="flex justify-between text-[#ffd700] mt-12 px-4">
          <a href="https://www.justice.gov" className="hover:underline">
            For more information, visit www.justice.gov
          </a>
          <a href="https://www.ic3.gov" className="hover:underline">
            Report cybercrime at www.ic3.gov
          </a>
        </div>
      </div>
    </div>
  );
}
