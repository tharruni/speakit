// server.js
// SpeakIt Backend - Express + SQLite + JWT Authentication + Claude API

const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET || "speakit_secret_2026";
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const PORT = process.env.PORT || 3001;

let db = null;

// ---------------------------------------------
// Database Initialization
// ---------------------------------------------
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: "./speakit.db",
      driver: sqlite3.Database,
    });

    await db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        emotion TEXT,
        relationship TEXT,
        situation TEXT,
        soft_output TEXT,
        direct_output TEXT,
        heartfelt_output TEXT,
        mode TEXT DEFAULT 'normal',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS moods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        emotion TEXT,
        recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    app.listen(PORT, () =>
      console.log(`SpeakIt server running at http://localhost:${PORT}/`)
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// ---------------------------------------------
// Middleware - JWT Authentication
// ---------------------------------------------
const authenticateToken = (request, response, next) => {
  const authHeader = request.headers["authorization"];
  let jwtToken;

  if (authHeader !== undefined) {
    jwtToken = authHeader.split(" ")[1];
  }

  if (jwtToken === undefined) {
    response.status(401);
    response.send({ error: "Invalid Access Token" });
    return;
  }

  jwt.verify(jwtToken, JWT_SECRET, (error, payload) => {
    if (error) {
      response.status(401);
      response.send({ error: "Invalid Access Token" });
    } else {
      request.userId = payload.userId;
      request.userName = payload.name;
      next();
    }
  });
};

// ---------------------------------------------
// Helper - Call Claude API
// ---------------------------------------------
const callClaude = async (prompt) => {
  const apiResponse = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": CLAUDE_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!apiResponse.ok) {
    const errText = await apiResponse.text();
    throw new Error(`Claude API error: ${apiResponse.status} - ${errText}`);
  }

  const data = await apiResponse.json();
  return data.content[0].text;
};

// Parses "SOFT: ... DIRECT: ... HEARTFELT: ..." formatted text
const parseTones = (text) => {
  const softMatch = text.match(/SOFT:\s*([\s\S]*?)(?=DIRECT:|$)/i);
  const directMatch = text.match(/DIRECT:\s*([\s\S]*?)(?=HEARTFELT:|$)/i);
  const heartfeltMatch = text.match(/HEARTFELT:\s*([\s\S]*)/i);

  return {
    soft: softMatch ? softMatch[1].trim() : "Could not generate.",
    direct: directMatch ? directMatch[1].trim() : "Could not generate.",
    heartfelt: heartfeltMatch ? heartfeltMatch[1].trim() : "Could not generate.",
  };
};

// ---------------------------------------------
// ROUTE: Register
// ---------------------------------------------
app.post("/register", async (request, response) => {
  const { name, email, password } = request.body;

  if (!name || !email || !password) {
    response.status(400);
    response.send({ error: "Name, email and password are required" });
    return;
  }

  if (password.length < 6) {
    response.status(400);
    response.send({ error: "Password must be at least 6 characters" });
    return;
  }

  const existingUser = await db.get("SELECT * FROM users WHERE email = ?", [
    email,
  ]);

  if (existingUser) {
    response.status(400);
    response.send({ error: "User already exists with this email" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.run(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, hashedPassword]
  );

  response.send({ message: "User registered successfully" });
});

// ---------------------------------------------
// ROUTE: Login
// ---------------------------------------------
app.post("/login", async (request, response) => {
  const { email, password } = request.body;

  const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);

  if (!user) {
    response.status(400);
    response.send({ error: "Invalid email or password" });
    return;
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    response.status(400);
    response.send({ error: "Invalid email or password" });
    return;
  }

  const payload = { userId: user.id, name: user.name };
  const jwtToken = jwt.sign(payload, JWT_SECRET);

  response.send({ jwtToken, name: user.name, email: user.email });
});

// ---------------------------------------------
// ROUTE: Generate Message (Normal Mode)
// ---------------------------------------------
app.post("/generate", authenticateToken, async (request, response) => {
  const { emotion, relationship, situation } = request.body;

  if (!emotion || !relationship || !situation) {
    response.status(400);
    response.send({ error: "emotion, relationship and situation are required" });
    return;
  }

  const prompt = `You are SpeakIt, an Indian emotional intelligence assistant that helps people express themselves clearly.

Someone is feeling "${emotion}" and needs to talk to their "${relationship}".
Their situation: "${situation}"

Generate exactly 3 versions of a message they could send. Make the tone feel natural, warm and Indian -- not overly formal, not robotic.

Return ONLY in this exact format, nothing else, no extra commentary:
SOFT: [a gentle, understanding message]
DIRECT: [a clear, assertive but respectful message]
HEARTFELT: [an emotional, sincere message]`;

  try {
    const text = await callClaude(prompt);
    const { soft, direct, heartfelt } = parseTones(text);

    await db.run(
      `INSERT INTO messages 
        (user_id, emotion, relationship, situation, soft_output, direct_output, heartfelt_output, mode)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [request.userId, emotion, relationship, situation, soft, direct, heartfelt, "normal"]
    );

    await db.run(
      "INSERT INTO moods (user_id, emotion) VALUES (?, ?)",
      [request.userId, emotion]
    );

    response.send({ soft, direct, heartfelt });
  } catch (error) {
    console.log(error.message);
    response.status(500);
    response.send({ error: "Failed to generate message. Please try again." });
  }
});

// ---------------------------------------------
// ROUTE: Translate Anger Mode
// ---------------------------------------------
app.post("/translate-anger", authenticateToken, async (request, response) => {
  const { rawMessage } = request.body;

  if (!rawMessage) {
    response.status(400);
    response.send({ error: "rawMessage is required" });
    return;
  }

  const prompt = `Someone wants to send this raw, unfiltered, angry message:
"${rawMessage}"

Transform it into 3 professional, sendable versions. Keep the core meaning and feeling but make it appropriate to actually send. Use natural Indian English.

Return ONLY in this exact format:
SOFT: [gentle version]
DIRECT: [assertive but professional version]
HEARTFELT: [emotional but mature version]`;

  try {
    const text = await callClaude(prompt);
    const { soft, direct, heartfelt } = parseTones(text);

    await db.run(
      `INSERT INTO messages 
        (user_id, emotion, relationship, situation, soft_output, direct_output, heartfelt_output, mode)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [request.userId, "angry", "unspecified", rawMessage, soft, direct, heartfelt, "anger_translate"]
    );

    response.send({ soft, direct, heartfelt });
  } catch (error) {
    console.log(error.message);
    response.status(500);
    response.send({ error: "Failed to translate message. Please try again." });
  }
});

// ---------------------------------------------
// ROUTE: Reverse Mode (decode a received message)
// ---------------------------------------------
app.post("/reverse-mode", authenticateToken, async (request, response) => {
  const { receivedMessage } = request.body;

  if (!receivedMessage) {
    response.status(400);
    response.send({ error: "receivedMessage is required" });
    return;
  }

  const prompt = `Someone received this message and isn't sure what it really means:
"${receivedMessage}"

Explain it clearly. Return ONLY in this exact format:
LITERAL: [what they literally said]
MEANING: [what they probably actually meant]
EMOTION: [what emotion they were likely feeling]
REPLY1: [one thoughtful way to respond]
REPLY2: [another thoughtful way to respond]`;

  try {
    const text = await callClaude(prompt);

    const literal = text.match(/LITERAL:\s*([\s\S]*?)(?=MEANING:|$)/i)?.[1]?.trim() || "";
    const meaning = text.match(/MEANING:\s*([\s\S]*?)(?=EMOTION:|$)/i)?.[1]?.trim() || "";
    const emotion = text.match(/EMOTION:\s*([\s\S]*?)(?=REPLY1:|$)/i)?.[1]?.trim() || "";
    const reply1 = text.match(/REPLY1:\s*([\s\S]*?)(?=REPLY2:|$)/i)?.[1]?.trim() || "";
    const reply2 = text.match(/REPLY2:\s*([\s\S]*)/i)?.[1]?.trim() || "";

    response.send({ literal, meaning, emotion, reply1, reply2 });
  } catch (error) {
    console.log(error.message);
    response.status(500);
    response.send({ error: "Failed to decode message. Please try again." });
  }
});

// ---------------------------------------------
// ROUTE: Get Message History
// ---------------------------------------------
app.get("/history", authenticateToken, async (request, response) => {
  const messages = await db.all(
    `SELECT id, emotion, relationship, situation, soft_output, direct_output, heartfelt_output, mode, created_at
     FROM messages
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT 50`,
    [request.userId]
  );
  response.send(messages);
});

// ---------------------------------------------
// ROUTE: Delete a message from history
// ---------------------------------------------
app.delete("/history/:id", authenticateToken, async (request, response) => {
  const { id } = request.params;

  const message = await db.get(
    "SELECT * FROM messages WHERE id = ? AND user_id = ?",
    [id, request.userId]
  );

  if (!message) {
    response.status(404);
    response.send({ error: "Message not found" });
    return;
  }

  await db.run("DELETE FROM messages WHERE id = ?", [id]);
  response.send({ message: "Deleted successfully" });
});

// ---------------------------------------------
// ROUTE: Mood Insights (for dashboard)
// ---------------------------------------------
app.get("/insights", authenticateToken, async (request, response) => {
  const emotionCounts = await db.all(
    `SELECT emotion, COUNT(*) as count
     FROM moods
     WHERE user_id = ?
     GROUP BY emotion
     ORDER BY count DESC`,
    [request.userId]
  );

  const recentMoods = await db.all(
    `SELECT emotion, recorded_at
     FROM moods
     WHERE user_id = ?
     ORDER BY recorded_at DESC
     LIMIT 30`,
    [request.userId]
  );

  const totalMessages = await db.get(
    `SELECT COUNT(*) as total FROM messages WHERE user_id = ?`,
    [request.userId]
  );

  response.send({
    emotionCounts,
    recentMoods,
    totalMessages: totalMessages.total,
  });
});

// ---------------------------------------------
// ROUTE: Get logged-in user profile
// ---------------------------------------------
app.get("/profile", authenticateToken, async (request, response) => {
  const user = await db.get(
    "SELECT id, name, email, created_at FROM users WHERE id = ?",
    [request.userId]
  );
  response.send(user);
});

// ---------------------------------------------
// Health check
// ---------------------------------------------
app.get("/", (request, response) => {
  response.send({ status: "SpeakIt backend is running" });
});

module.exports = app;
