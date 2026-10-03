# Quest Academy — NYC Grade 4 update

This update adds:
- Grade 4 Math coverage across NY-4.OA, NY-4.NBT, NY-4.NF, NY-4.MD and NY-4.G.
- Grade 4 English Language Arts practice using multiple-choice questions.
- ELA practice in reading evidence/inference, main idea, vocabulary, text structure, writing, research, grammar/usage, punctuation, and speaking/listening.
- Subject selection and a Grade 4 ELA mode.
- A better answer UI for ELA (multiple choice) while keeping numeric entry for math.
- Standard codes in the coach explanations.

Important: NYC public schools use New York State learning standards; the code labels in this app are NYS Next Generation standards. A complete NYC curriculum also includes school/district pacing and local curriculum choices, so this is standards-aligned practice rather than an official NYC Department of Education curriculum.

Math Grade 4 areas added/covered:
1. Operations & Algebraic Thinking: multiplicative comparison, multi-step word problems, factors/multiples/prime/composite, patterns.
2. Number & Operations in Base Ten: place value/rounding, multi-digit addition/subtraction, multiplication, division.
3. Number & Operations—Fractions: equivalent fractions, comparing fractions, addition/subtraction with like denominators, multiplying a whole number by a fraction.
4. Measurement & Data: unit conversions, measurement word problems, area/perimeter, line-plot-related measurement work.
5. Geometry: lines/angles, symmetry, triangles, quadrilaterals.

ELA Grade 4 areas:
- Reading literary and informational text
- Evidence, inference, main idea/theme
- Vocabulary in context
- Text structure
- Writing informative/explanatory and narrative responses
- Text evidence in writing
- Research and note-taking
- Grammar, capitalization, punctuation and sentence conventions
- Speaking/listening and discussion

The official NYS standards should remain the source of truth when expanding the question bank.

## Scratch pad (whiteboard)

There's now a collapsible **"✏️ Open Scratch Pad"** panel kids can use to work out math problems or jot notes on an ELA passage — mouse, touch, and stylus all work (built on Pointer Events). It has four pen colors, an eraser, and a Clear button, and it automatically clears itself each time a new question loads so old scratch work never lingers into the wrong question.

## No-repeat questions

Both Math and ELA now draw from a "shuffle bag": every question/question-type is shown once, in random order, before anything repeats, and the app also makes sure the question right after a reshuffle is never the same as the one right before it. In practice: you'll see all 49 ELA questions (in a random order) before any ELA question repeats, and all 22 math question templates before any type repeats.

## Optional: Unlimited AI-generated questions

The page now has a **"🤖 Unlimited AI Questions"** checkbox. Turning it on asks a small backend (included as `server.js`) to generate a brand-new, syllabus-aligned question from Claude every time, instead of pulling from the fixed question bank.

**This requires running the included Node server — it will not work if you just open `index.html` directly or host it as plain static files without a backend.** That's intentional: your Anthropic API key must stay on a server, never inside `app.js`, because anything in `app.js` is visible to anyone who views the page source.

### Setup
```bash
npm install
cp .env.example .env     # then paste your real key from console.anthropic.com into .env
npm start
```
Then open `http://localhost:3000` — the checkbox will now call Claude for each new question. If the server isn't running, or the key is missing/invalid, the checkbox automatically un-checks itself and the app quietly falls back to the built-in question bank, so the app always keeps working either way.
