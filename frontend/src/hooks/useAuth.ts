"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface User {
  id: string;
  username: string;
  email: string;
  avatar_url: string;
  name?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  const logout = useCallback(() => {
    setUser(null);
    document.cookie =
      "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/");
  }, [router]);

  const fetchUser = useCallback(
    async (token: string) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          logout();
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        logout();
      } finally {
        setLoading(false);
      }
    },
    [logout]
  );

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (token) {
      document.cookie = `auth_token=${token}; path=/; max-age=${
        7 * 24 * 60 * 60
      }; secure; samesite=strict`;

      const url = new URL(window.location.href);
      url.searchParams.delete("token");
      router.replace(url.pathname);

      fetchUser(token);
    } else if (error) {
      console.error("Auth error:", error);
      setLoading(false);
    } else {
      const existingToken = getCookie("auth_token");
      if (existingToken) {
        fetchUser(existingToken);
      } else {
        setLoading(false);
      }
    }
  }, [searchParams, router, fetchUser]);

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  };

  return { user, loading, logout };
};
