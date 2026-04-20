import React, { useMemo } from 'react';

export default function StatsPanel({ lang }) {
  const stats = useMemo(() => {
    const vocab = lang.vocabulary;
    const total = vocab.length;

    // POS breakdown
    const posCounts = {};
    for (const w of vocab) {
      const p = w.pos || 'unspecified';
      posCounts[p] = (posCounts[p] || 0) + 1;
    }
    const posBreakdown = Object.entries(posCounts)
      .sort((a,b) => b[1] - a[1]);

    // Tag cloud
    const tagCounts = {};
    for (const w of vocab) {
      for (const t of (w.tags || [])) {
        tagCounts[t] = (tagCounts[t] || 0) + 1;
      }
    }
    const topTags = Object.entries(tagCounts)
      .sort((a,b) => b[1] - a[1])
      .slice(0, 20);

    // Completeness
    const withPronunc = vocab.filter(w => w.pronunciation?.trim()).length;
    const withNotes   = vocab.filter(w => w.notes?.trim()).length;
    const withTags    = vocab.filter(w => w.tags?.length > 0).length;
    const withPos     = vocab.filter(w => w.pos?.trim()).length;

    // Word length distribution
    const avgWordLen = total > 0
      ? (vocab.reduce((s,w) => s + (w.word?.length||0), 0) / total).toFixed(1)
      : 0;
    const avgTransLen = total > 0
      ? (vocab.reduce((s,w) => s + (w.translation?.length||0), 0) / total).toFixed(1)
      : 0;

    // Duplicate check
    const wordSet = new Set();
    const dupes = [];
    for (const w of vocab) {
      const key = w.word?.toLowerCase().trim();
      if (key && wordSet.has(key)) dupes.push(w.word);
      else if (key) wordSet.add(key);
    }

    return { total, posCounts, posBreakdown, topTags, withPronunc, withNotes,
      withTags, withPos, avgWordLen, avgTransLen, dupes };
  }, [lang.vocabulary]);

  const pct = (n) => stats.total > 0 ? Math.round((n / stats.total) * 100) : 0;

  if (stats.total === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📊</div>
        <p>Add some words to see statistics.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Overview */}
      <div className="grid-3" style={{ marginBottom:16 }}>
        {[
          { label:'Total Words', val: stats.total, icon:'📖' },
          { label:'Grammar Rules', val: lang.grammarRules.length, icon:'📜' },
          { label:'Avg Word Length', val: `${stats.avgWordLen} chars`, icon:'📏' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <p style={{ fontSize:'1.5rem', marginBottom:4 }}>{s.icon}</p>
            <div className="stat-value">{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Completeness */}
      <div className="card" style={{ marginBottom:16 }}>
        <p className="section-title">Completeness</p>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {[
            { label:'Has pronunciation guide', val: stats.withPronunc },
            { label:'Has notes / examples',     val: stats.withNotes },
            { label:'Has tags',                 val: stats.withTags },
            { label:'Has part of speech',        val: stats.withPos },
          ].map(item => (
            <div key={item.label}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontSize:'0.95rem', color:'var(--parchment)' }}>{item.label}</span>
                <span style={{ fontFamily:'var(--font-display)', fontSize:'0.95rem',
                  color: pct(item.val) >= 80 ? 'var(--success)' : pct(item.val) >= 50 ? 'var(--gold)' : 'var(--smoke)' }}>
                  {item.val}/{stats.total} · {pct(item.val)}%
                </span>
              </div>
              <div style={{ height:5, background:'var(--bg-raised)', borderRadius:3, overflow:'hidden' }}>
                <div style={{
                  height:'100%',
                  width:`${pct(item.val)}%`,
                  background: pct(item.val)>=80 ? 'var(--success)' : pct(item.val)>=50 ? 'var(--gold)' : 'var(--smoke)',
                  borderRadius:3, transition:'width 0.5s ease',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* POS breakdown */}
      <div className="grid-2" style={{ marginBottom:16 }}>
        <div className="card">
          <p className="section-title">Parts of Speech</p>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {stats.posBreakdown.slice(0,10).map(([pos, count]) => (
              <div key={pos} style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span className="pos-pill" style={{ flexShrink:0 }}>{pos}</span>
                <div style={{ flex:1, height:4, background:'var(--bg-raised)', borderRadius:2, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${pct(count)}%`, background:'var(--gold)', borderRadius:2 }} />
                </div>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.84rem', color:'var(--smoke)', flexShrink:0 }}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <p className="section-title">Top Tags</p>
          {stats.topTags.length === 0 ? (
            <p style={{ color:'var(--smoke)', fontSize:'0.95rem' }}>No tags assigned yet.</p>
          ) : (
            <div className="chip-row">
              {stats.topTags.map(([tag, count]) => (
                <span key={tag} title={`${count} words`} style={{
                  display:'inline-flex', alignItems:'center', gap:4,
                  padding:'3px 10px', borderRadius:20, cursor:'default',
                  background:'rgba(200,134,10,0.1)', color:'var(--gold)',
                  border:'1px solid rgba(200,134,10,0.2)',
                  fontSize: Math.max(0.78, Math.min(1.05, 0.78 + count * 0.04)) + 'rem',
                  fontFamily:'var(--font-display)', letterSpacing:'0.04em',
                }}>
                  {tag}
                  <span style={{ fontSize:'0.78rem', color:'var(--smoke)' }}>{count}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Warnings */}
      {stats.dupes.length > 0 && (
        <div style={{ background:'rgba(224,90,0,0.08)', border:'1px solid rgba(224,90,0,0.25)',
          borderRadius:'var(--radius)', padding:'12px 16px', marginBottom:16 }}>
          <p style={{ fontFamily:'var(--font-display)', fontSize:'0.84rem', color:'var(--ember)',
            letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:6 }}>
            ⚠ Duplicate Words ({stats.dupes.length})
          </p>
          <p style={{ fontSize:'0.94rem', color:'var(--smoke)', lineHeight:1.5 }}>
            These words appear more than once: {stats.dupes.slice(0,8).join(', ')}
            {stats.dupes.length > 8 && ` …and ${stats.dupes.length - 8} more`}
          </p>
        </div>
      )}

      {/* Tips */}
      <div className="card" style={{ opacity:0.7 }}>
        <p className="section-title">Recommendations</p>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {[
            pct(stats.withPronunc) < 50 && `Add pronunciation guides to more words — only ${pct(stats.withPronunc)}% have them.`,
            pct(stats.withTags) < 30 && `Tag your words so the flashcard filter works well — only ${pct(stats.withTags)}% are tagged.`,
            stats.total < 25 && `Aim for at least 25 words before studying — ${25-stats.total} more to go.`,
            lang.grammarRules.length === 0 && `Add at least 3–4 grammar rules to fill out the Grammar tab on the app.`,
            stats.dupes.length > 0 && `Remove duplicate entries to keep your vocabulary clean.`,
          ].filter(Boolean).map((tip, i) => (
            <p key={i} style={{ fontSize:'0.94rem', color:'var(--smoke)', lineHeight:1.5 }}>
              💡 {tip}
            </p>
          ))}
          {[pct(stats.withPronunc)>=50, pct(stats.withTags)>=30, stats.total>=25,
            lang.grammarRules.length>0, stats.dupes.length===0].every(Boolean) && (
            <p style={{ fontSize:'0.94rem', color:'var(--success)' }}>
              ✦ Looks great! This language is well-structured and ready to study.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
