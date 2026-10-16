// Minimal AI question generator script (simple version)
// scripts/generate_questions_simple.js
#!/usr/bin/env node
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

const OUT = path.join(process.cwd(), 'questions_grade4_extra.json');
const API_KEY = process.env.OPENAI_API_KEY;
const COUNT = Number(process.env.QUESTION_COUNT || 40);
const MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo-16k';

if (!API_KEY) { console.error('ERROR: set OPENAI_API_KEY'); process.exit(2); }

async function callOpenAI(prompt) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, messages: [{role:'system',content:'You output STRICT JSON only.'},{role:'user',content:prompt}], temperature:0.6, max_tokens:2500 })
  });
  if (!res.ok) throw new Error(await res.text());
  const j = await res.json();
  return j.choices?.[0]?.message?.content || '';
}

function extractJSON(text) {
  const m = text.match(/({[\s\S]*}|\[[\s\S]*\])/);
  if (!m) return null;
  try { return JSON.parse(m[0]); } catch(e){ return null; }
}

async function main(){
  let existing = { ela: [], science: [] };
  try { existing = JSON.parse(await readFile(OUT, 'utf8')); } catch(e) {}

  const prompt = `\nReturn ONLY valid JSON. Produce an object with key "science" whose value is an array of ${COUNT} multiple-choice questions for Grade 4.\nEach item must be: { "cat":"<category>", "s":"science", "q":"<question>", "o":["A","B","C","D"], "a":"<correct option text>", "e":"<1-2 sentence explanation>" }.\nCategories: Ecosystems, Forces & Motion, Energy, Waves, Matter, Earth's Processes, Earth & Space Systems, Structure & Properties of Matter, Engineering Design, Human Impact.\n`;

  console.log('Calling model...');
  const content = await callOpenAI(prompt);
  const parsed = extractJSON(content);
  if (!parsed) { console.error('Could not parse model output. Output:\n', content); throw new Error('Parse failed'); }

  const newScience = Array.isArray(parsed) ? parsed : parsed.science;
  const valid = (newScience || []).filter(it => it && it.q && Array.isArray(it.o) && it.o.length===4 && it.a && it.o.includes(it.a)).map(it=>({ cat:it.cat||'Ecosystems', s:'science', q:it.q.trim(), o:it.o.map(x=>x.trim()), a:it.a.trim(), e:(it.e||'').trim() }));

  if (valid.length===0) throw new Error('No valid questions generated');

  const out = { ela: existing.ela || [], science: [] };
  const seen = new Set();
  (existing.science||[]).forEach(it=>{ if (it?.q && !seen.has(it.q)){ out.science.push(it); seen.add(it.q); }});
  valid.forEach(it=>{ if (!seen.has(it.q)){ out.science.push(it); seen.add(it.q); }});

  await writeFile(OUT, JSON.stringify(out, null, 2), 'utf8');
  console.log(`Wrote ${out.science.length} science items to ${OUT}`);
}

main().catch(e=>{ console.error(e); process.exit(1); });
