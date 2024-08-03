import { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { axiosClient } from "../lib/axiosConfig";

export default function Login() {
  const navigate = useNavigate();
  async function handleLogin(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const formdata = new FormData(ev.target as HTMLFormElement);
    const email = formdata.get("email") as string;
    const password = formdata.get("password") as string;
    try {
      if (email && password) {
        const response = await axiosClient.post("/login", { email, password });
        if (response.data.status === "success") {
          const { user } = response.data;
          localStorage.setItem("username", user.username);
          localStorage.setItem("email", user.email);
          navigate("/home", { state: response.data.user });
        }
      } else {
        throw new Error("Email and password are required");
      }
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <section className="p-6 shadow-lg shadow-slate-400 border rounded-md">
        <form
          onSubmit={handleLogin}
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
            <button className="button bg-primary text-white px-8">Login</button>
          </div>
        </form>
        <div className="text-center pt-2">
          No account? &nbsp;
          <a href="/signup" className="text-primary">
            Sign Up
          </a>
        </div>
      </section>
    </div>
  );
}
