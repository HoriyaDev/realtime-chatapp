"use client";



import { supabase } from "../lib/supabase";
import bcrypt from "bcryptjs";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Login = () => {

  const router = useRouter();

  const schema = yup.object({
    email: yup.string().email("Enter a valid email").required("Email is required"),
    password: yup.string().required("Password is required"),
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const handleLogin = async (data) => {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", data.email)
      .single();

    if (error || !user) {
      toast.error("User not found!");
      return;
    }

    const matched = bcrypt.compareSync(data.password, user.password);
    if (matched) {
      toast.success("Login successful!");
      setTimeout(() => router.push("/about"), 2000);
    } else {
      toast.error("Incorrect password!");
    }
  };
  
  
  return (
    <>
      <section className="min-h-screen w-full flex justify-center items-center bg-gray-100">
        <div className="w-full max-w-md p-6 bg-white shadow-lg rounded-lg">
          <h1 className="text-center text-2xl font-bold mb-6">
            Sign in to your account
          </h1>

          <form onSubmit={handleSubmit(handleLogin)}>
            <div className="relative mb-8">
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Email address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                {...register("email")}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
              />
              <p className="text-red-600">{errors.email?.message}</p>
            </div>

            <div className="relative mb-8">
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                {...register("password")} 
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
              />
              <p className="text-red-600">{errors.password?.message}</p>
            </div>

            <button
              type="submit"
              className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            >
              Login
            </button>

            

            <div className="mt-5 text-center">
              <p>
                Don't have an account?
                <Link href="/signup" className="font-bold">
                  {" "}
                  Sign up Here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default Login;