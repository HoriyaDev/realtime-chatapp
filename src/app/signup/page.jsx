"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";
import bcrypt from "bcryptjs";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from 'react-hot-toast';

const Signup = () => {
  const [image, setImage] = useState(null);
  const router = useRouter();

  // ✅ Validation Schema
  const schema = yup.object({
    UserName: yup.string().required("Name is required"),
    email: yup.string().email("Enter a valid email").required("Email is required"),
    password: yup.string().required("Password is required"),
    confirmPassword: yup.string().oneOf([yup.ref("password")], "Passwords must match").required("Confirm Password is required"),
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(URL.createObjectURL(file)); // Convert to preview
  };

  // ✅ Handle Form Errors
  const handleFormError = (errors) => {
    if (Object.keys(errors).length > 0) {
      toast.error("Please fix the errors before submitting!");
    }
  };

  // ✅ Submit Function
  const onSubmitForm = async (data) => {
    const hashedPassword = bcrypt.hashSync(data.password, 10);

    const { error } = await supabase.from("users").insert({
      name: data.UserName,
      email: data.email,
      password: hashedPassword,
      profile_pic: image,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Sign Up Successful!");
    setTimeout(() => router.push("/login"), 2000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white px-8 py-4 rounded-lg shadow-lg w-1/2">
        {/* Avatar Upload */}
        <form onSubmit={handleSubmit(onSubmitForm, handleFormError)}>
          <div className="flex flex-col items-center mb-4">
            <label htmlFor="avatarUpload" className="cursor-pointer">
              <img
                src={image || "default-user.png"}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover"
              />
            </label>
            <input
              id="avatarUpload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          <h2 className="text-2xl font-bold text-center mb-4">
            Sign up to your account
          </h2>

          {/* Name & Email Fields */}
          <div className="flex flex-col md:flex-row gap-4 mb-5">
            <div className="flex-1">
              <label className="block mb-1 font-bold text-gray-700">Name</label>
              <input
                type="text"
                placeholder="John Doe"
                {...register("UserName")}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-red-600">{errors.UserName?.message}</p>
            </div>

            <div className="flex-1">
              <label className="block mb-1 font-bold text-gray-700">
                Email address
              </label>
              <input
                type="email"
                {...register("email")}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="john.doe@company.com"
              />
              <p className="text-red-600">{errors.email?.message}</p>
            </div>
          </div>

          {/* Password Fields */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block mb-1 font-bold text-gray-700">
                Password:
              </label>
              <input
                type="password"
                {...register("password")}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="********"
              />
              <p className="text-red-600">{errors.password?.message}</p>
            </div>

            <div className="flex-1">
              <label className="block mb-1 font-bold text-gray-700">
                Confirm Password:
              </label>
              <input
                type="password"
                {...register("confirmPassword")}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="********"
              />
              <p className="text-red-600">{errors.confirmPassword?.message}</p>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="flex items-center my-2">
            <input type="checkbox" className="mr-2" />
            <label>
              I agree with the{" "}
              <a href="#" className="text-blue-600">
                terms and conditions
              </a>
              .
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Submit
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center mt-3">
          Already have an account?{" "}
          <a href="/" className="font-bold text-blue-600">
            Login Here
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;