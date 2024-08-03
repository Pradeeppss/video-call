import { useMemo } from "react";
import { ChatRoom } from "../types/userTypes";
import { FaVideo } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

export default function ChatHead({ room, me }: { room: ChatRoom; me: string }) {
  const navigate = useNavigate();
  const user = useMemo(() => {
    if (room.userOne.email === me) {
      return room.userTwo;
    } else {
      return room.userOne;
    }
  }, [room]);

  function handleVideoCall() {
    navigate(`/room/${room._id}`);
  }
  return (
    <header className="border-b p-2 flex justify-between bg-blue-200 ">
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
    </header>
  );
}
