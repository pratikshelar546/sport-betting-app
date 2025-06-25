"use client";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "./ui/Button";
import { ErrorLabel } from "./ui/ErrorLabel";
import { Input } from "./ui/Input";

const Login = () => {
  const creadntials = useRef("");
  const password = useRef("");

  const router = useRouter();
  const { data: session } = useSession();
  console.log(session, "session");

  const [requriedError, setRequriedError] = useState({
    creadntials: false,
    password: false,
  });

  const handleSubmit = async () => {
    const laoding = toast.loading("Signing in...");
    if (!creadntials.current)
      setRequriedError((prev) => ({ ...prev, creadntials: true }));
    if (!password.current)
      setRequriedError((prev) => ({ ...prev, password: true }));

    if (!creadntials.current || !password.current) {
      toast.dismiss(laoding);
      toast.error("Please fill all the required fields");
      return;
    }

    const data = {
      creadntials: creadntials.current,
      password: password.current,
      redirect: false,
    };
    try {
      const res = await signIn("credentials", data);
      console.log(res, "res");
      toast.dismiss(laoding);
      if (!res?.error) {
        router.push("/");
        toast.success("Login successful");
      }
      else if (res?.status === 404) {
        toast.error(" User not found!");
      }
      else if (res?.status === 401) {
        toast.error("Invalid creadentials, Try again!");
      }
      else if (res?.status === 400) {
        toast.error("Missing Credentials");
      }
      else if (res?.status === 500) {
        toast.error("Internal Server Error");
      } else {
        toast.error("Something went wrong");
      }
    } catch (error: any) {
      toast.dismiss(laoding);
      toast.error(error.response.data.message);
    }
  };

  return (
    <section className="wrapper flex-col min-h-screen">
      <div className="flex flex-col shadow-lg p-5 border-2 max-w-xl w-full h-full justify-center items-center">
        <div className="text-center gap-2 flex flex-col ">
          <h1 className="text-base md:text-xl lg:text-4xl font-semibold ">
            Welcome to betting app
          </h1>
          <p className="text-sm md:text-lg lg:text-xl ">
            You can win or lose betting on sports
          </p>
        </div>

        <div className="flex flex-col space-y-4 w-full p-5">
          <Input
            type="text"
            placeholder="Enter your Email id or Phone number"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              (creadntials.current = e.target.value)
            }
            label="Phone number/Email"
          />
          {requriedError.creadntials && (
            <ErrorLabel message="Phone number/Email is required" />
          )}
          <Input
            type="password"
            placeholder="Enter Password"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              (password.current = e.target.value)
            }
            label="Password"
          />

          {requriedError.password && (
            <ErrorLabel message="Password did not match" />
          )}

          <Button
            label="Sign In"
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleSubmit}
          />
        </div>
      </div>
    </section>
  );
};

export default Login;
