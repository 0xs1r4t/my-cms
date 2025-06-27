import { getAuthCookie } from "@/lib/cookies";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "@/utils/global";

export const handleMediaUpload = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const token = await getAuthCookie();
  if (!token) {
    console.error("No auth token found");
    return {
      message: "Authentication required. Please log in again.",
    };
  }

  const file = e.target.files?.[0];

  // Validate file exists
  if (!file || !(file instanceof File) || file.size === 0) {
    return {
      errors: {
        file: ["Please select a file"],
      },
    };
  }

  // Validate file type
  if (
    !ALLOWED_FILE_TYPES.includes(
      file.type as (typeof ALLOWED_FILE_TYPES)[number]
    )
  ) {
    return {
      errors: {
        file: [
          `File type ${
            file.type
          } is not allowed. Allowed types: ${ALLOWED_FILE_TYPES.join(", ")}`,
        ],
      },
    };
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      errors: {
        file: [
          `File size ${(file.size / 1024 / 1024).toFixed(
            2
          )}MB exceeds maximum size of ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(
            2
          )}MB`,
        ],
      },
    };
  }

  const uploadFormData = new FormData();
  uploadFormData.append("file", file);

  try {
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
      return;
    }

    const result = await response.json();
    return {
      message: `File "${
        result.original_name || result.filename
      }" uploaded successfully!`,
    };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      message: error instanceof Error ? error.message : "Upload failed",
    };
  }
};
