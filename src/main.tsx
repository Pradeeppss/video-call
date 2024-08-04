import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { QueryClient, QueryClientProvider } from "react-query";

const client = new QueryClient();
ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={client}>
    <React.StrictMode>
      <BrowserRouter>
        <App />
        <ToastContainer position="bottom-right" autoClose={2000} />
      </BrowserRouter>
    </React.StrictMode>
  </QueryClientProvider>
);
