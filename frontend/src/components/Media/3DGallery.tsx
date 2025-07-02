"use client";

import React, { useMemo, useEffect } from "react";

import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import ImagePlane from "@/components/Media/ImagePlane";
import type { MediaItem, ThreeGalleryProps } from "@/utils/interfaces";

const GalleryScene = ({ mediaItems }: { mediaItems: MediaItem[] }) => {
  const { camera, viewport } = useThree();

  const imagePositions = useMemo(() => {
    if (!mediaItems.length) return [];
    console.log(
      `NO.OF IMAGES: ${mediaItems.length} \nVIEWPORT:\nwidth: ${viewport.width}, height: ${viewport.height}`
    );

    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~137.5°
    const maxIndex = mediaItems.length - 1;
    const maxX = viewport.width * 0.45;
    const maxY = viewport.height * 0.45;

    return mediaItems.map((item, index) => {
      const t = index / maxIndex;

      const radius = Math.pow(t, 0.75);
      // const radius = t;
      // const radius = Math.sqrt(t);

      const angle = index * goldenAngle;

      const x = Math.cos(angle) * radius * maxX;
      const y = Math.sin(angle) * radius * maxY;

      return {
        item,
        position: [x, y, 0] as [number, number, number],
        scale: 2,
      };
    });
  }, [mediaItems, viewport.width, viewport.height]);

  // Camera setup
  useEffect(() => {
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return (
    <>
      <ambientLight intensity={1} />
      {imagePositions.map(({ item, position, scale }) => (
        <ImagePlane
          key={item.id}
          item={item}
          position={position}
          scale={scale}
        />
      ))}
    </>
  );
};

const ThreeGallery: React.FC<ThreeGalleryProps> = ({ mediaItems }) => {
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
        <GalleryScene mediaItems={mediaItems} />
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
    </div>
  );
};

export default ThreeGallery;
