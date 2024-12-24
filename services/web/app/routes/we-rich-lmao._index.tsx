import { CheckCircleIcon } from "@heroicons/react/20/solid";

const icon = (
  <CheckCircleIcon
    className="mt-1 h-5 w-5 flex-none text-indigo-600"
    aria-hidden="true"
  />
);

export default function WeRich() {
  return (
    <div className="bg-white px-6 py-32 lg:px-8">
      <div className="mx-auto max-w-3xl text-base leading-7 text-gray-700">
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          What up broke boi
        </h1>
        <p className="mt-6 text-xl leading-8">
          We just con<span className="line-through text-gray-300	">ned</span>
          vinced our wonderful VCs to give us a bridge round before our free
          users put us in the dirt for good. You might be wondering what
          we&apos;re going to use the money for, so this poast is to explain
          exactly that:
        </p>
        <div className="mt-10 max-w-2xl">
          {/* <p>
            Faucibus commodo massa rhoncus, volutpat. Dignissim sed eget risus
            enim. Mattis mauris semper sed amet vitae sed turpis id. Id dolor
            praesent donec est. Odio penatibus risus viverra tellus varius sit
            neque erat velit. Faucibus commodo massa rhoncus, volutpat.
            Dignissim sed eget risus enim. Mattis mauris semper sed amet vitae
            sed turpis id.
          </p> */}
          <ul className="mt-8 max-w-xl space-y-8 text-gray-600">
            <li className="flex gap-x-3">
              {icon}
              <span>
                <strong className="font-semibold text-gray-900">
                  Dark mode.
                </strong>{" "}
                There is literally nothing on the roadmap more important. We
                have 16 sprints planned to get this done.
              </span>
            </li>
            <li className="flex gap-x-3">
              {icon}
              <span>
                <strong className="font-semibold text-gray-900">
                  Bribing Youtubers.
                </strong>{" "}
                I mean devrel. I mean community. I mean oh sorry uhm marketing.
              </span>
            </li>

            <li className="flex gap-x-3">
              {icon}
              <span>
                <strong className="font-semibold text-gray-900">
                  Meaningful integrations.
                </strong>{" "}
                You know that framework that came out 3 weeks ago? No, the other
                one.. No the one with 30 users. We need SDKs for that one.
              </span>
            </li>
            <li className="flex gap-x-3">
              {icon}
              <span>
                <strong className="font-semibold text-gray-900">
                  Jepsen testing/audit.
                </strong>{" "}
                Look, we don&apos; have to PASS it.. we just need to be able to
                claim that we&apos;ve done it.
              </span>
            </li>
            <li className="flex gap-x-3">
              {icon}
              <span>
                <strong className="font-semibold text-gray-900">Lambos.</strong>{" "}
              </span>
            </li>
          </ul>

          <p className="mt-8">
            I hope this makes it clear what our roadmap is going forward. These
            last few years haven&apos;t been the greatest on the industry as a
            whole. We almost had to do a license rugpull to stay afloat!
            Luckily, due to our amazing and wonderful ENTERPRISE CUSTOMERS (you
            know who you are!!), things are looking great going forward.
            I&apos;ll leave you with some internal numbers our data science team
            (Jake (Stanford (Dropout))) put together using Databricks ($43k/mo):
          </p>
          {/* <figure className="mt-10 border-l border-indigo-600 pl-9">
            <blockquote className="font-semibold text-gray-900">
              <p>
                “Vel ultricies morbi odio facilisi ultrices accumsan donec lacus
                purus. Lectus nibh ullamcorper ac dictum justo in euismod. Risus
                aenean ut elit massa. In amet aliquet eget cras. Sem volutpat
                enim tristique.”
              </p>
            </blockquote>
            <figcaption className="mt-6 flex gap-x-4">
              <img
                className="h-6 w-6 flex-none rounded-full bg-gray-50"
                src="/public/ebitda.png"
                alt=""
              />
              <div className="text-sm leading-6">
                <strong className="font-semibold text-gray-900">
                  Maria Hill
                </strong>{" "}
                – Marketing Manager
              </div>
            </figcaption>
          </figure> */}
          {/* <p className="mt-10">
            Faucibus commodo massa rhoncus, volutpat. Dignissim sed eget risus
            enim. Mattis mauris semper sed amet vitae sed turpis id. Id dolor
            praesent donec est. Odio penatibus risus viverra tellus varius sit
            neque erat velit.
          </p> */}
        </div>
        <figure className="mt-16">
          <img
            className="aspect-video rounded-xl bg-gray-50 object-cover"
            src="ebitda.png"
            alt=""
          />
        </figure>
      </div>
    </div>
  );
}
