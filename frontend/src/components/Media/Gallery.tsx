"use client";

import React, { useEffect, useState } from "react";
import { A11yAnnouncer } from "@react-three/a11y";
import { getMediaFiles } from "@/lib/actions/media/view";
import { useMediaStore } from "@/store/useStore";
import ThreeGallery from "@/components/Media/3DGallery";

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
    <>
      <ThreeGallery mediaItems={mediaItems} />
      {/* <A11yAnnouncer /> */}
    </>
  );
};

export default MediaGallery;
