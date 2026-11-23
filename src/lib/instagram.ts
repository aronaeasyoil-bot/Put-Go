import "server-only";

export type InstagramMedia = {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
};

/**
 * Reads the brand's own media through the official Instagram API (Instagram
 * Login / Graph API) with a token issued to the PUT & GO business account.
 * Media URLs returned by Instagram are temporary, so they are fetched on
 * request and never stored. Returns [] when no token is configured.
 */
export async function getInstagramMedia(limit = 12): Promise<InstagramMedia[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) return [];
  const userId = process.env.INSTAGRAM_USER_ID || "me";
  const fields = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp";
  const url = `https://graph.instagram.com/${encodeURIComponent(userId)}/media?fields=${fields}&limit=${limit}&access_token=${encodeURIComponent(token)}`;
  try {
    const res = await fetch(url, { next: { revalidate: 900 } });
    if (!res.ok) {
      console.error("[instagram] HTTP", res.status);
      return [];
    }
    const json = (await res.json()) as { data?: InstagramMedia[] };
    return (json.data ?? []).filter((m) => m.media_url || m.thumbnail_url);
  } catch (err) {
    console.error("[instagram]", err);
    return [];
  }
}
