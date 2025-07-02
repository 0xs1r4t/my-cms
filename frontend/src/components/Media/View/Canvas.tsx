"use client";

import React, { useEffect, useState } from "react";

import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import Image from "next/image";
import Scene from "@/components/Media/View/Scene";
import ManageImage from "@/components/Media/View/ManageImage";
import type { MediaItem, ThreeGalleryProps } from "@/utils/interfaces";

const CanvasGallery: React.FC<ThreeGalleryProps> = ({ mediaItems }) => {
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedItem(null);
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  return (
    <div>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        style={{
          width: "100vw",
          height: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
        }}
      >
        <Scene mediaItems={mediaItems} onSelect={setSelectedItem} />
        <OrbitControls
          enableRotate={false}
          enablePan={true}
          enableZoom={true}
          minDistance={-2}
          maxDistance={15}
          panSpeed={2.0}
          zoomSpeed={1.2}
          mouseButtons={{
            LEFT: THREE.MOUSE.PAN,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.ROTATE,
          }}
        />
      </Canvas>

      {selectedItem && (
        <ManageImage
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          onDeleteSuccess={() => {
            setSelectedItem(null);
            console.log(
              `deleted item ${
                selectedItem.filename || selectedItem.original_name
              } successfully`
            );
          }}
        />
      )}
    </div>
  );
};

export default CanvasGallery;
