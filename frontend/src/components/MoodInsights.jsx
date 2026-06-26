import { useEffect, useState } from "react";
import { getInsights } from "../api";

function MoodInsights() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getInsights()
      .then(setInsights)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading insights...</div>;
  if (error) return <p className="error">{error}</p>;
  if (!insights) return null;

  const maxCount = Math.max(...insights.emotionCounts.map((e) => e.count), 1);

  return (
    <div className="section">
      <h2>Your Mood Insights</h2>

      <div className="insight-grid" style={{ marginBottom: 20 }}>
        <div className="insight-stat">
          <div className="number">{insights.totalMessages}</div>
          <div className="label">Total Messages</div>
        </div>
        <div className="insight-stat">
          <div className="number">{insights.emotionCounts.length}</div>
          <div className="label">Unique Emotions</div>
        </div>
        <div className="insight-stat">
          <div className="number">{insights.recentMoods.length}</div>
          <div className="label">Recent Mood Entries</div>
        </div>
      </div>

      <h3 style={{ marginBottom: 12 }}>Most Felt Emotions</h3>
      {insights.emotionCounts.length === 0 ? (
        <p className="empty-state">No mood data yet.</p>
      ) : (
        insights.emotionCounts.map((e) => (
          <div className="emotion-bar-row" key={e.emotion}>
            <span style={{ width: 90, fontSize: "0.9rem" }}>{e.emotion}</span>
            <div className="emotion-bar-track">
              <div
                className="emotion-bar-fill"
                style={{ width: `${(e.count / maxCount) * 100}%` }}
              />
            </div>
            <span style={{ fontSize: "0.85rem" }}>{e.count}</span>
          </div>
        ))
      )}
    </div>
  );
}

export default MoodInsights;
