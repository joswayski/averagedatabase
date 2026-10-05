import {
  DatabaseBusyError,
  DatabaseFullError,
  MAX_UPLOADS_PER_HOUR,
  RETENTION_SECONDS,
  createStore,
  randomHex,
  sha256Hex,
  type AverageStore,
  type StoreEnv,
} from "./db/index.ts";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
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

export type WorkerEnv = StoreEnv & {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
  UPLOADS: R2Bucket;
};

type WorkerContext = {
  waitUntil(promise: Promise<unknown>): void;
};

type CallerResult =
  | { ok: true; apiKey: string; trusted: boolean }
  | { ok: false; response: Response };

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
        ? await createApiKey(createStore(env))
        : methodNotAllowed(["POST"]);
    }

    if (url.pathname === ADD_ITEM_PATH) {
      return request.method === "POST"
        ? await addItem(request, createStore(env))
        : methodNotAllowed(["POST"]);
    }

    if (url.pathname === "/api/gibs-item") {
      return request.method === "GET"
        ? await getItem(request, url, createStore(env))
        : methodNotAllowed(["GET"]);
    }

    if (url.pathname === "/api/yeet") {
      return request.method === "POST"
        ? await uploadFiles(request, url, env, createStore(env))
        : methodNotAllowed(["POST"]);
    }

    if (url.pathname.startsWith(ASS_PATH_PREFIX)) {
      return request.method === "GET" || request.method === "HEAD"
        ? await getFile(request, url, env, ctx)
        : methodNotAllowed(["GET", "HEAD"]);
    }

    return json({ message: "That API endpoint does not exist." }, 404);
  } catch (error) {
    if (error instanceof DatabaseBusyError) {
      console.warn("Average Database store is busy", error);
      return new Response(
        "Route 53 is rate limiting our writes. That's the price of a 100% SLA. Try again in a few seconds.",
        {
          status: 503,
          headers: {
            "Cache-Control": "private, no-store",
            "Content-Type": "text/plain; charset=utf-8",
            "Retry-After": "5",
          },
        },
      );
    }

    if (error instanceof DatabaseFullError) {
      console.warn("Average Database store is full", error);
      return text(
        "The database is full. Our hourly cleanup will make room soon.",
        507,
      );
    }

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

export async function cleanupDatabase(env: StoreEnv): Promise<void> {
  await createStore(env).cleanup(unixSeconds());
}

async function createApiKey(store: AverageStore): Promise<Response> {
  const { apiKey } = await store.createApiKey(unixSeconds());

  return json({ api_key: apiKey, brought_to_you_by: randomAd() }, 201);
}

async function addItem(
  request: Request,
  store: AverageStore,
): Promise<Response> {
  const caller = readCaller(request);
  if (!caller.ok) {
    return caller.response;
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
  if (sizeBytes > store.maxValueBytes) {
    return text(
      `Value is too large. Keep it under ${store.maxValueBytes.toLocaleString()} bytes.`,
      413,
    );
  }

  const itemKey = await store.putItem(caller, data, unixSeconds());
  if (itemKey === null) {
    return invalidApiKey();
  }

  return json(
    {
      message: "Great success!",
      key: itemKey,
      brought_to_you_by: randomAd(caller.apiKey),
    },
    201,
  );
}

async function getItem(
  request: Request,
  url: URL,
  store: AverageStore,
): Promise<Response> {
  const auth = await authenticate(request, store);
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

  const value = await store.getItem(auth.apiKey, itemKey, unixSeconds());

  if (value === null) {
    return text(
      store.propagationSeconds > 0
        ? `No item found with this key. It might have been deleted, or it's still propagating to every Route 53 nameserver, which can take up to ${store.propagationSeconds} seconds.. 🤷`
        : "No item found with this key. It might have been deleted.. 🤷",
      404,
    );
  }

  return json({
    value,
    brought_to_you_by: randomAd(auth.apiKey),
  });
}

async function uploadFiles(
  request: Request,
  url: URL,
  env: WorkerEnv,
  store: AverageStore,
): Promise<Response> {
  const caller = readCaller(request);
  if (!caller.ok) {
    return caller.response;
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

  const slot = await store.claimUploadSlot(caller, unixSeconds());
  if (slot === "unauthorized") {
    return invalidApiKey();
  }
  if (slot === "rate_limited") {
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
  const ownerKeyHash = await sha256Hex(caller.apiKey);
  const expiresAt = unixSeconds() + RETENTION_SECONDS;

  const storedFiles = await Promise.all(
    uploads.map(async ({ file, filename }) => {
      const fileId = randomHex(32);
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
    brought_to_you_by: randomAd(caller.apiKey),
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
    const auth = await authenticate(request, createStore(env));
    if (!auth.ok) {
      return auth.response;
    }

    if ((await sha256Hex(auth.apiKey)) !== metadata.ownerKeyHash) {
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

// Reads the API key header. Writes check the key as part of the write itself.
function readCaller(request: Request): CallerResult {
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

  return { ok: true, apiKey, trusted: apiKey.startsWith("enterprise-") };
}

async function authenticate(
  request: Request,
  store: AverageStore,
): Promise<CallerResult> {
  const caller = readCaller(request);
  if (
    !caller.ok ||
    caller.trusted ||
    (await store.isApiKeyValid(caller.apiKey, unixSeconds()))
  ) {
    return caller;
  }

  return { ok: false, response: invalidApiKey() };
}

function invalidApiKey(): Response {
  return text("No way, Jose. Fix your API key. Figure it out.", 401);
}

function sanitizeFilename(filename: string): string {
  return filename
    .replaceAll(/[^a-zA-Z0-9._-]/g, "_")
    .replaceAll(/_+/g, "_")
    .slice(0, 255);
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
