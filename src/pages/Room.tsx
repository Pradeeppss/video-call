import { useEffect, useRef, useState } from "react";
import ChatBoard from "../components/ChatBoard";
import { useNavigate, useParams } from "react-router-dom";
import {
  getAllUsers,
  getCurrentRoomId,
  joinRoom,
  setCurrentRoomId,
} from "../lib/socketService";

export type User = {
  username: string;
  id: string;
};

export default function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>(`user_${Date.now()}`);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const singleRef = useRef(false);
  useEffect(() => {
    if (singleRef.current || !roomId) return;
    const name = localStorage.getItem("username");
    if (name) {
      setUsername(name);
    } else {
      navigate("/");
      return;
    }
    joinMeeting(roomId, name);
    getAllUsers(setAllUsers);
    singleRef.current = true;
  });

  function joinMeeting(roomId: string, name: string) {
    const currRoomId = getCurrentRoomId();
    if (currRoomId !== roomId) {
      setCurrentRoomId(roomId);
      joinRoom(roomId, name);
    }
  }
  return (
    <div className="h-screen bg-gray-900 grid p-8">
      <section className="flex gap-4">
        <div className="flex-1 grid gap-2 room-grid">
          {allUsers.map((user) => {
            return (
              <div
                key={user.id}
                className="bg-gray-600 rounded-md flex-1 flex justify-center items-center relative"
              >
                <div className="h-20 w-20 flex justify-center items-center rounded-full bg-purple-500 text-white text-3xl capitalize">
                  {user.username[0]}
                </div>
                <p className="absolute bottom-2 left-2 text-white">
                  {user.username}
                </p>
              </div>
            );
          })}
        </div>
        <div className="w-72">
          <ChatBoard username={username} />
        </div>
      </section>
    </div>
  );
}
