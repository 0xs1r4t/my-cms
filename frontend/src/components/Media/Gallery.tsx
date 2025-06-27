"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { getMediaFiles } from "@/lib/actions/media/view";

const MediaGallery = () => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true);
      const result = await getMediaFiles();
      if (result) {
        setMedia(result);
      }
      setLoading(false);
    };

    fetchMedia();
  }, []);

  if (loading) {
    return <p className="text-yellow-400">Loading media...</p>;
  }

  if (!media || media.length === 0) {
    return <p className="text-gray-400">No media found.</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-2">
      {media.map((item) => (
        <div key={item.id} className="border p-2 rounded shadow-sm">
          <Image
            src={item.public_url}
            alt={item.original_name || item.filename}
            className="w-full h-auto object-cover rounded"
            width={100}
            height={100}
          />
          <p className="text-sm mt-1 truncate">
            {item.original_name || item.filename}
          </p>
          <a
            href={item.public_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 text-xs underline"
          >
            Open
          </a>
        </div>
      ))}
    </div>
  );
};

export default MediaGallery;
