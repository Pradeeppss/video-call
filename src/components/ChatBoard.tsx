import { FormEvent, useEffect, useRef, useState } from "react";
import socket, {
  onDeleteRequest,
  onMessageRecieved,
  sendDeleteRequest,
  sendMessageToRoom,
} from "../lib/socketService";
import { FaTrash } from "react-icons/fa";
import { createUniqueId } from "../lib/helpers";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

type messageItem = {
  user: string;
  message: string;
  id: string;
  deletable: boolean;
  deleted: boolean;
};
const deleteTime = 2 * 60;
export default function ChatBoard({ username }: { username: string }) {
  const [messages, setMessages] = useState<messageItem[]>([]);
  const singleRef = useRef(false);
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
    if (singleRef.current) return;
    onMessageRecieved(whenMessageRecieved);
    onDeleteRequest(deleteMessage);
    singleRef.current = true;
  });

  function whenMessageRecieved(
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
    sendMessageToRoom(inputValue, createUniqueId(), username);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }
  function handledeleteRequest(index: number) {
    sendDeleteRequest(messages[index].id);
  }
  function deleteMessage(messageId: string) {
    setMessages((prev) => {
      return prev.map((message) => {
        if (message.id === messageId) {
          message.deleted = true;
        }
        return message;
      });
    });
  }
  return (
    <div className="flex flex-col gap-2 bg-slate-100 h-full p-2">
      <div
        ref={chatRef}
        className="flex-1 rounded-sm flex flex-col gap-3  p-1 overflow-auto max-h-[calc(100vh-8rem)] no-scroll "
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
