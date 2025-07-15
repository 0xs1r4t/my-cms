import { getAuthCookie } from "@/lib/cookies";
import { MediaUpdate } from "@/utils/interfaces";
import { ModifyMediaResponse } from "@/utils/interfaces";
import { MediaUpdateSchema, MediaResponseSchema } from "@/utils/zodSchemas";

export const modifyMedia = async (
  mediaId: string,
  updates: MediaUpdate
): Promise<ModifyMediaResponse> => {
  const token = await getAuthCookie();
  if (!token) {
    console.error("No auth token found");
    return {
      message: "Authentication required. Please log in again.",
    };
  }

  // Validate the update data
  const validationResult = MediaUpdateSchema.safeParse(updates);
  if (!validationResult.success) {
    return {
      message: "Invalid update data",
      errors: validationResult.error.flatten().fieldErrors,
    };
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/media/${mediaId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(validationResult.data),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Media update failed:", errorData);
      return {
        message: errorData.detail || "Failed to update media",
        errors: errorData.errors || {},
      };
    }

    const data = await response.json();

    // Validate the response
    const responseValidation = MediaResponseSchema.safeParse(data);
    if (!responseValidation.success) {
      console.error("Invalid response format:", responseValidation.error);
      return {
        message: "Invalid response from server",
      };
    }

    return {
      message: "Media updated successfully",
      media: responseValidation.data,
    };
  } catch (error) {
    console.error("Error updating media:", error);
    return {
      message:
        error instanceof Error ? error.message : "Failed to update media",
    };
  }
};
