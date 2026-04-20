import React, { useState } from 'react';
import { createBlankWord } from '../data/schema.js';
import WordModal from './WordModal.jsx';

export default function VocabEditor({ lang, onChange, onOpenCSV }) {
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [filterPos, setFilterPos] = useState('all');
  const [sortField, setSortField] = useState('index');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const saveWord = (w) => {
    const vocab = lang.vocabulary.find(x => x.id === w.id)
      ? lang.vocabulary.map(x => x.id === w.id ? w : x)
      : [...lang.vocabulary, w];
    onChange({ ...lang, vocabulary: vocab });
    setEditing(null);
  };

  const deleteWord = (id) => {
    onChange({ ...lang, vocabulary: lang.vocabulary.filter(w => w.id !== id) });
    setDeleteConfirm(null);
  };

  const duplicateWord = (w) => {
    const newW = { ...w, id: `w_${Date.now()}_dup`, word: w.word + ' (copy)' };
    onChange({ ...lang, vocabulary: [...lang.vocabulary, newW] });
  };

  const posOptions = ['all', ...new Set(lang.vocabulary.map(w => w.pos).filter(Boolean))];

  let filtered = lang.vocabulary.filter(w => {
    const q = search.toLowerCase();
    const matchSearch = !search || w.word.toLowerCase().includes(q)
      || w.translation.toLowerCase().includes(q)
      || w.pronunciation?.toLowerCase().includes(q)
      || w.tags?.some(t => t.toLowerCase().includes(q));
    const matchPos = filterPos === 'all' || w.pos === filterPos;
    return matchSearch && matchPos;
  });

  if (sortField === 'word') filtered = [...filtered].sort((a,b) => a.word.localeCompare(b.word));
  else if (sortField === 'translation') filtered = [...filtered].sort((a,b) => a.translation.localeCompare(b.translation));
  else if (sortField === 'pos') filtered = [...filtered].sort((a,b) => (a.pos||'').localeCompare(b.pos||''));

  return (
    <div>
      {editing && (
        <WordModal
          word={editing}
          lang={lang}
          onSave={saveWord}
          onClose={() => setEditing(null)}
        />
      )}

      {/* Toolbar */}
      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
        <div className="search-bar" style={{ flex:1, minWidth:200 }}>
          <span className="search-icon">🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search word, translation, tag…" />
          {search && <button onClick={() => setSearch('')}
            style={{ background:'none', border:'none', color:'var(--smoke)', cursor:'pointer', fontSize:'1rem' }}>✕</button>}
        </div>
        <select className="input" value={filterPos} onChange={e => setFilterPos(e.target.value)}
          style={{ width:'auto', minWidth:120 }}>
          {posOptions.map(p => <option key={p} value={p}>{p === 'all' ? 'All Parts of Speech' : p}</option>)}
        </select>
        <select className="input" value={sortField} onChange={e => setSortField(e.target.value)}
          style={{ width:'auto', minWidth:120 }}>
          <option value="index">Sort: Added</option>
          <option value="word">Sort: Word A–Z</option>
          <option value="translation">Sort: Translation A–Z</option>
          <option value="pos">Sort: Part of Speech</option>
        </select>
        <button className="btn btn-gold" onClick={() => setEditing(createBlankWord())}>
          + Add Word
        </button>
        {onOpenCSV && (
          <button className="btn btn-outline" onClick={onOpenCSV} title="Import words from a CSV spreadsheet">
            📊 CSV Import
          </button>
        )}
      </div>

      {/* Stats row */}
      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
        {[
          { label:'Total', val: lang.vocabulary.length },
          { label:'Showing', val: filtered.length },
          { label:'Parts of speech', val: new Set(lang.vocabulary.map(w=>w.pos).filter(Boolean)).size },
          { label:'With pronunciation', val: lang.vocabulary.filter(w=>w.pronunciation?.trim()).length },
        ].map(s => (
          <div key={s.label} style={{ background:'var(--bg-raised)', borderRadius:6,
            padding:'6px 12px', display:'flex', gap:6, alignItems:'baseline' }}>
            <span style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', color:'var(--gold-light)' }}>{s.val}</span>
            <span style={{ fontSize:'0.84rem', color:'var(--smoke)' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">{search ? '🔍' : '📝'}</div>
          <p>{search ? 'No words match your search.' : 'No words yet. Click + Add Word to begin.'}</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width:28 }}>#</th>
                <th onClick={() => setSortField('word')} style={{ cursor:'pointer' }}>
                  Word {sortField==='word' && '▲'}
                </th>
                <th onClick={() => setSortField('translation')} style={{ cursor:'pointer' }}>
                  Translation {sortField==='translation' && '▲'}
                </th>
                <th>Pronunciation</th>
                <th onClick={() => setSortField('pos')} style={{ cursor:'pointer' }}>
                  POS {sortField==='pos' && '▲'}
                </th>
                <th>Tags</th>
                <th style={{ width:120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((word, idx) => (
                <tr key={word.id}>
                  <td style={{ color:'var(--smoke)', fontSize:'0.84rem' }}>
                    {lang.vocabulary.indexOf(word) + 1}
                  </td>
                  <td className="td-word"
                    style={{ textShadow: `0 0 10px ${lang.color}33` }}>
                    {word.word}
                    {word.notes && (
                      <span title={word.notes}
                        style={{ marginLeft:6, color:'var(--smoke)', fontSize:'0.84rem', cursor:'help' }}>
                        📝
                      </span>
                    )}
                  </td>
                  <td>{word.translation}</td>
                  <td className="td-mono">{word.pronunciation || <span style={{ color:'var(--smoke)' }}>—</span>}</td>
                  <td>{word.pos && <span className="pos-pill">{word.pos}</span>}</td>
                  <td>
                    <div className="chip-row" style={{ flexWrap:'nowrap', overflow:'hidden' }}>
                      {(word.tags || []).slice(0,3).map(t => (
                        <span key={t} className="tag tag-smoke">{t}</span>
                      ))}
                      {(word.tags || []).length > 3 && (
                        <span className="tag tag-smoke">+{word.tags.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="td-actions">
                      <button className="btn btn-ghost btn-sm btn-icon"
                        onClick={() => setEditing(word)} title="Edit">✏️</button>
                      <button className="btn btn-ghost btn-sm btn-icon"
                        onClick={() => duplicateWord(word)} title="Duplicate">⧉</button>
                      {deleteConfirm === word.id ? (
                        <>
                          <button className="btn btn-danger btn-sm"
                            onClick={() => deleteWord(word.id)}>Yes</button>
                          <button className="btn btn-ghost btn-sm"
                            onClick={() => setDeleteConfirm(null)}>No</button>
                        </>
                      ) : (
                        <button className="btn btn-ghost btn-sm btn-icon"
                          onClick={() => setDeleteConfirm(word.id)} title="Delete">🗑</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
