import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { FaTrash } from "react-icons/fa";
import {
  createUniqueId,
  getLocalEmail,
  getLocalUsername,
} from "../lib/helpers";
import { useSocket } from "../context/Socket";
import { ChatRoom } from "../types/userTypes";
import { useQuery } from "react-query";
import { axiosClient } from "../lib/axiosConfig";

type messageItem = {
  user: string;
  userEmail: string;
  message: string;
  id: string;
  deletable: boolean;
  deleted: boolean;
};
type PrevMessage = {
  roomId: string;
  from: string;
  message: string;
  _id: string;
};
const deleteTime = 2 * 60;
export default function ChatBoard({ room }: { room: ChatRoom }) {
  const [username, email] = useMemo(() => {
    return [getLocalUsername(), getLocalEmail()];
  }, []);
  const { socket } = useSocket();
  const [messages, setMessages] = useState<messageItem[]>([]);
  const [prevMessages, setPrevMessages] = useState<PrevMessage[]>([]);
  const [prevPending, setPrevPending] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const allMessages = useQuery({
    queryKey: ["all-messages", room],
    queryFn: () => {
      return axiosClient.get(`/messages?room=${room._id}`);
    },
    refetchOnWindowFocus: false,
  });
  useEffect(() => {
    if (allMessages.isLoading || allMessages.isError) {
      setPrevPending(true);
    } else if (allMessages.data) {
      const { data } = allMessages.data.data;
      setPrevMessages(data);
      setPrevPending(false);
    }
  }, [allMessages.isLoading, allMessages.data, allMessages.isError]);

  useEffect(() => {
    socket.emit("join-room", room._id, username, email);
    socket.on("message", handleMessageRecieve);
    socket.on("delete-message", handleMessageDeletion);
    return () => {
      socket.off("message", handleMessageRecieve);
      socket.off("delete-message", handleMessageDeletion);
    };
  });
  function handleMessageRecieve(
    message: string,
    messageId: string,
    user: string,
    userEmail: string
  ) {
    setMessages((prev) => {
      return [
        ...prev,
        {
          message,
          id: messageId,
          user,
          userEmail,
          deletable: true,
          deleted: false,
        },
      ];
    });
    messageTimer(messageId);
  }
  function handleMessageDeletion(messageId: string) {
    setMessages((prev) => {
      return prev.map((message) => {
        if (message.id === messageId) {
          message.deleted = true;
        }
        return message;
      });
    });
  }

  function messageTimer(messageId: string) {
    setTimeout(() => {
      setMessages((prev) => {
        return prev.map((message) => {
          if (message.id === messageId) {
            message.deletable = false;
          }
          return message;
        });
      });
    }, deleteTime * 1000);
  }
  useEffect(() => {
    if (chatRef.current) {
      const lastMessage = chatRef.current.lastElementChild;
      lastMessage?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  function handleSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const formdata = new FormData(ev.target as HTMLFormElement);
    const inputValue = formdata.get("message") as string;
    socket.emit(
      "message",
      room._id,
      inputValue,
      createUniqueId(),
      username,
      email
    );
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }
  function handledeleteRequest(index: number) {
    const messageId = messages[index].id;
    socket.emit("message-delete", room._id, messageId);
  }
  return (
    <div className="flex flex-col gap-2 bg-slate-100 h-full p-2 rounded-md ">
      <div
        ref={chatRef}
        className="flex-1  flex flex-col gap-3  p-4 overflow-auto max-h-[calc(100%-3rem)] no-scroll  "
      >
        {prevPending ? (
          <div>Loading. . .</div>
        ) : (
          <>
            {prevMessages.map((message) => {
              return (
                <div
                  key={message._id}
                  className={`flex flex-col gap-[1px] ${
                    email === message.from ? "items-end" : "items-start"
                  }`}
                >
                  <p
                    className={`${
                      email === message.from ? "bg-blue-200" : "bg-white"
                    } rounded-full py-1 px-3 w-fit  border`}
                  >
                    {message.message}
                  </p>
                </div>
              );
            })}
          </>
        )}
        {messages.map((message, index) => {
          return (
            <div
              key={index}
              className={`flex flex-col gap-[1px] ${
                email === message.userEmail ? "items-end" : "items-start"
              }`}
            >
              {message.deleted ? (
                <p className="text-xs text-gray-500">
                  <i>{message.user}</i> deleted message
                </p>
              ) : (
                <>
                  {/* <p className="text-xs mx-1 text-slate-600">{message.user}</p> */}
                  <div className="flex">
                    <p
                      className={`${
                        email === message.userEmail ? "bg-blue-200" : "bg-white"
                      } rounded-full py-1 px-3 w-fit  border`}
                    >
                      {message.message}
                    </p>
                    {message.userEmail === email && message.deletable && (
                      <button
                        onClick={() => handledeleteRequest(index)}
                        className="button p-1 "
                      >
                        <FaTrash size={16} />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
      <div>
        <form onSubmit={handleSubmit} action="" className="flex gap-2">
          <input
            name="message"
            ref={inputRef}
            className="flex-1 border p-1 rounded-sm"
            type="text"
          />
          <button className="button bg-primary">Send</button>
        </form>
      </div>
    </div>
  );
}
