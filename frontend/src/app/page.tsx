import React, { Fragment, Suspense } from "react";
import LoginButton from "@/components/Buttons/Login";

const Home = () => {
  return (
    <Fragment>
      <Suspense fallback={<div>Loading page...</div>}>
        <LoginButton />
      </Suspense>
    </Fragment>
  );
};

export default Home;
