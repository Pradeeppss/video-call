import { useEffect, useRef, useState } from "react";
import ChatBoard from "../components/ChatBoard";
import { useNavigate, useParams } from "react-router-dom";
import {
  getAllUsers,
  getCurrentRoomId,
  getSocketId,
  joinRoom,
  setCurrentRoomId,
} from "../lib/socketService";
import VideoPlayer from "../components/VideoPlayer";
import { getPeerStream, startService } from "../lib/webrtcService";

export type User = {
  username: string;
  id: string;
};

export default function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>(`user_${Date.now()}`);
  const [mediaStream, setMediaStream] = useState<MediaStream>();
  const [peerStream, setpeerStream] = useState<MediaStream>();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const singleRef = useRef(false);
  useEffect(() => {
    if (singleRef.current || !roomId) return;
    setCurrentRoomId(roomId);
    const name = localStorage.getItem("username");
    if (name) {
      setUsername(name);
    } else {
      navigate("/");
      return;
    }
    joinRoom(roomId, name);
    startMediaStream();
    //@ts-expect-error
    setAllUsers([{ id: getSocketId(), username: name }]);
    getAllUsers(setAllUsers);
    singleRef.current = true;
    return () => {
      stopMediaStream();
    };
  });
  function stopMediaStream() {
    console.log("stopping");
    console.log(mediaStream);

    if (mediaStream) {
      const tracks = mediaStream.getTracks();
      for (const track of tracks) {
        track.stop();
      }
      setMediaStream(undefined);
    }
  }
  function startMediaStream() {
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then(getMediaStream)
      .catch((err) => {
        console.log(err);
      });
  }
  function getMediaStream(stream: MediaStream) {
    startService(stream);
    setMediaStream(stream);
    getPeerStream(setpeerStream);
  }
  return (
    <div className="h-screen bg-gray-900 grid p-8">
      <section className="flex gap-4">
        <div className="flex-1 grid gap-2 room-grid  max-h-[calc(100vh-4rem)]">
          <div className="bg-gray-600 rounded-md flex-1 relative aspect-video max-h-[calc(100vh-4rem)] ">
            <VideoPlayer
              muted={true}
              stream={mediaStream}
              username={username}
            />
            <p className="absolute bottom-2 left-2 text-white">{username}</p>
          </div>
          {allUsers.map((user) => {
            if (user.id === getSocketId()) return null;
            return (
              <div
                key={user.id}
                className="bg-gray-600 rounded-md flex-1 relative aspect-video max-h-[calc(100vh-4rem)] "
              >
                <VideoPlayer
                  muted={false}
                  stream={peerStream}
                  username={user.username}
                />
                <p className="absolute bottom-2 left-2 text-white">
                  {user.username}
                </p>
              </div>
            );
          })}
        </div>
        <div className="w-72">
          <ChatBoard username={username} />
        </div>
      </section>
    </div>
  );
}
