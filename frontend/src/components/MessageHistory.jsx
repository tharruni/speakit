import { useEffect, useState } from "react";
import { getHistory, deleteHistoryItem } from "../api";

function MessageHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await getHistory();
      setHistory(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteHistoryItem(id);
      setHistory(history.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">Loading your history...</div>;

  return (
    <div className="section">
      <h2>Your Message History</h2>
      {error && <p className="error">{error}</p>}

      {history.length === 0 ? (
        <p className="empty-state">No messages yet. Go generate your first one!</p>
      ) : (
        history.map((item) => (
          <div key={item.id} className="history-card">
            <div className="history-header">
              <span>
                {item.emotion} → {item.relationship} ({item.mode})
              </span>
              <span>{new Date(item.created_at).toLocaleDateString("en-IN")}</span>
            </div>
            <p className="history-situation">{item.situation}</p>
            <div className="history-messages">
              <p>
                <strong>🌸</strong> {item.soft_output}
              </p>
              <p>
                <strong>⚡</strong> {item.direct_output}
              </p>
              <p>
                <strong>❤️</strong> {item.heartfelt_output}
              </p>
            </div>
            <button className="delete-btn" onClick={() => handleDelete(item.id)}>
              🗑️ Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default MessageHistory;
