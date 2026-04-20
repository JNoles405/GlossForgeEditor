/**
 * CSV import and export for vocabulary
 * Column order: word, translation, pronunciation, pos, notes, tags
 */

export const CSV_HEADERS = ['word', 'translation', 'pronunciation', 'pos', 'notes', 'tags'];

export function vocabToCSV(vocabulary) {
  const header = CSV_HEADERS.join(',');
  const rows = vocabulary.map(w => {
    const fields = [
      w.word        || '',
      w.translation || '',
      w.pronunciation || '',
      w.pos         || '',
      w.notes       || '',
      (w.tags || []).join('; '),
    ];
    return fields.map(f => {
      // Quote fields that contain commas, quotes, or newlines
      if (f.includes(',') || f.includes('"') || f.includes('\n')) {
        return `"${f.replace(/"/g, '""')}"`;
      }
      return f;
    }).join(',');
  });
  return [header, ...rows].join('\n');
}

export function csvToVocab(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row.');

  const header = parseCSVRow(lines[0]).map(h => h.toLowerCase().trim());

  // Flexible column mapping — cope with different column orders
  const colIndex = (name, aliases = []) => {
    const idx = header.findIndex(h => h === name || aliases.includes(h));
    return idx >= 0 ? idx : -1;
  };

  const wordCol  = colIndex('word',          ['term', 'foreign', 'source']);
  const transCol = colIndex('translation',   ['english', 'meaning', 'definition', 'target']);
  const pronCol  = colIndex('pronunciation', ['pronunc', 'ipa', 'phonetic']);
  const posCol   = colIndex('pos',           ['part of speech', 'type', 'class']);
  const notesCol = colIndex('notes',         ['note', 'example', 'context', 'comment']);
  const tagsCol  = colIndex('tags',          ['tag', 'category', 'categories']);

  if (wordCol === -1)  throw new Error('CSV must have a "word" column.');
  if (transCol === -1) throw new Error('CSV must have a "translation" column.');

  const words = [];
  const errors = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      const cols = parseCSVRow(line);
      const word = (cols[wordCol]  || '').trim();
      const trans = (cols[transCol] || '').trim();

      if (!word || !trans) {
        errors.push(`Row ${i + 1}: skipped — word or translation is empty.`);
        continue;
      }

      const rawTags = tagsCol >= 0 ? (cols[tagsCol] || '') : '';
      const tags = rawTags
        .split(/[;,]/)
        .map(t => t.trim())
        .filter(Boolean);

      words.push({
        id: `w_${Date.now()}_${Math.random().toString(36).slice(2,6)}_${i}`,
        word:          word,
        translation:   trans,
        pronunciation: pronCol  >= 0 ? (cols[pronCol]  || '').trim() : '',
        pos:           posCol   >= 0 ? (cols[posCol]   || '').trim() || 'noun' : 'noun',
        notes:         notesCol >= 0 ? (cols[notesCol] || '').trim() : '',
        tags,
      });
    } catch (e) {
      errors.push(`Row ${i + 1}: parse error — ${e.message}`);
    }
  }

  return { words, errors };
}

// Proper RFC 4180 CSV row parser (handles quoted fields with commas/newlines)
function parseCSVRow(line) {
  const fields = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === '"') {
      // Quoted field
      let field = '';
      i++; // skip opening quote
      while (i < line.length) {
        if (line[i] === '"' && line[i+1] === '"') { field += '"'; i += 2; }
        else if (line[i] === '"') { i++; break; }
        else { field += line[i++]; }
      }
      fields.push(field);
      if (line[i] === ',') i++;
    } else {
      // Unquoted field
      const end = line.indexOf(',', i);
      if (end === -1) {
        fields.push(line.slice(i));
        break;
      } else {
        fields.push(line.slice(i, end));
        i = end + 1;
      }
    }
  }
  return fields;
}

export function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const CSV_TEMPLATE = `word,translation,pronunciation,pos,notes,tags
Hello,A greeting,heh-LOH,phrase,"Used when meeting someone",greeting;common
House,A dwelling or home,HOWSS,noun,,everyday;places
Run,To move quickly on foot,RUN,verb,"Example: I run every morning",action;movement
Beautiful,Pleasing to the senses,BYOO-tih-ful,adjective,,description
`;
