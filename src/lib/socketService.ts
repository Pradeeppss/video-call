import { io } from "socket.io-client";
import { createRoomId } from "./helpers";
import { User } from "../pages/Room";

const socket = io("http://localhost:3001");
let currentRoomId = "";
let currentUsers = [];

export function getCurrentRoomId() {
  return currentRoomId;
}
export function setCurrentRoomId(id: string) {
  currentRoomId = id;
}
//
socket.on("connect", () => {
  console.log(socket.id);
});

socket.on("disconnect", () => {
  console.log("socket disconnected");
});

//
export function createRoom(user: string) {
  currentRoomId = createRoomId();
  socket.emit("join-room", currentRoomId, user, true);
  return currentRoomId;
}

export function joinRoom(id: string, user: string) {
  currentRoomId = id;
  socket.emit("join-room", id, user, false);
}

export function getAllUsers(
  setUsers: React.Dispatch<React.SetStateAction<User[]>>
) {
  socket.on("joined", (users, roomId) => {
    console.log(users);
    setUsers(users);
  });
}

//send message to room
export function sendMessageToRoom(message: string, user: string) {
  socket.emit("message", currentRoomId, message, user);
}

export function onMessageRecieved(
  callback: (message: string, user: string) => void
) {
  socket.on("message", (message, user) => {
    console.log(message, "recieved client");
    callback(message, user);
  });
}

export default socket;
