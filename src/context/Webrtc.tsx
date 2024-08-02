import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { turnConfig } from "../utils/config";
import { useSocket } from "./Socket";
import { useLocation, useNavigate } from "react-router-dom";

type WebrtcContent = {
  peer: RTCPeerConnection;
  createOffer: () => Promise<RTCSessionDescriptionInit | null>;
  onRTCConnection: () => void;
  userStream: MediaStream | undefined;
  calleeStream: MediaStream | undefined;
  getUserStream: () => void;
  removeVideoTrack: () => void;
  exitCall: () => void;
  stopUserStream: () => void;
};

//@ts-expect-error
const webrtcContext = createContext<WebrtcContent>(null);

export const useWebrtc = () => {
  return useContext(webrtcContext);
};

export function WebrtcProvider({ children }: { children: ReactNode }) {
  const { socket } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [userStream, setUserStream] = useState<MediaStream>();
  const [calleeStream, setCalleeStream] = useState<MediaStream>();
  const [connected, setConnected] = useState(false);
  const singleRef = useRef(true);
  const videoSender = useRef<RTCRtpSender>();
  const audioSender = useRef<RTCRtpSender>();
  const peer = useMemo(() => {
    return new RTCPeerConnection(turnConfig);
  }, []);
  //
  useEffect(() => {
    if (location.pathname === "/home") {
      if (userStream?.active) {
        stopUserStream();
        window.location.reload();
      }
    }
  }, [location]);
  //
  useEffect(() => {
    peer.addEventListener("icecandidate", handleIceCandidate);
    peer.addEventListener("track", handleCalleeTrack);
    socket.on("recieve-candidate", handleRecieveCandidate);
    return () => {
      peer.removeEventListener("icecandidate", handleIceCandidate);
      socket.off("recieve-candidate", handleRecieveCandidate);
    };
  }, [peer]);

  function handleIceCandidate(event: RTCPeerConnectionIceEvent) {
    socket.emit("send-candidate", event.candidate);
  }
  async function handleRecieveCandidate(candidate: RTCIceCandidate) {
    const newCan = new RTCIceCandidate({
      candidate: candidate.candidate,
      sdpMLineIndex: candidate.sdpMLineIndex,
    });
    await peer.addIceCandidate(newCan);
  }

  function handleCalleeTrack(ev: RTCTrackEvent) {
    const { streams } = ev;
    setCalleeStream(streams[0]);
  }

  async function getUserStream() {
    if (singleRef.current) {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setUserStream(mediaStream);
    }
    singleRef.current = false;
  }

  function removeVideoTrack() {
    if (videoSender.current) {
      peer.removeTrack(videoSender.current);
    }
  }

  async function stopUserStream() {
    if (userStream) {
      const tracks = userStream.getTracks();
      for (const track of tracks) {
        track.stop();
      }
    }
  }
  function exitCall() {
    peer.close();
    navigate("/home");
    stopUserStream();
    window.location.reload();
  }
  async function createOffer() {
    try {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      return offer;
    } catch (err) {
      console.log(err);
      return null;
    }
  }
  async function onRTCConnection() {
    setConnected(true);
  }
  useEffect(() => {
    if (connected && userStream) {
      const tracks = userStream.getTracks();
      for (const track of tracks) {
        if (track.kind === "video") {
          videoSender.current = peer.addTrack(track, userStream);
        }
        if (track.kind === "audio") {
          audioSender.current = peer.addTrack(track, userStream);
        }
      }
    }
  }, [connected, userStream]);

  return (
    <webrtcContext.Provider
      value={{
        peer,
        createOffer,
        onRTCConnection,
        userStream,
        getUserStream,
        calleeStream,
        removeVideoTrack,
        exitCall,
        stopUserStream,
      }}
    >
      {children}
    </webrtcContext.Provider>
  );
}
