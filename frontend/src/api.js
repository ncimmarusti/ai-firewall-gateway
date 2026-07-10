// All backend calls live here so there's one place to change the URL.
const BASE = "http://localhost:8000";

async function json(res) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed (${res.status})`);
  }
  return res.json();
}

export const api = {
  sendPrompt: (prompt, model, firewallEnabled) =>
    fetch(`${BASE}/prompt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        model,
        firewall_enabled: firewallEnabled,
      }),
    }).then(json),

  getLogs: () => fetch(`${BASE}/logs`).then(json),

  getStats: () => fetch(`${BASE}/stats`).then(json),

  getRules: () => fetch(`${BASE}/rules`).then(json),

  createRule: (rule) =>
    fetch(`${BASE}/rules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rule),
    }).then(json),

  updateRule: (id, rule) =>
    fetch(`${BASE}/rules/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rule),
    }).then(json),

  deleteRule: (id) =>
    fetch(`${BASE}/rules/${id}`, { method: "DELETE" }).then(json),
};
