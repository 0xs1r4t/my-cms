"use client";

import React, { MouseEventHandler, useEffect } from "react";
import { FaGithub } from "react-icons/fa";

const LoginButton = () => {
  useEffect(() => {
    if (typeof window !== "undefined") {
      console.log("LoginButton mounted on client");
    }
  }, []);

  const handleGitHubLogin: MouseEventHandler<HTMLButtonElement> = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`;
  };

  return (
    <button
      onClick={handleGitHubLogin}
      className="flex flex-row items-center gap-3 text-lg px-4 py-2 rounded-xl hover:shadow-md transition-shadow"
    >
      <FaGithub size={22} /> <span>Login with Github</span>
    </button>
  );
};

export default LoginButton;
