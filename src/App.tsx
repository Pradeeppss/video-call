import { Route, Routes } from "react-router-dom";
import Room from "./pages/Room";
import Login from "./pages/Login";
import { SocketProvider } from "./context/Socket";
import HomePage from "./pages/HomePage";
import { WebrtcProvider } from "./context/Webrtc";
import SignUp from "./pages/SignUp";

function App() {
  return (
    <SocketProvider>
      <WebrtcProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/room/:roomId" element={<Room />} />
        </Routes>
      </WebrtcProvider>
    </SocketProvider>
  );
}

export default App;
