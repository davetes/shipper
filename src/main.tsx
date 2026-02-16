import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

const googleClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID as string | undefined;

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={googleClientId ?? ""}>
    <App />
  </GoogleOAuthProvider>
);
