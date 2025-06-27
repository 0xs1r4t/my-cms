"use client";

import React, { useState } from "react";
import { HiPlusCircle } from "react-icons/hi2";

import UploadMedia from "@/components/Media/Upload";
import CreatePost from "@/components/Post/Create";

const ActionsButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div>
      <HiPlusCircle
        className="m-2 text-5xl cursor-pointer"
        onClick={isOpen ? handleClose : handleOpen}
      />
      {isOpen && (
        <>
          <UploadMedia />
          <CreatePost />
        </>
      )}
    </div>
  );
};

export default ActionsButton;
