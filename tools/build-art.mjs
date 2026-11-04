import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  circeHall,
  circeTriptych,
  cyclopsCave,
  cyclopsClothCover,
  cyclopsFireCover,
  cyclopsFleeceCover,
  cyclopsShieldCover,
  cyclopsTriptych,
  cyclopsWoodpileCover,
  ithacaHall,
  ithacaTriptych,
  lotusBay,
  lotusTriptych,
  odysseyMap,
  sirensBenchCover,
  sirensCrateCover,
  sirensSailCover,
  sirensSea,
  sirensShieldCover,
  sirensTriptych,
  titleHero
} from './art/odyssey.mjs';

const out = resolve(new URL('../assets/art', import.meta.url).pathname);
mkdirSync(out, { recursive: true });

const files = {
  'title-hero.svg': titleHero(),
  'odyssey-map.svg': odysseyMap(),
  'lotus-a.svg': lotusBay('a'),
  'lotus-b.svg': lotusBay('b'),
  'cyclops-cave.svg': cyclopsCave(),
  'cyclops-fire-cover.svg': cyclopsFireCover(),
  'cyclops-wood-cover.svg': cyclopsWoodpileCover(),
  'cyclops-fleece-cover.svg': cyclopsFleeceCover(),
  'cyclops-cloth-cover.svg': cyclopsClothCover(),
  'cyclops-shield-cover.svg': cyclopsShieldCover(),
  'circe-a.svg': circeHall('a'),
  'circe-b.svg': circeHall('b'),
  'sirens-sea.svg': sirensSea(),
  'sirens-bench-cover.svg': sirensBenchCover(),
  'sirens-crate-cover.svg': sirensCrateCover(),
  'sirens-sail-cover.svg': sirensSailCover(),
  'sirens-shield-cover.svg': sirensShieldCover(),
  'ithaca-a.svg': ithacaHall('a'),
  'ithaca-b.svg': ithacaHall('b'),
  'story-lotus.svg': lotusTriptych(),
  'story-cyclops.svg': cyclopsTriptych(),
  'story-circe.svg': circeTriptych(),
  'story-sirens.svg': sirensTriptych(),
  'story-ithaca.svg': ithacaTriptych()
};

let total = 0;
for (const [name, content] of Object.entries(files)) {
  writeFileSync(resolve(out, name), content);
  total += Buffer.byteLength(content);
  console.log(`${name.padEnd(28)} ${(Buffer.byteLength(content) / 1024).toFixed(1)} kB`);
}
console.log(`\n${Object.keys(files).length} SVG files · ${(total / 1024).toFixed(1)} kB`);
