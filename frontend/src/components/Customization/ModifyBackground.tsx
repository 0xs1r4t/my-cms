import React from "react";
import { FaRainbow } from "react-icons/fa6";

const ModifyBackground = () => {
  return (
    <button className="flex items-center gap-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
      <FaRainbow />
    </button>
  );
};

export default ModifyBackground;
