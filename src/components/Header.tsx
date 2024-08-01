import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { logout, isAuthenticated } = useAuth0();
  const navigate = useNavigate();
  useEffect(() => {
    if (!isAuthenticated) {
      //   navigate("/");
    }
  });
  function logoutUser() {
    logout();
  }
  return (
    <header className="border p-2 flex justify-end ">
      <button onClick={logoutUser} className="button  bg-purple-500 text-white">
        Logout
      </button>
    </header>
  );
}
