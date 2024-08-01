import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const { loginWithRedirect, isAuthenticated } = useAuth0();
  function login() {
    loginWithRedirect();
  }
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home");
    }
  }, [isAuthenticated]);
  //   function login() {
  //     navigate("/home");
  //   }
  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <section className=" shadow-lg shadow-slate-400  rounded-md">
        <button onClick={login} className="button bg-primary text-white px-8">
          Login
        </button>
      </section>
    </div>
  );
}
