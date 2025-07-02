import { useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";

import ImagePlane from "@/components/Media/View/ImagePlane";
import { MediaItem } from "@/utils/interfaces";

const Scene = ({
  mediaItems,
  onSelect,
}: {
  mediaItems: MediaItem[];
  onSelect: (item: MediaItem) => void;
}) => {
  const { camera, viewport } = useThree();

  const imagePositions = useMemo(() => {
    if (!mediaItems.length) return [];
    // console.log(
    //   `NO.OF IMAGES: ${mediaItems.length} \nVIEWPORT:\nwidth: ${viewport.width}, height: ${viewport.height}`
    // );

    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~137.5°
    const maxIndex = mediaItems.length - 1;
    const maxX = viewport.width * 0.45;
    const maxY = viewport.height * 0.45;

    return mediaItems.map((item, index) => {
      const t = index / maxIndex;

      const radius = Math.pow(t, 0.55);
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
          onClick={onSelect}
        />
      ))}
    </>
  );
};

export default Scene;
