const AVATAR_PATH_PREFIX = "/api/avatar/";

export type WorkerEnv = {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
  API_UPSTREAM?: string;
};

export async function proxyApiRequest(
  request: Request,
  env: WorkerEnv,
): Promise<Response> {
  const url = new URL(request.url);
  if (url.pathname.startsWith(AVATAR_PATH_PREFIX)) {
    throw new Error("avatar requests should not be proxied");
  }

  const upstream = env.API_UPSTREAM?.trim().replace(/\/+$/, "");
  if (!upstream) {
    return Response.json(
      { message: "The API is between hosts. Try again after the moving truck leaves." },
      {
        status: 503,
        headers: { "Cache-Control": "private, no-store" },
      },
    );
  }

  const target = new URL(`${url.pathname}${url.search}`, `${upstream}/`);
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.set("x-forwarded-host", url.host);
  headers.set("x-forwarded-proto", url.protocol.replace(":", ""));

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = request.body;
    Object.assign(init, { duplex: "half" });
  }

  try {
    const response = await fetch(target, init);
    const outHeaders = new Headers(response.headers);
    if (!outHeaders.has("Cache-Control")) {
      outHeaders.set("Cache-Control", "private, no-store");
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: outHeaders,
    });
  } catch (error) {
    console.error("Failed to reach the Average Database API", error);
    return Response.json(
      { message: "The API is taking a personal day." },
      {
        status: 502,
        headers: { "Cache-Control": "private, no-store" },
      },
    );
  }
}
