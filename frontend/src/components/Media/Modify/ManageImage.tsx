"use client";

import React, { useState } from "react";
import Image from "next/image";

import { MediaItem } from "@/utils/interfaces";
import { deleteMedia } from "@/lib/actions/media/delete";
import { useMediaStore } from "@/store/useStore";
import { modifyMedia } from "@/lib/actions/media/modify";

const ManageImage = ({
  selectedItem,
  setSelectedItem,
  onDeleteSuccess,
}: {
  selectedItem: MediaItem;
  setSelectedItem: (item: MediaItem | null) => void;
  onDeleteSuccess?: () => void;
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState("");
  const [updateError, setUpdateError] = useState("");
  const [formData, setFormData] = useState({
    filename: selectedItem.filename,
    tags: selectedItem.tags.join(", "),
  });
  const { triggerRefresh } = useMediaStore();

  const handleDelete = async () => {
    setIsDeleting(true);
    setError("");
    const result = await deleteMedia(selectedItem.id, selectedItem.filename);
    if (result?.message?.includes("deleted successfully")) {
      triggerRefresh();
      setSelectedItem(null);
      onDeleteSuccess?.();
    } else {
      setError(result.message || "Something went wrong");
    }
    setIsDeleting(false);
    setShowDeleteConfirm(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateError("");

    // Parse tags from comma-separated string
    const tags = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const result = await modifyMedia(selectedItem.id, {
      filename: formData.filename,
      tags: tags,
    });

    if (result.message?.includes("successfully")) {
      // Update successful - refresh the media store
      triggerRefresh();
      console.log("Updated media:", result.media);
    } else {
      // Handle error
      setUpdateError(result.message || "Failed to update media");
      console.error("Update failed:", result.message);
    }
    setIsUpdating(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs"
      onClick={() => setSelectedItem(null)}
    >
      <div
        className="relative max-w-[90vw] max-h-[90vh] flex gap-4 p-4 bg-background rounded-lg shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <Image
          src={selectedItem.public_url}
          alt={selectedItem.original_name || selectedItem.filename || "image"}
          width={512}
          height={512}
          className="max-w-[60vh] w-full h-auto object-contain rounded"
        />

        {/* Modifications */}
        <div className="flex flex-col gap-4 min-w-[300px]">
          {/* Update Form */}
          <form onSubmit={handleUpdate} className="flex flex-col gap-3">
            <div>
              <label
                htmlFor="filename"
                className="block text-sm font-medium mb-1"
              >
                Filename
              </label>
              <input
                type="text"
                id="filename"
                name="filename"
                value={formData.filename}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="nature, landscape, outdoor"
              />
            </div>

            <div className="flex flex-row gap-3">
              {/* Update Button */}
              <button
                type="submit"
                disabled={isUpdating}
                className="flex flex-row items-center gap-3 text-lg px-4 py-2 rounded-xl"
              >
                {isUpdating ? "Updating..." : "Update Image"}
              </button>

              {/* Delete Button */}
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteConfirm(true)}
                className="flex flex-row items-center gap-3 text-lg px-4 py-2 rounded-xl"
              >
                {isDeleting ? "Deleting..." : "Delete Image"}
              </button>
            </div>

            {updateError && (
              <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                {updateError}
              </div>
            )}
          </form>

          {/* Original Info */}
          <div className="mt-4 p-3 bg-muted rounded-md">
            <ul className="text-sm space-y-1">
              <li>
                <span className="font-medium">Original Name:</span>{" "}
                {selectedItem.original_name || "N/A"}
              </li>
              <li>
                <span className="font-medium">File Size:</span>{" "}
                {(selectedItem.file_size / 1024 / 1024).toFixed(2)} MB
              </li>
              <li>
                <span className="font-medium">Created:</span>{" "}
                {new Date(selectedItem.created_at).toLocaleDateString()}
              </li>
            </ul>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50">
            <div className="bg-background p-6 rounded-lg shadow-lg max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
              <p className="text-foreground/80 mb-6">
                Are you sure you want to delete {selectedItem.filename}? This
                action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-border rounded-md hover:bg-muted transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute top-4 right-4 bg-red-700 text-white text-sm px-3 py-1 rounded shadow">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageImage;
