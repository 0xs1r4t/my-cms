import { getAuthCookie } from "@/lib/cookies";

interface PostCreateData {
  title: string;
  slug: string;
  description: string;
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
    content_media_id: null, // Required by backend but we're ignoring for now
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
