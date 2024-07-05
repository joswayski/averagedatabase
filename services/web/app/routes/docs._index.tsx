const faqs = [
  {
    id: 1,
    endpoint: (
      <div className="flex space-end items-center">
        <p className="bg-orange-500 text-white p-1 rounded-md">POST</p>
        <p className="text-slate-800 font-bold  pl-4">
          /SECRET_INTERNAL_ENDPOINT_DO_NOT_USE_OR_YOU_WILL_BE_FIRED_add_item
        </p>
      </div>
    ),
    text: (
      <p>
        Send a JSON body like <code>{`{"data": "your-crap-here"}`}</code>
      </p>
    ),
  },
  {
    id: 2,
    endpoint: (
      <div className="flex space-end items-center">
        <p className="bg-green-500 text-white p-1 rounded-md">POST</p>
        <p className="text-slate-800 font-bold  pl-4">/gibs-item</p>
      </div>
    ),
    text: (
      <p>
        Pass a query param of <code>?key=YOUR_ITEM_KEY</code>
      </p>
    ),
  },
];

export default function Example() {
  return (
    <div className="bg-white my-40 mx-auto border border-blue-500">
      <div className="max-w-7xl  flex lg:flex-row flex-col space-y-40 lg:space-y-0 space-x-4 border border-red-400 text-wrap">
        <div className="">
          <h2 className="text-2xl font-bold leading-10 tracking-tight text-gray-900">
            How to use the API
          </h2>
          <p>
            Send a <code>POST</code> request to the following base URL
          </p>
          <code className="font-bold p-4 block">
            https://averagedatabase.com/api
          </code>
          with the header{" "}
          <code className="font-bold p-4 block">x-averagedb-api-key</code> and
          the value being your API key. Endpoints are to the right (or below on
          mobile sorry idk how to do that yet)
        </div>
        <div>
          {faqs.map((faq) => (
            <div key={faq.id}>
              <p className="text-base font-semibold leading-7 text-slate-900">
                {faq.endpoint}
              </p>
              <p className="mt-2 text-base leading-7 text-gray-600">
                {faq.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
