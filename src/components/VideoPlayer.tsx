import { useEffect, useRef } from "react";
import { FaVolumeXmark } from "react-icons/fa6";

export default function VideoPlayer({
  stream,
  username,
  muted,
  playing,
  isUser,
}: {
  stream: MediaStream | undefined;
  username: string;
  muted: boolean;
  playing: boolean;
  isUser: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (!videoRef.current) return;
    if (stream) {
      videoRef.current.srcObject = stream;
    } else {
      videoRef.current.srcObject = null;
    }
  }, [stream, playing, muted]);
  return (
    <>
      {stream ? (
        <div className="h-full relative">
          {playing ? (
            <div className="w-full h-full rounded-md overflow-hidden">
              <video
                autoPlay
                muted={isUser ? true : muted}
                ref={videoRef}
                className="w-full h-full object-cover "
              ></video>
            </div>
          ) : (
            <div className="h-full flex justify-center items-center">
              <div className="h-20 w-20 flex justify-center items-center rounded-full bg-purple-500 text-white text-3xl capitalize">
                {username[0]}
              </div>
            </div>
          )}
          <div className="absolute top-1 left-1 bg-gray-200 p-2 rounded-full">
            {muted ? (
              <FaVolumeXmark size={26} />
            ) : (
              <div className="flex gap-1 py-1 px-[2px] translate-y-[1px]">
                <p className="animate-bounce w-1 h-4 rounded-full [animation-delay:0ms]   bg-blue-700"></p>
                <p className="animate-bounce w-1 h-4 rounded-full [animation-delay:200ms] bg-blue-700"></p>
                <p className="animate-bounce w-1 h-4 rounded-full [animation-delay:400ms] bg-blue-700"></p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="h-full flex justify-center items-center">
          <div className="h-20 w-20 flex justify-center items-center rounded-full bg-purple-500 text-white text-3xl capitalize">
            {username[0]}
          </div>
        </div>
      )}
    </>
  );
}
