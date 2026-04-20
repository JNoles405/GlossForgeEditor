import React, { useState } from 'react';
import { PARTS_OF_SPEECH, parseTags } from '../data/schema.js';

export default function WordModal({ word, lang, onSave, onClose }) {
  const [w, setW] = useState({ ...word });

  const set = (field, val) => setW(prev => ({ ...prev, [field]: val }));

  const handleSave = () => {
    if (!w.word.trim()) { alert('Word text is required.'); return; }
    if (!w.translation.trim()) { alert('Translation is required.'); return; }
    onSave(w);
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>{word.word ? `Edit — ${word.word}` : 'Add New Word'}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="grid-2">
            <div className="field">
              <label>{lang.name} Word *</label>
              <input className="input" value={w.word}
                placeholder="The word in your language"
                onChange={e => set('word', e.target.value)} autoFocus />
            </div>
            <div className="field">
              <label>Translation *</label>
              <input className="input" value={w.translation}
                placeholder="English meaning"
                onChange={e => set('translation', e.target.value)} />
            </div>
          </div>

          <div className="grid-2">
            <div className="field">
              <label>Pronunciation</label>
              <input className="input" value={w.pronunciation}
                placeholder="e.g. KAH-la, MOOR-ay"
                onChange={e => set('pronunciation', e.target.value)} />
            </div>
            <div className="field">
              <label>Part of Speech</label>
              <select className="input" value={w.pos} onChange={e => set('pos', e.target.value)}>
                {PARTS_OF_SPEECH.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="field">
            <label>Notes / Example Sentence</label>
            <textarea className="input" value={w.notes}
              placeholder="Usage notes, example sentence, cultural context…"
              style={{ minHeight: 70 }}
              onChange={e => set('notes', e.target.value)} />
          </div>

          <div className="field">
            <label>Tags (comma-separated)</label>
            <input className="input" value={(w.tags || []).join(', ')}
              placeholder="e.g. greeting, common, nature, spiritual"
              onChange={e => set('tags', parseTags(e.target.value))} />
            {w.tags?.length > 0 && (
              <div className="chip-row mt-4">
                {w.tags.map(t => (
                  <span key={t} className="tag tag-smoke">{t}</span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-gold" onClick={handleSave}>
            {word.word ? '✦ Save Changes' : '✦ Add Word'}
          </button>
        </div>
      </div>
    </div>
  );
}
