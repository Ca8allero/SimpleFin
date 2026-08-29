import { useEffect, useState } from "react";
import "./App.css";
import { profileExists } from "./features/authentication/api";
import CreateProfileScreen from "./features/authentication/CreateProfileScreen";
import LoginScreen from "./features/authentication/LoginScreen";

type Screen = "loading" | "create" | "login" | "authenticated";

function App() {
  const [screen, setScreen] = useState<Screen>("loading");

  useEffect(() => {
    profileExists()
      .then((exists) => setScreen(exists ? "login" : "create"))
      .catch(() => setScreen("create"));
  }, []);

  if (screen === "loading") {
    return <main className="min-h-screen bg-background" />;
  }

  if (screen === "create") {
    return <CreateProfileScreen onCreated={() => setScreen("authenticated")} />;
  }

  if (screen === "login") {
    return <LoginScreen onUnlocked={() => setScreen("authenticated")} />;
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <p className="font-display text-xl text-foreground">
        Welcome to Simple Fin — Dashboard coming next.
      </p>
    </main>
  );
}

export default App;