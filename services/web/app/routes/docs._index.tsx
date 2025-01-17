import { InformationCircleIcon } from "@heroicons/react/20/solid";


const faqs = [
  {
    id: 1,
    method: "GET",
    color: "bg-emerald-500",
    endpoint: "/u-up",
    text: <p>Will give you a response of:</p>,
    response: `{"message": "Yeah", "brought_to_you_by": "Pantene: Treat your hair with Pantene's new nourishing shampoo."}`,
  },
  {
    id: 2,
    method: "POST",
    color: "bg-orange-500",
    endpoint:
      "/SECRET_INTERNAL_ENDPOINT_DO_NOT_USE_OR_YOU_WILL_BE_FIRED_add_item",
    text: (
      <p>
        Send a JSON body like{" "}
        <code className="text-slate-800 font-bold  p-2 block bg-gray-100 ">
          {`{"data": "add your data here"}`}
        </code>{" "}
        which will give you a response of:
      </p>
    ),
    response: `{
    "message": "Great success!",
    "key": "442104:m0OSzCNyCifpj3mAHGUd",
    "brought_to_you_by": "Baskin-Robbins: Satisfy your sweet tooth with Baskin-Robbins' new ice cream flavors."
  }`,
  },
  {
    id: 3,
    method: "GET",
    color: "bg-emerald-500",
    endpoint: "/gibs-item",
    text: (
      <p>
        Pass a query param of{" "}
        <code className="text-slate-800 font-bold p-2 block bg-gray-100 ">
          ?key=442104:m0OSzCNyCifpj3mAHGUd
        </code>
        which will give you a response of:
      </p>
    ),
    response: `{
    "value": "add your data here",
    "brought_to_you_by": "KFC: Satisfy your hunger with KFC's new chicken sandwich."
  }`,
  },
];

export default function Example() {
  return (
    <div className="bg-white my-8 mx-auto p-4 max-w-7xl">
      <div className="flex flex-col lg:flex-row lg:space-x-8 space-y-8 lg:space-y-0">
        <div className="lg:w-1/2 lg:mb-0 mb-20">
          <h2 className="text-2xl font-bold leading-10 tracking-tight text-gray-900 mb-4">
            How to use the API
          </h2>
          <p className="mb-2">Send a request to the following base URL</p>
          <code className="font-bold p-2 block bg-gray-100 rounded break-all">
            https://api.averagedatabase.com
          </code>
          <p className="mt-4">
            with the header{" "}
            <code className="font-bold p-2 block bg-gray-100 rounded break-all mt-2">
              x-averagedb-api-key
            </code>{" "}
            and the value being your API key. Endpoints are to the right (or
            below on mobile).
          </p>
          <div className="rounded-md bg-blue-50 p-4 mt-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <InformationCircleIcon
                  aria-hidden="true"
                  className="h-5 w-5 text-blue-400"
                />
              </div>
              <div className="ml-3  flex-1 md:flex md:justify-between">
                <p className="text-sm text-blue-700">
                  Enterprise customers can bring their own API keys! Simply
                  insert any items with whatever key that you want prefixed with{" "}
                  <span className="font-bold">enterprise-</span>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:w-1/2">
          {faqs.map((faq) => (
            <div key={faq.id} className="mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <span
                  className={`${faq.color} text-white px-2 py-1 rounded text-sm`}
                >
                  {faq.method}
                </span>
                <code className="text-slate-800 font-bold break-all">
                  {faq.endpoint}
                </code>
              </div>
              <p className="text-gray-600">{faq.text}</p>
              <code className="font-bold p-2 block bg-gray-100 rounded break-all mt-2">
                {faq.response}
              </code>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

