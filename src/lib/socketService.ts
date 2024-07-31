import { io } from "socket.io-client";
import { createRoomId } from "./helpers";
import { User } from "../pages/Room";
import {
  createNewICECandidate,
  sendRTCOffer,
  setAnswer,
  setOffer,
  setStream,
} from "./webrtcService";

type RTCMessage = {
  type: "candidate" | "offer" | "answer";
  item: any;
};

const socket = io("http://localhost:3001");
let currentRoomId = "";
let isInititator = false;
let currentUsers: User[] = [];

export function getCurrentRoomId() {
  return currentRoomId;
}
export function setCurrentRoomId(id: string) {
  currentRoomId = id;
}
export function getIsInitiator() {
  return isInititator;
}
export function getSocketId() {
  return socket.id;
}
//
socket.on("connect", () => {
  console.log(socket.id);
});

socket.on("disconnect", () => {
  console.log("socket disconnected");
});

//
export function createRoom() {
  currentRoomId = createRoomId();
  return currentRoomId;
}

export function joinRoom(id: string, user: string) {
  currentRoomId = id;
  socket.emit("join-room", id, user);
}

export function getAllUsers(
  setUsers: React.Dispatch<React.SetStateAction<User[]>>
) {
  socket.on("joined", (users) => {
    console.log(users);
    setUsers(users);
  });
}
export function startConnection() {
  socket.emit("start-connection", currentRoomId);
}
socket.on("start-rtc", () => {
  console.log("new user joined");
  sendRTCOffer();
});

//send message to room
export function sendMessageToRoom(message: string, user: string) {
  socket.emit("message", currentRoomId, message, user);
}

export function sendOffer(offer: RTCSessionDescriptionInit) {
  socket.emit("send-offer", offer, currentRoomId);
}
socket.on("recieve-offer", (offer) => {
  setOffer(offer);
});
//
export function sendAnswer(answer: RTCSessionDescriptionInit) {
  socket.emit("send-answer", answer, currentRoomId);
}
socket.on("recieve-answer", (answer) => {
  setAnswer(answer);
});
//
export function sendCandidate(candidate: RTCIceCandidate) {
  socket.emit("send-candidate", candidate, currentRoomId);
}
socket.on("recieve-candidate", (candidate) => {
  createNewICECandidate(candidate);
});

export function onConnectionDone() {
  socket.emit("connection-finish", currentRoomId);
}
socket.on("rtc-finish", () => {
  console.log(
    "finished-------------------------------------------------------------"
  );
  setStream();
});

export function sendrtcMessages(message: RTCMessage) {
  socket.emit("rtc-connection", message, socket.id, currentRoomId);
}

//
export function onMessageRecieved(
  callback: (message: string, user: string) => void
) {
  socket.on("message", (message, user) => {
    console.log(message, "recieved client");
    callback(message, user);
  });
}

export default socket;
