import { FormEvent } from "react";
import { axiosClient } from "../lib/axiosConfig";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AxiosError } from "axios";

export default function SignUp() {
  const navigate = useNavigate();
  async function handleSignUp(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const formdata = new FormData(ev.target as HTMLFormElement);
    const email = formdata.get("email") as string;
    const username = formdata.get("username") as string;
    const password = formdata.get("password") as string;
    try {
      if (email && password && username) {
        const response = await axiosClient.post("/signup", {
          email,
          password,
          username,
        });
        console.log(response.data);
        if (response.data.status === "success") {
          navigate("/");
        }
      } else {
        throw new Error("Email, username and password are required");
      }
    } catch (error) {
      console.log(error);
      if (error instanceof AxiosError) {
        toast.error(error.message);
      } else {
        toast.error(error as string);
      }
    }
  }
  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <section className="p-6 shadow-lg shadow-slate-400 border rounded-md">
        <form
          onSubmit={handleSignUp}
          action=""
          className="flex flex-col gap-4 w-80"
        >
          <div className="flex flex-col gap-1 ">
            <label htmlFor="username">Enter email</label>
            <input
              className="border p-2 rounded-sm w-full"
              type="email"
              required
              name="email"
              placeholder="email"
            />
          </div>
          <div className="flex flex-col gap-1 ">
            <label htmlFor="username">Enter username</label>
            <input
              className="border p-2 rounded-sm w-full"
              type="text"
              required
              name="username"
              placeholder="username"
            />
          </div>
          <div className="flex flex-col gap-1 ">
            <label htmlFor="password">Enter password</label>
            <input
              className="border p-2 rounded-sm w-full"
              type="password"
              required
              name="password"
              placeholder="password"
            />
          </div>
          <div className="flex justify-center">
            <button className="button bg-secondary text-white px-8">
              Sign Up
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
