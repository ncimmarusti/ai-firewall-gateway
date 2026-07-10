# Project Notes — AI Firewall / Gateway

## What this project is
*In a few sentences, plain language: what does it do and why does it exist?
What problem is it solving?*

## How it works (the flow)
*Walk a prompt through the system in your own words: dashboard → gateway →
Layer 1 → model → Layer 2 → back to the user. What happens at each stop?*

## The technologies I used
*One line each, in your words:*
- FastAPI / Uvicorn —
- Ollama (TinyLlama, Mistral) —
- SQLite —
- Presidio + spaCy —
- React / Vite —

## What I did to make it better
*The improvements you drove, and WHY you added each one:*
- Added a firewall on/off toggle so I could compare...
- Planted a fake secret so extraction attempts had...
- Added Layer 2 (Presidio output DLP) because I realized Layer 1 alone...
  *(What gap in Layer 1 made you want a second layer?)*

## How I broke Layer 2
*This is the important one — tell the story:*
- What attack did I try? *(asking for the password one part at a time)*
- What did the system do? *(redacted SWORDFISH but leaked 9931, said "SECRET SAFE")*
- WHY did it fail? *(Presidio detects by shape — a fragment has no shape;
  leak detection only checks for the whole string in one response)*
- What this taught me about the limits of shape-based / stateless detection.

## What I'd do next
*The fixes: session-level leak tracking so fragmented leaks are measured
honestly, and a Layer 3 intent classifier to catch multi-turn attacks.*
