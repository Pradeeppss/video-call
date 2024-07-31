import { useNavigate } from "react-router-dom";
import { createRoom, joinRoom } from "../lib/socketService";
import { FormEvent } from "react";

export default function Home() {
  const navigate = useNavigate();

  function handleNewMeeting(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const formdata = new FormData(ev.target as HTMLFormElement);
    const inputValue = formdata.get("username") as string;
    localStorage.setItem("username", inputValue);
    const roomId = createRoom();
    navigator.clipboard.writeText(roomId);
    navigate("/room/" + roomId);
  }
  function handleMeetingJoin(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const formdata = new FormData(ev.target as HTMLFormElement);
    const inputValue = formdata.get("username") as string;
    const roomId = formdata.get("room-id") as string;
    localStorage.setItem("username", inputValue);
    navigate("/room/" + roomId);
  }
  return (
    <div className="h-screen flex ">
      <div className="flex-1 border-r flex items-center">
        <form
          onSubmit={handleNewMeeting}
          className="flex flex-col gap-2 justify-center items-center w-full"
        >
          <input
            className="border p-2 rounded-md w-1/2 max-w-96"
            type="text"
            placeholder="username"
            required
            name="username"
            defaultValue={localStorage.getItem("username") || ""}
          />
          <button
            disabled={!localStorage.getItem("username")}
            className="button bg-primary text-white"
          >
            Start New Meet
          </button>
        </form>
      </div>
      <div className="flex-1 flex items-center">
        <form
          onSubmit={handleMeetingJoin}
          className="flex flex-col gap-2 items-center  justify-center w-full"
        >
          <input
            className="border p-2 rounded-md w-1/2 max-w-96"
            type="text"
            placeholder="username"
            required
            name="username"
            defaultValue={localStorage.getItem("username") || ""}
          />
          <input
            className="border p-2 rounded-md w-1/2 max-w-96"
            type="text"
            placeholder="room id"
            required
            name="room-id"
          />
          <button className="button bg-red-500 text-white ">Join Meet</button>
        </form>
      </div>
    </div>
  );
}
