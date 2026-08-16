import { testimonials, type Testimonial } from "./data/testimonials";

export const AVATAR_PATH_PREFIX = "/api/avatar/";
export const AVATAR_CACHE_TTL_SECONDS = 60 * 60 * 24;

const FX_TWITTER_USER_URL = "https://api.fxtwitter.com";

type CfAwareRequestInit = RequestInit & {
  cf?: {
    cacheEverything?: boolean;
    cacheTtl?: number;
  };
};

type FxTwitterUserResponse = {
  user?: {
    avatar_url?: string;
  };
};

export function isXTestimonial(testimonial: Testimonial): boolean {
  return testimonial.xeet.startsWith("https://x.com/");
}

export function testimonialAvatarSrc(testimonial: Testimonial): string {
  if (!isXTestimonial(testimonial)) {
    return testimonial.imageUrl;
  }

  return `${AVATAR_PATH_PREFIX}${encodeURIComponent(testimonial.handle)}`;
}

export function findTestimonialByHandle(
  handle: string,
): Testimonial | undefined {
  const normalizedHandle = handle.toLowerCase();
  return testimonials.find(
    (testimonial) => testimonial.handle.toLowerCase() === normalizedHandle,
  );
}

export function toLargeXAvatarUrl(url: string): string {
  return url.replace(/_(normal|bigger|mini)(\.[a-z]+)$/i, "_400x400$2");
}

export async function resolveXAvatarUrl(
  handle: string,
  fallbackUrl: string,
): Promise<string> {
  try {
    const requestInit: CfAwareRequestInit = {
      headers: { Accept: "application/json" },
      cf: {
        cacheEverything: true,
        cacheTtl: AVATAR_CACHE_TTL_SECONDS,
      },
    };
    const response = await fetch(
      `${FX_TWITTER_USER_URL}/${encodeURIComponent(handle)}`,
      requestInit,
    );

    if (!response.ok) {
      return fallbackUrl;
    }

    const payload = (await response.json()) as FxTwitterUserResponse;
    const avatarUrl = payload.user?.avatar_url;

    if (!avatarUrl) {
      return fallbackUrl;
    }

    return toLargeXAvatarUrl(avatarUrl);
  } catch (error) {
    console.error("Failed to resolve X avatar", { handle, error });
    return fallbackUrl;
  }
}
