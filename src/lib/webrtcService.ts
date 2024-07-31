import { turnConfig } from "../utils/config";
import {
  getIsInitiator,
  onConnectionDone,
  sendAnswer,
  sendCandidate,
  sendOffer,
  sendrtcMessages,
  startConnection,
} from "./socketService";

const config = turnConfig;
const pc = new RTCPeerConnection(config);
let userStream: MediaStream;
let trackAdded = false;

export async function startService(stream: MediaStream) {
  console.log("adding stream");
  userStream = stream;
  startConnection();
}
export function setStream() {
  console.log("track adding");

  if (trackAdded) return;
  if (userStream) {
    trackAdded = true;
    const tracks = userStream.getTracks();
    for (const track of tracks) {
      pc.addTrack(track, userStream);
    }
  }
}

export function recieveRTCPeerconnection() {
  return pc;
}

export async function sendRTCOffer() {
  console.log("sending offer");
  try {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    sendOffer(offer);
  } catch (err) {
    console.log(err);
  }
}
pc.onnegotiationneeded = async () => {
  console.log("negotitation needed");
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  console.log(offer);
  sendOffer(offer);
};

export async function setOffer(offer: RTCSessionDescriptionInit) {
  console.log("recieving offfer");
  pc.setRemoteDescription(offer);
  sendRTCAnswer();
}
export async function sendRTCAnswer() {
  console.log("sending answer");
  const answer = await pc.createAnswer();
  pc.setLocalDescription(answer);
  console.log(answer);
  sendAnswer(answer);
}
export async function setAnswer(answer: RTCSessionDescriptionInit) {
  console.log("setting answer");
  pc.setRemoteDescription(answer);
  // setStream();
  onConnectionDone();
}

export function createNewICECandidate(candidate: RTCIceCandidate) {
  const newCan = new RTCIceCandidate({
    candidate: candidate.candidate,
    sdpMLineIndex: candidate.sdpMLineIndex,
  });
  pc.addIceCandidate(newCan);
}

export function setRemoteDescription(description: RTCSessionDescriptionInit) {
  console.log(description);

  pc.setRemoteDescription(description);
}

pc.onicecandidate = ({ candidate }) => {
  if (candidate) {
    sendCandidate(candidate);
  }
};

export function getPeerStream(
  setPeerStream: React.Dispatch<React.SetStateAction<MediaStream | undefined>>
) {
  pc.ontrack = ({ streams }) => {
    console.log("getting stream");

    setPeerStream(streams[0]);
  };
}
