const fs = require('fs');
const path = require('path');

const LIBRARY_PATH = path.join(__dirname, '../assets/data/library.json');

// First collection listed wins when a verse appears in multiple lists.
const ASSIGNMENTS = {
  lament: [
    'Psalm 22:1-2', 'Psalm 42:5', 'Psalm 46:1', 'Psalm 130:1-2', 'Psalm 142:3',
    'Psalm 61:1-2', 'Isaiah 51:12', 'Psalm 56:8', 'Psalm 71:20-21', 'Psalm 84:5-6',
  ],
  identity: [
    'Psalm 139:1-3', 'Psalm 139:14', 'Psalm 139:7-10', 'Isaiah 43:1', 'Isaiah 43:4',
    'Isaiah 49:15-16', 'Isaiah 62:3', 'Isaiah 66:13', 'Psalm 139:17-18', 'Isaiah 43:2',
  ],
  motherhood: [
    'Isaiah 40:11', 'Isaiah 49:15-16', 'Isaiah 66:13', 'Psalm 103:13-14', 'Psalm 131:2', 'Isaiah 46:4',
  ],
  'shame-and-worthiness': [
    'Psalm 51:17', 'Psalm 34:18', 'Isaiah 57:15', 'Isaiah 55:1', 'Isaiah 61:1',
    'Psalm 102:17', 'Psalm 86:15', 'Isaiah 43:1', 'Proverbs 24:16', 'Psalm 103:8',
  ],
  'rest-and-peace': [
    'Psalm 4:8', 'Psalm 23:1-3', 'Isaiah 26:3', 'Isaiah 30:15', 'Psalm 37:7',
    'Proverbs 3:24', 'Psalm 116:7', 'Psalm 131:2', 'Isaiah 32:17-18', 'Psalm 63:6-7',
  ],
  'courage-and-fear': [
    'Isaiah 41:10', 'Isaiah 41:13', 'Psalm 27:1', 'Psalm 56:3', 'Isaiah 43:2',
    'Proverbs 3:25-26', 'Psalm 46:10', 'Isaiah 12:2', 'Psalm 118:5-6', 'Proverbs 18:10',
  ],
};

// Build reference → collection map; first-listed collection wins
const referenceToCollection = {};
for (const [collection, refs] of Object.entries(ASSIGNMENTS)) {
  for (const ref of refs) {
    if (!referenceToCollection[ref]) {
      referenceToCollection[ref] = collection;
    }
  }
}

const library = JSON.parse(fs.readFileSync(LIBRARY_PATH, 'utf8'));

let assigned = 0;
const found = new Set();

for (const verse of library) {
  if (referenceToCollection[verse.reference]) {
    verse.collection = referenceToCollection[verse.reference];
    found.add(verse.reference);
    assigned++;
  }
}

const missing = Object.keys(referenceToCollection).filter(r => !found.has(r));
if (missing.length) {
  console.log('Not found in library:');
  missing.forEach(r => console.log(`  ${r}`));
}

fs.writeFileSync(LIBRARY_PATH, JSON.stringify(library, null, 2));

const byColl = {};
for (const verse of library) {
  if (verse.collection) {
    byColl[verse.collection] = (byColl[verse.collection] ?? 0) + 1;
  }
}
console.log(`\nAssigned ${assigned} verses across ${Object.keys(byColl).length} collections:`);
for (const [k, v] of Object.entries(byColl)) {
  console.log(`  ${k}: ${v}`);
}
