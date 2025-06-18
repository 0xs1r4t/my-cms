"use server";

import { cookies } from "next/headers";

export const setAuthCookie = async (token: string) => {
  const cookieStore = await cookies();
  cookieStore.set({
    name: "auth_token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
};

export const getAuthCookie = async (): Promise<string | undefined> => {
  const cookieStore = await cookies();
  return cookieStore.get("auth_token")?.value;
};

export const clearAuthCookie = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
};
