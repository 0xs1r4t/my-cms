"use client";

import React, { useState } from "react";
import { HiRss } from "react-icons/hi";

const CreatePost = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <HiRss className="text-4xl" onClick={isOpen ? handleClose : handleOpen} />
      {isOpen && <div>CreatePost</div>}
    </>
  );
};

export default CreatePost;
