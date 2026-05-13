'use strict';

const fs = require('fs');
const path = require('path');

const DATA = path.join(__dirname, '..', 'assets', 'data');

function parseJsonl(file) {
  return fs.readFileSync(path.join(DATA, file), 'utf8')
    .trim().split('\n').filter(Boolean)
    .map(l => JSON.parse(l));
}

const MOODS = [
  'afraid', 'anxious', 'overwhelmed', 'weary', 'exhausted',
  'grieving', 'heartbroken', 'lonely', 'abandoned',
  'ashamed', 'despairing', 'restless',
  'grateful', 'worshipful', 'strong', 'courageous',
];

const MOOD_LABELS = {
  afraid:      'I feel afraid',
  anxious:     'I feel anxious',
  overwhelmed: "I'm overwhelmed",
  weary:       "I'm carrying too much",
  exhausted:   'I have nothing left',
  grieving:    "I'm grieving",
  heartbroken: 'My heart is broken',
  lonely:      'I feel alone',
  abandoned:   'I feel abandoned',
  ashamed:     'I feel ashamed',
  despairing:  "I'm in a dark place",
  restless:    "I can't be still",
};

const library = parseJsonl('library.jsonl');
const prayers = parseJsonl('prayers.jsonl');

const prayerByMood = {};
for (const p of prayers) prayerByMood[p.mood_tag] = p;

function getVersesByMood(mood) {
  return library.filter(v => v.mood_tags.includes(mood));
}
function getPrayerByMood(mood) {
  return prayerByMood[mood] ?? null;
}
function getMoodDisplayLabel(mood) {
  return MOOD_LABELS[mood];
}

// ── verification ─────────────────────────────────────────────────────────────

let pass = 0;
let fail = 0;

function check(label, value, assertion) {
  const ok = assertion(value);
  console.log(`  ${ok ? '✓' : '✗'} ${label}`);
  if (!ok) {
    console.log(`    got: ${JSON.stringify(value)}`);
    fail++;
  } else {
    pass++;
  }
}

console.log('\n── getVersesByMood("weary") ────────────────────────────────');
const weary = getVersesByMood('weary');
console.log(`  ${weary.length} verses`);
weary.slice(0, 4).forEach(v => console.log(`    • ${v.reference}`));
check('returns multiple verses', weary.length, n => n > 1);

console.log('\n── getPrayerByMood("despairing") ───────────────────────────');
const desp = getPrayerByMood('despairing');
console.log(`  ${desp ? '"' + desp.prayer.slice(0, 72) + '…"' : 'null'}`);
check('returns a prayer', desp, p => p !== null);
check('prayer.mood_tag is "despairing"', desp?.mood_tag, t => t === 'despairing');

console.log('\n── getMoodDisplayLabel("heartbroken") ──────────────────────');
const label = getMoodDisplayLabel('heartbroken');
console.log(`  "${label}"`);
check('returns correct label', label, l => l === 'My heart is broken');

console.log('\n── getVersesByMood("restless") vs getVersesByMood("weary") ─');
const restless = getVersesByMood('restless');
console.log(`  restless: ${restless.length} verses`);
console.log(`  weary:    ${weary.length} verses`);
check('restless has fewer verses than weary', null,
  () => restless.length < weary.length);

console.log('\n── all 16 moods have at least one verse and one prayer ─────');
for (const mood of MOODS) {
  const vCount = getVersesByMood(mood).length;
  const hasPrayer = getPrayerByMood(mood) !== null;
  check(`${mood}: ${vCount} verses, prayer=${hasPrayer}`, null,
    () => vCount > 0 && hasPrayer);
}

console.log('\n── new empowerment tags appear in multiple verses ──────────');
for (const mood of ['grateful', 'worshipful', 'strong', 'courageous']) {
  const count = getVersesByMood(mood).length;
  check(`${mood}: ${count} verses (need ≥2)`, count, n => n >= 2);
}

console.log('\n── no duplicate references ─────────────────────────────────');
const refs = library.map(v => v.reference);
const seen = new Set();
const dupes = [];
for (const r of refs) {
  if (seen.has(r)) dupes.push(r);
  seen.add(r);
}
check('no duplicate references', dupes.length, n => n === 0);
if (dupes.length) dupes.forEach(r => console.log(`    duplicate: ${r}`));

console.log(`\n${'─'.repeat(55)}`);
console.log(`  ${pass} passed  ${fail > 0 ? fail + ' FAILED' : '0 failed'}`);
console.log(`${'─'.repeat(55)}\n`);

if (fail > 0) process.exit(1);
