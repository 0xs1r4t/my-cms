"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Image } from "@react-three/drei";
import * as THREE from "three";
import type { MediaItem, ThreeGalleryProps } from "@/utils/interfaces";

// Individual image component using drei Image
const ImagePlane = ({
  item,
  position,
  scale,
}: {
  item: MediaItem;
  position: [number, number, number];
  scale: number;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <Image
      ref={meshRef}
      url={item.public_url}
      position={position}
      scale={scale}
      transparent
      opacity={1}
      side={THREE.DoubleSide}
      toneMapped={false}
    />
  );
};

// Main gallery component
const GalleryScene = ({ mediaItems }: { mediaItems: MediaItem[] }) => {
  const { camera } = useThree();

  // Generate evenly distributed positions
  const imagePositions = useMemo(() => {
    if (!mediaItems.length) return [];

    return mediaItems.map((item, index) => {
      // Create a more even distribution across the screen
      const totalItems = mediaItems.length;

      // Use golden ratio for better distribution
      const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~137.5 degrees
      const radius = Math.sqrt(index) * 2; // Gradually increase radius
      const angle = index * goldenAngle;

      // Spread across a larger area
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      // Z-depth: alternate between closer and further for layering
      const z = (index % 2 === 0 ? 1 : -1) * (Math.random() * 2 + 1);

      // Scale: slightly random but consistent
      const scale = 2 + Math.random() * 1; // Between 2 and 3 (increased from 1.2-1.8)

      return {
        item,
        position: [x, y, z] as [number, number, number],
        scale,
      };
    });
  }, [mediaItems]);

  // Camera setup
  useEffect(() => {
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return (
    <>
      <ambientLight intensity={1} />

      {/* Render image planes */}
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

// Custom controls component with mouse drag support
const CustomControls = () => {
  const { camera } = useThree();
  const controlsRef = useRef<React.ComponentRef<typeof OrbitControls>>(null);

  useEffect(() => {
    if (controlsRef.current) {
      // Enable panning with mouse drag
      controlsRef.current.enablePan = true;
      controlsRef.current.enableZoom = true;
      controlsRef.current.enableRotate = false;

      // Enable damping for smooth movement
      controlsRef.current.enableDamping = true;
      controlsRef.current.dampingFactor = 0.05;

      // Set limits
      controlsRef.current.minDistance = 2;
      controlsRef.current.maxDistance = 10;

      // Configure mouse buttons for panning
      controlsRef.current.mouseButtons = {
        LEFT: THREE.MOUSE.PAN,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.ROTATE,
      };

      // Increase pan speed for better responsiveness
      controlsRef.current.panSpeed = 2.0;
    }
  }, []);

  return (
    <OrbitControls
      ref={controlsRef}
      enableRotate={false}
      enablePan={true}
      enableZoom={true}
      minDistance={2}
      maxDistance={20}
      panSpeed={2.0}
      zoomSpeed={1.2}
      mouseButtons={{
        LEFT: THREE.MOUSE.PAN,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.ROTATE,
      }}
    />
  );
};

const ThreeGallery: React.FC<ThreeGalleryProps> = ({ mediaItems }) => {
  return (
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
      <CustomControls />
    </Canvas>
  );
};

export default ThreeGallery;
