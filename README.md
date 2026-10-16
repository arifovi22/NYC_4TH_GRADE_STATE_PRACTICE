# Quest Academy — NYC Grade 4 update

This update adds science practice and fills a few Grade 4 gaps (decimals, fraction–decimal connections, fluency/presentation items, metric measurement). Changes are on branch `update-grade4-standards-bank`.

What I added
- questions_grade4_extra.json — a local bank of extra ELA items and a Science question bank (Grade 4) using NYSSLS-aligned short codes.
- app.js — loads the extra local bank when present and adds new math templates for decimals, fraction↔decimal conversion, mixed-number fraction word problems, and metric liquid volume.
- server.js — updated to allow AI-generation for science questions and includes a short SCIENCE_STANDARDS list.

If you want different exact NYS performance expectation codes for science or prefer a different tagging convention, I can update the PR accordingly.
