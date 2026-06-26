import { useRef, useState } from "react";

function SituationInput({ value, onChange }) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const startVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Try Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognitionRef.current = recognition;

    recognition.onstart = () => setListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onChange(transcript);
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognition.start();
  };

  return (
    <div className="section">
      <h2>What happened?</h2>
      <p className="section-subtitle">
        Just say what happened. Don't worry about how it sounds.
      </p>
      <div className="input-wrapper">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. My boss gave my project credit to someone else..."
        />
        <button
          type="button"
          className={`mic-btn ${listening ? "listening" : ""}`}
          onClick={startVoice}
        >
          {listening ? "🔴 Listening..." : "🎤 Voice"}
        </button>
      </div>
    </div>
  );
}

export default SituationInput;
