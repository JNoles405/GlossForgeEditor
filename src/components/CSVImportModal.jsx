import React, { useState, useRef } from 'react';
import { csvToVocab, CSV_TEMPLATE, downloadCSV, vocabToCSV } from '../utils/csv.js';

export default function CSVImportModal({ lang, onImport, onClose }) {
  const [text, setText] = useState('');
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState([]);
  const [mode, setMode] = useState('paste'); // 'paste' | 'file'
  const fileRef = useRef();

  const parse = (csv) => {
    try {
      const { words, errors } = csvToVocab(csv);
      setPreview(words);
      setErrors(errors);
    } catch (e) {
      setPreview(null);
      setErrors([e.message]);
    }
  };

  const handleText = (t) => {
    setText(t);
    if (t.trim()) parse(t);
    else { setPreview(null); setErrors([]); }
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const csv = ev.target.result;
      setText(csv);
      parse(csv);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleImport = (replaceAll) => {
    if (!preview?.length) return;
    onImport(preview, replaceAll);
  };

  const existingCount = lang.vocabulary.length;

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 760 }}>
        <div className="modal-header">
          <h3>📊 CSV Import — {lang.name}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Format guide */}
          <div className="card card-rune" style={{ marginBottom: 16, padding: '12px 16px' }}>
            <p style={{ fontFamily:'var(--font-display)', fontSize:'0.7rem', color:'var(--rune)',
              letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:6 }}>
              Expected CSV Format
            </p>
            <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.74rem', color:'var(--parchment)',
              lineHeight:1.6, whiteSpace:'pre' }}>
              word, translation, pronunciation, pos, notes, tags
            </p>
            <p style={{ fontSize:'0.76rem', color:'var(--smoke)', marginTop:6, lineHeight:1.5 }}>
              Only <strong style={{color:'var(--parchment)'}}>word</strong> and <strong style={{color:'var(--parchment)'}}>translation</strong> are required.
              Tags are semicolon-separated. Column order is flexible.
            </p>
            <div style={{ display:'flex', gap:8, marginTop:10 }}>
              <button className="btn btn-ghost btn-sm"
                onClick={() => downloadCSV(CSV_TEMPLATE, 'glossforge_template.csv')}>
                ⬇ Download Template
              </button>
              {existingCount > 0 && (
                <button className="btn btn-ghost btn-sm"
                  onClick={() => downloadCSV(vocabToCSV(lang.vocabulary), `${lang.id}_vocab.csv`)}>
                  ⬇ Export Current Words
                </button>
              )}
            </div>
          </div>

          {/* Input mode tabs */}
          <div style={{ display:'flex', gap:0, marginBottom:12, borderBottom:'1px solid rgba(200,134,10,0.12)' }}>
            {[['paste','Paste CSV'],['file','Upload File']].map(([m, label]) => (
              <button key={m} onClick={() => setMode(m)} style={{
                padding:'8px 18px', background:'none', border:'none',
                borderBottom: mode===m ? '2px solid var(--gold)' : '2px solid transparent',
                cursor:'pointer', fontFamily:'var(--font-display)', fontSize:'0.72rem',
                letterSpacing:'0.06em', textTransform:'uppercase',
                color: mode===m ? 'var(--gold)' : 'var(--smoke)',
                marginBottom:'-1px',
              }}>{label}</button>
            ))}
          </div>

          {mode === 'paste' ? (
            <div className="field">
              <label>Paste CSV content here</label>
              <textarea className="input" value={text} onChange={e => handleText(e.target.value)}
                placeholder={CSV_TEMPLATE} style={{ minHeight:160, fontFamily:'var(--font-mono)', fontSize:'0.78rem' }} />
            </div>
          ) : (
            <div style={{ textAlign:'center', padding:'24px',
              background:'var(--bg-raised)', borderRadius:'var(--radius)',
              border:'2px dashed rgba(200,134,10,0.2)', cursor:'pointer',
              marginBottom:16 }}
              onClick={() => fileRef.current?.click()}>
              <p style={{ fontSize:'2rem', marginBottom:8 }}>📂</p>
              <p style={{ fontFamily:'var(--font-display)', fontSize:'0.85rem', color:'var(--parchment)', marginBottom:4 }}>
                Click to choose a CSV file
              </p>
              <p style={{ fontSize:'0.75rem', color:'var(--smoke)' }}>
                .csv files exported from Excel, Google Sheets, or our template
              </p>
              <input ref={fileRef} type="file" accept=".csv,.txt" style={{display:'none'}} onChange={handleFile} />
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div style={{ background:'rgba(200,64,64,0.08)', border:'1px solid rgba(200,64,64,0.25)',
              borderRadius:'var(--radius-sm)', padding:'10px 14px', marginBottom:12 }}>
              <p style={{ fontFamily:'var(--font-display)', fontSize:'0.72rem', color:'var(--danger)',
                marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em' }}>
                {errors.length} Issue{errors.length>1?'s':''}
              </p>
              {errors.slice(0,5).map((e,i) => (
                <p key={i} style={{ fontSize:'0.78rem', color:'var(--danger)', lineHeight:1.5 }}>• {e}</p>
              ))}
              {errors.length > 5 && (
                <p style={{ fontSize:'0.76rem', color:'var(--smoke)', marginTop:4 }}>…and {errors.length-5} more</p>
              )}
            </div>
          )}

          {/* Preview */}
          {preview && preview.length > 0 && (
            <div>
              <p style={{ fontFamily:'var(--font-display)', fontSize:'0.72rem', color:'var(--success)',
                letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:8 }}>
                ✓ {preview.length} word{preview.length!==1?'s':''} ready to import
              </p>
              <div className="table-wrap" style={{ maxHeight:200, overflowY:'auto' }}>
                <table>
                  <thead><tr><th>Word</th><th>Translation</th><th>Pronunciation</th><th>POS</th><th>Tags</th></tr></thead>
                  <tbody>
                    {preview.slice(0,8).map((w,i) => (
                      <tr key={i}>
                        <td className="td-word">{w.word}</td>
                        <td>{w.translation}</td>
                        <td className="td-mono">{w.pronunciation||'—'}</td>
                        <td>{w.pos && <span className="pos-pill">{w.pos}</span>}</td>
                        <td><div className="chip-row">{(w.tags||[]).map(t=><span key={t} className="tag tag-smoke">{t}</span>)}</div></td>
                      </tr>
                    ))}
                    {preview.length > 8 && (
                      <tr><td colSpan={5} style={{textAlign:'center',color:'var(--smoke)',fontSize:'0.78rem'}}>
                        …and {preview.length-8} more words
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ flexDirection:'column', gap:8 }}>
          {preview && preview.length > 0 && (
            <div style={{ display:'flex', gap:10, width:'100%' }}>
              {existingCount > 0 && (
                <button className="btn btn-outline" style={{ flex:1 }}
                  onClick={() => handleImport(false)}>
                  + Append to {existingCount} existing words
                </button>
              )}
              <button className="btn btn-gold" style={{ flex:1 }}
                onClick={() => handleImport(true)}>
                {existingCount > 0 ? `↺ Replace all ${existingCount} words` : `✦ Import ${preview.length} words`}
              </button>
            </div>
          )}
          <button className="btn btn-ghost" style={{ alignSelf:'flex-end' }} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
