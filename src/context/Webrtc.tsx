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
  onRTCConnection: () => void;
  userStream: MediaStream | undefined;
  calleeStream: MediaStream | undefined;
  getUserStream: () => void;
  removeVideoTrack: () => void;
  removeAudioTrack: () => void;
  exitCall: () => void;
  stopUserStream: () => void;
  restartTrack: (video: boolean, audio: boolean) => void;
};

//@ts-expect-error
const webrtcContext = createContext<WebrtcContent>(null);

export const useWebrtc = () => {
  return useContext(webrtcContext);
};

export function WebrtcProvider({ children }: { children: ReactNode }) {
  const { socket } = useSocket();
  const peer = useMemo(() => {
    return new RTCPeerConnection(turnConfig);
  }, []);
  const navigate = useNavigate();
  const location = useLocation();
  const [userStream, setUserStream] = useState<MediaStream>();
  const [calleeStream, setCalleeStream] = useState<MediaStream>();
  const [connected, setConnected] = useState(false);
  const singleRef = useRef(true);
  const videoSender = useRef<RTCRtpSender>();
  const audioSender = useRef<RTCRtpSender>();
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
    if (peer) {
      peer.addEventListener("icecandidate", handleIceCandidate);
      peer.addEventListener("connectionstatechange", handleConnectionState);
      peer.addEventListener("track", handleCalleeTrack);
      socket.on("recieve-candidate", handleRecieveCandidate);
      return () => {
        peer.removeEventListener("icecandidate", handleIceCandidate);
        peer.removeEventListener("track", handleCalleeTrack);
        peer.removeEventListener(
          "connectionstatechange",
          handleConnectionState
        );
        socket.off("recieve-candidate", handleRecieveCandidate);
      };
    }
  }, [peer]);
  function handleIceCandidate(event: RTCPeerConnectionIceEvent) {
    if (event.candidate) {
      socket.emit("send-candidate", event.candidate);
    }
  }
  async function handleRecieveCandidate(candidate: RTCIceCandidate) {
    await peer.addIceCandidate(candidate);
  }
  function handleConnectionState() {
    console.log(peer.connectionState);
    if (peer.connectionState === "connected") {
      setConnected(true);
    }
    if (peer.connectionState === "failed") {
      // peer.
    }
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
    if (userStream?.active && videoSender.current) {
      userStream.removeTrack(userStream.getVideoTracks()[0]);
      userStream.getVideoTracks().forEach((track) => {
        track.stop();
      });
      peer.removeTrack(videoSender.current);
    }
  }
  function removeAudioTrack() {
    if (userStream?.active && audioSender.current) {
      userStream.removeTrack(userStream.getAudioTracks()[0]);
      userStream.getAudioTracks().forEach((track) => {
        track.stop();
      });
      peer.removeTrack(audioSender.current);
    }
  }
  async function restartTrack(video: boolean, audio: boolean) {
    console.log("restarting tracks");
    if (userStream) {
      const stream = await navigator.mediaDevices.getUserMedia({
        video,
        audio,
      });
      for (const track of userStream.getTracks()) {
        userStream.removeTrack(track);
      }
      for (const track of stream.getTracks()) {
        userStream.addTrack(track);
        if (track.kind === "video") {
          videoSender.current = peer.addTrack(track, stream);
        }
        if (track.kind === "audio") {
          audioSender.current = peer.addTrack(track, stream);
        }
      }
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
    navigate("/home");
    stopUserStream();
    window.location.reload();
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
        onRTCConnection,
        userStream,
        getUserStream,
        calleeStream,
        removeVideoTrack,
        removeAudioTrack,
        exitCall,
        stopUserStream,
        restartTrack,
      }}
    >
      {children}
    </webrtcContext.Provider>
  );
}
