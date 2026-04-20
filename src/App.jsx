import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BUILTIN_LANGUAGES } from './data/builtinLanguages.js';
import {
  loadEditorLanguages, saveEditorLanguages,
  parseImport, buildExport, downloadJSON, buildSeedFile,
} from './utils/storage.js';
import { createBlankLanguage, validateLanguage } from './data/schema.js';
import { vocabToCSV, downloadCSV } from './utils/csv.js';
import { useToast } from './utils/useToast.jsx';
import LangDetails from './components/LangDetails.jsx';
import VocabEditor from './components/VocabEditor.jsx';
import GrammarEditor from './components/GrammarEditor.jsx';
import StatsPanel from './components/StatsPanel.jsx';
import CSVImportModal from './components/CSVImportModal.jsx';
import AlphabetEditor from './components/AlphabetEditor.jsx';

function SidebarItem({ lang, selected, onSelect, badge }) {
  return (
    <div className={`lang-item ${selected?.id === lang.id ? 'active' : ''}`}
      onClick={() => onSelect(lang)}
      style={{ borderLeftColor: selected?.id === lang.id ? lang.color : 'transparent' }}>
      <span className="lang-item-flag">{lang.flag}</span>
      <div className="lang-item-text">
        <div className="lang-item-name">{lang.name || 'Unnamed'}</div>
        <div className="lang-item-meta">{lang.vocabulary.length} words · {lang.grammarRules.length} rules</div>
      </div>
      <span className={`lang-item-badge badge-${badge}`}>
        {badge === 'builtin' ? 'Built-in' : 'Custom'}
      </span>
    </div>
  );
}

function Sidebar({ custom, selected, onSelect, onNew, onImport, onExportAll }) {
  const fileRef = useRef();
  const [searchQ, setSearchQ] = useState('');
  const filter = (list) => !searchQ ? list :
    list.filter(l => l.name.toLowerCase().includes(searchQ.toLowerCase()));

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:2 }}>
          <img src="/icon.png" alt="GlossForge" style={{
            width: 38, height: 38, borderRadius: 8, flexShrink: 0,
            boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
          }} />
          <div>
            <h1>GlossForge</h1>
            <p style={{ color:'var(--smoke)', fontSize:'0.82rem', marginTop:1 }}>Language Editor</p>
          </div>
        </div>
      </div>
      <div style={{ padding:'8px 12px', borderBottom:'1px solid rgba(200,134,10,0.1)', flexShrink:0 }}>
        <div className="search-bar" style={{ padding:'5px 10px' }}>
          <span className="search-icon" style={{ fontSize:'0.9rem' }}>🔍</span>
          <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
            placeholder="Search languages…" style={{ fontSize:'0.94rem' }} />
          {searchQ && <button onClick={() => setSearchQ('')}
            style={{ background:'none', border:'none', color:'var(--smoke)', cursor:'pointer' }}>✕</button>}
        </div>
      </div>
      <div className="sidebar-list">
        <div style={{ padding:'8px 16px 4px', fontSize:'0.76rem', fontFamily:'var(--font-display)',
          letterSpacing:'0.10em', textTransform:'uppercase', color:'var(--smoke)' }}>
          My Languages ({custom.length})
        </div>
        {filter(custom).length === 0 && !searchQ && (
          <div style={{ padding:'6px 16px 8px', fontSize:'0.92rem', color:'var(--smoke)', lineHeight:1.5 }}>
            None yet — click "New Language".
          </div>
        )}
        {filter(custom).map(l => <SidebarItem key={l.id} lang={l} selected={selected} onSelect={onSelect} badge="custom" />)}

        <div style={{ padding:'12px 16px 4px', fontSize:'0.76rem', fontFamily:'var(--font-display)',
          letterSpacing:'0.10em', textTransform:'uppercase', color:'var(--smoke)' }}>
          Built-in ({BUILTIN_LANGUAGES.length}) · Clone to edit
        </div>
        {filter(BUILTIN_LANGUAGES).map(l => <SidebarItem key={l.id} lang={l} selected={selected} onSelect={onSelect} badge="builtin" />)}
      </div>
      <div className="sidebar-footer">
        <button className="btn btn-gold btn-full" onClick={onNew}>✦ New Language</button>
        <button className="btn btn-outline btn-full" onClick={() => fileRef.current?.click()}>📥 Import Backup</button>
        <input ref={fileRef} type="file" accept=".json" style={{ display:'none' }} onChange={onImport} />
        {custom.length > 0 && <button className="btn btn-ghost btn-full" onClick={onExportAll}>📤 Export All Custom</button>}
        <p style={{ fontSize:'0.76rem', color:'var(--smoke)', textAlign:'center', lineHeight:1.6 }}>
          Ctrl+S to save · Escape closes modals
        </p>
      </div>
    </aside>
  );
}

function ReadOnlyBanner({ onClone }) {
  return (
    <div style={{ display:'flex', gap:10, marginBottom:16, alignItems:'center' }}>
      <div className="card card-rune" style={{ flex:1, padding:'10px 16px', display:'flex', alignItems:'center', gap:10 }}>
        <span>🔒</span>
        <p style={{ fontSize:'0.94rem', color:'var(--smoke)' }}>
          Built-in languages are read-only. <strong style={{ color:'var(--rune)', cursor:'pointer' }} onClick={onClone}>Clone & Edit</strong> to modify.
        </p>
      </div>
      <button className="btn btn-gold btn-sm" onClick={onClone}>⧉ Clone & Edit</button>
    </div>
  );
}

function ReadOnlyVocab({ lang, onClone }) {
  const [search, setSearch] = useState('');
  const filtered = lang.vocabulary.filter(w =>
    !search || w.word.toLowerCase().includes(search.toLowerCase()) || w.translation.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div>
      <ReadOnlyBanner onClone={onClone} />
      <div className="search-bar" style={{ marginBottom:14 }}>
        <span className="search-icon">🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" />
        {search && <button onClick={() => setSearch('')} style={{ background:'none', border:'none', color:'var(--smoke)', cursor:'pointer' }}>✕</button>}
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>#</th><th>Word</th><th>Translation</th><th>Pronunciation</th><th>POS</th><th>Tags</th></tr></thead>
          <tbody>
            {filtered.map(w => (
              <tr key={w.id}>
                <td style={{ color:'var(--smoke)', fontSize:'0.84rem' }}>{lang.vocabulary.indexOf(w)+1}</td>
                <td className="td-word" style={{ textShadow:`0 0 10px ${lang.color}33` }}>{w.word}</td>
                <td>{w.translation}</td>
                <td className="td-mono">{w.pronunciation||'—'}</td>
                <td>{w.pos && <span className="pos-pill">{w.pos}</span>}</td>
                <td><div className="chip-row">
                  {(w.tags||[]).slice(0,3).map(t=><span key={t} className="tag tag-smoke">{t}</span>)}
                  {(w.tags||[]).length>3 && <span className="tag tag-smoke">+{w.tags.length-3}</span>}
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReadOnlyGrammar({ lang, onClone }) {
  return (
    <div>
      <ReadOnlyBanner onClone={onClone} />
      {lang.grammarRules.map((r,i) => (
        <div key={r.id||i} className="card" style={{ borderLeft:`3px solid ${lang.color}`, marginBottom:10 }}>
          <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1rem', color:'var(--gold-light)', marginBottom:8 }}>{r.title}</h3>
          <p style={{ fontSize:'1rem', color:'var(--parchment)', lineHeight:1.7 }}>{r.body}</p>
        </div>
      ))}
    </div>
  );
}

function JSONPreview({ lang, showToast }) {
  const json = JSON.stringify(lang, null, 2);
  return (
    <div>
      <div style={{ marginBottom:12, display:'flex', gap:10, alignItems:'flex-start' }}>
        <p style={{ flex:1, fontSize:'0.94rem', color:'var(--smoke)', lineHeight:1.6 }}>
          Raw JSON — exactly what the Android app reads. Use the Export button to download as a backup file.
        </p>
        <button className="btn btn-outline btn-sm" onClick={() => {
          navigator.clipboard?.writeText(json)
            .then(()=>showToast('Copied!','success')).catch(()=>showToast('Copy failed','error'));
        }}>📋 Copy JSON</button>
      </div>
      <pre style={{ background:'var(--bg-void)', border:'1px solid rgba(200,134,10,0.12)',
        borderRadius:'var(--radius)', padding:16, fontSize:'0.84rem', fontFamily:'var(--font-mono)',
        color:'var(--parchment)', lineHeight:1.6, overflow:'auto', maxHeight:'65vh' }}>
        {json}
      </pre>
    </div>
  );
}

function LanguageEditor({ lang, onSave, onDelete, onClone, showToast }) {
  const [current, setCurrent] = useState(lang);
  const [tab, setTab] = useState('details');
  const [dirty, setDirty] = useState(false);
  const [showCSV, setShowCSV] = useState(false);

  useEffect(() => { setCurrent(lang); setDirty(false); setTab('details'); }, [lang.id]);

  // Ctrl+S keyboard shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey||e.metaKey) && e.key==='s') { e.preventDefault(); if (current.isCustom && dirty) handleSave(); }
      if (e.key==='Escape') setShowCSV(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [current, dirty]);

  const handleChange = (updated) => { setCurrent(updated); setDirty(true); };

  const handleSave = () => {
    const errors = validateLanguage(current);
    if (errors.length) { showToast('⚠ ' + errors[0], 'error'); return; }
    onSave(current); setDirty(false); showToast('✦ Saved!', 'success');
  };

  const handleDelete = () => {
    if (confirm(`Delete "${current.name}"? Cannot be undone.`)) onDelete(current.id);
  };

  const handleCSVImport = (words, replaceAll) => {
    const vocab = replaceAll ? words : [...current.vocabulary, ...words];
    const updated = { ...current, vocabulary: vocab };
    handleChange(updated); onSave(updated); setDirty(false); setShowCSV(false);
    showToast(`✦ ${words.length} words ${replaceAll?'imported':'appended'}`, 'success');
  };

  const exportJSON = () => { downloadJSON(buildExport([current]), `glossforge_${current.id}_${Date.now()}.json`); showToast('Exported', 'success'); };
  const exportCSV  = () => { downloadCSV(vocabToCSV(current.vocabulary), `${current.id}_vocab.csv`); showToast('CSV exported', 'success'); };
  const exportSeed = () => {
    const src = buildSeedFile(current);
    const blob = new Blob([src],{type:'text/javascript'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download=`${current.id}.js`; a.click();
    URL.revokeObjectURL(url); showToast('Seed file downloaded', 'success');
  };

  const isBuiltin = !current.isCustom;
  const alphabetLen = (current.alphabet||[]).length;
  const TABS = [
    {id:'details',  label:'Details'},
    {id:'vocab',    label:`Vocabulary (${current.vocabulary.length})`},
    {id:'grammar',  label:`Grammar (${current.grammarRules.length})`},
    {id:'alphabet', label:`Alphabet (${alphabetLen})`},
    {id:'stats',    label:'Statistics'},
    {id:'json',     label:'JSON'},
  ];

  return (
    <>
      {showCSV && <CSVImportModal lang={current} onImport={handleCSVImport} onClose={() => setShowCSV(false)} />}

      <div className="main-toolbar">
        <span style={{ fontSize:'1.6rem' }}>{current.flag}</span>
        <div style={{ flex:1, minWidth:0 }}>
          <h2 style={{ margin:0, fontSize:'1.1rem' }}>
            {current.name || <span style={{ color:'var(--smoke)', fontStyle:'italic' }}>Unnamed Tongue</span>}
            {dirty && <span style={{ color:'var(--ember)', fontSize:'0.76rem', marginLeft:8,
              fontFamily:'var(--font-display)', letterSpacing:'0.04em' }}>● unsaved</span>}
          </h2>
          <p style={{ fontSize:'0.84rem', color:'var(--smoke)', marginTop:1 }}>
            {current.vocabulary.length} words · {current.grammarRules.length} rules
            {isBuiltin && <span style={{ marginLeft:8, color:'var(--gold-dim)' }}>· Read-only</span>}
          </p>
        </div>
        <div className="flex-gap" style={{ flexWrap:'wrap', rowGap:6 }}>
          {isBuiltin ? (
            <button className="btn btn-gold btn-sm" onClick={onClone}>⧉ Clone & Edit</button>
          ) : (<>
            <button className="btn btn-ghost btn-sm" onClick={onClone} title="Clone as new language">⧉ Clone</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowCSV(true)}>📊 CSV Import</button>
            <button className="btn btn-ghost btn-sm" onClick={exportCSV}>📊 CSV Export</button>
            <button className="btn btn-outline btn-sm" onClick={exportJSON}>📤 Export</button>
            <button className="btn btn-ghost btn-sm" onClick={exportSeed} title="Download as JS seed file">📄 Seed</button>
            <button className="btn btn-gold btn-sm" onClick={handleSave}
              disabled={!dirty} style={{ opacity:dirty?1:0.45, cursor:dirty?'pointer':'default' }}
              title="Save (Ctrl+S)">✦ Save</button>
            <button className="btn btn-danger btn-sm" onClick={handleDelete}>🗑</button>
          </>)}
        </div>
      </div>

      <div className="tab-bar">
        {TABS.map(t => (
          <button key={t.id} className={`tab-btn ${tab===t.id?'active':''}`}
            onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      <div className="main-content">
        {tab==='details' && <LangDetails lang={current} onChange={isBuiltin ? ()=>{} : handleChange} />}
        {tab==='vocab'   && (isBuiltin ? <ReadOnlyVocab lang={current} onClone={onClone} /> : <VocabEditor lang={current} onChange={handleChange} onOpenCSV={() => setShowCSV(true)} />)}
        {tab==='grammar' && (isBuiltin ? <ReadOnlyGrammar lang={current} onClone={onClone} /> : <GrammarEditor lang={current} onChange={handleChange} />)}
        {tab==='alphabet' && (isBuiltin ? (
          <div style={{padding:'12px 0'}}>
            <div className="card card-rune" style={{marginBottom:16,padding:'12px 16px',display:'flex',alignItems:'center',gap:10}}>
              <span>🔒</span><p style={{fontSize:'0.94rem',color:'var(--smoke)'}}>Built-in alphabet — read only. <strong style={{color:'var(--rune)',cursor:'pointer'}} onClick={onClone}>Clone & Edit</strong> to modify.</p>
            </div>
            <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
              {(current.alphabet||[]).map(l=>(
                <div key={l.id} style={{padding:'8px 12px',borderRadius:8,background:'var(--bg-card)',
                  border:`1px solid ${l.position==='vowel'?lang.color+'44':'rgba(200,134,10,0.15)'}`,textAlign:'center'}}>
                  <p style={{fontFamily:'var(--font-display)',fontSize:'1.3rem',
                    color:l.position==='vowel'?lang.color:'var(--parchment)',fontWeight:600}}>{l.letter}</p>
                  <p style={{fontSize:'0.7rem',color:'var(--smoke)'}}>{l.name}</p>
                </div>
              ))}
            </div>
            {!(current.alphabet||[]).length && <div className="empty-state"><p>No alphabet data for this language.</p></div>}
          </div>
        ) : <AlphabetEditor lang={current} onChange={handleChange} />)}
        {tab==='stats'   && <StatsPanel lang={current} />}
        {tab==='json'    && <JSONPreview lang={current} showToast={showToast} />}
      </div>
    </>
  );
}

function WelcomePanel({ onNew, onImport }) {
  const fileRef = useRef();
  return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center',
      background:'var(--bg-surface)', padding:32 }}>
      <div style={{ maxWidth:520, width:'100%', textAlign:'center' }}>
        <img src="/icon.png" alt="GlossForge" style={{
          width: 96, height: 96, borderRadius: 18, marginBottom: 18,
          boxShadow: '0 4px 24px rgba(0,0,0,0.6), 0 0 40px rgba(200,134,10,0.15)',
        }} />
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.55rem', color:'var(--gold-light)',
          letterSpacing:'0.06em', textShadow:'0 0 30px rgba(240,192,64,0.3)', marginBottom:6 }}>
          GlossForge Editor
        </h2>
        <p style={{ color:'var(--smoke)', marginBottom:28, lineHeight:1.7 }}>
          Select a language from the sidebar, or get started below.
        </p>
        <div className="grid-2" style={{ marginBottom:24 }}>
          {[
            {icon:'📥', title:'Import Backup', desc:'Load a GlossForge backup JSON from the Android app', action:()=>fileRef.current?.click()},
            {icon:'✦',  title:'New Language',  desc:'Create a brand new language from scratch', action:onNew},
          ].map(c => (
            <div key={c.title} className="card" style={{ cursor:'pointer', textAlign:'left',
              transition:'border-color 0.15s', border:'1px solid rgba(200,134,10,0.15)' }}
              onClick={c.action}
              onMouseOver={e=>e.currentTarget.style.borderColor='rgba(200,134,10,0.4)'}
              onMouseOut={e=>e.currentTarget.style.borderColor='rgba(200,134,10,0.15)'}>
              <p style={{ fontSize:'1.8rem', marginBottom:8 }}>{c.icon}</p>
              <p style={{ fontFamily:'var(--font-display)', fontSize:'1rem', color:'var(--gold-light)', marginBottom:4 }}>{c.title}</p>
              <p style={{ fontSize:'0.9rem', color:'var(--smoke)', lineHeight:1.5 }}>{c.desc}</p>
            </div>
          ))}
        </div>
        <div className="card" style={{ textAlign:'left' }}>
          <p className="section-title">Android sync workflow</p>
          {[
            ['📤','Android → Settings (Codex) → Export Tome'],
            ['📥','Editor → Import Backup → edit languages'],
            ['📤','Editor → Export All (sidebar footer)'],
            ['📱','Android → Settings → Restore from Tome'],
          ].map(([icon,step]) => (
            <div key={step} style={{ display:'flex', gap:10, alignItems:'center', marginBottom:6 }}>
              <span style={{ fontSize:'1rem', flexShrink:0 }}>{icon}</span>
              <span style={{ fontSize:'0.94rem', color:'var(--smoke)' }}>{step}</span>
            </div>
          ))}
        </div>
        <input ref={fileRef} type="file" accept=".json" style={{ display:'none' }} onChange={onImport} />
      </div>
    </div>
  );
}

export default function App() {
  const [customLangs, setCustomLangs] = useState([]);
  const [selected, setSelected] = useState(null);
  const { showToast, Toast } = useToast();

  useEffect(() => { setCustomLangs(loadEditorLanguages()); }, []);

  const persist = useCallback((langs) => { setCustomLangs(langs); saveEditorLanguages(langs); }, []);

  const createNew = () => {
    const lang = createBlankLanguage();
    persist([...customLangs, lang]);
    setSelected(lang);
    showToast('✦ New language created', 'success');
  };

  const saveLang = (lang) => {
    const updated = customLangs.find(l=>l.id===lang.id)
      ? customLangs.map(l=>l.id===lang.id?lang:l)
      : [...customLangs, lang];
    persist(updated);
    if (selected?.id===lang.id) setSelected(lang);
  };

  const deleteLang = (id) => { persist(customLangs.filter(l=>l.id!==id)); setSelected(null); showToast('Language deleted','info'); };

  const cloneLang = () => {
    if (!selected) return;
    const clone = { ...JSON.parse(JSON.stringify(selected)), id:`custom_${Date.now()}`, name:selected.name+' (copy)', isCustom:true };
    persist([...customLangs, clone]);
    setSelected(clone);
    showToast(`Cloned as "${clone.name}"`, 'success');
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const { languages: imported } = parseImport(ev.target.result);
        const marked = imported.map(l=>({...l,isCustom:true}));
        let added=0, skipped=0;
        const merged=[...customLangs];
        for (const lang of marked) {
          if (merged.find(l=>l.id===lang.id)) { skipped++; continue; }
          merged.push(lang); added++;
        }
        persist(merged);
        if (added>0) setSelected(marked[0]);
        showToast(`Imported ${added} language${added!==1?'s':''}${skipped>0?` (${skipped} already existed)`:''}`, 'success');
      } catch(err) { showToast('Import failed: '+err.message, 'error'); }
    };
    reader.readAsText(file); e.target.value='';
  };

  const exportAll = () => {
    if (!customLangs.length) { showToast('No custom languages to export','error'); return; }
    downloadJSON(buildExport(customLangs), `glossforge_backup_${Date.now()}.json`);
    showToast(`Exported ${customLangs.length} language${customLangs.length!==1?'s':''}`, 'success');
  };

  const handleSelect = (lang) => {
    if (lang.isCustom) { const stored=customLangs.find(l=>l.id===lang.id); setSelected(stored||lang); }
    else setSelected(lang);
  };

  return (
    <div className="app-shell">
      {Toast}
      <Sidebar custom={customLangs} selected={selected} onSelect={handleSelect}
        onNew={createNew} onImport={handleImportFile} onExportAll={exportAll} />
      <div className="main-panel">
        {selected
          ? <LanguageEditor key={selected.id} lang={selected} onSave={saveLang}
              onDelete={deleteLang} onClone={cloneLang} showToast={showToast} />
          : <WelcomePanel onNew={createNew} onImport={handleImportFile} />}
      </div>
    </div>
  );
}
