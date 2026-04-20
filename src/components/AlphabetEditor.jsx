import React, { useState } from 'react';

const POSITIONS = ['consonant', 'vowel', 'other'];

function LetterModal({ letter, onSave, onClose }) {
  const [l, setL] = useState({ ...letter });
  const set = (f, v) => setL(prev => ({ ...prev, [f]: v }));

  const handleSave = () => {
    if (!l.letter?.trim()) { alert('Letter character is required.'); return; }
    onSave(l);
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 580 }}>
        <div className="modal-header">
          <h3>{letter.letter ? `Edit — ${letter.letter}` : 'Add Letter / Character'}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="grid-2">
            <div className="field">
              <label>Character(s) *</label>
              <input className="input" value={l.letter}
                placeholder="e.g. Þ þ, A a, tlh"
                onChange={e => set('letter', e.target.value)}
                style={{ fontSize: '1.4rem', fontWeight: 600 }}
                autoFocus />
              <p style={{ fontSize:'0.76rem', color:'var(--smoke)', marginTop:4, lineHeight:1.4 }}>
                Include both upper and lower case if applicable. Digraphs (ch, tlh, ng) count as one entry.
              </p>
            </div>
            <div className="field">
              <label>Name / Traditional Name</label>
              <input className="input" value={l.name}
                placeholder="e.g. Thorn, Fehu, Ailm"
                onChange={e => set('name', e.target.value)} />
            </div>
          </div>

          <div className="grid-2">
            <div className="field">
              <label>Romanization</label>
              <input className="input" value={l.romanization}
                placeholder="e.g. th, f, ch"
                onChange={e => set('romanization', e.target.value)} />
            </div>
            <div className="field">
              <label>Pronunciation (simple)</label>
              <input className="input" value={l.pronunciation}
                placeholder="e.g. th (as in thin), kh, y"
                onChange={e => set('pronunciation', e.target.value)} />
            </div>
          </div>

          <div className="field">
            <label>Position</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {POSITIONS.map(pos => (
                <button key={pos} onClick={() => set('position', pos)} style={{
                  flex: 1, padding: '9px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                  fontFamily: 'var(--font-display)', fontSize: '0.76rem', letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  background: l.position === pos ? 'rgba(200,134,10,0.2)' : 'var(--bg-raised)',
                  border: `1px solid ${l.position === pos ? 'var(--gold)' : 'rgba(200,134,10,0.15)'}`,
                  color: l.position === pos ? 'var(--gold)' : 'var(--smoke)',
                }}>{pos}</button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>How to Say It — Full Explanation</label>
            <textarea className="input" value={l.soundDesc}
              placeholder="Explain how to produce this sound. Include comparisons to English sounds, what's unusual about it, and any common mistakes learners make. The more detail the better."
              style={{ minHeight: 110 }}
              onChange={e => set('soundDesc', e.target.value)} />
          </div>

          <div className="grid-2">
            <div className="field">
              <label>Example Word</label>
              <input className="input" value={l.exampleWord}
                placeholder="A word containing this character"
                onChange={e => set('exampleWord', e.target.value)} />
            </div>
            <div className="field">
              <label>Example Translation</label>
              <input className="input" value={l.exampleTranslation}
                placeholder="English meaning"
                onChange={e => set('exampleTranslation', e.target.value)} />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-gold" onClick={handleSave}>
            {letter.letter ? '✦ Save Changes' : '✦ Add Character'}
          </button>
        </div>
      </div>
    </div>
  );
}

function blankLetter() {
  return {
    id: `a_${Date.now()}_${Math.random().toString(36).slice(2,5)}`,
    letter: '', name: '', romanization: '', pronunciation: '',
    soundDesc: '', position: 'consonant',
    exampleWord: '', exampleTranslation: '',
  };
}

export default function AlphabetEditor({ lang, onChange }) {
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const alphabet = lang.alphabet || [];

  const saveLetter = (letter) => {
    const updated = alphabet.find(l => l.id === letter.id)
      ? alphabet.map(l => l.id === letter.id ? letter : l)
      : [...alphabet, letter];
    onChange({ ...lang, alphabet: updated });
    setEditing(null);
  };

  const deleteLetter = (id) => {
    onChange({ ...lang, alphabet: alphabet.filter(l => l.id !== id) });
    setDeleteConfirm(null);
  };

  const moveLetter = (idx, dir) => {
    const arr = [...alphabet];
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    onChange({ ...lang, alphabet: arr });
  };

  const vowels = alphabet.filter(l => l.position === 'vowel').length;
  const consonants = alphabet.filter(l => l.position === 'consonant').length;
  const others = alphabet.filter(l => l.position === 'other').length;

  return (
    <div>
      {editing && (
        <LetterModal letter={editing} onSave={saveLetter} onClose={() => setEditing(null)} />
      )}

      {/* Header */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--smoke)', lineHeight: 1.6, marginBottom: 8 }}>
            Build the writing system or sound guide for your language.
            Each entry can represent a letter, character, digraph, or sound rule.
            Learners will see these in the Alphabet tab and can study them with flashcards.
          </p>
          {alphabet.length > 0 && (
            <div style={{ display: 'flex', gap: 12 }}>
              {[['vowels', vowels], ['consonants', consonants], ['other', others]]
                .filter(([, n]) => n > 0)
                .map(([label, n]) => (
                  <span key={label} style={{ fontSize: '0.78rem', color: 'var(--smoke)' }}>
                    <strong style={{ color: 'var(--gold-light)' }}>{n}</strong> {label}
                  </span>
                ))}
            </div>
          )}
        </div>
        <button className="btn btn-gold" onClick={() => setEditing(blankLetter())}>
          + Add Character
        </button>
      </div>

      {/* Quick preview */}
      {alphabet.length > 0 && (
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16,
          padding: '12px 14px', background: 'var(--bg-raised)',
          borderRadius: 'var(--radius)', border: '1px solid rgba(200,134,10,0.12)',
        }}>
          {alphabet.map(letter => (
            <span key={letter.id} onClick={() => setEditing(letter)} style={{
              padding: '4px 10px', borderRadius: 8, cursor: 'pointer',
              fontFamily: 'var(--font-display)',
              fontSize: letter.letter.length > 4 ? '0.85rem' : '1.2rem',
              color: letter.position === 'vowel' ? lang.color : 'var(--parchment)',
              background: letter.position === 'vowel'
                ? `${lang.color}18` : 'rgba(200,134,10,0.08)',
              border: `1px solid ${letter.position === 'vowel'
                ? `${lang.color}44` : 'rgba(200,134,10,0.15)'}`,
              transition: 'all 0.15s',
              fontWeight: 600,
            }} title={letter.name}>
              {letter.letter}
            </span>
          ))}
        </div>
      )}

      {/* Letter table */}
      {alphabet.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔤</div>
          <p>No characters yet.</p>
          <p style={{ fontSize: '0.88rem', marginTop: 6, lineHeight: 1.5, maxWidth: 340, margin: '6px auto 16px' }}>
            Add each letter, digraph, or sound of your language. Include pronunciation
            explanations so learners can actually say the words correctly.
          </p>
          <button className="btn btn-gold" onClick={() => setEditing(blankLetter())}>
            + Add First Character
          </button>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: 40 }}>#</th>
                <th>Character</th>
                <th>Name</th>
                <th>Romanization</th>
                <th>Position</th>
                <th>Example</th>
                <th style={{ width: 130 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {alphabet.map((letter, idx) => (
                <tr key={letter.id}>
                  <td style={{ color: 'var(--smoke)', fontSize: '0.78rem' }}>{idx + 1}</td>
                  <td>
                    <span style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: letter.letter.length > 4 ? '1rem' : '1.4rem',
                      color: letter.position === 'vowel' ? lang.color : 'var(--gold-light)',
                      fontWeight: 600,
                    }}>{letter.letter}</span>
                  </td>
                  <td style={{ fontSize: '0.9rem', color: 'var(--parchment)' }}>{letter.name || '—'}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.84rem', color: 'var(--smoke)' }}>
                    {letter.romanization || '—'}
                  </td>
                  <td>
                    {letter.position && (
                      <span style={{
                        padding: '2px 8px', borderRadius: 12, fontSize: '0.72rem',
                        fontFamily: 'var(--font-display)', letterSpacing: '0.04em',
                        background: letter.position === 'vowel'
                          ? `${lang.color}18` : 'rgba(200,134,10,0.1)',
                        color: letter.position === 'vowel' ? lang.color : 'var(--gold-dim)',
                        border: `1px solid ${letter.position === 'vowel'
                          ? `${lang.color}33` : 'rgba(200,134,10,0.2)'}`,
                      }}>{letter.position}</span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.86rem', color: 'var(--smoke)' }}>
                    {letter.exampleWord && letter.exampleWord !== '—'
                      ? <span style={{ color: 'var(--parchment)' }}>{letter.exampleWord}</span>
                      : '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-ghost btn-sm btn-icon"
                        style={{ padding: '4px 8px', opacity: idx === 0 ? 0.3 : 1 }}
                        onClick={() => moveLetter(idx, -1)} disabled={idx === 0}>▲</button>
                      <button className="btn btn-ghost btn-sm btn-icon"
                        style={{ padding: '4px 8px', opacity: idx === alphabet.length - 1 ? 0.3 : 1 }}
                        onClick={() => moveLetter(idx, 1)} disabled={idx === alphabet.length - 1}>▼</button>
                      <button className="btn btn-ghost btn-sm btn-icon"
                        onClick={() => setEditing(letter)} title="Edit">✏️</button>
                      {deleteConfirm === letter.id ? (
                        <>
                          <button className="btn btn-danger btn-sm"
                            onClick={() => deleteLetter(letter.id)}>Del</button>
                          <button className="btn btn-ghost btn-sm"
                            onClick={() => setDeleteConfirm(null)}>✕</button>
                        </>
                      ) : (
                        <button className="btn btn-ghost btn-sm btn-icon"
                          onClick={() => setDeleteConfirm(letter.id)}>🗑</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {alphabet.length > 0 && (
        <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--bg-raised)',
          borderRadius: 'var(--radius-sm)', border: '1px solid rgba(200,134,10,0.1)' }}>
          <p style={{ fontSize: '0.82rem', color: 'var(--smoke)', lineHeight: 1.5 }}>
            💡 <strong style={{ color: 'var(--parchment-dim)' }}>Tip:</strong> Vowels are highlighted
            in the app's alphabet grid. The "How to Say It" explanation is the most valuable field —
            learners rely on it to produce sounds correctly. Click any character in the preview above to edit it.
          </p>
        </div>
      )}
    </div>
  );
}
