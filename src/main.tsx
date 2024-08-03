import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Auth0Provider } from "@auth0/auth0-react";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { QueryClient, QueryClientProvider } from "react-query";

const client = new QueryClient();
ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={client}>
    <React.StrictMode>
      <Auth0Provider
        domain="dev-j43eildeur8ddi7m.us.auth0.com"
        clientId="NqM2DOrij0TXNAFh3CRBNLMzREEhwOgp"
        authorizationParams={{ redirect_uri: window.location.origin }}
      >
        <BrowserRouter>
          <App />
          <ToastContainer position="bottom-right" autoClose={2000} />
        </BrowserRouter>
      </Auth0Provider>
    </React.StrictMode>
  </QueryClientProvider>
);
