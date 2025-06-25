"use client";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React from "react";

const HeroSection = () => {
  const router = useRouter();
  const { data: session } = useSession();
  console.log(session);

  return (
    <header className="w-full border flex justify-center fixed top-0 z-10">
      <div className="flex justify-between py-5 wrapper ">
        <div className="">
          <h1></h1>
        </div>
        <div className="text-xl text-white font-semibold flex gap-10">
          {session ? (
            <>
              <p
                className=" cursor-pointer"
                onClick={() =>
                  signOut({
                    callbackUrl: "/login",
                    redirect: true,
                  })
                }
              >
                Logout
              </p>
              <p className="cursor-pointer" onClick={() => router.push('/create-market')}>Create Market</p>
            </>
          ) : (
            <>
              <p
                className="cursor-pointer"
                onClick={() => router.push("/signin")}
              >
                Signin
              </p>
              <p
                className=" cursor-pointer"
                onClick={() => router.push("/login")}
              >
                Login
              </p>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeroSection;
