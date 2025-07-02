import { Fragment } from "react";
import { redirect } from "next/navigation";

import { getAuthCookie } from "@/lib/cookies";
import LogoutButton from "@/components/Buttons/Logout";
import ActionsButton from "@/components/Buttons/Actions";
import MediaGallery from "@/components/Media/View/Gallery";

const UserPage = async ({ params }: { params: Promise<{ user: string }> }) => {
  const { user } = await params;
  const token = await getAuthCookie();

  if (!token) {
    console.log("No token found");
    redirect("/");
  }

  return (
    <Fragment>
      <LogoutButton className="absolute top-0 right-0 z-10 p-4 m-4" />
      <MediaGallery />
      <div className="absolute top-0 left-0 z-10 p-4">
        <h1 className="text-xl font-bold">{`${user}'s collection`}</h1>
      </div>
      <ActionsButton className="absolute bottom-0 left-0 z-10 p-3" />
    </Fragment>
  );
};

export default UserPage;
