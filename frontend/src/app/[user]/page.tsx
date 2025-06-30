import { Fragment } from "react";
import { redirect } from "next/navigation";

import { getAuthCookie } from "@/lib/cookies";

import LogoutButton from "@/components/Buttons/Logout";
import ActionsButton from "@/components/Buttons/Actions";

import MediaGallery from "@/components/Media/Gallery";

const UserPage = async ({ params }: { params: Promise<{ user: string }> }) => {
  const { user } = await params;
  const token = await getAuthCookie();

  if (!token) {
    console.log("No token found");
    redirect("/");
  }

  return (
    <Fragment>
      {/* UI Elements - positioned above gallery */}
      <div className="relative z-10 flex justify-between items-center mb-8 p-4">
        <h1 className="text-3xl font-bold">{`Welcome ${user}!`}</h1>
        <div className="flex items-center gap-4">
          <ActionsButton />
          <LogoutButton />
        </div>
      </div>

      {/* Gallery component */}
      <MediaGallery />
    </Fragment>
  );
};

export default UserPage;
