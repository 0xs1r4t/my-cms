import { Html } from "@react-three/drei";
import Image from "next/image";
import { LazyMotion } from "motion/react";
import * as m from "motion/react-m";

import { MediaItem } from "@/utils/interfaces";

const loadFeatures = () => import("@/lib/features").then((res) => res.default);

const ImagePlane = ({
  item,
  position,
  scale,
  onClick,
}: {
  item: MediaItem;
  position: [number, number, number];
  scale: number;
  onClick?: (item: MediaItem) => void;
}) => {
  return (
    <Html position={position} distanceFactor={1} transform occlude>
      <LazyMotion features={loadFeatures}>
        <m.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.1 }}
          whileHover={{ scale: 1.5 }}
          onClick={() => onClick?.(item)}
        >
          <Image
            src={item.public_url}
            alt={item.original_name || item.filename || "image"}
            width={512}
            height={512}
            className={` w-[${scale * 50}px] h-auto cursor-pointer`} // w-[${scale * 50}px] h-auto pointer-events-auto hover:border-2 hover:border-pink-500 hover:drop-shadow-[0_0_10px_rgba(255,20,147,0.5)]
            loading="lazy"
          />
        </m.div>
      </LazyMotion>
    </Html>
  );
};

export default ImagePlane;
