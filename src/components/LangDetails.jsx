import React from 'react';
import { COLOR_OPTIONS, FLAG_OPTIONS, colorDim } from '../data/schema.js';

export default function LangDetails({ lang, onChange }) {
  const set = (field, val) => {
    const updated = { ...lang, [field]: val };
    if (field === 'color') updated.colorDim = colorDim(val);
    onChange(updated);
  };

  return (
    <div>
      <div className="card mb-16">
        <p className="section-title">Identity</p>
        <div className="grid-2">
          <div className="field">
            <label>Language Name *</label>
            <input className="input" value={lang.name}
              placeholder="e.g. Elvish, Thornish, Gloomtongue"
              onChange={e => set('name', e.target.value)} />
          </div>
          <div className="field">
            <label>Native Name</label>
            <input className="input" value={lang.nativeName}
              placeholder="Name in the language itself"
              onChange={e => set('nativeName', e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label>Origin / World</label>
          <input className="input" value={lang.origin}
            placeholder="e.g. The Shattered Kingdoms, Planet Veth, My fantasy world"
            onChange={e => set('origin', e.target.value)} />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Description</label>
          <textarea className="input" value={lang.description}
            placeholder="Describe your language — its history, who speaks it, what it sounds like, what makes it special. This appears in the About tab on the Android app."
            style={{ minHeight: 100 }}
            onChange={e => set('description', e.target.value)} />
        </div>
      </div>

      <div className="card mb-16">
        <p className="section-title">Appearance</p>
        <div className="field">
          <label>Icon</label>
          <div className="icon-grid">
            {FLAG_OPTIONS.map(f => (
              <button key={f} className={`icon-btn ${lang.flag === f ? 'selected' : ''}`}
                onClick={() => set('flag', f)} title={f}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Accent Color</label>
          <div className="color-swatches">
            {COLOR_OPTIONS.map(c => (
              <button key={c} className={`color-swatch ${lang.color === c ? 'selected' : ''}`}
                style={{ background: c, color: c }}
                onClick={() => set('color', c)}
                title={c} />
            ))}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:10 }}>
            <input type="color" value={lang.color}
              style={{ width:36, height:36, padding:2, background:'none', border:'1px solid var(--gold-dim)',
                borderRadius:6, cursor:'pointer' }}
              onChange={e => set('color', e.target.value)} />
            <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.8rem', color:'var(--smoke)' }}>
              {lang.color} — or pick any custom color above
            </span>
          </div>
        </div>
      </div>

      {/* Live preview */}
      <div className="card" style={{ borderLeft:`4px solid ${lang.color}`, opacity: lang.name ? 1 : 0.4 }}>
        <p className="section-title">Preview (how it looks in the app)</p>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:'2rem' }}>{lang.flag}</span>
          <div style={{ flex:1 }}>
            <p style={{ fontFamily:'var(--font-display)', fontSize:'1rem',
              color:'var(--parchment)', fontWeight:600 }}>
              {lang.name || 'Language Name'}
              {lang.nativeName && (
                <span style={{ fontSize:'0.78rem', color:'var(--smoke)',
                  fontWeight:400, fontStyle:'italic', marginLeft:8 }}>
                  {lang.nativeName}
                </span>
              )}
            </p>
            <p style={{ fontSize:'0.75rem', color:'var(--smoke)', marginTop:2 }}>
              {lang.origin || 'Origin not set'}
            </p>
            <div style={{ marginTop:8, height:6, background:'var(--bg-raised)', borderRadius:3, overflow:'hidden' }}>
              <div style={{ height:'100%', width:'35%', background:`linear-gradient(90deg,${lang.color}66,${lang.color})`,
                borderRadius:3 }} />
            </div>
            <p style={{ fontSize:'0.65rem', color:'var(--smoke)', marginTop:3 }}>
              {lang.vocabulary.length} words · 0% mastered (sample progress)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
