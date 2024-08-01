import { turnConfig } from "../utils/config";
import {
  onConnectionDone,
  sendAnswer,
  sendCandidate,
  sendOffer,
  startConnection,
} from "./socketService";

const config = turnConfig;
const pc = new RTCPeerConnection(config);
let userStream: MediaStream;
let trackAdded = false;

export async function startService(stream: MediaStream) {
  userStream = stream;
  startConnection();
}
export function setStream() {
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
  try {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    sendOffer(offer);
  } catch (err) {
    console.log(err);
  }
}
pc.onnegotiationneeded = async () => {
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  sendOffer(offer);
};

export async function setOffer(offer: RTCSessionDescriptionInit) {
  pc.setRemoteDescription(offer);
  sendRTCAnswer();
}
export async function sendRTCAnswer() {
  const answer = await pc.createAnswer();
  pc.setLocalDescription(answer);
  sendAnswer(answer);
}
export async function setAnswer(answer: RTCSessionDescriptionInit) {
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
    setPeerStream(streams[0]);
  };
}
