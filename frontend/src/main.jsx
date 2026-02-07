import { createRoot } from 'react-dom/client';
import App from "./App";
import "./index.css";
import { StrictMode } from "react";
import { UserProvider } from './context/UserContext';
import { Toaster } from "react-hot-toast";

<Toaster position="top-right" />

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </StrictMode>,
)
