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

// Mark all as non-editable (isCustom: false) — user must clone to edit
export const BUILTIN_LANGUAGES = [
  klingon, dothraki, highValyrian, atlantean, quenya, sindarin,
  oldEnglish, oldNorse, gaelic, navajo, norwegian,
].map(l => ({ ...l, isCustom: false }));
