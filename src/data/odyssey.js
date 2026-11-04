export const odyssey = {
  id: 'odyssey',
  kicker: 'UNIT I',
  title: 'The Odyssey',
  latin: 'THE ODYSSEY',
  subtitle: 'The Long Way Home',
  author: "After Homer's Odyssey",
  intro: 'The war at Troy is over. Ten years of wandering still stand between Odysseus and Ithaca.',
  epigraph: '"A traveler is not lost so long as a road home remains."',
  map: {
    image: 'odyssey-map',
    nodes: [
      { x: 248, y: 652, label: 'Lotus Shore' },
      { x: 470, y: 508, label: 'Cyclops Isle' },
      { x: 760, y: 590, label: 'Aeaea' },
      { x: 1080, y: 396, label: 'Siren Rocks' },
      { x: 1442, y: 616, label: 'Ithaca' }
    ]
  },
  levels: [
    {
      id: 'lotus',
      number: 1,
      roman: 'I',
      title: 'The Lotus-Eaters',
      latin: 'THE LOTUS-EATERS',
      place: 'The Southern Sea · Lotus Isle',
      story: {
        kicker: 'NINE DAYS OUT FROM TROY',
        image: 'story-lotus',
        caption: 'The storm drives the fleet off course. The shore is in bloom.',
        paragraphs: [
          'Troy is still burning on the horizon when Odysseus sets sail for Ithaca. But the gods are not finished with him, and a north wind drives his fleet into the fog.',
          'On the tenth day they reach an island covered in pink lotus flowers. The islanders offer the crew the honey-sweet fruit. Those who eat it forget their oars, their ship, and even home.',
          'Odysseus drags the last man back to the ship. First, he must see through the five false details in this bay and break the lotus spell.'
        ],
        quote: '"They ate the honey-sweet lotus, and would not sail home, nor even remember it."',
        source: 'Homer, The Odyssey · Book IX'
      },
      puzzle: {
        type: 'spot',
        title: 'Five Flaws in the Lotus Bay',
        instruction: 'Five details differ between the two paintings. Find them all to wake the crew from the lotus spell.',
        imageA: 'lotus-a',
        imageB: 'lotus-b',
        differences: [
          { id: 'sail-eye', name: 'The Eye on the Sail', x: 340, y: 435, r: 80, hint: 'That sail seems to be watching you.' },
          { id: 'lotus-color', name: 'The Pale Lotus', x: 790, y: 790, r: 86, hint: 'The largest lotus has changed color.' },
          { id: 'birds', name: 'The Extra Gull', x: 960, y: 214, r: 80, hint: 'Count the gulls again.' },
          { id: 'tripod', name: 'The Golden Tripod', x: 1338, y: 520, r: 78, hint: 'Something gold stood on the eastern cliff.' },
          { id: 'cloth', name: 'The Red Cloth', x: 640, y: 738, r: 82, hint: 'The rock by the shore has lost its cloth.' }
        ]
      },
      reward: {
        title: 'The Fog Lifts',
        text: 'The sweetness fades and the oars bite the water again. Ahead, an unnamed island is already sending up smoke.'
      }
    },
    {
      id: 'cyclops',
      number: 2,
      roman: 'II',
      title: "The Cyclops' Cave",
      latin: 'THE CYCLOPS',
      place: 'The Goat Island · Polyphemus’ Cave',
      story: {
        kicker: 'THE ISLAND OF THE CYCLOPS',
        image: 'story-cyclops',
        caption: 'A boulder seals the mouth of the cave. Firelight reaches every wall.',
        paragraphs: [
          'The island belongs to Polyphemus, a shepherd with one eye. He drives Odysseus and his men into the cave, rolls a boulder across the entrance, and eats two of them.',
          'The giant says his name is “No One.” Odysseus offers him wine and waits for him to fall asleep. Then he must find seven things that can get them out.',
          'Some lie in plain sight. Others are hidden under firewood, fleece, and hanging cloth. There is no second door and only one chance.'
        ],
        quote: '"No One — my name is No One."',
        source: 'Homer, The Odyssey · Book IX'
      },
      puzzle: {
        type: 'hidden',
        title: 'Seven Things to Escape the Cave',
        instruction: 'Find seven things in the cave. Some are hidden — move aside whatever covers them.',
        image: 'cyclops-cave',
        items: [
          { id: 'wine', name: 'Wine Skin', x: 532, y: 398, r: 58, hint: 'A dark red skin hangs against the cave wall.' },
          { id: 'honey', name: 'Honey Jar', x: 880, y: 424, r: 52, hint: 'The small jar with the bee mark on the shelf.' },
          { id: 'ember', name: 'Ember', x: 700, y: 670, r: 54, cover: 'fire', hint: 'A dull red coal still glows beneath the fire.' },
          { id: 'stake', name: 'Olive Stake', x: 420, y: 732, r: 64, cover: 'wood', hint: 'One sharpened olive branch lies in the woodpile.' },
          { id: 'rope', name: 'Coarse Rope', x: 1004, y: 730, r: 60, cover: 'fleece', hint: 'Something coils beneath that sheepskin.' },
          { id: 'bell', name: 'Sheep Bell', x: 960, y: 356, r: 52, cover: 'cloth', hint: 'A small metal sound comes from behind the cheese cloth.' },
          { id: 'latch', name: 'Door Bar', x: 1180, y: 380, r: 54, cover: 'shield', hint: 'The shield on the wall hides more than old victories.' }
        ],
        covers: [
          { id: 'fire', x: 700, y: 690, r: 112, texture: 'cyclops-fire-cover', label: 'Rake the fire', move: { x: 0, y: -14, alpha: 0.14 }, message: 'The flames sink low. A red ember remains.' },
          { id: 'wood', x: 420, y: 744, r: 104, texture: 'cyclops-wood-cover', label: 'Move the wood', move: { x: -66, y: 20, alpha: 0.9 }, message: 'The logs roll aside, uncovering a sharpened stake.' },
          { id: 'fleece', x: 1000, y: 718, r: 100, texture: 'cyclops-fleece-cover', label: 'Lift the fleece', move: { x: 74, y: 22, alpha: 0.9 }, message: 'A coil of coarse rope lies beneath the fleece.' },
          { id: 'cloth', x: 960, y: 300, r: 98, texture: 'cyclops-cloth-cover', label: 'Lift the cloth', move: { x: 0, y: -58, alpha: 0.78 }, message: 'The cloth lifts. An old sheep bell swings behind it.' },
          { id: 'shield', x: 1180, y: 380, r: 86, texture: 'cyclops-shield-cover', label: 'Move the shield', move: { x: 76, y: 10, alpha: 0.9 }, message: 'A heavy door bar is wedged into the wall behind the shield.' }
        ]
      },
      reward: {
        title: 'No One',
        text: 'The giant falls into a drunken sleep. The red-hot stake finds his only eye, and the boulder rolls away before dawn. His blind roar follows the ship for miles.'
      }
    },
    {
      id: 'circe',
      number: 3,
      roman: 'III',
      title: "Circe's Hall",
      latin: "CIRCE'S HALL",
      place: 'Aeaea · The Witch’s Wood',
      story: {
        kicker: 'AEAEA · THE WITCH’S WOOD',
        image: 'story-circe',
        caption: 'The wine is sweet. The reflections in the cup are not human.',
        paragraphs: [
          'Deep in the woods of Aeaea, the witch Circe lays out a feast. She smiles and offers a golden cup. One by one, the men who drink from it become pigs.',
          'Only Odysseus is spared, thanks to a white herb given to him by Hermes. He forces Circe to break the spell, but five illusions still cling to her hall.',
          'Separate what is real from what the witch wants him to see — and she may finally point the way home.'
        ],
        quote: '"Why do you walk these woods alone, mortal?"',
        source: 'Homer, The Odyssey · Book X'
      },
      puzzle: {
        type: 'spot',
        title: "Five Illusions in Circe's Hall",
        instruction: 'Circe’s magic has shifted five details between the paintings. Find them to break the illusion.',
        imageA: 'circe-a',
        imageB: 'circe-b',
        differences: [
          { id: 'moon', name: 'The Moon', x: 800, y: 245, r: 82, hint: 'The moon beyond the arch has changed shape.' },
          { id: 'pig', name: 'The Extra Pig', x: 1182, y: 820, r: 84, hint: 'One pig on the right should not be there.' },
          { id: 'jewel', name: 'The Cup’s Jewel', x: 552, y: 600, r: 62, hint: 'The jewel in Circe’s cup has changed color.' },
          { id: 'goblet', name: 'The Golden Goblet', x: 928, y: 620, r: 68, hint: 'Is the goblet on the table standing or fallen?' },
          { id: 'moly', name: 'The White Moly', x: 690, y: 590, r: 66, hint: 'The white flower has vanished from one table.' }
        ]
      },
      reward: {
        title: 'The Spell Breaks',
        text: 'The potion loses its power and the pigs rise as men. Circe gives Odysseus the wind he needs — at the price of a year’s stay.'
      }
    },
    {
      id: 'sirens',
      number: 4,
      roman: 'IV',
      title: "The Sirens' Strait",
      latin: "THE SIRENS' STRAIT",
      place: 'The Siren Rocks · Before Sunset',
      story: {
        kicker: 'THE SIREN ROCKS · BEFORE SUNSET',
        image: 'story-sirens',
        caption: 'The song comes from both cliffs at once, singing of the place each man most wants to return to.',
        paragraphs: [
          'Sirens perch on the rocks on either side of the strait. Their song makes sailors forget their course and steer straight into the cliffs.',
          'Odysseus seals his crew’s ears with beeswax and has himself bound to the mast. He must hear the song, and he must live to pass through it.',
          'Before they enter the strait, six things must be gathered from the deck. Some lie under benches, crates, sail folds, and shields.'
        ],
        quote: '"Come closer, glorious Odysseus, and listen to our song."',
        source: 'Homer, The Odyssey · Book XII'
      },
      puzzle: {
        type: 'hidden',
        title: 'Six Things to Pass the Sirens',
        instruction: 'Find six things on the deck. Look beneath the sail, the bench, the crate, and the shield.',
        image: 'sirens-sea',
        items: [
          { id: 'wax', name: 'Beeswax', x: 1150, y: 778, r: 56, hint: 'A cut block of yellow wax sits on the deck.' },
          { id: 'water', name: 'Water Skin', x: 690, y: 566, r: 54, hint: 'A water skin hangs beside the mast.' },
          { id: 'rope', name: 'Spare Rope', x: 340, y: 758, r: 60, cover: 'bench', hint: 'A spare coil is tucked under the bench.' },
          { id: 'lyre', name: 'Lyre', x: 1262, y: 716, r: 64, cover: 'crate', hint: 'A single string hums inside the crate.' },
          { id: 'feather', name: 'Siren Feather', x: 720, y: 226, r: 52, cover: 'sail', hint: 'A white feather is caught in the folded sail.' },
          { id: 'shell', name: 'Seashell', x: 1036, y: 766, r: 56, cover: 'shield', hint: 'The round shield on the deck is hiding something.' }
        ],
        covers: [
          { id: 'bench', x: 350, y: 766, r: 108, texture: 'sirens-bench-cover', label: 'Move the bench', move: { x: -74, y: 22, alpha: 0.9 }, message: 'The bench scrapes aside. A coil of rope lies beneath.' },
          { id: 'crate', x: 1262, y: 728, r: 100, texture: 'sirens-crate-cover', label: 'Open the crate', move: { x: 84, y: 18, alpha: 0.9 }, message: 'The lid slides open. A lyre rests inside.' },
          { id: 'sail', x: 724, y: 222, r: 100, texture: 'sirens-sail-cover', label: 'Lift the sail', move: { x: 0, y: -62, alpha: 0.72 }, message: 'The canvas lifts and a white feather drifts free.' },
          { id: 'shield', x: 1036, y: 770, r: 90, texture: 'sirens-shield-cover', label: 'Push the shield', move: { x: 78, y: 10, alpha: 0.9 }, message: 'A seashell was pressed into the deck beneath the shield.' }
        ]
      },
      reward: {
        title: 'After the Song',
        text: 'The last note is carried away by the wind. Odysseus unties himself, hands shaking. At last, the ship turns toward Ithaca.'
      }
    },
    {
      id: 'ithaca',
      number: 5,
      roman: 'V',
      title: 'The Hall of Ithaca',
      latin: 'THE HALL OF ITHACA',
      place: 'Ithaca · The Twentieth Year',
      story: {
        kicker: 'ITHACA · THE TWENTIETH YEAR',
        image: 'story-ithaca',
        caption: 'No one recognizes the ragged old man at the door — except the old dog.',
        paragraphs: [
          'Twenty years later, Odysseus comes home. Dressed as a beggar, he enters his own hall and finds it full of suitors. Penelope sits at the loom, surrounded.',
          'A bow hangs on the wall that no man can string. Whoever bends it will win the queen — and end the long waiting.',
          'Before the bow is strung, look closely at the hall. Five details have been rearranged. Some answers hide in the most familiar places.'
        ],
        quote: '"Whoever strings this bow shall have the queen."',
        source: 'Homer, The Odyssey · Book XXI'
      },
      puzzle: {
        type: 'spot',
        title: 'Five Flaws in the Hall of Ithaca',
        instruction: 'Memory and disguise have unsettled the hall. Find five differences and let Odysseus reclaim his name.',
        imageA: 'ithaca-a',
        imageB: 'ithaca-b',
        differences: [
          { id: 'bow', name: 'The Bow on the Wall', x: 302, y: 300, r: 92, hint: 'The great bow has vanished from one wall.' },
          { id: 'loom', name: 'The Loom’s Weave', x: 1372, y: 650, r: 96, hint: 'Penelope’s weaving has changed color.' },
          { id: 'suitor', name: 'The Extra Suitor', x: 1096, y: 700, r: 74, hint: 'One more man stands at the feast than before.' },
          { id: 'dog', name: 'Old Argos', x: 1460, y: 800, r: 76, hint: 'The old dog is missing from the corner.' },
          { id: 'cup', name: 'The Queen’s Cup', x: 762, y: 632, r: 62, hint: 'The wine in the golden cup has changed.' }
        ]
      },
      reward: {
        title: 'Home',
        text: 'The bowstring sings. The last arrow passes through twelve axe heads — and through twenty years of wandering. Penelope knows him at last.'
      }
    }
  ]
};

export const unitLevelIds = odyssey.levels.map((level) => level.id);

export function getLevel(id) {
  return odyssey.levels.find((level) => level.id === id) || odyssey.levels[0];
}

export function getNextLevel(id) {
  const index = odyssey.levels.findIndex((level) => level.id === id);
  return odyssey.levels[index + 1] || null;
}

export function isLevelUnlocked(id) {
  const index = odyssey.levels.findIndex((level) => level.id === id);
  if (index <= 0) return true;
  return odyssey.levels.slice(0, index).every((level) => saveCompleted(level.id));
}

function saveCompleted(id) {
  try {
    const raw = localStorage.getItem('pnp.save.v1');
    if (!raw) return false;
    const data = JSON.parse(raw);
    return Array.isArray(data.completed) && data.completed.includes(id);
  } catch {
    return false;
  }
}
