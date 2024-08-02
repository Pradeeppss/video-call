import { createContext, ReactNode, useContext, useMemo } from "react";
import { io, Socket } from "socket.io-client";
import { config } from "../utils/config";

export type SocketContent = {
  socket: Socket;
};

//@ts-expect-error
const socketContext = createContext<SocketContent>(null);

export const useSocket = () => {
  return useContext(socketContext);
};

export function SocketProvider({ children }: { children: ReactNode }) {
  const socket = useMemo(() => {
    return io(config.baseUrl);
  }, []);
  return (
    <socketContext.Provider value={{ socket }}>
      {children}
    </socketContext.Provider>
  );
}
