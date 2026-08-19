const RETENTION_SECONDS = 3 * 24 * 60 * 60;
const MAX_VALUE_BYTES = 1_000_000;
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const MAX_UPLOADS_PER_HOUR = 10;
const DATABASE_HIGH_WATER_BYTES = 5 * 1024 * 1024 * 1024;
const CLEANUP_BATCH_SIZE = 1_000;
const MAX_CLEANUP_BATCHES = 20;
const UPLOAD_PREFIX = "uploads/";

const API_KEY_HEADER = "x-averagedb-api-key";
const ADD_ITEM_PATH =
  "/api/SECRET_INTERNAL_ENDPOINT_DO_NOT_USE_OR_YOU_WILL_BE_FIRED_add_item";
const ASS_PATH_PREFIX = "/api/ass/";

const ALLOWED_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "pdf",
  "txt",
  "md",
  "csv",
  "log",
  "json",
  "xml",
  "mp3",
  "wav",
  "m4a",
  "mp4",
  "webm",
  "mov",
  "zip",
  "tar",
  "gz",
]);

const ADS = [
  "Tempur-Pedic: Experience the ultimate comfort with Tempur-Pedic mattresses.",
  "Glade: Freshen up your home with Glade air fresheners.",
  "Starbucks: Upgrade your mornings with Starbucks' new iced caramel macchiato.",
  "Verizon: Stay connected with Verizon's unlimited data plans.",
  "IKEA: Transform your space with IKEA's stylish furniture.",
  "Subway: Taste the freshness of Subway's new avocado toast.",
  "The North Face: Get ready for adventure with The North Face gear.",
  "McDonald's: Enjoy the new crispy chicken sandwich at McDonald's.",
  "Best Buy: Discover the latest tech at Best Buy.",
  "GameStop: Do you like losing money?",
] as const;

export type WorkerEnv = {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
  DB: D1Database;
  UPLOADS: R2Bucket;
};

type WorkerContext = {
  waitUntil(promise: Promise<unknown>): void;
};

type ApiKeyResult =
  { ok: true; apiKey: string } | { ok: false; response: Response };

type StoredUploadMetadata = {
  expiresAt?: string;
  filename?: string;
  ownerKeyHash?: string;
  public?: string;
};

export async function handleApiRequest(
  request: Request,
  env: WorkerEnv,
  ctx: WorkerContext,
): Promise<Response> {
  const url = new URL(request.url);

  try {
    if (url.pathname === "/api/health") {
      return request.method === "GET"
        ? text("Yeah")
        : methodNotAllowed(["GET"]);
    }

    if (url.pathname === "/api/u-up") {
      return request.method === "GET"
        ? json({ message: "Yeah", brought_to_you_by: randomAd() })
        : methodNotAllowed(["GET"]);
    }

    if (url.pathname === "/api/gibs-key") {
      return request.method === "POST"
        ? createApiKey(env.DB)
        : methodNotAllowed(["POST"]);
    }

    if (url.pathname === ADD_ITEM_PATH) {
      return request.method === "POST"
        ? addItem(request, env.DB)
        : methodNotAllowed(["POST"]);
    }

    if (url.pathname === "/api/gibs-item") {
      return request.method === "GET"
        ? getItem(request, url, env.DB)
        : methodNotAllowed(["GET"]);
    }

    if (url.pathname === "/api/yeet") {
      return request.method === "POST"
        ? uploadFiles(request, url, env)
        : methodNotAllowed(["POST"]);
    }

    if (url.pathname.startsWith(ASS_PATH_PREFIX)) {
      return request.method === "GET" || request.method === "HEAD"
        ? getFile(request, url, env, ctx)
        : methodNotAllowed(["GET", "HEAD"]);
    }

    return json({ message: "That API endpoint does not exist." }, 404);
  } catch (error) {
    console.error("Average Database API request failed", error);
    return json(
      {
        message:
          "Something went wrong. This is, after all, an average database.",
      },
      500,
    );
  }
}

export async function cleanupDatabase(db: D1Database): Promise<void> {
  const now = unixSeconds();

  await deleteInBatches(db, "items", "item_key", "expires_at <= ?", now);
  await deleteInBatches(db, "api_keys", "api_key", "expires_at <= ?", now);
  await deleteUploadLimitsInBatches(db, now - 2 * 60 * 60);

  const sizeProbe = await db.prepare("SELECT 1").run();
  let databaseBytes = Number(sizeProbe.meta.size_after ?? 0);

  for (
    let batch = 0;
    databaseBytes > DATABASE_HIGH_WATER_BYTES && batch < MAX_CLEANUP_BATCHES;
    batch += 1
  ) {
    const result = await db
      .prepare(
        `DELETE FROM items
         WHERE item_key IN (
           SELECT item_key
           FROM items
           ORDER BY created_at ASC
           LIMIT ?
         )`,
      )
      .bind(CLEANUP_BATCH_SIZE)
      .run();

    if (Number(result.meta.changes ?? 0) === 0) {
      break;
    }

    databaseBytes = Number(result.meta.size_after ?? databaseBytes);
  }
}

async function createApiKey(db: D1Database): Promise<Response> {
  const now = unixSeconds();
  const apiKey = `avg_${crypto.randomUUID().replaceAll("-", "")}`;

  await db
    .prepare(
      `INSERT INTO api_keys (api_key, created_at, expires_at)
       VALUES (?, ?, ?)`,
    )
    .bind(apiKey, now, now + RETENTION_SECONDS)
    .run();

  return json({ api_key: apiKey, brought_to_you_by: randomAd() }, 201);
}

async function addItem(request: Request, db: D1Database): Promise<Response> {
  const auth = await authenticate(request, db);
  if (!auth.ok) {
    return auth.response;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return text("Request body must be valid JSON", 400);
  }

  const data =
    typeof body === "object" &&
    body !== null &&
    "data" in body &&
    typeof body.data === "string"
      ? body.data
      : null;

  if (data === null) {
    return text("Request body must contain a string named 'data'", 400);
  }

  const sizeBytes = new TextEncoder().encode(data).byteLength;
  if (sizeBytes > MAX_VALUE_BYTES) {
    return text(
      `Value is too large. Keep it under ${MAX_VALUE_BYTES.toLocaleString()} bytes.`,
      413,
    );
  }

  const now = unixSeconds();
  const itemKey = `${auth.apiKey}:${randomId(20)}`;

  await db
    .prepare(
      `INSERT INTO items
        (item_key, api_key, value, size_bytes, created_at, expires_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(itemKey, auth.apiKey, data, sizeBytes, now, now + RETENTION_SECONDS)
    .run();

  return json(
    {
      message: "Great success!",
      key: itemKey,
      brought_to_you_by: randomAd(auth.apiKey),
    },
    201,
  );
}

async function getItem(
  request: Request,
  url: URL,
  db: D1Database,
): Promise<Response> {
  const auth = await authenticate(request, db);
  if (!auth.ok) {
    return auth.response;
  }

  const itemKey = url.searchParams.get("key") ?? "";
  if (!itemKey) {
    return text("You must provide a key in the query string", 400);
  }

  if (!itemKey.startsWith(`${auth.apiKey}:`)) {
    return text("Query key must match api key in header", 401);
  }

  const item = await db
    .prepare(
      `SELECT value
       FROM items
       WHERE item_key = ? AND api_key = ? AND expires_at > ?`,
    )
    .bind(itemKey, auth.apiKey, unixSeconds())
    .first<{ value: string }>();

  if (!item) {
    return text(
      "No item found with this key. It might have been deleted.. 🤷",
      404,
    );
  }

  return json({
    value: item.value,
    brought_to_you_by: randomAd(auth.apiKey),
  });
}

async function uploadFiles(
  request: Request,
  url: URL,
  env: WorkerEnv,
): Promise<Response> {
  const auth = await authenticate(request, env.DB);
  if (!auth.ok) {
    return auth.response;
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_UPLOAD_BYTES) {
    return text(
      "Upload is too large. The entire request must be 10 MB or less.",
      413,
    );
  }

  if (!request.headers.get("content-type")?.includes("multipart/form-data")) {
    return text("Upload files using multipart/form-data.", 400);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return text("Could not read that multipart upload.", 400);
  }

  const files = formData
    .getAll("file")
    .filter((value): value is File => value instanceof File);
  if (files.length === 0) {
    return text(
      "No files were uploaded. Please include at least one file.",
      400,
    );
  }

  const totalBytes = files.reduce((total, file) => total + file.size, 0);
  if (totalBytes > MAX_UPLOAD_BYTES) {
    return text("Upload is too large. Files must total 10 MB or less.", 413);
  }

  const uploads: Array<{ file: File; filename: string }> = [];
  for (const file of files) {
    const filename = sanitizeFilename(file.name);
    const extension = filename.split(".").pop()?.toLowerCase() ?? "";

    if (!filename || !ALLOWED_EXTENSIONS.has(extension)) {
      return text(
        `File type '${extension || "unknown"}' is not allowed. Allowed types: ${Array.from(ALLOWED_EXTENSIONS).join(", ")}`,
        400,
      );
    }

    uploads.push({ file, filename });
  }

  const rateLimit = await incrementUploadLimit(env.DB, auth.apiKey);
  if (rateLimit > MAX_UPLOADS_PER_HOUR) {
    return text(
      `Rate limit exceeded. Maximum ${MAX_UPLOADS_PER_HOUR} upload requests per hour per API key.`,
      429,
    );
  }

  const isPublic = ["true", "1"].includes(
    String(formData.get("public") ?? "")
      .trim()
      .toLowerCase(),
  );
  const ownerKeyHash = await sha256(auth.apiKey);
  const expiresAt = unixSeconds() + RETENTION_SECONDS;

  const storedFiles = await Promise.all(
    uploads.map(async ({ file, filename }) => {
      const fileId = randomId(32);
      await env.UPLOADS.put(`${UPLOAD_PREFIX}${fileId}`, file.stream(), {
        customMetadata: {
          expiresAt: String(expiresAt),
          filename,
          ownerKeyHash,
          public: String(isPublic),
        },
        httpMetadata: {
          contentDisposition: `inline; filename="${filename}"`,
          contentType: file.type || "application/octet-stream",
        },
      });

      return {
        file_id: fileId,
        file_url: `${url.origin}${ASS_PATH_PREFIX}${fileId}`,
        filename,
        size_bytes: file.size,
      };
    }),
  );

  return json({
    message: `Successfully stored ${storedFiles.length} file(s) in our ultra-secure ASS!${
      isPublic ? "" : " Private files require the uploading API key to access."
    }`,
    files: storedFiles,
    brought_to_you_by: randomAd(auth.apiKey),
  });
}

async function getFile(
  request: Request,
  url: URL,
  env: WorkerEnv,
  ctx: WorkerContext,
): Promise<Response> {
  const encodedFileId = url.pathname.slice(ASS_PATH_PREFIX.length);
  let fileId: string;
  try {
    fileId = decodeURIComponent(encodedFileId);
  } catch {
    return text("File not found.", 404);
  }

  if (!fileId || fileId.includes("/") || !/^[a-zA-Z0-9]+$/.test(fileId)) {
    return text("File not found.", 404);
  }

  const object = await env.UPLOADS.get(`${UPLOAD_PREFIX}${fileId}`);
  if (!object) {
    return text("File not found.", 404);
  }

  const metadata = object.customMetadata as StoredUploadMetadata;
  const expiresAt = Number(metadata.expiresAt ?? 0);
  if (!expiresAt || expiresAt <= unixSeconds()) {
    ctx.waitUntil(env.UPLOADS.delete(`${UPLOAD_PREFIX}${fileId}`));
    return text("File not found.", 404);
  }

  if (metadata.public !== "true") {
    const auth = await authenticate(request, env.DB);
    if (!auth.ok) {
      return auth.response;
    }

    if ((await sha256(auth.apiKey)) !== metadata.ownerKeyHash) {
      return text("That file belongs to somebody else. Rude.", 403);
    }
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set(
    "Cache-Control",
    metadata.public === "true" ? "public, max-age=3600" : "private, no-store",
  );
  headers.set("ETag", object.httpEtag);
  headers.set("X-Content-Type-Options", "nosniff");

  return new Response(request.method === "HEAD" ? null : object.body, {
    headers,
  });
}

async function authenticate(
  request: Request,
  db: D1Database,
): Promise<ApiKeyResult> {
  const apiKey = request.headers.get(API_KEY_HEADER)?.trim() ?? "";
  if (!apiKey) {
    return {
      ok: false,
      response: text(
        `You must provide an API key in the '${API_KEY_HEADER}' header`,
        401,
      ),
    };
  }

  if (apiKey.startsWith("enterprise-")) {
    return { ok: true, apiKey };
  }

  const row = await db
    .prepare(
      "SELECT api_key FROM api_keys WHERE api_key = ? AND expires_at > ?",
    )
    .bind(apiKey, unixSeconds())
    .first<{ api_key: string }>();

  if (!row) {
    return {
      ok: false,
      response: text("No way, Jose. Fix your API key. Figure it out.", 401),
    };
  }

  return { ok: true, apiKey };
}

async function incrementUploadLimit(
  db: D1Database,
  apiKey: string,
): Promise<number> {
  const windowStart = Math.floor(unixSeconds() / 3600) * 3600;
  const row = await db
    .prepare(
      `INSERT INTO upload_limits (api_key, window_start, count)
       VALUES (?, ?, 1)
       ON CONFLICT (api_key, window_start)
       DO UPDATE SET count = count + 1
       RETURNING count`,
    )
    .bind(apiKey, windowStart)
    .first<{ count: number }>();

  return Number(row?.count ?? 1);
}

async function deleteInBatches(
  db: D1Database,
  table: "api_keys" | "items",
  keyColumn: "api_key" | "item_key",
  predicate: string,
  value: number,
): Promise<void> {
  for (let batch = 0; batch < MAX_CLEANUP_BATCHES; batch += 1) {
    const result = await db
      .prepare(
        `DELETE FROM ${table}
         WHERE ${keyColumn} IN (
           SELECT ${keyColumn}
           FROM ${table}
           WHERE ${predicate}
           LIMIT ?
         )`,
      )
      .bind(value, CLEANUP_BATCH_SIZE)
      .run();

    if (Number(result.meta.changes ?? 0) < CLEANUP_BATCH_SIZE) {
      break;
    }
  }
}

async function deleteUploadLimitsInBatches(
  db: D1Database,
  before: number,
): Promise<void> {
  for (let batch = 0; batch < MAX_CLEANUP_BATCHES; batch += 1) {
    const result = await db
      .prepare(
        `DELETE FROM upload_limits
         WHERE (api_key, window_start) IN (
           SELECT api_key, window_start
           FROM upload_limits
           WHERE window_start < ?
           LIMIT ?
         )`,
      )
      .bind(before, CLEANUP_BATCH_SIZE)
      .run();

    if (Number(result.meta.changes ?? 0) < CLEANUP_BATCH_SIZE) {
      break;
    }
  }
}

function sanitizeFilename(filename: string): string {
  return filename
    .replaceAll(/[^a-zA-Z0-9._-]/g, "_")
    .replaceAll(/_+/g, "_")
    .slice(0, 255);
}

function randomId(length: number): string {
  return crypto.randomUUID().replaceAll("-", "").slice(0, length);
}

function unixSeconds(): number {
  return Math.floor(Date.now() / 1_000);
}

function randomAd(apiKey = ""): string {
  if (apiKey.startsWith("enterprise-")) {
    return "You! Thanks for being an enterprise customer.";
  }

  return ADS[Math.floor(Math.random() * ADS.length)];
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

function json(value: unknown, status = 200): Response {
  return Response.json(value, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}

function text(value: string, status = 200): Response {
  return new Response(value, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

function methodNotAllowed(methods: string[]): Response {
  return new Response("method not allowed", {
    status: 405,
    headers: {
      Allow: methods.join(", "),
      "Cache-Control": "private, no-store",
    },
  });
}
