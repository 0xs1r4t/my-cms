import { getAuthCookie } from "@/lib/cookies";

export const deleteMedia = async (mediaId: string, mediaName: string) => {
  const token = await getAuthCookie();
  if (!token) {
    console.error("No auth token found");
    return {
      message: "Authentication required. Please log in again.",
    };
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/media/${mediaId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Delete failed:", errorData);
    return {
      message: errorData.detail || "Delete failed",
    };
  }

  return { message: `Media ${mediaName} deleted successfully` };
};
