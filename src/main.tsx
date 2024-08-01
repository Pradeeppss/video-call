import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Auth0Provider } from "@auth0/auth0-react";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Auth0Provider
      domain="dev-j43eildeur8ddi7m.us.auth0.com"
      clientId="NqM2DOrij0TXNAFh3CRBNLMzREEhwOgp"
      authorizationParams={{ redirect_uri: "http://localhost:5173/" }}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);
