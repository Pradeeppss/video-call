import { useEffect, useRef } from "react";

export default function VideoPlayer({
  stream,
  username,
}: {
  stream: MediaStream | undefined;
  username: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);
  return (
    <>
      {stream ? (
        <div className="w-full h-full rounded-md overflow-hidden">
          <video
            autoPlay
            muted
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
    </>
  );
}
