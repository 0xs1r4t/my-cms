import { getAuthCookie } from "@/lib/cookies";
import { v4 as uuidv4 } from "uuid";
import type { MediaItem } from "@/utils/interfaces";

export interface ContentBlock {
  block_type: "markdown" | "media";
  block_content: string;
  block_order: number;
}

interface PostCreateData {
  title: string;
  slug: string;
  description: string;
  content_blocks: ContentBlock[];
  tags: string[];
  type: string;
  status: "draft" | "published" | "archived";
}

export const createPost = async (postData: PostCreateData) => {
  const token = await getAuthCookie();
  if (!token) {
    console.error("No auth token found");
    return {
      message: "Authentication required. Please log in again.",
    };
  }

  // Prepare the data with required fields
  const submitData = {
    ...postData,
    content_media_id: null, // Will be set by the backend
    meta_data: {}, // Required by backend but we're ignoring for now
  };

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/posts/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Post creation failed:", errorData);
      return {
        message: errorData.detail || "Failed to create post",
        errors: errorData.errors || {},
      };
    }

    const data = await response.json();
    return {
      message: "Post created successfully",
      post: data,
    };
  } catch (error) {
    console.error("Error creating post:", error);
    return {
      message: error instanceof Error ? error.message : "Failed to create post",
    };
  }
};

// Helper function to create a new markdown block
export const createMarkdownBlock = (
  content: string = "",
  order: number
): ContentBlock => {
  return {
    block_type: "markdown",
    block_content: content,
    block_order: order,
  };
};

// Helper function to create a new media block
export const createMediaBlock = (
  mediaId: string,
  order: number
): ContentBlock => {
  return {
    block_type: "media",
    block_content: mediaId,
    block_order: order,
  };
};

// Function to fetch media for the media selector
export const getMediaForSelector = async (
  limit: number = 20
): Promise<MediaItem[] | null> => {
  const token = await getAuthCookie();
  if (!token) {
    console.error("No auth token found.");
    return null;
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/media/?limit=${limit}&asset_type=image`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
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
