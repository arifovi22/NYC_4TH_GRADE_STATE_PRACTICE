// Quest Academy — optional AI question server
// -------------------------------------------------
// Serves the app's static files AND a POST /api/generate-question endpoint
// that asks Claude for a fresh, syllabus-aligned Grade 4 question each time.
// This is what powers the "🤖 Unlimited AI Questions" checkbox in the app.
//
// IMPORTANT: your Anthropic API key must live here, on the server, in an
// environment variable. Never put it inside app.js or any file sent to the
// browser — anyone could view-source the page and steal it.
//
// Setup:
//   1. npm install
//   2. cp .env.example .env         then put your real key in .env
//   3. npm start
//   4. open http://localhost:3000   (the checkbox will now work)
//
// If you don't run this server, the app still works fine — it just uses its
// built-in question bank instead of calling out to Claude.
//
// HOSTING ON GITHUB PAGES: GitHub Pages only serves static files, so it
// cannot run this server. The usual setup is: index.html + app.js on GitHub
// Pages, and this server deployed separately (Render, Railway, Fly.io, a
// VPS, etc.), with app.js's AI_ENDPOINT pointed at that separate URL. Because
// the two will then be on different domains, this file allows cross-origin
// requests (CORS) from any origin by default — see ALLOWED_ORIGIN below if
// you'd rather lock it down to just your GitHub Pages URL.

require("dotenv").config();
const express = require("express");

const app = express();

// Allow the app.js running on GitHub Pages (a different domain) to call this
// server. Set ALLOWED_ORIGIN in your environment to restrict this to just
// your Pages URL, e.g. https://yourusername.github.io — otherwise it's left
// open ("*") so this works out of the box for a simple student project.
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(express.json());
app.use(express.static(__dirname)); // serves index.html, app.js, etc. from this same folder (only used if you host the whole app from here instead of GitHub Pages)

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = "claude-haiku-4-5-20251001"; // fast and inexpensive — plenty for short quiz questions

const MATH_STANDARDS = [
  "NY-4.OA.1 multiplicative comparison",
  "NY-4.OA.2 multiplicative comparison word problem",
  "NY-4.OA.3 multi-step word problem using the four operations",
  "NY-4.OA.4 factors, multiples, prime/composite numbers (1-100)",
  "NY-4.OA.5 number or shape pattern",
  "NY-4.NBT.1-3 place value / rounding multi-digit numbers",
  "NY-4.NBT.4 multi-digit addition or subtraction",
  "NY-4.NBT.5 multi-digit multiplication",
  "NY-4.NBT.6 division with a one-digit divisor, may have a remainder",
  "NY-4.NF.1-2 equivalent fractions or comparing fractions",
  "NY-4.NF.3-4 adding/subtracting like-denominator fractions or multiplying a fraction by a whole number",
  "NY-4.MD.1-2 measurement unit conversion or measurement word problem",
  "NY-4.MD.3 area and perimeter of a rectangle",
  "NY-4.MD.5-7 angle measurement",
  "NY-4.G.1-3 lines, angles, triangles, quadrilaterals, or symmetry"
];

const ELA_STANDARDS = [
  "NY-4R1 inference using text evidence from a short literary passage",
  "NY-4R2 main idea or theme of a short passage",
  "NY-4R3 relationships between events, characters, or ideas in a passage",
  "NY-4RI1-3 informational text: evidence, main idea, or cause/effect",
  "NY-4RI4 vocabulary in context from an informational passage",
  "NY-4RI5 text structure (sequence, compare/contrast, problem/solution, cause/effect)",
  "NY-4RI6 author's purpose",
  "NY-4L1-2 grammar, capitalization, or punctuation",
  "NY-4L4-5 vocabulary strategies (prefixes/suffixes) or figurative language/idioms",
  "NY-4W2-3 topic sentences or descriptive/sensory detail",
  "NY-4W5 using text evidence to support a written response",
  "NY-4SL1 collaborative discussion skills"
];

app.post("/api/generate-question", async (req, res) => {
  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "Server is missing ANTHROPIC_API_KEY. See .env.example." });
  }

  const subject = req.body.subject === "ela" ? "ela" : "math";
  const pool = subject === "ela" ? ELA_STANDARDS : MATH_STANDARDS;
  const standard = pool[Math.floor(Math.random() * pool.length)];
  const seed = Math.random().toString(36).slice(2, 8); // nudges the model toward a different question every call

  const systemPrompt = subject === "math"
    ? "You write ONE original NYC/NYS Grade 4 math practice question. " +
      "Respond with ONLY raw JSON (no markdown fences, no commentary), matching exactly this shape: " +
      '{"question":"<question text, plain text or simple HTML>","answer":<number>,' +
      '"explanation":"<1-2 sentence explanation, may use <strong> tags>","standard":"<short code like NY-4.OA.1>"}. ' +
      'The "answer" must be a plain number a student would type in. Keep numbers grade-appropriate for the standard given. ' +
      "Vary the scenario, names, and numbers each time — do not reuse a generic textbook example."
    : "You write ONE original NYC/NYS Grade 4 English Language Arts multiple-choice practice question. " +
      "Respond with ONLY raw JSON (no markdown fences, no commentary), matching exactly this shape: " +
      '{"question":"<a short passage wrapped in a <div class=\\"passage\\">...</div> if the standard needs one, ' +
      'followed by the actual question>","options":["opt1","opt2","opt3","opt4"],' +
      '"answer":"<the exact text of the correct option, must match one options entry exactly>",' +
      '"explanation":"<1-2 sentence explanation of why the answer is correct>","standard":"<short code like NY-4R1>"}. ' +
      "Write a fresh, grade-appropriate passage or scenario each time — do not reuse a stock example.";

  const userPrompt = `Standard focus: ${standard}. Random seed: ${seed}. Generate the question now as raw JSON only.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 500,
        temperature: 1,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(502).json({ error: "Anthropic API error", detail: errText });
    }

    const data = await response.json();
    const textBlock = (data.content || []).find(function(b) { return b.type === "text"; });
    if (!textBlock) return res.status(502).json({ error: "No text in model response" });

    const cleaned = textBlock.text.replace(/```json|```/g, "").trim();
    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      return res.status(502).json({ error: "Model did not return valid JSON", raw: cleaned });
    }

    parsed.type = subject === "ela" ? "mcq" : "number";
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
  console.log("Quest Academy server running at http://localhost:" + PORT);
  if (!ANTHROPIC_API_KEY) {
    console.log('⚠️  No ANTHROPIC_API_KEY set — the "Unlimited AI Questions" toggle will fall back to the local bank.');
  }
});
