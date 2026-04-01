import { redirect } from "react-router";

const YOUTUBE_URL = "https://www.youtube.com/watch?v=KnVu-qNEcrg";

const BOT_UA_PATTERN =
  /Twitterbot|facebookexternalhit|Slackbot|LinkedInBot|Discordbot|WhatsApp|Googlebot|bingbot|Applebot/i;

export async function loader({ request }: { request: Request }) {
  const ua = request.headers.get("user-agent") || "";
  if (!BOT_UA_PATTERN.test(ua)) {
    return redirect(YOUTUBE_URL);
  }
  return {};
}

export function meta() {
  return [
    { title: "Incident Report: April 1st, 2026 — Control Plane Degradation | Average Database" },
    {
      name: "description",
      content:
        "Average Database experienced a critical control plane failure in our managed Kubernetes infrastructure affecting database clusters in US-EAST-1 and EU-WEST-2.",
    },
    { property: "og:type", content: "article" },
    { property: "og:site_name", content: "Average Database" },
    {
      property: "og:title",
      content: "Incident Report: April 1st, 2026 — Control Plane Degradation",
    },
    {
      property: "og:description",
      content:
        "Average Database experienced a critical control plane failure in our managed Kubernetes infrastructure. etcd leader election timeouts caused cascading API server failures affecting all managed database clusters in US-EAST-1 and EU-WEST-2 regions for approximately 23 minutes.",
    },
    {
      property: "og:url",
      content:
        "https://averagedatabase.com/status/incident-report-april-1-2026-control-plane-degradation",
    },
    {
      property: "og:image",
      content: "https://averagedatabase.com/incident-4-1-2026.png",
    },
    { name: "twitter:card", content: "summary_large_image" },
    {
      name: "twitter:title",
      content: "Incident Report: April 1st, 2026 — Control Plane Degradation",
    },
    {
      name: "twitter:image",
      content: "https://averagedatabase.com/incident-4-1-2026.png",
    },
    {
      name: "twitter:description",
      content:
        "Average Database experienced a critical control plane failure in our managed Kubernetes infrastructure affecting database clusters in US-EAST-1 and EU-WEST-2.",
    },
  ];
}

export default function IncidentApril2026() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px", fontFamily: "Inter, sans-serif" }}>
      <p style={{ color: "#6b7280", fontSize: 14 }}>April 1, 2026</p>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginTop: 8 }}>
        Incident Report: April 1st, 2026 — Control Plane Degradation
      </h1>

      <h2 style={{ marginTop: 32 }}>Impact</h2>
      <p>
        On April 1, 2026 between 06:17 UTC and 06:40 UTC (23 minutes), Average Database
        experienced a critical control plane failure in our managed Kubernetes infrastructure.
        An etcd leader election timeout caused cascading API server failures, preventing
        reconciliation of managed database clusters in US-EAST-1 and EU-WEST-2 regions.
      </p>
      <p>
        During this window, provisioning, scaling, and failover operations were unavailable.
        Existing database connections remained active, but new connections could not be
        established through our connection pooler.
      </p>

      <h2 style={{ marginTop: 32 }}>Incident Timeline</h2>
      <ul>
        <li><strong>06:17 UTC</strong> — etcd leader election fails after node replacement in US-EAST-1 control plane.</li>
        <li><strong>06:19 UTC</strong> — kube-apiserver begins returning 503s. Reconciliation loops stall across both regions.</li>
        <li><strong>06:22 UTC</strong> — Automated alerting triggers. On-call engineer paged.</li>
        <li><strong>06:28 UTC</strong> — Root cause identified: quorum loss due to stale peer configuration after node rotation.</li>
        <li><strong>06:35 UTC</strong> — etcd cluster manually re-bootstrapped with corrected peer list.</li>
        <li><strong>06:40 UTC</strong> — Full control plane recovery confirmed. All clusters reconciling normally.</li>
      </ul>

      <h2 style={{ marginTop: 32 }}>What Happened?</h2>
      <p>
        During a routine node rotation in our US-EAST-1 control plane, a stale peer
        configuration was propagated to the replacement etcd member. When the existing
        leader was drained, the remaining members could not elect a new leader because the
        peer list referenced the decommissioned node. This caused quorum loss and cascading
        kube-apiserver failures in both US-EAST-1 and EU-WEST-2 (which shares a federated
        control plane).
      </p>

      <h2 style={{ marginTop: 32 }}>Preventative Measures</h2>
      <ul>
        <li>Pre-rotation peer configuration validation is now enforced before any etcd member replacement.</li>
        <li>Control plane federation has been decoupled so regional failures cannot cascade cross-region.</li>
        <li>etcd quorum health checks are now gating conditions in our node rotation runbook.</li>
      </ul>

      <p style={{ marginTop: 32 }}>
        We sincerely apologize for the disruption. Reliability is our top priority and we
        are committed to ensuring this class of failure cannot recur.
      </p>
    </div>
  );
}
