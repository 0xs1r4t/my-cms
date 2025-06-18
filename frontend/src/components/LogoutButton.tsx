"use client";

import { useRouter } from "next/navigation";
import { clearAuthCookie } from "@/lib/cookies";

const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = () => {
    clearAuthCookie();
    router.push("/");
  };

  return (
    <button
      onClick={handleLogout}
      className="flex flex-row items-center gap-3 text-lg px-4 py-2 rounded-xl hover:shadow-md transition-shadow"
    >
      Log out
    </button>
  );
};

export default LogoutButton;
