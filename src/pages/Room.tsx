import { useEffect, useMemo, useState } from "react";
import ChatBoard from "../components/ChatBoard";
import { useNavigate, useParams } from "react-router-dom";
import VideoPlayer from "../components/VideoPlayer";
import { useSocket } from "../context/Socket";
import { useAuth0 } from "@auth0/auth0-react";
import { useWebrtc } from "../context/Webrtc";
import { FaPhoneSlash } from "react-icons/fa";
import { getLocalEmail, getLocalUsername } from "../lib/helpers";

export type User = {
  username: string;
  id: string;
  email: string;
};

export default function Room() {
  const { socket, currRoom } = useSocket();
  const {
    peer,
    createOffer,
    onRTCConnection,
    getUserStream,
    userStream,
    calleeStream,
    // removeVideoTrack,
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
    socket.on("room-full", () => {
      navigate("/home");
    });
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
      peer.addEventListener("negotiationneeded", handleNewUserJoin);
    }
    return () => {
      socket.off("new-user", handleNewUserJoin);
      socket.off("recieve-offer", handleOfferRecieving);
      socket.off("recieve-answer", handleAnserRecieving);
      socket.off("rtc-finish", onRTCConnection);
      socket.off("left-room", handleUserLeaving);
      peer.removeEventListener("negotiationneeded", handleNewUserJoin);
    };
  }, [socket]);

  async function handleNewUserJoin() {
    const offer = await createOffer();
    if (offer) {
      peer.setLocalDescription(offer);
      socket.emit("send-offer", offer, roomId);
    }
  }
  function handleNewCalleeUser(users: User[]) {
    users.forEach((ur) => {
      if (ur.id !== socket.id) {
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
    socket.emit("exit-user", socket.id, roomId);
    exitCall();
  }

  return (
    <section className="flex gap-4 h-screen bg-gray-900 p-4">
      <div className="flex-1 flex flex-col justify-between gap-4">
        <div className="flex gap-4 flex-1  h-[calc(100vh-20rem)] justify-center items-top">
          <div className="bg-gray-600  rounded-md relative flex-1 max-w-full h-full">
            <VideoPlayer muted={true} stream={userStream} username={username} />
            <p className="absolute bottom-2 left-2 text-white">{username}</p>
          </div>
          {calleeUser && (
            <div className="bg-gray-600 rounded-md relative flex-1 max-w-full h-full">
              <VideoPlayer
                muted={false}
                stream={calleeStream}
                username={calleeUser.username}
              />
              <p className="absolute bottom-2 left-2 text-white">
                {calleeUser.username}
              </p>
            </div>
          )}
        </div>
        <div className=" flex justify-center  ">
          <div className="flex items-center bg-gray-600 rounded-full">
            {/* <button className="button rounded-full hover:bg-gray-400">
              <FaVolumeHigh size={25} />
            </button>
            <button
              onClick={removeVideoTrack}
              className="button rounded-full hover:bg-gray-400"
            >
              <FaVideo size={25} />
            </button> */}
            <button
              onClick={handleCallDisconnect}
              className="button rounded-full hover:bg-gray-400"
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
