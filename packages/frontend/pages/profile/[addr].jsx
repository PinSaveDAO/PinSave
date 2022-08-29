// import React, { useState, useEffect } from "react";
//import { useRouter } from "next/router";

const ProfilePage = ({ user }) => {
  //const router = useRouter();
  //const { addr } = router.query;

  return (
    <div>
      <pre>{JSON.stringify(user, null, 4)}</pre>
    </div>
  );
};

export async function getServerSideProps(context) {
  const { addr } = context.params;
  const user = await fetch(`http://evm.pinsave.app/api/lukso/l14/${addr}`);
  const data = await user.json();

  if (!data) {
    return {
      notFound: true,
    };
  }

  return {
    props: { user: data },
  };
}

export default ProfilePage;
