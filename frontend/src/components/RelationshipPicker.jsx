const RELATIONSHIPS = [
  { id: "parent", emoji: "👨‍👩‍👧", label: "Parent" },
  { id: "friend", emoji: "👫", label: "Friend" },
  { id: "boss", emoji: "👨‍💼", label: "Boss" },
  { id: "partner", emoji: "💑", label: "Partner" },
  { id: "teacher", emoji: "👩‍🏫", label: "Teacher" },
  { id: "colleague", emoji: "🧑‍🤝‍🧑", label: "Colleague" },
];

function RelationshipPicker({ selected, onSelect }) {
  return (
    <div className="section">
      <h2>Who are you talking to?</h2>
      <div className="relationship-grid">
        {RELATIONSHIPS.map((r) => (
          <div
            key={r.id}
            className={`relationship-card ${selected === r.id ? "selected" : ""}`}
            onClick={() => onSelect(r.id)}
          >
            {r.emoji} {r.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default RelationshipPicker;
