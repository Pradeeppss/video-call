import { useNavigate } from "react-router-dom";
import { axiosClient } from "../lib/axiosConfig";
import { FaSignOutAlt } from "react-icons/fa";

export default function Header({ username }: { username: string }) {
  const navigate = useNavigate();
  async function logoutUser() {
    try {
      await axiosClient.get("/logout");
      navigate("/");
    } catch (error) {
      console.log(error);
      navigate("/");
    }
  }

  return (
    <header className="border-b p-2 flex justify-between ">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 border rounded-full flex items-center justify-center">
          {username[0]}
        </div>
        <p>{username}</p>
      </div>
      <button
        onClick={logoutUser}
        className="button px-2 bg-gray-100 hover:bg-gray-200"
      >
        <FaSignOutAlt size={20} />
      </button>
    </header>
  );
}
