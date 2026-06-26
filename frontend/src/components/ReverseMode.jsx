import { useState } from "react";
import { reverseMode } from "../api";

function ReverseMode() {
  const [receivedMessage, setReceivedMessage] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDecode = async () => {
    if (!receivedMessage.trim()) {
      setError("Please paste the message you received.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const data = await reverseMode(receivedMessage.trim());
      setResult(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="section">
      <h2>🔍 Reverse Mode</h2>
      <p className="section-subtitle">
        Paste a confusing message you received — we'll explain what it really
        means.
      </p>
      <textarea
        value={receivedMessage}
        onChange={(e) => setReceivedMessage(e.target.value)}
        placeholder="Fine. Do whatever you want."
      />
      {error && <p className="error">{error}</p>}
      <button className="generate-btn" onClick={handleDecode} disabled={loading}>
        {loading ? "Decoding..." : "Decode It 🔍"}
      </button>

      {result && (
        <div style={{ marginTop: 20 }}>
          <p>
            <strong>📝 Literal:</strong> {result.literal}
          </p>
          <p>
            <strong>💭 Meaning:</strong> {result.meaning}
          </p>
          <p>
            <strong>❤️ Emotion:</strong> {result.emotion}
          </p>
          <p>
            <strong>💬 Reply Option 1:</strong> {result.reply1}
          </p>
          <p>
            <strong>💬 Reply Option 2:</strong> {result.reply2}
          </p>
        </div>
      )}
    </div>
  );
}

export default ReverseMode;
