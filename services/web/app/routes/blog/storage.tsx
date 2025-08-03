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
export function meta() {
  return [
    { title: "Storage is now available in AvgDB - Average Database Blog" },
    {
      name: "description",
      content:
        "Learn about our new storage capabilities and how we built them with a modest budget.",
    },
  ];
}

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
              Average Storage System (ASS) is now available in AvgDB
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
              our Average Storage System (ASS).
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
                href="https://x.com/notjoswayski"
                target="_blank"
                className="text-blue-500 hover:text-blue-700"
              >
                @notjoswayski
              </a>
              , we've been able to develop and launch ASS after months of
              rigorous testing with Fortune 500 companies who have reported
              "it's definitely one of the storage solutions they've tried."
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              When you sign up for AvgDB, you now get a database with all the
              usual features, plus AvgAuth if you don't know how JWTs work,
              alongisde our great, big, beutiful ASS. What's even cooler is that
              these services integrate seamlessly if you send the correct API
              calls, so you don't need to sign up for yet another vendor just
              for your storage requirements.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Our ASS is secure, functional, and comes with our signature
              branding touch. You can use it to store your files, documents,
              images, and more. We've worked our ASS off to make sure it's both
              reliable and affordable.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4 mt-10">
              Security
            </h3>

            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Our Average Storage Service sits behind the same authentication
              system as the rest of AvgDB. Any requests with a valid API key are
              authenticated and passed to the storage API.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              We've implemented a secure multi-tenant system where files are
              prefixed with a hash of the API key that created them. This
              ensures that users can only access their own files, preventing any
              cross-account access.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Additionally, we support both public and private files:
            </p>

            <Code block className="mb-4">
              {`# Upload a private file (default)
curl -X POST https://api.averagedatabase.com/yeet \\
  -H "x-averagedb-api-key: YOUR_API_KEY" \\
  -F "file=@/path/to/your/file.pdf"

# Upload a public file (accessible without API key)
curl -X POST https://api.averagedatabase.com/yeet \\
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
  "message": "Successfully stored 2 files in our ultra-secure ASS! Private files require API key to access.",
  "files": [
    {
      "file_id": "hQZXIKNqpkq1ouRcyBm0",
      "file_url": "https://api.averagedatabase.com/ass/hQZXIKNqpkq1ouRcyBm0",
      "filename": "important_document.pdf",
      "size_bytes": 524288
    },
    {
      "file_id": "bjJn5TGjXk2VN28vPbtQ",
      "file_url": "https://api.averagedatabase.com/ass/bjJn5TGjXk2VN28vPbtQ",
      "filename": "profile_picture.png",
      "size_bytes": 327680
    }
  ],
  "brought_to_you_by": "Tempur-Pedic: Experience the ultimate comfort with Tempur-Pedic mattresses."
}`}
            </Code>

            <h3 className="text-2xl font-bold text-gray-900 mb-4 mt-10">
              Content Processing
            </h3>

            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              One of our unique features is automatic content processing. Every
              file uploaded to our ASS is automatically branded with our logo:
            </p>

            <div className="mb-4 space-y-6">
              <div>
                <p className="text-gray-900 font-bold">
                  Images (JPG, PNG, GIF):
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Our logo is overlaid in the center at 75% of the image width
                  with semi-transparency.
                </p>
              </div>

              <div>
                <p className="text-gray-900 font-bold">PDFs:</p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  We add our logo as a new page at the beginning, between each
                  existing page, and at the end.
                </p>
              </div>

              <div>
                <p className="text-gray-900 font-bold">Text files:</p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  ASCII art of our logo is prepended to the content.
                </p>
              </div>

              <div>
                <p className="text-gray-900 font-bold">JSON:</p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  We add an{" "}
                  <code className="bg-gray-100 px-1 py-0.5 rounded">
                    _avgdb_watermark
                  </code>{" "}
                  field with our branding information.
                </p>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-4 mt-10">
              Data Retention
            </h3>

            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              While most enterprise systems are required to retain data for
              extended periods (often 7+ years), we've taken a more efficient
              approach. Files are automatically deleted after 24 hours or when
              total storage exceeds 10GB. This ensures optimal performance and
              keeps our storage costs low, well within our $21.97 budget.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4 mt-10">
              What's Next
            </h3>

            <div className="mb-4 space-y-6">
              <div>
                <p className="text-gray-900 font-bold">
                  Improved Branding Options:
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  We're working on allowing users to adjust the transparency
                  level of our logo on their files (from 50% to 95% opacity).
                </p>
              </div>

              <div>
                <p className="text-gray-900 font-bold">
                  Enterprise Branding Removal:
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Enterprise users may soon be able to remove our branding
                  entirely as a premium add-on ($999/month).
                </p>
              </div>

              <div>
                <p className="text-gray-900 font-bold">Extended Retention:</p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  If we can secure additional funding (perhaps as much as $30),
                  we may extend file retention to 48 hours.
                </p>
              </div>

              <div>
                <p className="text-gray-900 font-bold">More File Types:</p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  We're exploring ways to brand additional file formats like
                  audio files (with periodic "AvgDB" whispers) and video files
                  (with our logo watermark).
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
