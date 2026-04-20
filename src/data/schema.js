// Matches the GlossForge Android app's data schema exactly

export const PARTS_OF_SPEECH = [
  'noun','verb','adjective','adverb','phrase','pronoun',
  'particle','conjunction','preposition','name','numeral',
  'question','interjection','other',
];

export const COLOR_OPTIONS = [
  '#c8860a','#40c8a0','#e05a00','#9060d0','#27ae60',
  '#e67e22','#3d6b99','#c0392b','#8b6914','#16a085',
  '#8e44ad','#d35400','#1a78c2','#2e86c1','#1abc9c',
];

export const FLAG_OPTIONS = [
  '📖','🌟','⚔️','🌿','🐉','🌊','🔮','🌙','☀️','🎭',
  '🏔️','🌺','🦋','🔥','❄️','⚡','🌈','🗿','💎','⚗️',
  '🦅','🐺','🌑','✦','🎪','🏛️','🗡️','🌀','💀','🧿',
];

export function createBlankLanguage() {
  return {
    id: `custom_${Date.now()}`,
    name: '',
    nativeName: '',
    flag: '📖',
    description: '',
    origin: '',
    isCustom: true,
    color: '#40c8a0',
    colorDim: 'rgba(64,200,160,0.15)',
    grammarRules: [],
    vocabulary: [],
  };
}

export function createBlankWord() {
  return {
    id: `w_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
    word: '',
    translation: '',
    pronunciation: '',
    pos: 'noun',
    notes: '',
    tags: [],
  };
}

export function createBlankRule() {
  return {
    id: `r_${Date.now()}`,
    title: '',
    body: '',
  };
}

// Build the color dim from a hex color
export function colorDim(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},0.15)`;
}

// Validate a language object before export
export function validateLanguage(lang) {
  const errors = [];
  if (!lang.name?.trim()) errors.push('Language name is required.');
  if (!lang.id) errors.push('Language ID is missing.');
  if (!Array.isArray(lang.vocabulary)) errors.push('Vocabulary must be an array.');
  if (!Array.isArray(lang.grammarRules)) errors.push('Grammar rules must be an array.');
  for (const [i, w] of (lang.vocabulary || []).entries()) {
    if (!w.word?.trim()) errors.push(`Word #${i+1}: word text is required.`);
    if (!w.translation?.trim()) errors.push(`Word #${i+1}: translation is required.`);
  }
  return errors;
}

// Parse tags from comma string
export function parseTags(str) {
  return str.split(',').map(t => t.trim()).filter(Boolean);
}

// Built-in language IDs — these cannot be deleted but CAN be cloned & edited as custom
export const BUILTIN_IDS = [
  'klingon','dothraki','high_valyrian','atlantean','quenya','sindarin',
  'old_english','old_norse','gaelic','navajo','norwegian',
];
