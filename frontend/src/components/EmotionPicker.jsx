const EMOTIONS = [
  { id: "angry", emoji: "😡", label: "Angry" },
  { id: "sad", emoji: "😢", label: "Sad" },
  { id: "hurt", emoji: "💔", label: "Hurt" },
  { id: "anxious", emoji: "😰", label: "Anxious" },
  { id: "confused", emoji: "😕", label: "Confused" },
  { id: "happy", emoji: "😊", label: "Grateful" },
  { id: "awkward", emoji: "😬", label: "Awkward" },
  { id: "scared", emoji: "🥺", label: "Scared" },
  { id: "frustrated", emoji: "😤", label: "Frustrated" },
  { id: "overwhelmed", emoji: "🤯", label: "Overwhelmed" },
];

function EmotionPicker({ selected, onSelect }) {
  return (
    <div className="section">
      <h2>How are you feeling?</h2>
      <div className="emotion-grid">
        {EMOTIONS.map((e) => (
          <button
            key={e.id}
            type="button"
            className={`emotion-btn ${selected === e.id ? "selected" : ""}`}
            onClick={() => onSelect(e.id)}
            title={e.label}
            aria-label={e.label}
          >
            {e.emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

export default EmotionPicker;
