import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import {
  Route53ApiClient,
  changeBatchXml,
  parseRecordSets,
} from "./route53-client.ts";
import { ChangeRejectedError } from "./route53-store.ts";
import { DatabaseBusyError } from "./store.ts";

const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("builds a change batch with escaped values", () => {
  const xml = changeBatchXml([
    {
      action: "DELETE",
      record: { name: "a.db.example.com", ttl: 60, values: ['"x<&>"'] },
    },
    {
      action: "CREATE",
      record: { name: "a.db.example.com", ttl: 60, values: ['"1"', '"2"'] },
    },
  ]);

  assert.match(
    xml,
    /^<\?xml version="1\.0" encoding="UTF-8"\?><ChangeResourceRecordSetsRequest xmlns="https:\/\/route53\.amazonaws\.com\/doc\/2013-04-01\/"><ChangeBatch><Changes><Change><Action>DELETE<\/Action>/,
  );
  assert.ok(xml.includes('<Value>"x&lt;&amp;&gt;"</Value>'));
  assert.ok(
    xml.includes(
      '<ResourceRecords><ResourceRecord><Value>"1"</Value></ResourceRecord><ResourceRecord><Value>"2"</Value></ResourceRecord></ResourceRecords>',
    ),
  );
});

test("parses TXT record sets and the next page", () => {
  const page = parseRecordSets(`<?xml version="1.0"?>
<ListResourceRecordSetsResponse xmlns="https://route53.amazonaws.com/doc/2013-04-01/">
  <ResourceRecordSets>
    <ResourceRecordSet>
      <Name>db.example.com.</Name><Type>NS</Type><TTL>172800</TTL>
      <ResourceRecords><ResourceRecord><Value>ns-1.awsdns-01.org.</Value></ResourceRecord></ResourceRecords>
    </ResourceRecordSet>
    <ResourceRecordSet>
      <Name>abc.k.db.example.com.</Name><Type>TXT</Type><TTL>60</TTL>
      <ResourceRecords>
        <ResourceRecord><Value>"e=1" "&amp;"</Value></ResourceRecord>
        <ResourceRecord><Value>&quot;two&quot;</Value></ResourceRecord>
      </ResourceRecords>
    </ResourceRecordSet>
  </ResourceRecordSets>
  <IsTruncated>true</IsTruncated>
  <MaxItems>2</MaxItems>
  <NextRecordName>def.k.db.example.com.</NextRecordName>
  <NextRecordType>TXT</NextRecordType>
</ListResourceRecordSetsResponse>`);

  assert.deepEqual(page, {
    records: [
      {
        name: "abc.k.db.example.com.",
        ttl: 60,
        values: ['"e=1" "&"', '"two"'],
      },
    ],
    next: { name: "def.k.db.example.com.", type: "TXT" },
  });
});

test("signs requests and retries throttling", async () => {
  const requests: Request[] = [];
  globalThis.fetch = async (input, init) => {
    const request = new Request(input, init);
    requests.push(request);
    return requests.length === 1
      ? errorResponse("Throttling", "Rate exceeded")
      : new Response("<ChangeResourceRecordSetsResponse/>");
  };

  await client().changeRecords([
    {
      action: "CREATE",
      record: { name: "a.db.example.com", ttl: 60, values: ['"1"'] },
    },
  ]);

  assert.equal(requests.length, 2);
  assert.equal(
    requests[1].url,
    "https://route53.amazonaws.com/2013-04-01/hostedzone/Z123/rrset/",
  );
  assert.equal(requests[1].method, "POST");
  assert.match(
    requests[1].headers.get("authorization") ?? "",
    /^AWS4-HMAC-SHA256 Credential=AKIDEXAMPLE\/\d{8}\/us-east-1\/route53\/aws4_request, /,
  );
});

test("reports a busy database once retries run out", async () => {
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return errorResponse(
      "PriorRequestNotComplete",
      "The request was rejected because Route 53 was still processing a prior request.",
    );
  };

  await assert.rejects(client().getRecordLimit(), DatabaseBusyError);
  assert.equal(calls, 4);
});

test("turns InvalidChangeBatch into a rejected change", async () => {
  globalThis.fetch = async () =>
    new Response(
      `<?xml version="1.0"?>
<InvalidChangeBatch xmlns="https://route53.amazonaws.com/doc/2013-04-01/"><Messages><Message>Tried to delete resource record set [name='a.db.example.com.', type='TXT'] but it was not found</Message></Messages><RequestId>1</RequestId></InvalidChangeBatch>`,
      { status: 400 },
    );

  await assert.rejects(
    client().changeRecords([
      {
        action: "DELETE",
        record: { name: "a.db.example.com", ttl: 60, values: ['"1"'] },
      },
    ]),
    (error: unknown) =>
      error instanceof ChangeRejectedError &&
      error.message.includes("but it was not found"),
  );
});

test("finds a single record set by exact name", async () => {
  const urls: string[] = [];
  globalThis.fetch = async (input, init) => {
    urls.push(new Request(input, init).url);
    return new Response(`<ListResourceRecordSetsResponse><ResourceRecordSets>
<ResourceRecordSet><Name>next.k.db.example.com.</Name><Type>TXT</Type><TTL>60</TTL>
<ResourceRecords><ResourceRecord><Value>"e=1"</Value></ResourceRecord></ResourceRecords>
</ResourceRecordSet></ResourceRecordSets><IsTruncated>false</IsTruncated></ListResourceRecordSetsResponse>`);
  };

  assert.equal(await client().getRecord("wanted.k.db.example.com"), null);
  assert.deepEqual(await client().getRecord("NEXT.k.db.example.com"), {
    name: "next.k.db.example.com.",
    ttl: 60,
    values: ['"e=1"'],
  });
  assert.equal(
    urls[0],
    "https://route53.amazonaws.com/2013-04-01/hostedzone/Z123/rrset?maxitems=1&name=wanted.k.db.example.com&type=TXT",
  );
});

function client(): Route53ApiClient {
  return new Route53ApiClient("/hostedzone/Z123", {
    accessKeyId: "AKIDEXAMPLE",
    secretAccessKey: "wJalrXUtnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY",
  });
}

function errorResponse(code: string, message: string): Response {
  return new Response(
    `<ErrorResponse><Error><Type>Sender</Type><Code>${code}</Code><Message>${message}</Message></Error><RequestId>1</RequestId></ErrorResponse>`,
    { status: 400 },
  );
}
