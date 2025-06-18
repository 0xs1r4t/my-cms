import { Fragment } from "react";
import { getAuthCookie } from "@/lib/cookies";
import { redirect } from "next/navigation";

import LogoutButton from "@/components/LogoutButton";

const UserPage = async ({ params }: { params: Promise<{ user: string }> }) => {
  const { user } = await params;
  const token = await getAuthCookie();

  if (!token) {
    console.log("No token found");
    redirect("/");
  }

  return (
    <Fragment>
      <h1 className="text-2xl font-bold">{` Welcome ${user}!`}</h1>
      <LogoutButton />
    </Fragment>
  );
};

export default UserPage;
