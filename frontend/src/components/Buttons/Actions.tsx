"use client";

import React, { useState } from "react";
import { HiPlusCircle } from "react-icons/hi2";

import UploadMedia from "@/components/Media/Upload";
import CreatePost from "@/components/Post/Create";
import ModifyBackground from "@/components/Customization/ModifyBackground";

const ActionsButton = ({ className }: { className?: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className={className}>
      <HiPlusCircle
        className="text-5xl cursor-pointer"
        onClick={isOpen ? handleClose : handleOpen}
      />
      {isOpen && (
        <>
          <UploadMedia />
          <CreatePost />
          <ModifyBackground />
        </>
      )}
    </div>
  );
};

export default ActionsButton;
