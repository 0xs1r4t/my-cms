"use client";

import React, { useEffect, useState } from "react";
import { HiUpload } from "react-icons/hi";

import { handleMediaUpload } from "@/lib/actions/media/upload";

const UploadMedia = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setStatus("uploading");
    setMessage(null);

    const result = await handleMediaUpload(e);

    if (result?.errors || result?.message?.toLowerCase().includes("failed")) {
      setStatus("error");
      setMessage(
        result?.errors?.file?.[0] || result?.message || "Upload failed"
      );
    } else {
      setStatus("success");
      setMessage(result?.message || "Upload successful!");
    }
  };

  useEffect(() => {
    if (status !== "idle") {
      const timeout = setTimeout(() => {
        setStatus("idle");
        setMessage(null);
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
            />

            {status === "uploading" && (
              <p className="text-sm text-yellow-400">Uploading...</p>
            )}

            {status === "success" && message && (
              <p className="text-sm text-green-400">✅ {message}</p>
            )}

            {status === "error" && message && (
              <p className="text-sm text-red-400">❌ {message}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default UploadMedia;
