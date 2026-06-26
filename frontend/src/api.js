// api.js
// Central place for all backend calls

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3001";

const getToken = () => localStorage.getItem("speakit_token");

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

export const registerUser = async (name, email, password) => {
  const response = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Registration failed");
  return data;
};

export const loginUser = async (email, password) => {
  const response = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Login failed");
  return data;
};

export const generateMessage = async (emotion, relationship, situation) => {
  const response = await fetch(`${API_BASE}/generate`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ emotion, relationship, situation }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Generation failed");
  return data;
};

export const translateAnger = async (rawMessage) => {
  const response = await fetch(`${API_BASE}/translate-anger`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ rawMessage }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Translation failed");
  return data;
};

export const reverseMode = async (receivedMessage) => {
  const response = await fetch(`${API_BASE}/reverse-mode`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ receivedMessage }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Decoding failed");
  return data;
};

export const getHistory = async () => {
  const response = await fetch(`${API_BASE}/history`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Failed to load history");
  return response.json();
};

export const deleteHistoryItem = async (id) => {
  const response = await fetch(`${API_BASE}/history/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Failed to delete");
  return response.json();
};

export const getInsights = async () => {
  const response = await fetch(`${API_BASE}/insights`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Failed to load insights");
  return response.json();
};
