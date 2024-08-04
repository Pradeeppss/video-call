import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Header from "../components/Header";
import { toast } from "react-toastify";
import { getLocalEmail, getLocalUsername } from "../lib/helpers";
import ChatBoard from "../components/ChatBoard";
import { ChatRoom, ChatUser } from "../types/userTypes";
import { axiosClient } from "../lib/axiosConfig";
import UserTab from "../components/UserTab";
import { FaPlus } from "react-icons/fa6";
import ChatHead from "../components/ChatHead";
import { useSocket } from "../context/Socket";
import NotficationBox from "../components/NotificationBox";

export default function HomePage() {
  const [username, email] = useMemo(() => {
    return [getLocalUsername(), getLocalEmail()];
  }, []);
  const { socket } = useSocket();
  const [allUsers, setAllusers] = useState<ChatUser[]>([]);
  const [allRooms, setAllRooms] = useState<ChatRoom[]>([]);
  const [callRequests, setCallRequests] = useState<string[]>([]);
  const { currRoom, setCurrRoom } = useSocket();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    socket.emit("user-online", email);
    socket.on("call-request", handleCallRequest);
    socket.on("left-room", handleCallCancel);
    getAllusers();
    getAllChatRooms();
    return () => {
      socket.off("call-request", handleCallRequest);
      socket.off("left-room", handleCallCancel);
    };
  }, []);
  function handleCallRequest(roomId: string) {
    const newReq = callRequests.concat(roomId);
    setCallRequests(newReq);
  }

  function handleCallCancel(roomId: string) {
    console.log("call cancelled");
    const newReq = callRequests.filter((Id) => Id !== roomId);
    setCallRequests(newReq);
  }
  async function getAllusers() {
    try {
      const response = await axiosClient.get("/users");
      if (response.data.status === "success") {
        const users = response.data.data as ChatUser[];
        const otherUsers = users.filter((user) => user.email !== email);
        setAllusers(otherUsers);
      }
    } catch (error) {
      console.log(error);
    }
  }
  async function getAllChatRooms() {
    try {
      const response = await axiosClient.get(`/rooms?email=${email}`);
      if (response.data.status === "success") {
        const rooms = response.data.data as ChatRoom[];
        setAllRooms(rooms);
      }
    } catch (error) {
      console.log(error);
    }
  }
  async function getChatroom(index: number) {
    const currentRoom = allRooms[index];
    setCurrRoom(currentRoom);
  }
  function handlechatRoomRequest(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const formdata = new FormData(ev.target as HTMLFormElement);
    const userEmail = formdata.get("chat-email") as string;
    if (userEmail) {
      const viable = checkRoomViability(userEmail);
      if (viable) {
        console.log("creating room");
        createChatRoom(userEmail);
      } else {
        toast.warning("room already exists");
      }
    }
    //@ts-expect-error
    inputRef.current.value = "";
  }
  function checkRoomViability(userEmail: string) {
    const exist = allUsers.filter(
      (user) => user.email === userEmail && user.email !== email
    );
    if (exist.length === 0) {
      return false;
    }
    const rooms = allRooms.filter((room) => {
      if (
        room.userOne.email === userEmail ||
        room.userTwo.email === userEmail
      ) {
        return true;
      }
      return false;
    });
    if (rooms.length > 0) {
      return false;
    }
    return true;
  }
  async function createChatRoom(userEmail: string) {
    try {
      const payload = { emailOne: email, emailTwo: userEmail };
      const response = await axiosClient.post("/create", payload);
      if (response.data.status === "success") {
        const newRoom = response.data.data;
        const rooms = allRooms.concat(newRoom);
        setAllRooms(rooms);
        setCurrRoom(newRoom);
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <section className=" h-screen flex ">
      <section className="border w-72 relative">
        <Header username={username} />
        <form onSubmit={handlechatRoomRequest} className="p-2 flex gap-2">
          <input
            name="chat-email"
            className="border flex-1 px-2 rounded-md"
            type="text"
            placeholder="add email"
            required
            ref={inputRef}
          />
          <button className="button bg-gray-100 py-3 px-3 ">
            <FaPlus />
          </button>
        </form>
        <div className="p-2 flex flex-col gap-2 ">
          {allRooms.map((room, index) => {
            return (
              <UserTab
                getChatRoom={getChatroom}
                key={room._id}
                index={index}
                me={email}
                room={room}
                calling={callRequests.includes(room._id)}
              />
            );
          })}
        </div>
        <div className="absolute bottom-0 w-full ">
          <NotficationBox />
        </div>
      </section>
      <section className="flex-1">
        {currRoom ? (
          <div className="h-full flex flex-col">
            <ChatHead
              room={currRoom}
              me={email}
              calling={callRequests.includes(currRoom._id)}
              cancelCall={handleCallCancel}
            />
            <div className="h-[calc(100%-3.7rem)]">
              <ChatBoard room={currRoom} />
            </div>
          </div>
        ) : (
          <div className="text-2xl w-full h-full flex items-center justify-center">
            Welcome!
          </div>
        )}
      </section>
    </section>
  );
}
