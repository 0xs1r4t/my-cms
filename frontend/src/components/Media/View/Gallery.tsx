"use client";

import React, { useEffect, useState } from "react";

import CanvasGallery from "@/components/Media/View/Canvas";
import { getMediaFiles } from "@/lib/actions/media/view";
import { useMediaStore } from "@/store/useStore";

const MediaGallery = () => {
  const [loading, setLoading] = useState(true);
  const { mediaItems, setMediaItems, refreshTrigger } = useMediaStore();

  const fetchMedia = async () => {
    setLoading(true);
    const result = await getMediaFiles({ limit: 100 });
    if (result) {
      setMediaItems(result);
    }
    setLoading(false);
  };

  useEffect(() => {
    // ✅ Auto-refresh on manual trigger or first load
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
    <>
      <CanvasGallery mediaItems={mediaItems} />
    </>
  );
};

export default MediaGallery;
