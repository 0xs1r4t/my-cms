"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { setAuthCookie } from "@/lib/cookies";
import { useUserStore } from "@/store/useStore";

import { CallbackQuerySchema, UserResponseSchema } from "@/utils/zodSchemas";

const CallbackContent = () => {
  const router = useRouter();
  const params = useSearchParams();
  const setUser = useUserStore((s) => s.setUser);

  useEffect(() => {
    const handleCallback = async () => {
      const access_token = params.get("access_token");

      try {
        // ✅ Validate query param
        const validated = CallbackQuerySchema.parse({
          access_token,
        });

        // ✅ Set auth cookie
        setAuthCookie(validated.access_token);

        // ✅ Fetch user info
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${validated.access_token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch user info");
        }

        const data = await res.json();

        // ✅ Validate response
        const user = UserResponseSchema.parse(data);

        // ✅ Save to store
        setUser(user);

        // ✅ Redirect
        router.push(`/${user.username}`);
      } catch (e) {
        console.error("Login failed", e);
        router.push("/");
      }
    };

    handleCallback();
  }, [params, router, setUser]);

  return <div className="text-center mt-10">Logging you in...</div>;
};

const CallbackPage = () => {
  return (
    <Suspense
      fallback={<div className="text-center mt-10">Loading page...</div>}
    >
      <CallbackContent />
    </Suspense>
  );
};

export default CallbackPage;
