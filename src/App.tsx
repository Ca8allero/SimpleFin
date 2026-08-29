import { useEffect, useState } from "react";
import "./App.css";
import { profileExists } from "./features/authentication/api";
import CreateProfileScreen from "./features/authentication/CreateProfileScreen";
import LoginScreen from "./features/authentication/LoginScreen";
import Sidebar from "./components/Sidebar";
import ComingSoon from "./components/ComingSoon";
import DashboardScreen from "./features/dashboard/DashboardScreen";

type Screen = "loading" | "create" | "login" | "app";

const SECTION_TITLES: Record<string, string> = {
  finances: "Finances",
  investments: "Investments",
  analytics: "Analytics",
  forecast: "Forecast",
  settings: "Settings",
};

function App() {
  const [screen, setScreen] = useState<Screen>("loading");
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    profileExists()
      .then((exists) => setScreen(exists ? "login" : "create"))
      .catch(() => setScreen("create"));
  }, []);

  if (screen === "loading") {
    return <main className="min-h-screen bg-background" />;
  }

  if (screen === "create") {
    return <CreateProfileScreen onCreated={() => setScreen("app")} />;
  }

  if (screen === "login") {
    return <LoginScreen onUnlocked={() => setScreen("app")} />;
  }

  return (
    <div className="h-screen flex bg-background">
      <Sidebar
        active={activeSection}
        onSelect={setActiveSection}
        onLock={() => setScreen("login")}
      />
      <main className="flex-1 overflow-hidden">
        {activeSection === "overview" ? (
          <DashboardScreen />
        ) : (
          <ComingSoon title={SECTION_TITLES[activeSection] ?? activeSection} />
        )}
      </main>
    </div>
  );
}

export default App;