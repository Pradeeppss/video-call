import { useNavigate } from "react-router-dom";
import socket, { createRoom } from "../lib/socketService";
import { FormEvent } from "react";

export default function Home() {
  const navigate = useNavigate();

  function handleNewMeeting() {
    const username = localStorage.getItem("username");
    if (!username) return;
    const roomId = createRoom(username);
    navigate("/room/" + roomId);
  }
  function handleFormSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const formdata = new FormData(ev.target as HTMLFormElement);
    const inputValue = formdata.get("username") as string;
    localStorage.setItem("username", inputValue);
  }
  return (
    <div className="h-screen flex flex-col gap-4 justify-center items-center">
      <form
        onSubmit={handleFormSubmit}
        className="flex gap-2 justify-center w-full"
      >
        <input
          className="border p-2 rounded-md w-1/2 max-w-96"
          type="text"
          placeholder="username"
          required
          name="username"
          defaultValue={localStorage.getItem("username") || ""}
        />
        <button className="button bg-gray-300 ">Set Username</button>
      </form>
      <button
        onClick={handleNewMeeting}
        disabled={!localStorage.getItem("username")}
        className="button bg-primary text-white"
      >
        Start New Meet
      </button>
    </div>
  );
}
