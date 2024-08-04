import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";
import { config } from "../utils/config";
import { ChatRoom } from "../types/userTypes";

export type SocketContent = {
  socket: Socket;
  currRoom: ChatRoom | undefined;
  setCurrRoom: React.Dispatch<React.SetStateAction<ChatRoom | undefined>>;
  notifStatus: "default" | "denied" | "granted";
  setNotifStatus: React.Dispatch<
    React.SetStateAction<"default" | "denied" | "granted">
  >;
};

//@ts-expect-error
const socketContext = createContext<SocketContent>(null);

export const useSocket = () => {
  return useContext(socketContext);
};

export function SocketProvider({ children }: { children: ReactNode }) {
  const [currRoom, setCurrRoom] = useState<ChatRoom>();
  const [notifStatus, setNotifStatus] = useState(Notification.permission);
  const socket = useMemo(() => {
    return io(config.baseUrl);
  }, []);
  return (
    <socketContext.Provider
      value={{ socket, currRoom, setCurrRoom, notifStatus, setNotifStatus }}
    >
      {children}
    </socketContext.Provider>
  );
}
