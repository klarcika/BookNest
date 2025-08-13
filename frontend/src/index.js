import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

const clerkPubKey = import.meta.env.CLERK_KEY

if (!clerkPubKey) {
    console.error("Missing CLERK_KEY in .env file");
}

ReactDOM.createRoot(document.getElementById("root")).render(
    <ClerkProvider publishableKey={clerkPubKey}>
        <App />
    </ClerkProvider>
);

reportWebVitals();
