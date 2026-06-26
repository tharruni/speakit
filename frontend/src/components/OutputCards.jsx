function OutputCards({ outputs, onRegenerate, regenerating }) {
  const copyMessage = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const shareWhatsApp = (text) => {
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const cards = [
    { tone: "Soft", emoji: "🌸", message: outputs.soft, cls: "card-soft" },
    { tone: "Direct", emoji: "⚡", message: outputs.direct, cls: "card-direct" },
    { tone: "Heartfelt", emoji: "❤️", message: outputs.heartfelt, cls: "card-heartfelt" },
  ];

  return (
    <div className="section">
      <h2>Choose Your Message</h2>
      <div className="output-grid">
        {cards.map((card) => (
          <div key={card.tone} className={`output-card ${card.cls}`}>
            <h3>
              {card.emoji} {card.tone}
            </h3>
            <p>{card.message}</p>
            <div className="card-actions">
              <button onClick={() => copyMessage(card.message)}>📋 Copy</button>
              <button onClick={() => shareWhatsApp(card.message)}>💬 Share</button>
            </div>
          </div>
        ))}
      </div>
      <button
        className="generate-btn"
        style={{ marginTop: 16 }}
        onClick={onRegenerate}
        disabled={regenerating}
      >
        {regenerating ? "Regenerating..." : "🔄 Generate New Versions"}
      </button>
    </div>
  );
}

export default OutputCards;
