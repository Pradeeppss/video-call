import { useEffect, useMemo, useState } from "react";
import ChatBoard from "../components/ChatBoard";
import { useNavigate, useParams } from "react-router-dom";
import VideoPlayer from "../components/VideoPlayer";
import { useSocket } from "../context/Socket";
import { useWebrtc } from "../context/Webrtc";
import { FaPhoneSlash, FaVolumeOff } from "react-icons/fa";
import { getLocalEmail, getLocalUsername } from "../lib/helpers";
import {
  FaVideo,
  FaVideoSlash,
  FaVolumeHigh,
  FaVolumeXmark,
} from "react-icons/fa6";

export type User = {
  username: string;
  email: string;
};

export default function Room() {
  const { socket, currRoom } = useSocket();
  const [videoOn, setVideoOn] = useState(true);
  const [audioOn, setAudioOn] = useState(true);
  const [peerVideoOn, setPeerVideoOn] = useState(true);
  const [peerAudioOn, setPeerAudioOn] = useState(true);
  const {
    peer,
    createOffer,
    onRTCConnection,
    getUserStream,
    userStream,
    calleeStream,
    removeVideoTrack,
    removeAudioTrack,
    restartTrack,
    exitCall,
  } = useWebrtc();
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [username, email] = useMemo(() => {
    return [getLocalUsername(), getLocalEmail()];
  }, []);
  const [calleeUser, setCalleeUser] = useState<User>();

  useEffect(() => {
    socket.emit("join-call", roomId, username, email);
    if (!currRoom) {
      handleCallDisconnect();
      // navigate("/home");
    }
    getUserStream();
  }, []);
  useEffect(() => {
    if (socket) {
      socket.on("new-user", handleNewUserJoin);
      socket.on("all-users", handleNewCalleeUser);
      socket.on("recieve-offer", handleOfferRecieving);
      socket.on("recieve-answer", handleAnserRecieving);
      socket.on("rtc-finish", onRTCConnection);
      socket.on("left-room", handleUserLeaving);
      socket.on("toggle-video", handlePeerVideoToggle);
      socket.on("toggle-audio", handlePeerAudioToggle);
      peer.addEventListener("negotiationneeded", handleNegotiation);
    }
    return () => {
      socket.off("new-user", handleNewUserJoin);
      socket.off("recieve-offer", handleOfferRecieving);
      socket.off("recieve-answer", handleAnserRecieving);
      socket.off("rtc-finish", onRTCConnection);
      socket.off("left-room", handleUserLeaving);
      socket.off("toggle-video", handlePeerVideoToggle);
      socket.off("toggle-audio", handlePeerAudioToggle);
      peer.removeEventListener("negotiationneeded", handleNegotiation);
    };
  }, [socket]);

  async function handleNewUserJoin() {
    const offer = await createOffer();
    if (offer) {
      peer.setLocalDescription(offer);
      socket.emit("send-offer", offer, roomId);
    }
  }
  async function handleNegotiation() {
    const offer = await createOffer();
    if (offer) {
      peer.setLocalDescription(offer);
      socket.emit("send-offer", offer, roomId);
    }
  }
  function handleNewCalleeUser(users: User[]) {
    users.forEach((ur) => {
      if (ur.email !== email) {
        setCalleeUser(ur);
      }
    });
  }
  function handleUserLeaving() {
    setCalleeUser(undefined);
  }
  async function handleOfferRecieving(offer: RTCSessionDescriptionInit) {
    await peer.setRemoteDescription(offer);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    socket.emit("send-answer", answer, roomId);
  }
  async function handleAnserRecieving(answer: RTCSessionDescriptionInit) {
    await peer.setRemoteDescription(answer);
    socket.emit("connection-finish", roomId);
    onRTCConnection();
  }
  function handleCallDisconnect() {
    socket.emit("exit-user", socket.id, roomId, email);
    exitCall();
  }
  function handlePeerVideoToggle(value: boolean) {
    setPeerVideoOn(value);
  }
  function handlePeerAudioToggle(value: boolean) {
    setPeerAudioOn(value);
  }
  function handleVideoToggle() {
    if (videoOn) {
      removeVideoTrack();
      socket.emit("video-toggle", roomId, false);
    } else {
      restartTrack(true, audioOn);
      socket.emit("video-toggle", roomId, true);
    }
    setVideoOn((prev) => !prev);
  }
  function handleAudioToggle() {
    if (audioOn) {
      removeAudioTrack();
      socket.emit("audio-toggle", roomId, false);
    } else {
      restartTrack(videoOn, true);
      socket.emit("audio-toggle", roomId, true);
    }
    setAudioOn((prev) => !prev);
  }
  return (
    <section className="flex gap-4 h-screen bg-gray-900 p-4">
      <div className="flex-1 flex flex-col justify-between gap-4">
        <div className="flex gap-4 flex-1  h-[calc(100vh-20rem)] justify-center items-top">
          <div className="bg-gray-600  rounded-md relative flex-1 max-w-full h-full">
            <VideoPlayer
              playing={videoOn}
              muted={!audioOn}
              stream={userStream}
              username={username}
              isUser={true}
            />
            <p className="absolute bottom-2 left-2 text-white">{username}</p>
          </div>
          {calleeUser && (
            <div className="bg-gray-600 rounded-md relative flex-1 max-w-full h-full">
              <VideoPlayer
                playing={peerVideoOn}
                muted={!peerAudioOn}
                stream={calleeStream}
                username={calleeUser.username}
                isUser={false}
              />
              <p className="absolute bottom-2 left-2 text-white">
                {calleeUser.username}
              </p>
            </div>
          )}
        </div>
        <div className=" flex justify-center  ">
          <div className="flex items-center bg-gray-600 rounded-full">
            <button
              onClick={handleAudioToggle}
              className="button rounded-full hover:bg-gray-500"
            >
              {audioOn ? (
                <FaVolumeHigh size={25} />
              ) : (
                <FaVolumeXmark color="#f77b79" size={25} />
              )}
            </button>
            <button
              onClick={handleVideoToggle}
              className="button rounded-full hover:bg-gray-500"
            >
              {videoOn ? (
                <FaVideo size={25} />
              ) : (
                <FaVideoSlash color="#f77b79" size={25} />
              )}
            </button>
            <button
              onClick={handleCallDisconnect}
              className="button rounded-full hover:bg-gray-500"
            >
              <FaPhoneSlash size={25} />
            </button>
          </div>
        </div>
      </div>
      <div className="w-72 ">
        {currRoom ? (
          <ChatBoard room={currRoom} />
        ) : (
          <div className="h-full flex justify-center items-center">
            Loading...
          </div>
        )}
      </div>
    </section>
  );
}
