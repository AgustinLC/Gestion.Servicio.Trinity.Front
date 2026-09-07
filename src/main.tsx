import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import "animate.css";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { AppProvider } from "./context/AppContext.tsx";
import { ConnectionErrorProvider } from "./context/ConnectionErrorContext.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <AuthProvider>
            <AppProvider>
                <ConnectionErrorProvider>
                    <App />
                </ConnectionErrorProvider>
            </AppProvider>
        </AuthProvider>
    </StrictMode>
);
