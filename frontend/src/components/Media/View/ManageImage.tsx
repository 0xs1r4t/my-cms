"use client";

import React, { useState } from "react";
import Image from "next/image";
import { TiDelete } from "react-icons/ti";
import { MediaItem } from "@/utils/interfaces";
import { deleteMedia } from "@/lib/actions/media/delete";
import { useMediaStore } from "@/store/useStore";

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
  const [error, setError] = useState("");
  const { triggerRefresh } = useMediaStore();

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteMedia(selectedItem.id, selectedItem.filename);
    if (result?.message?.includes("deleted successfully")) {
      triggerRefresh();
      setSelectedItem(null);
      onDeleteSuccess?.();
    } else {
      setError(result.message || "Something went wrong");
    }
    setIsDeleting(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs"
      onClick={() => setSelectedItem(null)}
    >
      <div
        className="relative max-w-[90vw] max-h-[90vh] p-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="self-start -mt-4 -mr-4 z-10">
          <TiDelete
            role="button"
            onClick={handleDelete}
            // disabled={isDeleting}
            className="text-foreground hover:text-red-700 text-3xl transition"
            title="Delete Image"
          />
        </div>

        <Image
          src={selectedItem.public_url}
          alt={selectedItem.original_name || selectedItem.filename || "image"}
          width={512}
          height={512}
          className="max-w-[90vh] w-full h-auto object-contain"
        />

        {error && (
          <div className="mt-4 bg-red-700 text-white text-sm px-3 py-1 rounded shadow">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageImage;
