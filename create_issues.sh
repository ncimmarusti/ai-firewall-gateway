#!/usr/bin/env bash
#
# Bulk-create GitHub labels, milestones, and issues for the AI Firewall POC.
#
# Prerequisites:
#   - GitHub CLI installed:  https://cli.github.com
#   - Authenticated:         gh auth login
#   - Run from inside your cloned repo directory.
#
# Usage:  bash create_issues.sh
#
set -euo pipefail

echo "Creating labels..."
gh label create "phase-0" --color FEF08A --description "Setup & Planning"     --force
gh label create "phase-1" --color BFDBFE --description "Backend Core"          --force
gh label create "phase-2" --color FECACA --description "Firewall Engine"       --force
gh label create "phase-3" --color DDD6FE --description "Rules Management API"   --force
gh label create "phase-4" --color BBF7D0 --description "React Dashboard"       --force
gh label create "phase-5" --color FED7AA --description "Testing & Baseline"    --force
gh label create "phase-6" --color E5E7EB --description "Polish & Portfolio"    --force

echo "Creating milestones..."
create_milestone () {
  gh api repos/{owner}/{repo}/milestones -f title="$1" >/dev/null 2>&1 || true
}
create_milestone "Phase 0 — Setup & Planning"
create_milestone "Phase 1 — Backend Core"
create_milestone "Phase 2 — Firewall Engine"
create_milestone "Phase 3 — Rules Management API"
create_milestone "Phase 4 — React Dashboard"
create_milestone "Phase 5 — Testing & Baseline"
create_milestone "Phase 6 — Polish & Portfolio"

echo "Creating issues..."
new_issue () {
  # $1 = title, $2 = label, $3 = body (checklist)
  gh issue create --title "$1" --label "$2" --body "$3"
}

new_issue "Phase 0: Setup & Planning" "phase-0" "$(cat <<'EOF'
- [ ] Create GitHub repo, add README, LICENSE, .gitignore (Python + Node)
- [ ] Commit REQUIREMENTS.md and architecture.mermaid
- [ ] Install Ollama, pull tinyllama and mistral
- [ ] Confirm both models respond via `ollama run`
- [ ] Set up Python venv (FastAPI) and Node project (React)
EOF
)"

new_issue "Phase 1: Backend Core" "phase-1" "$(cat <<'EOF'
- [ ] Scaffold FastAPI app with /health endpoint
- [ ] Define SQLite schema: prompts, rules, logs
- [ ] POST /prompt — accept prompt, return stubbed response
- [ ] Wire Ollama call: forward prompt, capture response
- [ ] Log every request to logs table
EOF
)"

new_issue "Phase 2: Firewall Engine" "phase-2" "$(cat <<'EOF'
- [ ] Rules loader: read active rules from DB on each request
- [ ] Pattern-matching inspection (keyword + regex)
- [ ] Block vs. allow decision + reason logging
- [ ] Seed 5 rule categories (override, leak, roleplay, secrets, evasion)
- [ ] Unit tests for each rule category
EOF
)"

new_issue "Phase 3: Rules Management API" "phase-3" "$(cat <<'EOF'
- [ ] GET /rules — list all rules
- [ ] POST /rules — create rule
- [ ] PUT /rules/{id} — edit rule
- [ ] DELETE /rules/{id} — remove rule
- [ ] Toggle active/inactive per rule
EOF
)"

new_issue "Phase 4: React Dashboard" "phase-4" "$(cat <<'EOF'
- [ ] Prompt submission form + model selector (TinyLlama / Mistral)
- [ ] Live feed table: prompt, matched rule, decision, response
- [ ] Blocked vs. allowed styling
- [ ] Rules management UI (add / edit / delete / toggle)
- [ ] Stats panel: blocked count, allowed count, top rules triggered
EOF
)"

new_issue "Phase 5: Testing & Baseline" "phase-5" "$(cat <<'EOF'
- [ ] Curate injection test suite (OWASP LLM Top 10, MITRE ATLAS, jailbreak sets)
- [ ] Run suite against TinyLlama firewall OFF — record failures (baseline)
- [ ] Run same suite firewall ON — record blocks
- [ ] Produce before/after comparison table
- [ ] Write up findings in RESULTS.md
EOF
)"

new_issue "Phase 6: Polish & Portfolio" "phase-6" "$(cat <<'EOF'
- [ ] README with screenshots + architecture diagram
- [ ] Setup/run instructions (one-command start if possible)
- [ ] Short demo GIF or recording
- [ ] Future work section (AI-classifier detection, output moderation)
- [ ] Final code cleanup and comments
EOF
)"

echo "Done. View them with:  gh issue list"
