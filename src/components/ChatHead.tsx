import { useMemo } from "react";
import { ChatRoom } from "../types/userTypes";
import { FaPhone, FaPhoneSlash, FaVideo } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/Socket";

export default function ChatHead({
  room,
  me,
  calling,
  cancelCall,
}: {
  room: ChatRoom;
  me: string;
  calling: boolean;
  cancelCall: (roomId: string) => void;
}) {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const otherUser = useMemo(() => {
    if (room.userOne.email === me) {
      return room.userTwo;
    } else {
      return room.userOne;
    }
  }, [room]);
  const user = useMemo(() => {
    if (room.userOne.email === me) {
      return room.userTwo;
    } else {
      return room.userOne;
    }
  }, [room]);

  function handleVideoCall() {
    if (!calling) {
      socket.emit("make-call", room._id, me, otherUser.email);
    }
    navigate(`/room/${room._id}`);
  }
  function handleCallCancel() {
    socket.emit("cancel-call", room._id, me);
    cancelCall(room._id);
  }
  return (
    <header className="border-b p-2 flex justify-between bg-blue-200 relative">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 border rounded-full bg-white flex items-center justify-center">
          {user.username[0]}
        </div>
        <p>{user.username}</p>
      </div>
      <button
        onClick={handleVideoCall}
        className="button hover:bg-blue-100 text-gray-700"
      >
        <FaVideo size={23} />
      </button>
      {calling && (
        <div className="absolute animate-bounce hover:animate-none bg-white flex items-center rounded-full shadow-md -bottom-3/4 left-[calc(50%-2rem)]  ">
          <button
            onClick={handleVideoCall}
            className="button rounded-full text-green-600 hover:bg-gray-100"
          >
            <FaPhone size={20} />
          </button>
          <button
            onClick={handleCallCancel}
            className="button rounded-full text-red-500 hover:bg-gray-100"
          >
            <FaPhoneSlash size={25} />
          </button>
        </div>
      )}
    </header>
  );
}
