import { useState } from "react";
import { registerUser, loginUser } from "../api";

function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isRegister) {
        await registerUser(name, email, password);
        setSuccess("Registered! Please login now.");
        setIsRegister(false);
        setPassword("");
      } else {
        const data = await loginUser(email, password);
        onLogin(data.jwtToken, data.name);
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <h1>SpeakIt ✨</h1>
      <p>Say what you really feel</p>

      <form onSubmit={handleSubmit}>
        {isRegister && (
          <input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Please wait..." : isRegister ? "Register" : "Login"}
        </button>
      </form>

      <p
        className="switch-link"
        onClick={() => {
          setIsRegister(!isRegister);
          setError("");
          setSuccess("");
        }}
      >
        {isRegister ? "Already have an account? Login" : "New here? Create an account"}
      </p>
    </div>
  );
}

export default Login;
