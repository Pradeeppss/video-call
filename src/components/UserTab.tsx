import { useMemo } from "react";
import { ChatRoom, ChatUser } from "../types/userTypes";

export default function UserTab({
  room,
  me,
  index,
  getChatRoom,
}: {
  room: ChatRoom;
  me: string;
  index: number;
  getChatRoom: (index: number) => void;
}) {
  const user = useMemo(() => {
    if (room.userOne.email === me) {
      return room.userTwo;
    } else {
      return room.userOne;
    }
  }, [room]);
  function handleChatroom() {
    getChatRoom(index);
  }
  return (
    <button
      onClick={handleChatroom}
      className=" button w-full flex p-2 items-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-md"
    >
      <div className="rounded-full w-10 h-10 flex items-center justify-center border bg-white">
        {user.username[0]}
      </div>
      <div>{user.username}</div>
    </button>
  );
}
