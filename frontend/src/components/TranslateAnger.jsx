import { useState } from "react";
import { translateAnger } from "../api";

function TranslateAnger() {
  const [rawMessage, setRawMessage] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTransform = async () => {
    if (!rawMessage.trim()) {
      setError("Please type what you really want to say.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const data = await translateAnger(rawMessage.trim());
      setResult(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const copyMessage = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied!");
  };

  return (
    <div className="section">
      <h2>😤 Translate Anger Mode</h2>
      <p className="section-subtitle">
        Type what you REALLY want to say — raw and unfiltered. We'll make it
        sendable.
      </p>
      <textarea
        value={rawMessage}
        onChange={(e) => setRawMessage(e.target.value)}
        placeholder="I hate my boss, he is so unfair and took credit for my work..."
      />
      {error && <p className="error">{error}</p>}
      <button className="generate-btn" onClick={handleTransform} disabled={loading}>
        {loading ? "Transforming..." : "Transform It ✨"}
      </button>

      {result && (
        <div className="output-grid" style={{ marginTop: 20 }}>
          <div className="output-card card-soft">
            <h3>🌸 Soft</h3>
            <p>{result.soft}</p>
            <div className="card-actions">
              <button onClick={() => copyMessage(result.soft)}>📋 Copy</button>
            </div>
          </div>
          <div className="output-card card-direct">
            <h3>⚡ Direct</h3>
            <p>{result.direct}</p>
            <div className="card-actions">
              <button onClick={() => copyMessage(result.direct)}>📋 Copy</button>
            </div>
          </div>
          <div className="output-card card-heartfelt">
            <h3>❤️ Heartfelt</h3>
            <p>{result.heartfelt}</p>
            <div className="card-actions">
              <button onClick={() => copyMessage(result.heartfelt)}>📋 Copy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TranslateAnger;
