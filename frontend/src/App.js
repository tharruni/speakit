import { useState } from "react";
import Login from "./components/Login";
import EmotionPicker from "./components/EmotionPicker";
import RelationshipPicker from "./components/RelationshipPicker";
import SituationInput from "./components/SituationInput";
import OutputCards from "./components/OutputCards";
import TranslateAnger from "./components/TranslateAnger";
import ReverseMode from "./components/ReverseMode";
import MessageHistory from "./components/MessageHistory";
import MoodInsights from "./components/MoodInsights";
import { generateMessage } from "./api";

const TABS = [
  { id: "generate", label: "✨ Generate" },
  { id: "anger", label: "😤 Anger Mode" },
  { id: "reverse", label: "🔍 Reverse" },
  { id: "history", label: "📜 History" },
  { id: "insights", label: "📊 Insights" },
];

function App() {
  const [token, setToken] = useState(localStorage.getItem("speakit_token"));
  const [userName, setUserName] = useState(localStorage.getItem("speakit_name"));
  const [activeTab, setActiveTab] = useState("generate");

  const [emotion, setEmotion] = useState("");
  const [relationship, setRelationship] = useState("");
  const [situation, setSituation] = useState("");
  const [outputs, setOutputs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (jwtToken, name) => {
    localStorage.setItem("speakit_token", jwtToken);
    localStorage.setItem("speakit_name", name);
    setToken(jwtToken);
    setUserName(name);
  };

  const handleLogout = () => {
    localStorage.removeItem("speakit_token");
    localStorage.removeItem("speakit_name");
    setToken(null);
    setUserName(null);
  };

  const runGenerate = async (isRegenerate = false) => {
    if (!emotion || !relationship || !situation.trim()) {
      setError("Please select an emotion, who you're talking to, and describe what happened.");
      return;
    }
    setError("");
    isRegenerate ? setRegenerating(true) : setLoading(true);
    try {
      const data = await generateMessage(emotion, relationship, situation.trim());
      setOutputs(data);
    } catch (err) {
      setError(err.message);
    }
    isRegenerate ? setRegenerating(false) : setLoading(false);
  };

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <nav>
        <h1>SpeakIt ✨</h1>
        <div className="nav-actions">
          <span style={{ color: "var(--text-light)", fontSize: "0.9rem" }}>
            Hi, {userName}
          </span>
          <button className="nav-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="hero">
        <h1>Say What You Really Feel</h1>
        <p>Type how you feel. We find the right words.</p>
      </div>

      <div className="nav-actions" style={{ marginBottom: 20, flexWrap: "wrap" }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`nav-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "generate" && (
        <>
          <EmotionPicker selected={emotion} onSelect={setEmotion} />
          <RelationshipPicker selected={relationship} onSelect={setRelationship} />
          <SituationInput value={situation} onChange={setSituation} />

          {error && <p className="error">{error}</p>}

          <button
            className="generate-btn"
            onClick={() => runGenerate(false)}
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate My Message ✨"}
          </button>

          {outputs && (
            <div style={{ marginTop: 24 }}>
              <OutputCards
                outputs={outputs}
                onRegenerate={() => runGenerate(true)}
                regenerating={regenerating}
              />
            </div>
          )}
        </>
      )}

      {activeTab === "anger" && <TranslateAnger />}
      {activeTab === "reverse" && <ReverseMode />}
      {activeTab === "history" && <MessageHistory />}
      {activeTab === "insights" && <MoodInsights />}

      <p className="disclaimer">
        SpeakIt helps you express yourself more clearly. It does not replace
        real conversation, therapy, or human connection. If you're going
        through something difficult, please reach out to a trusted person or
        professional.
      </p>
    </div>
  );
}

export default App;
