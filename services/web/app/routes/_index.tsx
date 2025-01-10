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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-white rounded-lg shadow-xl">
        <div className="p-8 flex flex-col items-center">
          <div className="w-40 h-40 rounded-full bg-gray-100 border-2 border-gray-100 flex items-center justify-center mt-4 mb-8">
            <img
              src="https://www.usatoday.com/gcdn/authoring/authoring-images/2024/09/19/USAT/75291430007-20231129-t-210147-z-663274362-rc-25-n-4-ajalro-rtrmadp-3-peoplerosalynncarter-1.JPG?crop=1357,1809,x543,y0"
              alt="Jimmy Carter"
              className="w-36 h-36 rounded-full"
            />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-light text-gray-900 mb-2">
              James Earl &quot;Jimmy&quot; Carter Jr.
            </h1>
            <p className="text-xl text-gray-600 font-light">
              39th President of the United States
            </p>
            <p className="text-gray-500 mt-1">1924 - 2024</p>
          </div>

          {/* Company notice */}
          <div className="w-full border-t border-gray-100 pt-8">
            <div className="max-w-2xl mx-auto text-gray-800 leading-relaxed text-left">
              <p className="">
                In honor of former President  Jimmy Carter, AvgDB will observe a
                National Day of Observance on Thursday, January 9th.
              </p>
              <p className="pt-4">
                On this day,{" "}
                <span className="font-bold">
                  queries, metrics, and dashboard access will be temporarily
                  suspended
                </span>
                . Customer complaints will continue to be accepted (but not
                processed) and limited scheduled backups will occur to prevent
                impacts. Regular operations will resume on Friday, January 10th.
                Thank you.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
