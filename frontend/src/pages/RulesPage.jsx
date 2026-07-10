import { useEffect, useState } from "react";
import { api } from "../api.js";

const BLANK = { name: "", pattern: "", severity: "medium", is_active: true };

export default function RulesPage() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null); // rule id being edited
  const [draft, setDraft] = useState(BLANK);
  const [adding, setAdding] = useState(false);
  const [newRule, setNewRule] = useState(BLANK);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setRules(await api.getRules());
    } catch (e) {
      setError("Couldn't load rules. Is the backend running on port 8000?");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(rule) {
    setEditing(rule.id);
    setDraft({
      name: rule.name,
      pattern: rule.pattern,
      severity: rule.severity,
      is_active: !!rule.is_active,
    });
  }

  async function saveEdit(id) {
    await api.updateRule(id, draft);
    setEditing(null);
    load();
  }

  async function remove(id) {
    if (!confirm("Delete this rule?")) return;
    await api.deleteRule(id);
    load();
  }

  async function addRule() {
    if (!newRule.name.trim() || !newRule.pattern.trim()) return;
    await api.createRule(newRule);
    setNewRule(BLANK);
    setAdding(false);
    load();
  }

  return (
    <div className="page">
      <header className="page-head">
        <h1>Rules</h1>
        <p>The patterns the gateway checks every prompt against. Edit them live.</p>
      </header>

      {error && <div className="notice notice-error">{error}</div>}
      {loading && <div className="notice">Loading…</div>}

      <div className="rules-list">
        {rules.map((rule) =>
          editing === rule.id ? (
            <div className="rule-card rule-editing" key={rule.id}>
              <input
                className="inp"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="Rule name"
              />
              <input
                className="inp inp-mono"
                value={draft.pattern}
                onChange={(e) => setDraft({ ...draft, pattern: e.target.value })}
                placeholder="Pattern (regex)"
              />
              <div className="rule-controls">
                <select
                  className="inp"
                  value={draft.severity}
                  onChange={(e) => setDraft({ ...draft, severity: e.target.value })}
                >
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                </select>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={draft.is_active}
                    onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })}
                  />
                  active
                </label>
                <div className="spacer" />
                <button className="btn-ghost" onClick={() => setEditing(null)}>
                  Cancel
                </button>
                <button className="btn-primary btn-sm" onClick={() => saveEdit(rule.id)}>
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="rule-card" key={rule.id}>
              <div className="rule-main">
                <div className="rule-name">
                  {rule.name}
                  <span className={"sev sev-" + rule.severity}>{rule.severity}</span>
                  {!rule.is_active && <span className="sev sev-off">inactive</span>}
                </div>
                <code className="rule-pattern">{rule.pattern}</code>
              </div>
              <div className="rule-actions">
                <button className="btn-ghost" onClick={() => startEdit(rule)}>
                  Edit
                </button>
                <button className="btn-ghost btn-danger" onClick={() => remove(rule.id)}>
                  Delete
                </button>
              </div>
            </div>
          )
        )}
      </div>

      {adding ? (
        <div className="rule-card rule-editing">
          <input
            className="inp"
            value={newRule.name}
            onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
            placeholder="Rule name"
          />
          <input
            className="inp inp-mono"
            value={newRule.pattern}
            onChange={(e) => setNewRule({ ...newRule, pattern: e.target.value })}
            placeholder="Pattern (regex), e.g. (?i)ignore previous instructions"
          />
          <div className="rule-controls">
            <select
              className="inp"
              value={newRule.severity}
              onChange={(e) => setNewRule({ ...newRule, severity: e.target.value })}
            >
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
            <div className="spacer" />
            <button className="btn-ghost" onClick={() => setAdding(false)}>
              Cancel
            </button>
            <button className="btn-primary btn-sm" onClick={addRule}>
              Add rule
            </button>
          </div>
        </div>
      ) : (
        <button className="btn-add" onClick={() => setAdding(true)}>
          + New rule
        </button>
      )}
    </div>
  );
}
