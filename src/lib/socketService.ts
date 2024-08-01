import { io } from "socket.io-client";
import { createUniqueId } from "./helpers";
import { User } from "../pages/Room";
import {
  createNewICECandidate,
  sendRTCOffer,
  setAnswer,
  setOffer,
  setStream,
} from "./webrtcService";
import { config } from "../utils/config";

type RTCMessage = {
  type: "candidate" | "offer" | "answer";
  item: any;
};

const socket = io(config.baseUrl);
let currentRoomId = "";
let isInititator = false;

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
  currentRoomId = createUniqueId();
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
export function sendMessageToRoom(
  message: string,
  messageId: string,
  user: string
) {
  socket.emit("message", currentRoomId, message, messageId, user);
}
export function sendDeleteRequest(messageId: string) {
  console.log("sending delete req");
  socket.emit("message-delete", currentRoomId, messageId);
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
  setStream();
});

export function sendrtcMessages(message: RTCMessage) {
  socket.emit("rtc-connection", message, socket.id, currentRoomId);
}

//
export function onMessageRecieved(
  callback: (message: string, messageId: string, user: string) => void
) {
  socket.on("message", (message, messageId, user) => {
    callback(message, messageId, user);
  });
}
export function onDeleteRequest(callback: (messageId: string) => void) {
  socket.on("delete-message", (messageId) => {
    console.log("recieved delete req");

    callback(messageId);
  });
}

export default socket;
