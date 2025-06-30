"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { getMediaFiles } from "@/lib/actions/media/view";
import { useMediaStore } from "@/store/useStore";

const MediaGallery = () => {
  const [loading, setLoading] = useState(true);
  const { mediaItems, setMediaItems, refreshTrigger } = useMediaStore();

  const fetchMedia = async () => {
    setLoading(true);
    const result = await getMediaFiles();
    if (result) {
      setMediaItems(result);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Only fetch if we don't have items or if refresh is triggered
    if (mediaItems.length === 0 || refreshTrigger > 0) {
      fetchMedia();
    }
  }, [refreshTrigger]);

  if (loading && mediaItems.length === 0) {
    return <p className="text-yellow-400">Loading media...</p>;
  }

  if (!mediaItems || mediaItems.length === 0) {
    return <p className="text-gray-400">No media found.</p>;
  }

  return (
    <div className="flex flex-wrap basis-full place-content-center gap-2 p-2">
      {mediaItems.map((item) => (
        <span key={item.id}>
          <Image
            src={item.public_url}
            alt={item.original_name || item.filename}
            className="flex-auto w-[200px] h-auto block object-cover"
            width={200}
            height={200}
            loading="lazy"
          />
        </span>
      ))}
    </div>
  );
};

export default MediaGallery;
