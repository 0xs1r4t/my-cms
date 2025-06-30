"use client";

import React, { useEffect, useState } from "react";
import { HiUpload } from "react-icons/hi";

import { handleMediaUpload } from "@/lib/actions/media/upload";
import { useMediaStore } from "@/store/useStore";
import { ALLOWED_FILE_TYPES } from "@/utils/global";
import type { UploadStatus } from "@/utils/interfaces";

const UploadMedia = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<UploadStatus["status"]>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [errors, setErrors] = useState<string[]>([]);
  const { addMediaItems, triggerRefresh } = useMediaStore();

  const handleToggle = () => setIsOpen(!isOpen);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setStatus("uploading");
    setMessage(null);
    setUploadProgress("");
    setErrors([]);

    const files = Array.from(e.target.files || []);
    if (files.length > 1) {
      setUploadProgress(`Uploading ${files.length} files...`);
    } else if (files.length === 1) {
      setUploadProgress(`Uploading ${files[0].name}...`);
    }

    const result = await handleMediaUpload(e);

    if (result?.errors || result?.message?.toLowerCase().includes("failed")) {
      setStatus("error");
      setMessage(
        result?.errors?.file?.[0] || result?.message || "Upload failed"
      );
      // Store all errors for display
      if (result?.errors?.file) {
        setErrors(result.errors.file);
      }
    } else {
      setStatus("success");
      setMessage(result?.message || "Upload successful!");

      // Add the new items to the gallery immediately
      if (result?.mediaItems && result.mediaItems.length > 0) {
        addMediaItems(result.mediaItems);
      } else {
        // Fallback to full refresh if no media items returned
        triggerRefresh();
      }
    }

    setUploadProgress("");
  };

  useEffect(() => {
    if (status !== "idle") {
      const timeout = setTimeout(() => {
        setStatus("idle");
        setMessage(null);
        setUploadProgress("");
        setErrors([]);
      }, 4000);
      return () => clearTimeout(timeout);
    }
  }, [status]);

  return (
    <>
      <HiUpload className="text-4xl cursor-pointer" onClick={handleToggle} />
      {isOpen && (
        <div className="m-1 p-3 rounded-lg bg-foreground text-secondary">
          <div className="flex flex-col gap-2">
            <label htmlFor="file" className="ml-1">
              Upload Media
            </label>
            <input
              type="file"
              id="file"
              className="p-1 px-2 mx-1 mb-1 border-2 border-secondary rounded-md"
              onChange={handleFileChange}
              disabled={status === "uploading"}
              multiple
              accept={ALLOWED_FILE_TYPES.join(",")}
            />

            {status === "uploading" && (
              <div className="text-sm text-yellow-400">
                {uploadProgress || "Uploading..."}
              </div>
            )}

            {status === "success" && message && (
              <p className="text-sm text-green-400">✅ {message}</p>
            )}

            {status === "error" && message && (
              <p className="text-sm text-red-400">❌ {message}</p>
            )}

            {errors.length > 1 && (
              <div className="text-sm text-red-400">
                <p>Failed uploads:</p>
                <ul className="list-disc list-inside ml-2">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default UploadMedia;
