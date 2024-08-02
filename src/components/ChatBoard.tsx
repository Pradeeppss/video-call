import { FormEvent, useEffect, useRef, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { createUniqueId } from "../lib/helpers";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useSocket } from "../context/Socket";

type messageItem = {
  user: string;
  message: string;
  id: string;
  deletable: boolean;
  deleted: boolean;
};
const deleteTime = 2 * 60;
export default function ChatBoard({ username }: { username: string }) {
  const { socket } = useSocket();
  const { roomId } = useParams();
  const [messages, setMessages] = useState<messageItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [isLoading]);
  useEffect(() => {
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
    user: string
  ) {
    setMessages((prev) => {
      return [
        ...prev,
        { message, id: messageId, user, deletable: true, deleted: false },
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
    socket.emit("message", roomId, inputValue, createUniqueId(), username);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }
  function handledeleteRequest(index: number) {
    const messageId = messages[index].id;
    socket.emit("message-delete", roomId, messageId);
  }
  return (
    <div className="flex flex-col gap-2 bg-slate-100 h-full p-2 rounded-md">
      <div
        ref={chatRef}
        className="flex-1  flex flex-col gap-3  p-1 overflow-auto max-h-[calc(100%-3rem)] no-scroll "
      >
        {messages.map((message, index) => {
          return (
            <div
              key={index}
              className={`flex flex-col gap-[1px] ${
                username === message.user ? "items-start" : "items-end"
              }`}
            >
              {message.deleted ? (
                <p className="text-xs text-gray-500">
                  <i>{message.user}</i> deleted message
                </p>
              ) : (
                <>
                  <p className="text-xs mx-1 text-slate-600">{message.user}</p>
                  <div className="flex">
                    <p className="bg-white rounded-full py-1 px-3 w-fit   border">
                      {message.message}
                    </p>
                    {message.user === username && message.deletable && (
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
