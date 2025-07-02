import { Html } from "@react-three/drei";
import Image from "next/image";

import { MediaItem } from "@/utils/interfaces";

const ImagePlane = ({
  item,
  position,
  scale,
}: {
  item: MediaItem;
  position: [number, number, number];
  scale: number;
}) => {
  return (
    <Html
      position={position}
      transform
      distanceFactor={1} // Controls size in 3D space
      occlude // Optional: allows occlusion by other 3D objects
    >
      <div
        style={{
          width: `${scale * 200}px`, // Adjust as needed
          height: "auto",
          pointerEvents: "auto", // Allow mouse events
        }}
      >
        <Image
          src={item.public_url}
          alt={item.original_name || item.filename || "image"}
          width={1024}
          height={1024}
          style={{
            objectFit: "contain",
            width: "100%",
            height: "auto",
          }}
          loading="lazy"
        />
      </div>
    </Html>
  );
};

export default ImagePlane;
