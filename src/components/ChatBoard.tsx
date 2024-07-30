import { FormEvent, useEffect, useRef, useState } from "react";
import socket, {
  onMessageRecieved,
  sendMessageToRoom,
} from "../lib/socketService";

type messageItem = {
  user: string;
  message: string;
};
export default function ChatBoard({ username }: { username: string }) {
  const [messages, setMessages] = useState<messageItem[]>([]);
  const singleRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (singleRef.current) return;
    onMessageRecieved(whenMessageRecieved);
    singleRef.current = true;
  });

  function whenMessageRecieved(message: string, user: string) {
    setMessages((prev) => {
      return [...prev, { message, user }];
    });
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
    sendMessageToRoom(inputValue, username);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
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
              <p className="text-xs mx-1 text-slate-600">{message.user}</p>
              <p className="bg-white rounded-full py-1 px-4 w-11/12  border">
                {message.message}
              </p>
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
