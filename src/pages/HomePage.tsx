import { FormEvent, useState } from "react";
import Header from "../components/Header";
import { toast } from "react-toastify";
import { createUniqueId } from "../lib/helpers";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const [username, setUsername] = useState(
    localStorage.getItem("username") || ""
  );
  const [roomJoinID, setRoomJoinId] = useState("");
  const navigate = useNavigate();

  function handleUsernameSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (!username) {
      toast.error("Username required");
      return;
    }
    localStorage.setItem("username", username);
  }

  function handleJoinMeeting(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (!username || !roomJoinID) {
      toast.error("Username required");
      return;
    }
    localStorage.setItem("username", username);
    navigate("/room/" + roomJoinID);
  }
  function handleNewMeeting() {
    if (!username) {
      toast.error("Username required");
      return;
    }
    localStorage.setItem("username", username);
    const roomId = createUniqueId();
    navigator.clipboard.writeText(roomId);
    navigate("/room/" + roomId);
  }
  return (
    <section className=" h-screen flex flex-col">
      <Header />
      <div className=" flex flex-1 ">
        <div className="flex-1 border-r flex items-center justify-center">
          <div className="border p-6 shadow-lg shadow-gray-400 rounded-md">
            <form
              onSubmit={handleUsernameSubmit}
              className="flex  gap-2 justify-center items-center w-full pb-4 "
            >
              <input
                onChange={(ev) => setUsername(ev.target.value)}
                className="border flex-1 p-2 rounded-md w-1/2 max-w-96"
                type="text"
                placeholder="username"
                required
                name="username"
                value={username}
              />
              <button className="button bg-gray-600 text-white">
                Set username
              </button>
            </form>
            <hr />
            <button
              onClick={handleNewMeeting}
              className="button bg-primary text-white w-full mt-4"
            >
              Start New Meet
            </button>
            <p className="text-center my-3">Or</p>
            <form
              onSubmit={handleJoinMeeting}
              className="flex flex-col gap-2 items-center  justify-center w-full "
            >
              <div className="flex gap-2 w-full">
                <input
                  className="border flex-1 p-2 rounded-md w-1/2 max-w-96"
                  type="text"
                  placeholder="room id"
                  required
                  onChange={(ev) => setRoomJoinId(ev.target.value)}
                  value={roomJoinID}
                  name="room-id"
                />
                <button className="button bg-red-500 text-white ">
                  Join Meet
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
