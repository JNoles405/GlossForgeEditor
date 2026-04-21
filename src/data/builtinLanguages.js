import { klingon }      from './seeds/klingon.js';
import { gaelic }       from './seeds/gaelic.js';
import { dothraki }     from './seeds/dothraki.js';
import { quenya }       from './seeds/quenya.js';
import { sindarin }     from './seeds/sindarin.js';
import { navajo }       from './seeds/navajo.js';
import { norwegian }    from './seeds/norwegian.js';
import { atlantean }    from './seeds/atlantean.js';
import { highValyrian } from './seeds/high_valyrian.js';
import { oldEnglish }   from './seeds/old_english.js';
import { oldNorse }     from './seeds/old_norse.js';
import { latin }        from './seeds/latin.js';
import { ancientGreek } from './seeds/ancient_greek.js';
import { ancientHebrew }from './seeds/ancient_hebrew.js';

const _RAW_BUILTIN_LANGUAGES = [
  // Constructed / Fictional
  klingon, dothraki, highValyrian, atlantean, quenya, sindarin,
  // Historical
  oldEnglish, oldNorse,
  // Living
  gaelic, navajo, norwegian,
  // Classical
  latin, ancientGreek, ancientHebrew,
];


// Sanitize: remove undefined entries and filter malformed vocabulary words
// so a bad seed file can never crash the whole app
function sanitizeLanguages(langs) {
  return langs
    .filter(lang => lang && lang.id && lang.vocabulary)
    .map(lang => ({
      ...lang,
      vocabulary: lang.vocabulary.filter(w => w && w.id && w.word && w.translation),
    }));
}

export const BUILTIN_LANGUAGES = sanitizeLanguages(_RAW_BUILTIN_LANGUAGES);

export const LANGUAGE_CATEGORIES = {
  'Constructed / Fictional': ['klingon','dothraki','high_valyrian','atlantean','quenya','sindarin'],
  'Historical':              ['old_english','old_norse'],
  'Living Languages':        ['gaelic','navajo','norwegian'],
  'Classical Languages':     ['latin','ancient_greek','ancient_hebrew'],
};

/**
 * Default structure for a custom language.
 * Language Builder creates objects matching this shape.
 */
export function createBlankLanguage(name = 'New Language') {
  return {
    id: `custom_${Date.now()}`,
    name,
    nativeName: '',
    flag: '📖',
    description: '',
    origin: 'Custom',
    isCustom: true,
    color: '#4ecdc4',
    colorDim: 'rgba(78,205,196,0.15)',
    grammarRules: [],
    vocabulary: [],
  };
}

/**
 * Default blank word entry.
 */
export function createBlankWord(languageId) {
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

export const PARTS_OF_SPEECH = [
  'noun', 'verb', 'adjective', 'adverb', 'phrase', 'pronoun',
  'particle', 'conjunction', 'preposition', 'name', 'numeral', 'other'
];
