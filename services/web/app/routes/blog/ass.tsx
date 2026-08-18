import { createFileRoute } from "@tanstack/react-router";
import {
  Container,
  Paper,
  Text,
  Divider,
  Badge,
  Code,
  Anchor,
} from "@mantine/core";
import assLogo from "/public/ass.png";

export const Route = createFileRoute("/blog/ass")({
  head: () => ({
    meta: [
      { title: "Storage is now available in AvgDB - Average Database Blog" },
      {
        name: "description",
        content:
          "Learn about our new storage capabilities and how we built them with a modest budget.",
      },
    ],
  }),
  component: SpareChangeRoundBlogPost,
});

export default function SpareChangeRoundBlogPost() {
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
          {/* Header Image/Banner */}
          <div className="bg-blue-600 p-8 text-white">
            <Badge color="yellow" size="lg" variant="filled" className="mb-4">
              Product Update
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-3 text-white">
              Average Storage Service (ASS) is now available in AvgDB
            </h1>
            <div className="flex items-center gap-4">
              <Text className="text-blue-100">August 03, 2025</Text>
              <Divider orientation="vertical" className="bg-blue-400" />
              <Text className="text-blue-100">5 min read</Text>
            </div>
          </div>

          <div className="p-8 lg:p-12">
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              🆕{" "}
              <span className="font-bold">
                Today marks two m<span className="italic">ass</span>ive
                milestones for AvgDB:
              </span>{" "}
              We're announcing our $21.97 funding round{" "}
              <span className="italic">and</span> the general availability of
              our Average Storage Service (ASS).
            </p>

            <img src={assLogo} alt="ASS funding" className="mb-4" />

            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Thanks to the generous investment from{" "}
              <a
                href="https://x.com/AvgDatabaseCEO"
                target="_blank"
                className="text-blue-500 hover:text-blue-700"
              >
                @AvgDatabaseCEO
              </a>{" "}
              and{" "}
              <a
                href="https://x.com/josevalerio"
                target="_blank"
                className="text-blue-500 hover:text-blue-700"
              >
                @josevalerio
              </a>
              , we've been able to develop and launch ASS after months of
              rigorous testing with Fortune 500 companies who have reported
              "it's definitely one of the storage solutions they've tried."
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              When you get an AvgDB API key, you now get a database with all the
              usual features alongside our great, big, beautiful ASS. The same
              key works for both, so you don't need to sign up for yet another
              vendor just for your storage requirements.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Our ASS is secure, functional, and no longer vandalizes your
              uploads with our logo. You can use it to store files, documents,
              images, and more. We've worked our ASS off to make sure it's both
              reliable and affordable.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4 mt-10">
              Security
            </h3>

            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Our Average Storage Service uses the same API keys as the rest of
              AvgDB. Requests with a valid key are passed to the storage API.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              We've implemented a secure multi-tenant system where files are
              associated with a hash of the API key that created them. This
              ensures that API keys can only access their own private files,
              preventing cross-key access.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Additionally, we support both public and private files:
            </p>

            <Code block className="mb-4">
              {`# Upload a private file (default)
curl -X POST https://averagedatabase.com/api/yeet \\
  -H "x-averagedb-api-key: YOUR_API_KEY" \\
  -F "file=@/path/to/your/file.pdf"

# Upload a public file (accessible without API key)
curl -X POST https://averagedatabase.com/api/yeet \\
  -H "x-averagedb-api-key: YOUR_API_KEY" \\
  -F "public=true" \\
  -F "file=@/path/to/your/file.pdf"`}
            </Code>

            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Here's an example of what the API response looks like when
              uploading files:
            </p>

            <Code block className="mb-4">
              {`{
  "message": "Successfully stored 2 file(s) in our ultra-secure ASS! Private files require the uploading API key to access.",
  "files": [
    {
      "file_id": "hQZXIKNqpkq1ouRcyBm0",
      "file_url": "https://averagedatabase.com/api/ass/hQZXIKNqpkq1ouRcyBm0",
      "filename": "important_document.pdf",
      "size_bytes": 524288
    },
    {
      "file_id": "bjJn5TGjXk2VN28vPbtQ",
      "file_url": "https://averagedatabase.com/api/ass/bjJn5TGjXk2VN28vPbtQ",
      "filename": "profile_picture.png",
      "size_bytes": 327680
    }
  ],
  "brought_to_you_by": "Tempur-Pedic: Experience the ultimate comfort with Tempur-Pedic mattresses."
}`}
            </Code>

            <h3 className="text-2xl font-bold text-gray-900 mb-4 mt-10">
              Content Non-Processing
            </h3>

            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              After a strategic reorganization of our value-add pipeline, files
              are now stored in object storage exactly as uploaded. We validate
              the filename extension, enforce a 10 MB limit per request, and
              then bravely leave the bytes alone.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4 mt-10">
              Data Retention
            </h3>

            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              While most enterprise systems are required to retain data for
              extended periods (often 7+ years), we've taken a more efficient
              approach. The key/value database lives in RAM and will forget
              your data. ASS files live in a real bucket, because somebody
              actually wanted those back.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4 mt-10">
              What's Next
            </h3>

            <div className="mb-4 space-y-6">
              <div>
                <p className="text-gray-900 font-bold">Fewer Features:</p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  We remain committed to not processing, resizing, optimizing,
                  scanning, transcoding, or otherwise touching your files.
                </p>
              </div>

              <div>
                <p className="text-gray-900 font-bold">Extended Retention:</p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  If we can secure additional funding (perhaps as much as $30),
                  we may consider a fourth day.
                </p>
              </div>

              <div>
                <p className="text-gray-900 font-bold">More File Types:</p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  We'll add formats when we can do so without learning anything
                  about media processing.
                </p>
              </div>
            </div>

            <Divider className="my-8" />
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Take our ASS for a spin and let us know what you think!
            </p>
          </div>
        </Paper>
      </Container>
    </div>
  );
}
