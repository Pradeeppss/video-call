import { useEffect, useMemo } from "react";
import { ChatRoom } from "../types/userTypes";
import { useSocket } from "../context/Socket";

export default function UserTab({
  room,
  me,
  index,
  getChatRoom,
  calling,
}: {
  room: ChatRoom;
  me: string;
  index: number;
  getChatRoom: (index: number) => void;
  calling: boolean;
}) {
  const { notifStatus } = useSocket();
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
  useEffect(() => {
    if (calling) {
      if (notifStatus === "granted") {
        new Notification("VideoChat", {
          body: user.email + "is calling",
        });
      }
    }
  }, [calling]);
  return (
    <button
      onClick={handleChatroom}
      className=" button relative w-full flex p-2 items-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-md"
    >
      <div className="rounded-full w-10 h-10 flex items-center justify-center border bg-white">
        {user.username[0]}
      </div>
      <div>{user.username}</div>
      {calling && (
        <>
          <p className="absolute w-2 h-2 rounded-full bg-red-600 top-0 right-0 animate-ping"></p>
          <p className="absolute w-2 h-2 rounded-full bg-red-600 top-0 right-0 "></p>
        </>
      )}
    </button>
  );
}
