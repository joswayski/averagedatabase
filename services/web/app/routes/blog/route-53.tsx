import { createFileRoute } from "@tanstack/react-router";
import { Badge, Code, Container, Divider, Paper, Text } from "@mantine/core";

export const Route = createFileRoute("/blog/route-53")({
  head: () => ({
    meta: [
      {
        title:
          "AvgDB now runs on Route 53, Amazon's premier database - Average Database Blog",
      },
      {
        name: "description",
        content:
          "We moved every API key and value into DNS TXT records so we can finally say 100% SLA.",
      },
    ],
  }),
  component: Route53BlogPost,
});

const link = "text-blue-500 hover:text-blue-700";
const paragraph = "text-lg text-gray-700 leading-relaxed mb-4";
const heading = "text-2xl font-bold text-gray-900 mb-4 mt-10";

export default function Route53BlogPost() {
  return (
    <div className="bg-gradient-to-b from-blue-50 to-white">
      <Container size="md" className="py-16">
        <Paper
          shadow="md"
          p={0}
          radius="lg"
          withBorder
          className="overflow-hidden"
        >
          <div className="bg-blue-600 p-8 text-white">
            <Badge color="yellow" size="lg" variant="filled" className="mb-4">
              Infrastructure
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-3 text-white">
              AvgDB now runs on Route 53, Amazon's premier database
            </h1>
            <div className="flex items-center gap-4">
              <Text className="text-blue-100">October 5, 2026</Text>
              <Divider orientation="vertical" className="bg-blue-400" />
              <Text className="text-blue-100">4 min read</Text>
            </div>
          </div>

          <div className="p-8 lg:p-12">
            <p className={paragraph}>
              Enterprise buyers kept asking about our SLA. We kept changing
              the subject. Today we can finally answer:{" "}
              <span className="font-bold">100%</span>.
            </p>

            <p className={paragraph}>
              Every API key and every value you store in AvgDB now lives in
              DNS TXT records in Amazon Route 53, the only AWS service we know
              of with a 100% SLA. Corey Quinn{" "}
              <a
                href="https://www.lastweekinaws.com/blog/route-53-amazons-premier-database/"
                target="_blank"
                rel="noopener noreferrer"
                className={link}
              >
                declared Route 53 a database in 2020
              </a>{" "}
              and dared anyone to prove him wrong. We are not here to prove
              him wrong. We are here to put him in production.
            </p>

            <h3 className={heading}>How it works</h3>

            <p className={paragraph}>
              Your value is base64-encoded, cut into 255-character strings
              (the most a TXT string can hold), and written as a single record
              set with a call to <Code>ChangeResourceRecordSets</Code>.
            </p>

            <p className={paragraph}>
              Reads skip the AWS API entirely. We ask the zone's own
              nameservers over plain DNS, which is the part of Route 53 the
              100% SLA actually covers.
            </p>

            <p className={paragraph}>
              Route 53 applies a change batch all at once or not at all. It
              also refuses to delete a record unless you describe it exactly.
              So every write deletes and re-creates your API key record in the
              same batch, and the batch fails if your key isn't there. That's a
              conditional write. Upload rate limits work the same way, as a
              compare-and-swap counter. We are as surprised as you are.
            </p>

            <p className={paragraph}>
              We are in good company. AWS's own{" "}
              <a
                href="https://aws.amazon.com/message/101925/"
                target="_blank"
                rel="noopener noreferrer"
                className={link}
              >
                write-up of the October 2025 us-east-1 outage
              </a>{" "}
              describes DynamoDB's DNS automation applying its plans "using a
              Route53 transaction". Corey also{" "}
              <a
                href="https://github.com/ExtendDB/extenddb/pull/54"
                target="_blank"
                rel="noopener noreferrer"
                className={link}
              >
                tried to add a Route 53 backend to ExtendDB
              </a>{" "}
              this spring. It was turned down because Route 53 can't pass
              DynamoDB's conditional-write tests. Ours pass, mostly because we
              wrote them.
            </p>

            <h3 className={heading}>Features we let go</h3>

            <div className="mb-4 space-y-6">
              <div>
                <p className="text-gray-900 font-bold">Big values:</p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  The maximum value size goes from 1 MB to 20 KB, a 98%
                  reduction that our analysts are calling "focus".
                </p>
              </div>

              <div>
                <p className="text-gray-900 font-bold">Reading your own writes:</p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Route 53 needs up to 60 seconds to reach every nameserver.
                  New values, and new API keys used for reads, can return 404
                  or 401 for about a minute. Writes accept a new key right
                  away. We call this eventual consistency, and you should too.
                </p>
              </div>

              <div>
                <p className="text-gray-900 font-bold">Write throughput:</p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  The Route 53 API allows about ten requests a second for our
                  entire AWS account. When everyone writes at once you'll get a
                  503 with a <Code>Retry-After</Code> header. Please be patient
                  with our nameservers.
                </p>
              </div>

              <div>
                <p className="text-gray-900 font-bold">Unlimited storage:</p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  A hosted zone comes with 10,000 records. Our hourly cleanup
                  deletes whatever expires soonest when we get close. Values
                  still expire after three days.
                </p>
              </div>

              <div>
                <p className="text-gray-900 font-bold">Secrets:</p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Your data is in public DNS now. Record names use a hash of
                  your API key, so nobody can list them. Anyone with your item
                  key can still read the value with <Code>dig</Code>, so maybe
                  don't store anything in AvgDB that you wouldn't put in a TXT
                  record. That was already good advice.
                </p>
              </div>
            </div>

            <h3 className={heading}>The fine print</h3>

            <p className={paragraph}>
              The 100% SLA covers Route 53 answering DNS queries for our zone,
              not the API we write through, and not the Worker in front of it.
              Credits are a percentage of the zone's DNS query charges and are
              only issued above $1. At $0.40 per million queries, we expect our
              first credit sometime after we IPO.
            </p>

            <p className={paragraph}>
              Your files are still in our ASS. Putting a 10 MB upload into TXT
              records would take more than 400 API calls, and even we have
              limits.
            </p>

            <Divider className="my-8" />
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Your existing API keys and values keep working until they
              expire. Grab a new key with <Code>npx avgdb</Code> and enjoy
              your 100% SLA.
            </p>
          </div>
        </Paper>
      </Container>
    </div>
  );
}
