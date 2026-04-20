import React, { useState } from 'react';
import { createBlankRule } from '../data/schema.js';
import RuleModal from './RuleModal.jsx';

export default function GrammarEditor({ lang, onChange }) {
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const saveRule = (r) => {
    const rules = lang.grammarRules.find(x => x.id === r.id)
      ? lang.grammarRules.map(x => x.id === r.id ? r : x)
      : [...lang.grammarRules, r];
    onChange({ ...lang, grammarRules: rules });
    setEditing(null);
  };

  const deleteRule = (id) => {
    onChange({ ...lang, grammarRules: lang.grammarRules.filter(r => r.id !== id) });
    setDeleteConfirm(null);
  };

  const moveRule = (idx, dir) => {
    const rules = [...lang.grammarRules];
    const target = idx + dir;
    if (target < 0 || target >= rules.length) return;
    [rules[idx], rules[target]] = [rules[target], rules[idx]];
    onChange({ ...lang, grammarRules: rules });
  };

  return (
    <div>
      {editing && (
        <RuleModal rule={editing} onSave={saveRule} onClose={() => setEditing(null)} />
      )}

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <p style={{ color:'var(--smoke)', fontSize:'0.88rem' }}>
          {lang.grammarRules.length} rule{lang.grammarRules.length !== 1 ? 's' : ''} · Drag or use arrows to reorder
        </p>
        <button className="btn btn-gold" onClick={() => setEditing(createBlankRule())}>
          + Add Rule
        </button>
      </div>

      {lang.grammarRules.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📜</div>
          <p>No grammar rules yet.</p>
          <p style={{ fontSize:'0.82rem', marginTop:6, lineHeight:1.5 }}>
            Add rules to explain how your language works — word order, verb conjugation, case systems, etc.<br/>
            These appear in the Grammar tab on the Android app.
          </p>
          <button className="btn btn-gold" style={{ marginTop:16 }}
            onClick={() => setEditing(createBlankRule())}>
            + Add First Rule
          </button>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {lang.grammarRules.map((rule, idx) => (
            <div key={rule.id} className="card"
              style={{ borderLeft:`3px solid ${lang.color}`, transition:'box-shadow 0.15s' }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                {/* Order controls */}
                <div style={{ display:'flex', flexDirection:'column', gap:2, flexShrink:0 }}>
                  <button className="btn btn-ghost btn-icon"
                    style={{ padding:'3px 7px', opacity: idx===0?0.3:1 }}
                    onClick={() => moveRule(idx, -1)} disabled={idx===0}>▲</button>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.7rem',
                    color:'var(--smoke)', textAlign:'center' }}>{idx+1}</span>
                  <button className="btn btn-ghost btn-icon"
                    style={{ padding:'3px 7px', opacity: idx===lang.grammarRules.length-1?0.3:1 }}
                    onClick={() => moveRule(idx, 1)} disabled={idx===lang.grammarRules.length-1}>▼</button>
                </div>

                {/* Content */}
                <div style={{ flex:1, minWidth:0 }}>
                  <h3 style={{ fontFamily:'var(--font-display)', fontSize:'0.9rem',
                    color:'var(--gold-light)', marginBottom:8 }}>
                    {rule.title}
                  </h3>
                  <p style={{ fontSize:'0.88rem', color:'var(--parchment)', lineHeight:1.7,
                    whiteSpace:'pre-wrap' }}>
                    {rule.body}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                  <button className="btn btn-ghost btn-sm btn-icon"
                    onClick={() => setEditing(rule)} title="Edit">✏️</button>
                  {deleteConfirm === rule.id ? (
                    <>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteRule(rule.id)}>Delete</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                    </>
                  ) : (
                    <button className="btn btn-ghost btn-sm btn-icon"
                      onClick={() => setDeleteConfirm(rule.id)} title="Delete">🗑</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {lang.grammarRules.length > 0 && (
        <div style={{ marginTop:16, padding:'12px 16px', background:'var(--bg-raised)',
          borderRadius:'var(--radius-sm)', border:'1px solid rgba(200,134,10,0.1)' }}>
          <p style={{ fontSize:'0.78rem', color:'var(--smoke)', lineHeight:1.5 }}>
            💡 <strong style={{ color:'var(--parchment-dim)' }}>Tip:</strong> Grammar rules appear in the order
            listed above. Start with the most fundamental rules (word order, verb basics)
            and build toward more complex topics.
          </p>
        </div>
      )}
    </div>
  );
}
