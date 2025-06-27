import { getAuthCookie } from "@/lib/cookies";

export const getMediaFiles = async ({
  skip = 0,
  limit = 20,
  asset_type,
  status,
}: {
  skip?: number;
  limit?: number;
  asset_type?: string;
  status?: string;
} = {}): Promise<MediaItem[] | null> => {
  const token = await getAuthCookie();
  if (!token) {
    console.error("No auth token found.");
    return null;
  }

  const searchParams = new URLSearchParams();
  searchParams.append("skip", skip.toString());
  searchParams.append("limit", limit.toString());
  if (asset_type) searchParams.append("asset_type", asset_type);
  if (status) searchParams.append("status", status);

  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL
      }/api/v1/media/?${searchParams.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store", // skip ISR/cache
      }
    );

    if (!response.ok) {
      console.error("Failed to fetch media files.");
      return null;
    }

    const data = await response.json();
    return data as MediaItem[];
  } catch (err) {
    console.error("Error fetching media files:", err);
    return null;
  }
};
