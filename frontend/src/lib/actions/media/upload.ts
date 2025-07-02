import { getAuthCookie } from "@/lib/cookies";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "@/utils/global";
import type { MediaUploadResponse, MediaItem } from "@/utils/interfaces";

export const handleMediaUpload = async (
  e: React.ChangeEvent<HTMLInputElement>
): Promise<MediaUploadResponse> => {
  const token = await getAuthCookie();
  if (!token) {
    console.error("No auth token found");
    return {
      message: "Authentication required. Please log in again.",
    };
  }

  const files = Array.from(e.target.files || []);

  // Validate files exist
  if (!files.length) {
    return {
      errors: {
        file: ["Please select at least one file"],
      },
    };
  }

  // Validate each file
  const errors: string[] = [];
  const validFiles: File[] = [];

  for (const file of files) {
    if (!(file instanceof File) || file.size === 0) {
      errors.push(`${file.name}: Invalid file`);
      continue;
    }

    // Validate file type
    if (
      !ALLOWED_FILE_TYPES.includes(
        file.type as (typeof ALLOWED_FILE_TYPES)[number]
      )
    ) {
      errors.push(
        `${file.name}: File type ${
          file.type
        } is not allowed. Allowed types: ${ALLOWED_FILE_TYPES.join(", ")}`
      );
      continue;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      errors.push(
        `${file.name}: File size ${(file.size / 1024 / 1024).toFixed(
          2
        )}MB exceeds maximum size of ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(
          2
        )}MB`
      );
      continue;
    }

    validFiles.push(file);
  }

  if (errors.length > 0) {
    return {
      errors: {
        file: errors,
      },
    };
  }

  // Upload all files in a single request
  try {
    const uploadFormData = new FormData();

    // Add all files to FormData
    validFiles.forEach((file) => {
      uploadFormData.append("files", file);
    });

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/media/upload?status=draft`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadFormData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Upload failed:", errorData);
      return {
        errors: {
          file: [errorData.detail || "Upload failed"],
        },
      };
    }

    const results = await response.json();

    const successMessage =
      results.length === 1
        ? `File "${
            results[0].original_name || results[0].filename
          }" uploaded successfully!`
        : `${results.length} files uploaded successfully!`;

    return {
      message: successMessage,
      mediaItems: results as MediaItem[],
    };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      errors: {
        file: [error instanceof Error ? error.message : "Upload failed"],
      },
    };
  }
};
