import { ChangeEvent, useRef } from "react";
import { useSocket } from "../context/Socket";

export default function NotficationBox() {
  const { notifStatus, setNotifStatus } = useSocket();
  const inputRef = useRef<HTMLInputElement>(null);
  async function handleNotificationPermission(
    ev: ChangeEvent<HTMLInputElement>
  ) {
    const checked = ev.target.checked;
    if (checked) {
      if (Notification.permission !== "granted") {
        const permission = await Notification.requestPermission();
        if (permission === "denied") {
          //@ts-expect-error
          inputRef.current.checked = false;
        }
      } else {
        setNotifStatus("granted");
      }
    } else {
      setNotifStatus("denied");
    }
  }
  return (
    <div className="border-t p-2 ">
      <input
        ref={inputRef}
        onChange={handleNotificationPermission}
        type="checkbox"
        className="cursor-pointer"
        name=""
        id="notif"
        defaultChecked={notifStatus === "granted"}
      />
      <label htmlFor="notif" className="cursor-pointer">
        &nbsp;Notifications
      </label>
    </div>
  );
}
