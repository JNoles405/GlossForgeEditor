import React, { useState } from 'react';

export default function RuleModal({ rule, onSave, onClose }) {
  const [r, setR] = useState({ ...rule });
  const set = (f, v) => setR(prev => ({ ...prev, [f]: v }));

  const handleSave = () => {
    if (!r.title.trim()) { alert('Rule title is required.'); return; }
    if (!r.body.trim()) { alert('Explanation is required.'); return; }
    onSave(r);
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>{rule.title ? `Edit Rule — ${rule.title}` : 'Add Grammar Rule'}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label>Rule Title *</label>
            <input className="input" value={r.title}
              placeholder="e.g. Verb Comes Last, No Articles, Tonal Distinctions"
              onChange={e => set('title', e.target.value)} autoFocus />
          </div>
          <div className="field">
            <label>Explanation *</label>
            <textarea className="input" value={r.body}
              placeholder="Explain the rule clearly, with an example sentence or two. The learner will see this in the Grammar tab."
              style={{ minHeight: 140 }}
              onChange={e => set('body', e.target.value)} />
          </div>
          <p style={{ fontSize:'0.78rem', color:'var(--smoke)', lineHeight:1.5 }}>
            💡 Good grammar notes include: what the rule is, why it matters, and a concrete example showing the rule in action.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-gold" onClick={handleSave}>
            {rule.title ? '✦ Save Rule' : '✦ Add Rule'}
          </button>
        </div>
      </div>
    </div>
  );
}
