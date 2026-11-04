import {
  P,
  arch,
  amphora,
  banner,
  bird,
  birds,
  column,
  esc,
  figure,
  flame,
  frameSvg,
  goat,
  grad,
  lotus,
  mapCompass,
  moon,
  mountainPath,
  pig,
  radial,
  ribbon,
  rng,
  sea,
  seaDefs,
  seaMonster,
  ship,
  shield,
  sky,
  skyDefs,
  smoke,
  stars,
  sun,
  svgDoc,
  tree,
  tripod
} from './lib.mjs';

const W = 1600;
const H = 900;

function doc(body, defs = '', opts = {}) {
  return svgDoc(W, H, body, { defs, frame: false, ...opts });
}

function coverDoc(body) {
  return svgDoc(W, H, body, {
    bg: 'none',
    texture: false,
    vignette: false,
    wash: false
  });
}

function beam(x1, y1, x2, y2, width = 18, color = '#4c3b2d') {
  return `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>
    <path d="M${x1} ${y1} L${x2} ${y2}" stroke="${P.gold}" stroke-width="${Math.max(1, width * 0.08)}" opacity=".2"/>`;
}

function drape(x, y, w, h, color, opacity = 1) {
  return `<path d="M${x} ${y} Q${x + w * 0.1} ${y + h * 0.35} ${x + w * 0.02} ${y + h}
    Q${x + w * 0.48} ${y + h * 0.85} ${x + w * 0.62} ${y + h * 0.98}
    Q${x + w * 0.86} ${y + h * 0.75} ${x + w} ${y + h * 0.92}
    Q${x + w * 0.88} ${y + h * 0.35} ${x + w} ${y}
    Q${x + w * 0.55} ${y + h * 0.14} ${x} ${y} Z" fill="${color}" opacity="${opacity}"/>`;
}

function goblet(x, y, s = 1, { wine = true, jewel = null, tipped = false } = {}) {
  return `<g transform="translate(${x} ${y}) scale(${s}) rotate(${tipped ? 76 : 0})">
    <path d="M-22 -44 Q-20 -12 0 -10 Q20 -12 22 -44 Z" fill="${P.gold}" stroke="${P.ink}" stroke-opacity=".3" stroke-width="2"/>
    <path d="M-17 -40 Q-15 -18 0 -16 Q15 -18 17 -40 Z" fill="${wine ? P.wine : '#2b2b28'}"/>
    <path d="M0 -10 V12" stroke="${P.gold}" stroke-width="4"/>
    <path d="M-20 20 Q0 12 20 20" stroke="${P.gold}" stroke-width="5" fill="none"/>
    ${jewel ? `<circle cx="0" cy="-30" r="5" fill="${jewel}" stroke="${P.cream}" stroke-width="1"/>` : ''}
  </g>`;
}

function moly(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M0 0 Q-5 -32 3 -58" stroke="${P.olive}" stroke-width="3" fill="none"/>
    <ellipse cx="-14" cy="-20" rx="13" ry="5" transform="rotate(-25 -14 -20)" fill="${P.olive}"/>
    <ellipse cx="17" cy="-28" rx="13" ry="5" transform="rotate(22 17 -28)" fill="${P.olive}"/>
    <g transform="translate(3 -61)">
      <path d="M0 0 L-20 -16 M0 0 L-8 -25 M0 0 L8 -25 M0 0 L20 -16" stroke="${P.cream}" stroke-width="2"/>
      <circle cx="-20" cy="-16" r="10" fill="${P.cream}"/>
      <circle cx="-8" cy="-25" r="10" fill="${P.cream}"/>
      <circle cx="8" cy="-25" r="10" fill="${P.cream}"/>
      <circle cx="20" cy="-16" r="10" fill="${P.cream}"/>
      <circle cx="0" cy="-3" r="5" fill="${P.gold}"/>
    </g>
  </g>`;
}

function deerSkull(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})" opacity=".8">
    <path d="M0 0 q-14 -8 -8 -28 q8 -16 22 -4 q8 12 -2 26 Z" fill="${P.paper2}"/>
    <path d="M-7 -28 q-8 -28 -26 -38 M9 -30 q10 -27 30 -34" stroke="${P.paper2}" stroke-width="4" fill="none"/>
    <circle cx="-3" cy="-12" r="3" fill="${P.ink}"/><circle cx="7" cy="-12" r="3" fill="${P.ink}"/>
  </g>`;
}

// ---------------------------------------------------------------------------
// Title / map

export function titleHero() {
  const defs = [
    skyDefs('titleSky', '#071520', '#183b45', { bottomStop: '68%' }),
    seaDefs('seaGrad', '#204f59', '#0b1d26'),
    radial('moonHalo', [[0, '#f5dfaa', 0.38], [0.5, '#d5a85a', 0.12], [1, '#d5a85a', 0]])
  ].join('');
  const body = `
    ${sky(W, H)}
    ${stars(0, 0, W, 610, 23, 160)}
    <circle cx="1240" cy="250" r="430" fill="url(#moonHalo)"/>
    ${moon(1240, 250, 108)}
    <g opacity=".65" stroke="${P.gold2}" stroke-width="1">
      <path d="M170 175 L250 132 L332 198 L414 120 L492 166" fill="none" opacity=".28"/>
      <circle cx="170" cy="175" r="3" fill="${P.gold2}"/><circle cx="250" cy="132" r="4" fill="${P.gold2}"/>
      <circle cx="332" cy="198" r="2.5" fill="${P.gold2}"/><circle cx="414" cy="120" r="4" fill="${P.gold2}"/>
      <circle cx="492" cy="166" r="2" fill="${P.gold2}"/>
    </g>
    ${mountainPath('M0 552 L120 486 L224 520 L348 462 L482 536 L620 500 L760 552 L900 512 L1080 552 L1220 504 L1380 552 L1500 526 L1600 552 V620 H0Z', '#0b2029', 0.9)}
    <path d="M0 548 Q240 530 480 550 T960 546 T1600 548" fill="none" stroke="${P.gold}" stroke-width="1" opacity=".22"/>
    ${sea(548, W, H, { seed: 9 })}
    ${ship(690, 750, 0.96, { eye: true, flag: '#9d4938', oars: 6 })}
    <path d="M0 760 Q240 738 480 762 T960 756 T1600 770 V900 H0Z" fill="#08151d" opacity=".55"/>
    <g opacity=".5" fill="${P.gold2}">
      <circle cx="600" cy="440" r="1.6"/><circle cx="710" cy="510" r="1.1"/><circle cx="940" cy="390" r="2"/>
      <circle cx="1040" cy="620" r="1.3"/><circle cx="300" cy="340" r="1.2"/><circle cx="1330" cy="480" r="1.4"/>
    </g>
    <path d="M1180 790 q90 -42 180 0 q-90 20 -180 0" fill="none" stroke="${P.foam}" stroke-width="2" opacity=".16"/>
    <rect x="0" y="0" width="1600" height="900" fill="url(#vignette)"/>
    <rect x="26" y="26" width="1548" height="848" fill="none" stroke="${P.gold}" stroke-opacity=".24"/>
    <path d="M26 104 V26 H104 M1496 26 H1574 V104 M26 796 V874 H104 M1496 874 H1574 V796" fill="none" stroke="${P.gold}" stroke-width="2" stroke-opacity=".5"/>
  `;
  return doc(body, defs);
}

export function odysseyMap() {
  const defs = [
    grad('mapSea', [[0, '#173e46'], [0.5, '#1f4d50'], [1, '#102f39']]),
    grad('land', [[0, '#d8c396'], [1, '#b99b68']]),
    grad('landDark', [[0, '#a78a5e'], [1, '#796341']]),
    radial('mapGlow', [[0, '#d5a85a', 0.2], [1, '#d5a85a', 0]])
  ].join('');
  const body = `
    <rect width="1600" height="900" fill="url(#mapSea)"/>
    ${Array.from({ length: 18 }, (_, i) => `<path d="M0 ${80 + i * 46} Q400 ${70 + i * 46 + (i % 3) * 9} 800 ${84 + i * 46} T1600 ${78 + i * 46}" stroke="${P.sea3}" stroke-width="1" opacity=".06" fill="none"/>`).join('')}
    <g opacity=".12" stroke="${P.paper2}" fill="none">
      <path d="M80 690 q120 -90 260 -60 q150 32 200 -80" stroke-dasharray="3 10"/>
      <circle cx="1210" cy="180" r="110"/><circle cx="1210" cy="180" r="96"/>
    </g>
    <g>
      <!-- Lotus coast -->
      <path d="M96 690 Q112 598 196 568 Q274 540 338 592 Q390 636 374 700 Q352 762 250 768 Q122 770 96 690Z" fill="url(#land)" stroke="${P.gold}" stroke-opacity=".55" stroke-width="2"/>
      <path d="M118 702 Q160 660 214 680 Q270 700 310 674 Q340 718 282 738 Q196 750 118 702Z" fill="#8da071" opacity=".65"/>
      <path d="M166 650 q8 -42 -14 -76 M176 648 q18 -34 46 -50 M150 658 q-24 -24 -46 -26" stroke="${P.olive2}" stroke-width="5" fill="none" opacity=".8"/>
      <g fill="${P.olive}" opacity=".75"><ellipse cx="150" cy="580" rx="32" ry="13" transform="rotate(-24 150 580)"/><ellipse cx="218" cy="594" rx="38" ry="15" transform="rotate(18 218 594)"/><ellipse cx="104" cy="628" rx="30" ry="11" transform="rotate(-12 104 628)"/></g>
      <g fill="#d77a81" opacity=".85"><circle cx="138" cy="712" r="7"/><circle cx="204" cy="728" r="6"/><circle cx="252" cy="704" r="7"/><circle cx="294" cy="728" r="5"/></g>
      <!-- Cyclops isle -->
      <path d="M394 506 Q430 432 500 426 Q562 420 606 474 Q640 520 610 560 Q570 604 498 596 Q414 590 394 506Z" fill="url(#landDark)" stroke="${P.gold}" stroke-opacity=".45" stroke-width="2"/>
      <path d="M456 506 L482 442 L514 486 L548 432 L578 506 Z" fill="#6e6047"/>
      <path d="M482 442 L514 486 L548 432" fill="none" stroke="${P.paper2}" stroke-width="2" opacity=".45"/>
      <path d="M500 566 q12 -20 28 0" fill="none" stroke="${P.ink}" stroke-width="6" opacity=".55"/>
      <circle cx="516" cy="566" r="3" fill="${P.gold2}" opacity=".7"/>
      <!-- Circe isle -->
      <path d="M700 616 Q736 542 812 534 Q888 526 928 584 Q962 646 916 690 Q858 734 784 720 Q712 706 700 616Z" fill="url(#land)" stroke="${P.gold}" stroke-opacity=".5" stroke-width="2"/>
      <g fill="#60744f" opacity=".8">
        <circle cx="758" cy="600" r="30"/><circle cx="806" cy="576" r="35"/><circle cx="854" cy="614" r="27"/><circle cx="880" cy="656" r="24"/>
      </g>
      <g fill="#3f543b"><circle cx="782" cy="578" r="10"/><circle cx="836" cy="596" r="8"/><circle cx="860" cy="636" r="9"/></g>
      <path d="M794 674 q20 -22 44 0" fill="none" stroke="${P.paper2}" stroke-width="3" opacity=".4"/>
      <!-- Sirens rocks -->
      <path d="M1028 402 L1054 322 L1086 358 L1116 290 L1146 360 L1182 326 L1214 430 L1168 466 L1074 460Z" fill="#615a4b" stroke="${P.gold}" stroke-opacity=".4" stroke-width="2"/>
      <path d="M1048 408 L1080 366 L1104 400 L1130 348 L1162 412" fill="none" stroke="${P.paper2}" stroke-width="2" opacity=".35"/>
      <path d="M1070 448 q26 -10 50 0 M1130 454 q20 -8 38 0" fill="none" stroke="${P.foam}" stroke-width="3" opacity=".3"/>
      <g fill="${P.cream}" opacity=".7"><path d="M1086 350 q10 -15 20 0 q-10 6 -20 0Z"/><path d="M1148 338 q11 -16 22 0 q-11 7 -22 0Z"/></g>
      <!-- Ithaca -->
      <path d="M1252 650 Q1288 574 1368 562 Q1464 550 1512 616 Q1548 674 1490 724 Q1414 772 1334 736 Q1268 704 1252 650Z" fill="url(#land)" stroke="${P.gold}" stroke-opacity=".55" stroke-width="2"/>
      <path d="M1308 640 L1326 600 L1344 640 M1370 630 L1388 584 L1408 630 M1430 640 L1448 606 L1464 640" fill="${P.paper}" opacity=".72"/>
      <path d="M1326 600 V628 M1388 584 V626 M1448 606 V636" stroke="${P.ink}" stroke-width="3" opacity=".4"/>
      <path d="M1296 670 q52 -20 104 0" fill="none" stroke="${P.rust}" stroke-width="3" opacity=".55"/>
      <path d="M1378 692 h42 v8 h-42z" fill="${P.rust2}" opacity=".7"/>
      <!-- Route -->
      <path d="M248 652 C318 594 350 542 470 508 C580 476 582 566 748 590 C878 608 936 494 1080 396 C1176 330 1200 486 1304 590 C1352 638 1402 632 1442 616" fill="none" stroke="${P.gold2}" stroke-width="2.5" stroke-dasharray="2 12" stroke-linecap="round" opacity=".65"/>
    </g>
    ${mapCompass(1438, 196, 1.08)}
    ${seaMonster(250, 360, 1.18)}
    <g opacity=".22" fill="none" stroke="${P.paper2}">
      <path d="M60 820 q90 -30 180 0 q90 30 180 0"/>
      <path d="M1200 800 q70 -24 140 0 q70 24 140 0"/>
    </g>
    <rect x="0" y="0" width="1600" height="900" fill="url(#vignette)" opacity=".52"/>
    <rect x="22" y="22" width="1556" height="856" fill="none" stroke="${P.gold}" stroke-opacity=".34"/>
    <rect x="30" y="30" width="1540" height="840" fill="none" stroke="${P.gold}" stroke-opacity=".13"/>
  `;
  return doc(body, defs, { texture: true, vignette: false });
}

// ---------------------------------------------------------------------------
// Puzzle scene 1 — Lotus Bay (spot the difference)

export function lotusBay(variant = 'a') {
  const a = variant === 'a';
  const defs = [
    skyDefs('sky', '#80aeb0', '#f3c78f', { bottomStop: '70%' }),
    seaDefs('seaGrad', '#3a7d82', '#1e505a'),
    grad('sand', [[0, '#d9bf91'], [1, '#b98f61']]),
    grad('cliff', [[0, '#8b7a58'], [1, '#4d4738']])
  ].join('');
  const body = `
    ${sky(W, H)}
    <g opacity=".26" fill="${P.cream}">
      <path d="M-80 236 q180 -42 360 0 q180 42 380 0 q-180 58 -380 22 q-180 -36 -360 -22Z"/>
      <path d="M930 320 q160 -30 300 0 q-150 38 -300 0Z" opacity=".6"/>
    </g>
    ${sun(1160, 250, 78)}
    ${birds(1030, 150, a ? 2 : 2, P.ink, 1, 12)}
    ${a ? bird(944, 226, 1.5, P.ink) : ''}
    ${a ? bird(980, 198, 1.1, P.ink) : ''}
    ${mountainPath('M0 474 L100 420 L210 470 L330 412 L470 470 L610 436 L720 480 L860 430 L1010 480 L1130 438 L1260 480 L1400 450 L1600 480 V540 H0Z', '#5c817d', 0.62)}
    ${mountainPath('M0 500 L120 470 L260 506 L410 470 L560 510 L730 478 L900 512 L1080 480 L1260 512 L1440 486 L1600 510 V560 H0Z', '#3e686b', 0.75)}
    ${sea(496, W, H, { seed: 7 })}
    ${ship(338, 588, 0.92, { eye: a, sail: '#f0e1c2', flag: '#9e4938', oars: 5 })}
    <g>
      <path d="M1032 900 Q1070 744 1118 630 Q1160 528 1240 500 Q1330 470 1410 510 L1600 560 V900Z" fill="url(#cliff)"/>
      <path d="M1122 636 Q1170 550 1244 522 Q1330 492 1406 530" fill="none" stroke="${P.paper2}" stroke-width="4" opacity=".35"/>
      <path d="M1180 650 Q1214 590 1272 566 Q1338 542 1408 568" fill="none" stroke="${P.gold}" stroke-width="2" opacity=".22"/>
      <path d="M1300 602 q42 -30 84 -6 q-34 24 -84 6Z" fill="#6f664e" opacity=".7"/>
      <path d="M1320 538 Q1344 514 1374 530 Q1400 550 1380 574 L1332 568Z" fill="#5c5744"/>
      ${a ? `<g>${tripod(1338, 536, 1.05)}<path d="M1312 540 h58" stroke="${P.gold}" stroke-width="3" opacity=".5"/></g>` : ''}
    </g>
    <path d="M0 742 Q220 700 450 748 Q690 798 950 760 Q1220 720 1600 770 V900 H0Z" fill="url(#sand)"/>
    <path d="M0 766 Q240 728 470 768 Q700 810 960 774 Q1230 738 1600 788" fill="none" stroke="${P.foam}" stroke-width="4" opacity=".42"/>
    ${tree(118, 760, 0.9)}
    ${amphora(940, 806, 0.9, '#9f5b44')}
    <g>
      <path d="M575 742 Q602 706 650 708 Q694 712 704 750 L684 778 Q624 794 582 768Z" fill="#7a6a52"/>
      <path d="M590 736 q34 -26 74 -6" fill="none" stroke="${P.paper2}" stroke-width="2" opacity=".3"/>
      ${a ? drape(596, 708, 92, 76, '#a34f3c', 0.92) : ''}
    </g>
    ${figure(760, 824, 0.84, { robe: '#e3d2b2', robe2: '#8c4a3b', pose: 'reach', facing: -1, hair: '#2d2520' })}
    ${figure(880, 842, 0.72, { robe: '#b76a58', robe2: '#d5a85a', pose: 'stand', facing: -1, hair: '#4a3428' })}
    ${figure(1004, 850, 0.68, { robe: '#5b7c76', robe2: '#cbb78f', pose: 'hold', facing: -1, hair: '#2b211d' })}
    ${lotus(286, 866, 1.3, '#d77a81')}
    ${lotus(378, 892, 1.05, '#e8b3b0')}
    ${lotus(548, 874, 0.92, '#d77a81')}
    ${lotus(790, 866, 1.42, a ? '#d77a81' : '#f1e5c9')}
    ${lotus(1000, 896, 1.0, '#e8b3b0')}
    ${lotus(1160, 872, 0.8, '#d77a81')}
    <g opacity=".7">
      <path d="M404 890 q50 -18 104 0" fill="none" stroke="${P.olive2}" stroke-width="5"/>
      <path d="M1110 898 q44 -16 92 0" fill="none" stroke="${P.olive2}" stroke-width="4"/>
    </g>
    ${ribbon(1030, 800, 0.8, '#d5a85a')}
    <rect width="1600" height="900" fill="url(#vignette)" opacity=".4"/>
  `;
  return doc(body, defs);
}

// ---------------------------------------------------------------------------
// Puzzle scene 3 — Circe's hall (spot the difference)

export function circeHall(variant = 'a') {
  const a = variant === 'a';
  const defs = [
    grad('wall', [[0, '#4a3341'], [0.55, '#372c35'], [1, '#1d2228']]),
    grad('night', [[0, '#132f3d'], [1, '#091922']]),
    grad('floor', [[0, '#5b4a3b'], [1, '#241f1d']])
  ].join('');
  const body = `
    <rect width="1600" height="900" fill="url(#wall)"/>
    <path d="M0 0 H1600 V650 H0Z" fill="#372a31" opacity=".6"/>
    ${Array.from({ length: 9 }, (_, i) => `<path d="M${i * 200} 0 V650" stroke="${P.ink}" stroke-opacity=".13" stroke-width="2"/>`).join('')}
    ${arch(800, 664, 560, 498, { wall: '#332a2e', inner: 'url(#night)', rim: P.gold })}
    ${moon(800, 252, 48, { phase: a ? 'full' : 'crescent' })}
    ${stars(590, 160, 420, 230, 8, 28)}
    ${column(120, 700, 540, 44, '#c8b28c', '#8f7b5b')}
    ${column(1480, 700, 540, 44, '#c8b28c', '#8f7b5b')}
    ${beam(0, 112, 1600, 112, 28, '#2a2324')}
    ${banner(178, 126, 0.9, '#6d3a3f')}
    ${banner(1422, 126, -0.9, '#6d3a3f')}
    <g>
      <path d="M228 126 V252" stroke="${P.ink}" stroke-width="3"/>
      <path d="M206 252 h44 l-10 26 h-24Z" fill="${P.gold}" opacity=".8"/>
      <circle cx="228" cy="290" r="48" fill="${P.gold}" opacity=".1" filter="url(#softGlow)"/>
      ${flame(228, 308, 0.55, 11)}
    </g>
    <g>
      <path d="M1372 126 V240" stroke="${P.ink}" stroke-width="3"/>
      <path d="M1350 240 h44 l-10 26 h-24Z" fill="${P.gold}" opacity=".8"/>
      <circle cx="1372" cy="280" r="44" fill="${P.gold}" opacity=".1" filter="url(#softGlow)"/>
      ${flame(1372, 296, 0.48, 13)}
    </g>
    <path d="M0 664 H1600 V900 H0Z" fill="url(#floor)"/>
    <path d="M0 720 Q400 694 800 720 T1600 716" fill="none" stroke="${P.gold}" stroke-width="1.5" opacity=".16"/>
    <path d="M200 900 L520 664 M1400 900 L1080 664 M750 900 L790 664 M850 900 L810 664" stroke="${P.ink}" stroke-width="2" opacity=".18"/>
    ${flame(330, 812, 0.68, 5)}
    ${flame(1270, 824, 0.58, 6)}
    <g>
      <path d="M612 642 H1042 L1022 680 H632Z" fill="#7b4d3d"/>
      <path d="M612 642 H1042 L1038 652 H616Z" fill="${P.gold}" opacity=".65"/>
      <path d="M646 680 V820 M1008 680 V820" stroke="#4a302a" stroke-width="16"/>
      <path d="M660 710 H990" stroke="${P.ink}" stroke-width="3" opacity=".25"/>
      <g>${goblet(928, 628, 0.92, { wine: a, tipped: !a })}</g>
      <ellipse cx="790" cy="650" rx="54" ry="16" fill="${P.paper}" opacity=".7"/>
      <g fill="${P.rust}"><circle cx="770" cy="646" r="10"/><circle cx="792" cy="642" r="11"/><circle cx="814" cy="647" r="9"/></g>
      <g fill="${P.olive}"><ellipse cx="852" cy="646" rx="18" ry="7"/><ellipse cx="870" cy="650" rx="15" ry="6"/></g>
      <g>${a ? moly(690, 640, 0.92) : ''}</g>
    </g>
    ${figure(500, 750, 1.02, { robe: '#7e3f4d', robe2: '#d5a85a', skin: '#e0b08a', hair: '#261b1b', pose: 'hold', facing: 1, cloak: '#4c2a3b' })}
    ${goblet(552, 626, 0.9, { wine: true, jewel: a ? '#d65a4a' : '#5c8f8a' })}
    ${pig(303, 812, 0.9)}
    ${pig(940, 836, 0.72, { body: '#bd7a6b' })}
    ${a ? pig(1182, 824, 0.62, { body: '#d09480' }) : ''}
    ${a ? `<circle cx="1190" cy="690" r="0" fill="none"/>` : ''}
    ${figure(1218, 750, 0.8, { robe: '#3f5e55', robe2: '#b8a579', pose: 'plead', facing: -1, hair: '#3b2e23' })}
    <g opacity=".45" stroke="${P.gold2}" fill="none" stroke-width="1.4">
      <path d="M640 400 q34 -36 70 0 q-34 34 -70 0Z"/>
      <path d="M920 350 q20 -24 42 0 q-20 22 -42 0Z"/>
      <path d="M1080 440 q26 -30 54 0 q-26 28 -54 0Z"/>
    </g>
    <g fill="${P.gold2}" opacity=".5">
      <circle cx="688" cy="420" r="2"/><circle cx="958" cy="338" r="1.7"/><circle cx="1106" cy="466" r="1.5"/>
    </g>
    <rect width="1600" height="900" fill="url(#vignette)" opacity=".34"/>
  `;
  return doc(body, defs);
}

// ---------------------------------------------------------------------------
// Puzzle scene 5 — Ithaca's hall (spot the difference)

export function ithacaHall(variant = 'a') {
  const a = variant === 'a';
  const defs = [
    grad('hallWall', [[0, '#59493e'], [0.55, '#403831'], [1, '#24251f']]),
    grad('hallFloor', [[0, '#7a6147'], [1, '#332a23']]),
    grad('dusk', [[0, '#d59a68'], [0.5, '#8f6b61'], [1, '#263947']])
  ].join('');
  const body = `
    <rect width="1600" height="900" fill="url(#hallWall)"/>
    <path d="M0 0 H1600 V640 H0Z" fill="#4b3d33" opacity=".48"/>
    ${arch(800, 660, 500, 470, { wall: '#3d312a', inner: 'url(#dusk)', rim: P.gold })}
    <g opacity=".8">
      <path d="M800 190 L1080 640 M800 190 L520 640" stroke="${P.gold2}" stroke-width="2" opacity=".12"/>
      <circle cx="800" cy="300" r="74" fill="${P.gold2}" opacity=".12" filter="url(#softGlow)"/>
    </g>
    ${stars(620, 190, 360, 120, 16, 12)}
    ${column(130, 690, 530, 42, '#bda985', '#827054')}
    ${column(1470, 690, 530, 42, '#bda985', '#827054')}
    ${beam(0, 108, 1600, 108, 26, '#2b2420')}
    <g opacity=".8">
      <path d="M1110 170 q70 -24 140 0 v158 q-70 24 -140 0Z" fill="#5d3a35"/>
      <path d="M1110 170 q70 -24 140 0 M1140 200 q40 -14 80 0 M1140 272 q40 -14 80 0" fill="none" stroke="${P.gold}" stroke-width="1.5" opacity=".38"/>
    </g>
    ${banner(1360, 128, 0.85, '#73413b')}
    <path d="M0 660 H1600 V900 H0Z" fill="url(#hallFloor)"/>
    <path d="M0 700 Q300 680 540 706 M1040 706 Q1320 680 1600 704" fill="none" stroke="${P.gold}" stroke-width="1.4" opacity=".18"/>
    ${flame(250, 780, 0.65, 21)}
    <g>
      <path d="M668 656 H1112 L1090 690 H690Z" fill="#65432f"/>
      <path d="M668 656 H1112 L1108 666 H672Z" fill="${P.gold}" opacity=".55"/>
      <path d="M710 690 V838 M1070 690 V838" stroke="#443026" stroke-width="15"/>
      <ellipse cx="810" cy="672" rx="46" ry="13" fill="${P.paper}" opacity=".65"/>
      <g fill="${P.rust}"><circle cx="796" cy="668" r="9"/><circle cx="816" cy="664" r="10"/></g>
      <g>${goblet(762, 646, 0.95, { wine: a })}</g>
      <g fill="${P.gold}" opacity=".7"><ellipse cx="888" cy="662" rx="28" ry="7"/><ellipse cx="888" cy="654" rx="20" ry="5"/></g>
      <path d="M954 666 q34 -22 68 0" fill="none" stroke="${P.paper2}" stroke-width="4" opacity=".6"/>
    </g>
    ${figure(660, 748, 0.86, { robe: '#684a3b', robe2: '#9f6a4d', pose: 'reach', facing: 1, hair: '#2b211c' })}
    ${figure(906, 760, 0.83, { robe: '#4a5b58', robe2: '#b18a5f', pose: 'hold', facing: -1, hair: '#201a18' })}
    ${figure(1008, 744, 0.78, { robe: '#7d5146', robe2: '#d0a16b', pose: 'stand', facing: 1, hair: '#33251e' })}
    ${a ? figure(1096, 768, 0.82, { robe: '#59615a', robe2: '#b08b60', pose: 'plead', facing: -1, hair: '#1d1a18' }) : ''}
    ${figure(1274, 744, 0.92, { robe: '#6c4a56', robe2: '#d5a85a', pose: 'reach', facing: -1, hair: '#2e2220', cloak: '#40303a' })}
    <g>
      <path d="M1290 490 V826 M1454 490 V826" stroke="#4a3528" stroke-width="15"/>
      <path d="M1290 490 H1454 M1290 560 H1454" stroke="#4a3528" stroke-width="12"/>
      <path d="M1306 512 H1438 V806 H1306Z" fill="#342d2b"/>
      <path d="M1318 526 H1426 V790 H1318Z" fill="${a ? '#8a433d' : '#a67b42'}" opacity=".9"/>
      ${Array.from({ length: 7 }, (_, i) => `<path d="M1318 ${548 + i * 34} H1426" stroke="${P.gold2}" stroke-width="2" opacity=".3"/>`).join('')}
      <path d="M1326 560 L1420 790 M1420 560 L1326 790" stroke="${P.ink}" stroke-width="2" opacity=".18"/>
    </g>
    ${a ? `<g>${dog(1460, 828, 0.95, '#7a5b42')}</g>` : ''}
    ${a ? bowOnWall(302, 328, 1) : ''}
    ${figure(222, 814, 0.92, { robe: '#6a5c46', robe2: '#91836a', pose: 'plead', facing: 1, hair: '#b9ab92', barefoot: true })}
    <path d="M258 810 L286 690" stroke="#5d4634" stroke-width="7" stroke-linecap="round"/>
    ${goat(420, 806, 0.8, '#b9a88b')}
    <g opacity=".5" fill="${P.gold2}">
      <circle cx="540" cy="240" r="2"/><circle cx="620" cy="320" r="1.4"/><circle cx="1000" cy="280" r="1.8"/>
    </g>
    <rect width="1600" height="900" fill="url(#vignette)" opacity=".36"/>
  `;
  return doc(body, defs);
}

function dog(x, y, s, color) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="0" cy="0" rx="48" ry="22" fill="${color}"/>
    <path d="M-30 12 V44 M22 14 V44 M-6 20 V46 M38 8 V42" stroke="${color}" stroke-width="9" stroke-linecap="round"/>
    <path d="M42 -12 q28 -15 44 4 q-14 20 -42 12" fill="${color}"/>
    <path d="M50 -18 q4 -20 18 -24 q2 18 -6 26" fill="${color}"/>
    <circle cx="78" cy="-1" r="2.4" fill="${P.ink}"/><circle cx="84" cy="4" r="3" fill="${P.ink}"/>
    <path d="M-46 -2 q-20 -10 -28 -30 q22 2 33 18" fill="${color}"/>
  </g>`;
}

function bowOnWall(x, y, s) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-2 -98 Q-58 -20 -8 46" fill="none" stroke="${P.gold}" stroke-width="8" stroke-linecap="round"/>
    <path d="M-2 -98 L-8 46" stroke="${P.paper2}" stroke-width="1.6" opacity=".85"/>
    <path d="M-22 -22 h20" stroke="${P.rust2}" stroke-width="7" stroke-linecap="round"/>
    <circle cx="-2" cy="-98" r="4" fill="${P.gold2}"/><circle cx="-8" cy="46" r="4" fill="${P.gold2}"/>
    <path d="M-16 15 Q20 4 34 30" fill="none" stroke="${P.cream}" stroke-width="2" opacity=".55"/>
    <path d="M34 30 l10 -1 M34 30 l-3 9" stroke="${P.cream}" stroke-width="2" opacity=".55"/>
  </g>`;
}

// ---------------------------------------------------------------------------
// Puzzle scene 2 — The Cyclops' cave (hidden objects)

function wineSkin(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M0 -50 V-78" stroke="${P.paper2}" stroke-width="3"/>
    <path d="M-26 -48 q-20 34 -8 58 q10 20 34 18 q24 2 34 -18 q12 -24 -8 -58 Z" fill="#8c4c38" stroke="${P.ink}" stroke-opacity=".25" stroke-width="2"/>
    <path d="M-15 -44 q-10 36 1 58 M15 -44 q10 36 -1 58" stroke="${P.rust2}" stroke-width="2" fill="none" opacity=".7"/>
    <path d="M-14 -44 h28 v-12 h-28z" fill="${P.paper2}"/>
    <path d="M-8 -56 h16" stroke="${P.ink}" stroke-width="2" opacity=".45"/>
  </g>`;
}

function honeyJar(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="0" cy="2" rx="24" ry="6" fill="${P.ink}" opacity=".3" filter="url(#blur2)"/>
    <path d="M-18 -40 q-12 22 -8 38 q3 12 26 12 q23 0 26 -12 q4 -16 -8 -38Z" fill="#ad7a42" stroke="${P.ink}" stroke-opacity=".3"/>
    <path d="M-18 -38 h36 v-8 h-36z" fill="${P.paper2}"/>
    <path d="M-13 -28 q13 8 26 0" fill="none" stroke="${P.gold2}" stroke-width="2" opacity=".75"/>
    <path d="M-5 -16 q5 -8 10 0 q-5 7 -10 0Z" fill="${P.gold2}" opacity=".9"/>
  </g>`;
}

function bell(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M0 -38 V-50" stroke="${P.paper2}" stroke-width="2"/>
    <path d="M-18 -8 q0 -28 18 -30 q18 2 18 30 l8 10 h-52Z" fill="${P.gold}" stroke="${P.ink}" stroke-opacity=".3" stroke-width="2"/>
    <path d="M-14 -6 q14 -8 28 0" fill="none" stroke="${P.gold2}" stroke-width="2" opacity=".7"/>
    <circle cx="0" cy="8" r="5" fill="${P.rust2}"/>
  </g>`;
}

function ember(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <circle cx="0" cy="0" r="38" fill="#e58348" opacity=".2" filter="url(#softGlow)"/>
    <ellipse cx="0" cy="0" rx="34" ry="16" fill="#5c3b2d"/>
    <ellipse cx="-12" cy="-3" rx="10" ry="5" fill="#d8653e"/>
    <ellipse cx="8" cy="1" rx="8" ry="4" fill="#e5a24f"/>
    <ellipse cx="18" cy="-2" rx="5" ry="3" fill="#f0c477"/>
  </g>`;
}

function stake(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s}) rotate(-36)">
    <path d="M-54 0 H44 L66 0 L44 9 H-54Z" fill="#7d6240" stroke="${P.ink}" stroke-opacity=".25"/>
    <path d="M44 0 L74 0 L46 9Z" fill="${P.paper2}"/>
    <path d="M-38 -2 q32 -4 64 2" stroke="${P.paper2}" stroke-width="1" opacity=".3"/>
  </g>`;
}

function rope(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="0" cy="0" rx="45" ry="18" fill="none" stroke="${P.paper2}" stroke-width="8"/>
    <ellipse cx="0" cy="-6" rx="35" ry="14" fill="none" stroke="${P.paper2}" stroke-width="7"/>
    <ellipse cx="0" cy="-11" rx="23" ry="9" fill="none" stroke="${P.paper2}" stroke-width="6"/>
    <path d="M34 4 q34 12 14 30" fill="none" stroke="${P.paper2}" stroke-width="5"/>
  </g>`;
}

function spindleLatch(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <rect x="-28" y="-7" width="56" height="14" rx="4" fill="#7f8077" stroke="${P.ink}" stroke-opacity=".35"/>
    <rect x="-40" y="-15" width="18" height="30" rx="3" fill="#4d504a"/>
    <circle cx="26" cy="0" r="9" fill="${P.gold}" opacity=".7"/>
    <path d="M-32 -11 v22 M32 -11 v22" stroke="${P.ink}" stroke-opacity=".4"/>
  </g>`;
}

function cyclops(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="30" cy="230" rx="290" ry="170" fill="#6e5d48"/>
    <path d="M-220 300 Q-190 90 -70 30 Q20 -16 90 36 Q160 94 176 300Z" fill="#8a7357"/>
    <path d="M-90 70 Q-30 18 52 54 Q136 94 156 310" fill="none" stroke="${P.ink}" stroke-width="3" opacity=".16"/>
    <path d="M-118 296 q100 -62 224 -24" fill="none" stroke="${P.paper2}" stroke-width="3" opacity=".16"/>
    <g transform="translate(-62 22)">
      <ellipse cx="0" cy="0" rx="82" ry="74" fill="#a18864"/>
      <path d="M-82 -6 Q-68 -72 8 -78 Q70 -82 90 -16 Q94 54 22 78 Q-46 92 -76 30Z" fill="#a18864"/>
      <path d="M-60 28 q28 52 92 42 q50 -8 40 -52 q-18 32 -66 28 q-48 -4 -66 -18Z" fill="#5f503e"/>
      <path d="M-52 -2 q22 -12 44 0" fill="none" stroke="${P.ink}" stroke-width="5" stroke-linecap="round" opacity=".55"/>
      <path d="M-32 4 q18 8 36 0" fill="none" stroke="${P.ink}" stroke-width="4" opacity=".6"/>
      <path d="M-38 -28 q20 -10 40 2" stroke="${P.ink}" stroke-width="6" fill="none" opacity=".42"/>
      <path d="M54 -20 q24 -38 40 2 q-14 26 -40 18" fill="#947b59"/>
      <path d="M-74 -24 q-26 18 -18 54 q12 22 32 8" fill="#947b59"/>
      <path d="M-26 36 q20 14 42 2" stroke="${P.ink}" stroke-width="3" fill="none" opacity=".35"/>
      <path d="M44 -70 q18 -22 39 -4" stroke="#4a3d2f" stroke-width="8" fill="none" stroke-linecap="round"/>
    </g>
    <path d="M-240 242 Q-144 176 -42 214 Q28 240 52 306" fill="none" stroke="#7c684e" stroke-width="74" stroke-linecap="round"/>
    <path d="M-254 306 q150 -32 306 6" stroke="#4e4337" stroke-width="3" opacity=".3" fill="none"/>
  </g>`;
}

export function cyclopsCave() {
  const defs = [
    grad('caveWall', [[0, '#3c4037'], [0.48, '#272d29'], [1, '#111817']]),
    grad('caveFloor', [[0, '#4a4335'], [1, '#181b18']]),
    grad('caveNight', [[0, '#1f4b5b'], [1, '#0a1b25']]),
    seaDefs('seaGrad', '#2b6871', '#102c35')
  ].join('');
  const body = `
    <rect width="1600" height="900" fill="url(#caveWall)"/>
    ${arch(260, 700, 390, 570, { wall: '#232823', inner: 'url(#caveNight)', rim: P.gold })}
    ${moon(270, 330, 34, { phase: 'half' })}
    ${stars(100, 220, 320, 160, 31, 18)}
    <path d="M88 650 Q140 598 210 630 Q276 606 340 646 Q388 620 432 654 V700 H88Z" fill="#153d49" opacity=".65"/>
    <path d="M96 654 Q140 610 206 638 Q270 614 336 650 Q384 628 428 660" fill="none" stroke="${P.foam}" stroke-width="3" opacity=".3"/>
    <g fill="#1c2220">
      <path d="M0 0 H1600 V84 L1540 116 L1482 76 L1404 130 L1330 70 L1252 118 L1168 60 L1094 120 L1008 58 L936 112 L862 54 L786 122 L716 62 L640 116 L566 58 L490 120 L412 64 L334 118 L254 62 L174 122 L92 66 L0 110Z"/>
      ${Array.from({ length: 11 }, (_, i) => `<path d="M${70 + i * 146} 0 L${94 + i * 146} ${46 + (i % 4) * 30} L${122 + i * 146} 0Z"/>`).join('')}
    </g>
    <path d="M0 666 Q280 636 520 676 Q760 716 1020 680 Q1290 642 1600 680 V900 H0Z" fill="url(#caveFloor)"/>
    <path d="M0 720 Q300 690 600 724 T1200 724 T1600 708" fill="none" stroke="${P.paper2}" stroke-width="2" opacity=".1"/>
    <g>
      <path d="M720 416 H980" stroke="#4d3e30" stroke-width="16"/>
      <path d="M734 416 V432 M966 416 V432" stroke="${P.gold}" stroke-width="2" opacity=".35"/>
      <path d="M776 420 V436 M858 420 V438 M930 420 V434" stroke="${P.paper2}" stroke-width="2" opacity=".3"/>
    </g>
    <g>
      <path d="M760 420 H940 V432 H760Z" fill="#4d3b2b"/>
      ${amphora(792, 428, 0.7, '#8d6448')}
      ${amphora(846, 430, 0.58, '#7b5140')}
      ${honeyJar(880, 424, 1)}
    </g>
    <g>
      <path d="M1480 430 q46 -160 120 -220" stroke="#5a4a38" stroke-width="30" stroke-linecap="round"/>
      <path d="M1480 430 q46 -160 120 -220" stroke="${P.ink}" stroke-width="4" opacity=".18"/>
      <path d="M1536 320 q-32 24 -30 60" stroke="${P.paper2}" stroke-width="2" opacity=".2"/>
    </g>
    ${cyclops(1240, 560, 0.95)}
    ${goat(596, 774, 0.72, '#d4c5a9')}
    ${goat(880, 804, 0.6, '#b9aa8f')}
    <g>
      <ellipse cx="700" cy="690" rx="92" ry="24" fill="#2e2b24"/>
      <path d="M620 682 Q700 658 780 682" stroke="${P.paper2}" stroke-width="9" fill="none" stroke-linecap="round"/>
      <path d="M634 690 Q700 674 766 690" stroke="#6b4a32" stroke-width="8" fill="none"/>
      ${ember(700, 670, 0.9)}
    </g>
    <g>
      <ellipse cx="420" cy="760" rx="82" ry="20" fill="${P.ink}" opacity=".45" filter="url(#blur5)"/>
      ${stake(420, 744, 1)}
    </g>
    <g>
      <ellipse cx="1004" cy="744" rx="74" ry="20" fill="${P.ink}" opacity=".38" filter="url(#blur5)"/>
      <path d="M954 724 q50 -26 104 0 l-12 32 h-80Z" fill="#54574c"/>
      ${rope(1004, 734, 0.95)}
    </g>
    <g>
      <path d="M930 408 q30 -18 60 0" fill="none" stroke="${P.gold}" stroke-width="2" opacity=".3"/>
      ${bell(960, 356, 1)}
    </g>
    <g>
      <path d="M1120 330 q60 -20 120 0" fill="none" stroke="${P.ink}" stroke-width="4" opacity=".25"/>
      ${spindleLatch(1180, 380, 1)}
    </g>
    ${wineSkin(532, 398, 1.05)}
    <g>
      <path d="M486 330 q44 -26 92 0" fill="none" stroke="${P.ink}" stroke-width="6" opacity=".3"/>
      <path d="M520 336 V378" stroke="${P.paper2}" stroke-width="2" opacity=".4"/>
    </g>
    ${smoke(700, 640, 0.9, 17)}
    ${deerSkull(1116, 578, 0.9)}
    <g fill="#8d7d61" opacity=".24">
      <path d="M1100 690 q12 -30 38 -4 q-16 18 -38 4Z"/>
      <path d="M1240 748 q18 -36 54 -4 q-22 22 -54 4Z"/>
    </g>
    <rect width="1600" height="900" fill="url(#vignette)" opacity=".58"/>
  `;
  return doc(body, defs, { texture: true });
}

// ---------------------------------------------------------------------------
// Puzzle scene 4 — The Sirens' strait (hidden objects)

function siren(x, y, s = 1, flip = false) {
  const dir = flip ? -1 : 1;
  return `<g transform="translate(${x} ${y}) scale(${s * dir} ${s})">
    <ellipse cx="0" cy="4" rx="54" ry="10" fill="${P.ink}" opacity=".28" filter="url(#blur2)"/>
    <g fill="#e5d6ba" opacity=".95">
      <path d="M-8 -64 Q-64 -108 -122 -68 Q-80 -70 -42 -46 Q-82 -36 -112 -12 Q-64 -16 -26 -30Z"/>
      <path d="M8 -64 Q64 -108 122 -68 Q80 -70 42 -46 Q82 -36 112 -12 Q64 -16 26 -30Z"/>
    </g>
    <g stroke="#c3b08f" stroke-width="1.4" fill="none" opacity=".72">
      <path d="M-18 -62 Q-62 -78 -98 -60 M-22 -50 Q-64 -56 -94 -38 M-26 -38 Q-60 -42 -84 -22"/>
      <path d="M18 -62 Q62 -78 98 -60 M22 -50 Q64 -56 94 -38 M26 -38 Q60 -42 84 -22"/>
    </g>
    <path d="M18 -28 Q54 -12 74 14 Q40 14 12 -8Z" fill="#cdbb99" opacity=".9"/>
    <path d="M-12 -30 Q-26 -4 -32 8 M12 -30 Q28 -6 34 6" stroke="#b7a482" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M-16 -78 Q0 -88 16 -78 L24 -38 Q0 -28 -24 -38Z" fill="#efe1c5" stroke="${P.ink}" stroke-opacity=".18" stroke-width="1.5"/>
    <path d="M-16 -78 Q0 -70 16 -78 L18 -66 Q0 -58 -18 -66Z" fill="${P.gold}" opacity=".68"/>
    <path d="M-20 -72 Q-36 -60 -40 -46 M20 -72 Q36 -60 40 -46" stroke="#d8ad87" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M-12 -40 Q-24 -16 -30 4 M12 -40 Q24 -16 30 4" stroke="#b7a482" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M-30 4 l-10 8 M-30 4 l-2 12 M-30 4 l9 8 M30 4 l10 8 M30 4 l2 12 M30 4 l-9 8" stroke="#b7a482" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <path d="M-15 -82 Q0 -94 15 -82 L13 -70 Q0 -62 -13 -70Z" fill="#d8ad87"/>
    <circle cx="0" cy="-101" r="18" fill="#d8ad87"/>
    <path d="M-18 -101 Q-20 -126 0 -126 Q20 -126 18 -101 Q12 -114 0 -114 Q-12 -114 -18 -101Z" fill="#4e3b35"/>
    <path d="M-16 -104 Q-26 -92 -22 -78 Q-12 -82 -10 -96Z" fill="#4e3b35"/>
    <path d="M16 -104 Q26 -92 22 -78 Q12 -82 10 -96Z" fill="#4e3b35"/>
    <circle cx="7" cy="-102" r="1.6" fill="${P.ink}"/>
    <path d="M4 -94 q7 3 12 -2" stroke="${P.rust2}" stroke-width="1.6" fill="none"/>
    <path d="M-8 -70 q8 5 16 0" stroke="${P.gold}" stroke-width="1.5" fill="none" opacity=".7"/>
  </g>`;
}

function waxBlock(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-34 -24 L12 -38 L42 -16 L-4 0Z" fill="#e1c67d"/>
    <path d="M-34 -24 L-4 0 V26 L-34 2Z" fill="#b99a58"/>
    <path d="M-4 0 L42 -16 V8 L-4 26Z" fill="#d1b06b"/>
    <path d="M-20 -18 q18 -8 40 -4" stroke="${P.cream}" stroke-width="2" fill="none" opacity=".6"/>
  </g>`;
}

function waterSkin(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M0 -40 V-58" stroke="${P.paper2}" stroke-width="3"/>
    <path d="M-20 -38 q-14 26 -4 46 q8 18 24 18 q16 0 24 -18 q10 -20 -4 -46Z" fill="#7b6248" stroke="${P.ink}" stroke-opacity=".3"/>
    <path d="M-12 -34 q-6 28 2 46 M12 -34 q6 28 -2 46" stroke="${P.paper2}" stroke-width="2" fill="none" opacity=".4"/>
    <path d="M-12 -40 h24 v-8 h-24z" fill="${P.paper2}"/>
  </g>`;
}

function lyre(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-22 18 Q-46 -18 -28 -38 Q-12 -54 0 -28 Q12 -54 28 -38 Q46 -18 22 18Z" fill="none" stroke="${P.gold}" stroke-width="7"/>
    <path d="M-25 -4 H25" stroke="${P.gold}" stroke-width="4"/>
    <path d="M-12 4 V-16 M0 4 V-22 M12 4 V-16" stroke="${P.cream}" stroke-width="1.5" opacity=".75"/>
    <circle cx="-28" cy="-38" r="4" fill="${P.gold2}"/><circle cx="28" cy="-38" r="4" fill="${P.gold2}"/>
  </g>`;
}

function shell(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-38 8 Q-30 -34 0 -42 Q30 -34 38 8 Q0 22 -38 8Z" fill="#e2c9a1" stroke="${P.ink}" stroke-opacity=".25"/>
    <path d="M0 -38 V12 M-16 -32 Q-10 4 -6 14 M16 -32 Q10 4 6 14 M-30 -18 Q-22 4 -18 12 M30 -18 Q22 4 18 12" stroke="${P.paper2}" stroke-width="2" fill="none" opacity=".8"/>
  </g>`;
}

function bench(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-58 -20 H58 V-6 H-58Z" fill="#6c4a32"/>
    <path d="M-50 0 V42 M50 0 V42 M-34 0 V34 M34 0 V34" stroke="#503725" stroke-width="8"/>
    <path d="M-58 -20 q58 8 116 0" stroke="${P.gold}" stroke-width="2" fill="none" opacity=".2"/>
  </g>`;
}

function crate(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-46 -38 H46 V38 H-46Z" fill="#765234" stroke="${P.ink}" stroke-opacity=".3"/>
    <path d="M-46 -38 H46 M-46 38 H46 M-30 -38 V38 M30 -38 V38" stroke="#4f3726" stroke-width="4"/>
    <path d="M-46 -28 H46 M-46 28 H46" stroke="${P.paper2}" stroke-width="2" opacity=".3"/>
    <path d="M-30 -38 L30 38 M30 -38 L-30 38" stroke="${P.paper2}" stroke-width="2" opacity=".22"/>
  </g>`;
}

function sailFold(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-68 42 Q-42 -34 4 -40 Q58 -48 72 26 Q20 56 -68 42Z" fill="#d9c7a5" stroke="${P.ink}" stroke-opacity=".16"/>
    <path d="M-54 30 Q-24 -20 10 -26 Q46 -32 58 18" fill="none" stroke="${P.paper2}" stroke-width="3" opacity=".55"/>
    <path d="M-46 20 Q-20 -4 4 -8" fill="none" stroke="${P.ink}" stroke-width="2" opacity=".12"/>
  </g>`;
}

function feather(x, y, s = 1, rotation = 0) {
  return `<g transform="translate(${x} ${y}) scale(${s}) rotate(${rotation})">
    <path d="M0 0 Q-6 -42 8 -82" stroke="${P.paper2}" stroke-width="2.4" fill="none"/>
    <path d="M2 -72 Q-24 -58 -30 -30 Q-12 -34 1 -44 Q-9 -22 -8 -4 Q4 -16 7 -32 Q12 -14 22 0 Q24 -24 16 -44 Q34 -30 46 -12 Q38 -44 16 -58 Q34 -62 42 -76 Q22 -70 8 -60 Q10 -74 2 -72Z" fill="#e8dcc4" stroke="${P.ink}" stroke-opacity=".12" stroke-width="1"/>
    <path d="M2 -64 Q-12 -48 -20 -32 M4 -48 Q-2 -28 -4 -12 M10 -54 Q20 -40 30 -22" stroke="#c7b795" stroke-width="1" fill="none" opacity=".7"/>
  </g>`;
}

export function sirensSea() {
  const defs = [
    skyDefs('sky', '#162a40', '#b36e5f', { bottomStop: '62%' }),
    seaDefs('seaGrad', '#285e68', '#122d38'),
    grad('deck', [[0, '#6d5138'], [1, '#2b211a']]),
    grad('rock', [[0, '#4a4b44'], [1, '#1d2527']])
  ].join('');
  const body = `
    ${sky(W, H)}
    ${stars(0, 0, W, 460, 44, 120)}
    ${moon(1220, 190, 56, { phase: 'crescent' })}
    <g opacity=".22" fill="${P.cream}">
      <path d="M0 300 q200 -30 380 0 q-180 38 -380 0Z"/>
      <path d="M980 330 q180 -24 330 0 q-170 34 -330 0Z"/>
    </g>
    ${mountainPath('M0 470 L120 400 L226 458 L350 384 L470 456 L604 402 L730 470 L878 408 L1000 470 L1130 420 L1270 472 L1410 414 L1600 470 V540 H0Z', '#2d3d45', 0.9)}
    ${sea(478, W, H, { seed: 14 })}
    <path d="M0 600 Q110 430 236 470 Q330 500 352 640 L320 760 H0Z" fill="url(#rock)"/>
    <path d="M48 616 Q124 512 212 520 Q286 530 308 642" fill="none" stroke="${P.paper2}" stroke-width="2" opacity=".18"/>
    <path d="M1600 600 Q1470 420 1352 458 Q1240 494 1230 646 L1258 780 H1600Z" fill="url(#rock)"/>
    <path d="M1540 636 Q1460 520 1378 534 Q1300 550 1284 650" fill="none" stroke="${P.paper2}" stroke-width="2" opacity=".18"/>
    ${siren(140, 482, 1.0)}
    ${siren(246, 510, 0.7)}
    ${siren(1440, 468, 1.05, true)}
    ${siren(1522, 506, 0.65, true)}
    <g>
      <path d="M0 628 Q300 596 600 626 T1200 622 T1600 636 V900 H0Z" fill="url(#deck)"/>
      <path d="M0 650 Q300 618 600 648 T1200 644 T1600 658" fill="none" stroke="${P.gold}" stroke-width="2" opacity=".18"/>
      ${Array.from({ length: 14 }, (_, i) => `<path d="M${i * 124} 646 L${i * 124 - 10} 900" stroke="${P.ink}" stroke-width="2" opacity=".16"/>`).join('')}
      ${Array.from({ length: 4 }, (_, i) => `<path d="M0 ${710 + i * 52} Q400 ${692 + i * 52} 800 ${712 + i * 52} T1600 ${706 + i * 52}" fill="none" stroke="${P.paper2}" stroke-width="1.4" opacity=".1"/>`).join('')}
      <path d="M0 630 H1600" stroke="#8b6a45" stroke-width="12"/>
      <path d="M0 630 H1600" stroke="${P.gold2}" stroke-width="2" opacity=".3"/>
      <path d="M760 80 V900" stroke="#3b2b21" stroke-width="28"/>
      <path d="M760 80 V900" stroke="${P.gold}" stroke-width="3" opacity=".2"/>
      <path d="M760 150 H1400" stroke="#3b2b21" stroke-width="18" transform="rotate(-4 760 150)"/>
      <path d="M800 144 Q1040 50 1350 130 Q1180 320 830 292 Z" fill="#d8c4a0" opacity=".95"/>
      <path d="M812 156 Q1040 76 1310 140 Q1160 290 848 270" fill="none" stroke="${P.paper2}" stroke-width="3" opacity=".55"/>
      <path d="M842 188 Q1040 132 1250 166" fill="none" stroke="${P.ink}" stroke-width="2" opacity=".1"/>
      <path d="M760 80 L800 144 M760 80 L1350 130 M760 300 L830 292" stroke="${P.ink}" stroke-width="1.2" opacity=".35"/>
      ${sailFold(720, 226, 0.92)}
      ${figure(812, 712, 1.02, { robe: '#d8c5a4', robe2: '#8d3e35', skin: '#c99972', hair: '#241c19', pose: 'bound', bound: true, facing: -1, cloak: '#6e3d38' })}
      <path d="M766 512 q46 -18 92 0 M772 574 q40 -16 82 0 M776 636 q36 -12 74 0" fill="none" stroke="${P.paper2}" stroke-width="4" opacity=".55"/>
      <path d="M758 410 q-26 70 -68 142" fill="none" stroke="${P.paper2}" stroke-width="2" opacity=".38"/>
      ${waterSkin(690, 566, 0.95)}
      ${feather(720, 226, 0.72, -24)}
      ${figure(505, 784, 0.9, { robe: '#43615c', robe2: '#b79a6b', pose: 'row', facing: 1, hair: '#2f251f' })}
      ${figure(1174, 798, 0.88, { robe: '#7b5546', robe2: '#c3a171', pose: 'row', facing: -1, hair: '#25201d' })}
      <g>
        <path d="M1074 800 Q1122 780 1180 800" fill="none" stroke="${P.paper2}" stroke-width="6"/>
        ${waxBlock(1150, 778, 0.95)}
      </g>
      <g>
        <ellipse cx="348" cy="770" rx="78" ry="18" fill="${P.ink}" opacity=".4" filter="url(#blur5)"/>
        ${rope(340, 758, 0.95)}
      </g>
      <g>
        <ellipse cx="1270" cy="760" rx="64" ry="20" fill="${P.ink}" opacity=".38" filter="url(#blur5)"/>
        ${lyre(1262, 716, 0.9)}
      </g>
      <g>
        <ellipse cx="1036" cy="780" rx="68" ry="18" fill="${P.ink}" opacity=".35" filter="url(#blur5)"/>
        ${shell(1036, 766, 0.9)}
      </g>
      <path d="M0 820 Q200 790 380 824 M1230 850 Q1420 818 1600 848" fill="none" stroke="${P.ink}" stroke-width="4" opacity=".2"/>
    </g>
    <rect width="1600" height="900" fill="url(#vignette)" opacity=".46"/>
  `;
  return doc(body, defs);
}

// ---------------------------------------------------------------------------
// Hidden-object covers (transparent full-canvas sprites)

export function cyclopsFireCover() {
  return coverDoc(`${flame(700, 690, 1.35, 5)}
    <circle cx="700" cy="660" r="120" fill="#efad55" opacity=".13" filter="url(#softGlow)"/>`);
}

export function cyclopsWoodpileCover() {
  const logs = [
    [-60, 0, 0.04], [-10, -18, -0.07], [36, -2, 0.03], [-38, 22, -0.03], [18, 24, 0.06]
  ];
  return coverDoc(`<g transform="translate(420 742)">
    ${logs.map(([x, y, r]) => `<g transform="translate(${x} ${y}) rotate(${r * 57})">
      <rect x="-44" y="-15" width="88" height="30" rx="14" fill="#62462f"/>
      <ellipse cx="-44" cy="0" rx="14" ry="15" fill="#8f6b47"/>
      <ellipse cx="-44" cy="0" rx="8" ry="9" fill="#6c4b31"/>
      <path d="M-30 -10 q28 -4 58 0" stroke="${P.paper2}" stroke-width="2" opacity=".3" fill="none"/>
    </g>`).join('')}
    <ellipse cx="0" cy="34" rx="92" ry="16" fill="${P.ink}" opacity=".3" filter="url(#blur5)"/>
  </g>`);
}

export function cyclopsFleeceCover() {
  return coverDoc(`<g transform="translate(1000 718)">
    <path d="M-76 18 Q-92 -26 -46 -42 Q-10 -64 28 -40 Q74 -48 82 -2 Q94 40 44 42 Q0 62 -42 42 Q-72 40 -76 18Z" fill="#d9cbb1" stroke="${P.ink}" stroke-opacity=".22" stroke-width="2"/>
    <path d="M-54 -8 q24 -26 58 -10 q-6 34 -44 34 q-28 0 -14 -24Z" fill="#c6b596" opacity=".7"/>
    <path d="M-42 18 q28 12 64 -4" stroke="${P.paper2}" stroke-width="2" fill="none" opacity=".6"/>
    <path d="M-30 -30 q8 -18 20 -20 M30 -32 q12 -18 24 -12" stroke="#b9a98e" stroke-width="3" fill="none" opacity=".6"/>
  </g>`);
}

export function cyclopsClothCover() {
  return coverDoc(`<g transform="translate(960 300)">
    <path d="M-74 -62 H74" stroke="#4d3c2d" stroke-width="8"/>
    <path d="M-64 -58 Q-58 54 -76 96 Q-20 82 18 96 Q50 70 58 98 Q72 34 64 -58Z" fill="#cabfa7" stroke="${P.ink}" stroke-opacity=".18" stroke-width="2"/>
    <path d="M-44 -50 Q-40 30 -52 78 M-12 -50 Q-6 42 4 86 M22 -50 Q26 34 34 78" stroke="${P.paper2}" stroke-width="2" fill="none" opacity=".55"/>
    <circle cx="-34" cy="-22" r="18" fill="#e3d3ad" opacity=".8"/>
    <circle cx="18" cy="-4" r="21" fill="#e3d3ad" opacity=".7"/>
    <circle cx="-30" cy="-22" r="6" fill="#c7b183" opacity=".7"/>
    <circle cx="18" cy="-4" r="7" fill="#c7b183" opacity=".7"/>
  </g>`);
}

export function cyclopsShieldCover() {
  return coverDoc(`<g transform="translate(1180 380)">${shield(0, 0, 1.08, { field: '#6e4a37', rim: P.gold })}</g>`);
}

export function sirensBenchCover() {
  return coverDoc(bench(350, 766, 1.05));
}

export function sirensCrateCover() {
  return coverDoc(crate(1262, 728, 1.05));
}

export function sirensSailCover() {
  return coverDoc(`<g transform="translate(724 222)">
    <path d="M-72 28 Q-46 -34 2 -42 Q56 -52 76 20 Q20 48 -72 28Z" fill="#e0cfad" stroke="${P.ink}" stroke-opacity=".18"/>
    <path d="M-54 18 Q-24 -18 8 -24 Q44 -32 58 12" fill="none" stroke="${P.paper2}" stroke-width="3" opacity=".6"/>
    <path d="M-70 30 Q0 50 74 22" fill="none" stroke="${P.ink}" stroke-width="2" opacity=".13"/>
    <path d="M-28 10 q18 -10 36 0" fill="none" stroke="${P.gold}" stroke-width="1.5" opacity=".3"/>
  </g>`);
}

export function sirensShieldCover() {
  return coverDoc(`<g transform="translate(1036 770) rotate(8)">${shield(0, 0, 1.08, { field: '#3f5f5c', rim: P.gold })}</g>`);
}

// ---------------------------------------------------------------------------
// Story triptychs — three framed panels for every narrative beat

function triptych(panels, defs = '') {
  const panelW = 460;
  const panelH = 640;
  const gap = 40;
  const startX = 40;
  const startY = 40;
  const frame = panels.map((panel, index) => {
    const x = startX + index * (panelW + gap);
    const clip = `panelClip${index}`;
    return `<g transform="translate(${x} ${startY})">
      <defs><clipPath id="${clip}"><rect x="0" y="0" width="${panelW}" height="${panelH}" rx="3"/></clipPath></defs>
      <g clip-path="url(#${clip})">${panel}</g>
      <rect x="0" y="0" width="${panelW}" height="${panelH}" fill="none" stroke="${P.gold}" stroke-opacity=".62" stroke-width="1.6"/>
      <rect x="7" y="7" width="${panelW - 14}" height="${panelH - 14}" fill="none" stroke="${P.gold}" stroke-opacity=".2"/>
      <path d="M0 26 V0 H26 M${panelW - 26} 0 H${panelW} V26 M0 ${panelH - 26} V${panelH} H26 M${panelW - 26} ${panelH} H${panelW} V${panelH - 26}" fill="none" stroke="${P.gold2}" stroke-width="2" stroke-opacity=".55"/>
      <text x="${panelW - 18}" y="${panelH - 18}" fill="${P.gold}" opacity=".72" font-family="Georgia, serif" font-size="13" text-anchor="end" letter-spacing="3">${['I', 'II', 'III'][index]}</text>
    </g>`;
  }).join('');
  return svgDoc(1560, 720, `${frame}`, { defs, frame: false, texture: true, vignette: true, bg: '#0d1b23' });
}

function rain(x, y, w, h, seed = 4) {
  const rand = rng(seed);
  let out = '';
  for (let i = 0; i < 42; i += 1) {
    const px = x + rand() * w;
    const py = y + rand() * h;
    const len = 12 + rand() * 22;
    out += `<path d="M${px.toFixed(0)} ${py.toFixed(0)} l-${len * 0.35} ${len}" stroke="${P.foam}" stroke-width="1.2" opacity="${(0.08 + rand() * 0.18).toFixed(2)}"/>`;
  }
  return out;
}

function axe(x, y, s = 1, rotation = 0) {
  return `<g transform="translate(${x} ${y}) scale(${s}) rotate(${rotation})">
    <path d="M0 0 V-102" stroke="#6a4a2e" stroke-width="7" stroke-linecap="round"/>
    <path d="M2 -108 Q-34 -116 -48 -92 Q-42 -64 -4 -70 L2 -82Z" fill="${P.gold}" stroke="${P.ink}" stroke-opacity=".28" stroke-width="2"/>
    <path d="M2 -106 Q-28 -108 -38 -90" fill="none" stroke="${P.gold2}" stroke-width="2" opacity=".7"/>
    <path d="M4 -80 L28 -90 L22 -74Z" fill="${P.gold}" opacity=".8"/>
    <path d="M-4 -84 h12" stroke="${P.paper2}" stroke-width="4" opacity=".55"/>
  </g>`;
}

export function lotusTriptych() {
  const defs = [
    grad('p1sky', [[0, '#152b35'], [1, '#50747a']]),
    grad('p2sky', [[0, '#94b4b1'], [1, '#f1c68e']]),
    grad('p3sky', [[0, '#e1b076'], [1, '#f6ddae']]),
    seaDefs('seaGrad', '#346e74', '#122f38')
  ].join('');
  const panels = [
    `<g>
      <rect width="460" height="640" fill="url(#p1sky)"/>
      <path d="M0 170 q100 -40 190 0 q90 36 180 0 q60 -20 90 8" fill="none" stroke="${P.ink}" stroke-width="20" opacity=".24"/>
      <path d="M60 128 L96 214 L64 200 L108 286 L54 248" fill="none" stroke="${P.gold2}" stroke-width="3" opacity=".75"/>
      ${rain(0, 70, 460, 350, 9)}
      ${sea(380, 460, 640, { seed: 11 })}
      ${ship(230, 474, 0.62, { oars: 3, sail: '#bdb191', flag: '#7f372f' })}
      <path d="M0 520 Q110 486 230 526 T460 522 V640 H0Z" fill="#122b35" opacity=".7"/>
      <path d="M40 558 q100 -26 190 0 M260 590 q80 -18 160 0" fill="none" stroke="${P.foam}" stroke-width="2" opacity=".22"/>
      <rect width="460" height="640" fill="url(#vignette)" opacity=".3"/>
    </g>`,
    `<g>
      <rect width="460" height="640" fill="url(#p2sky)"/>
      ${sun(330, 150, 44)}
      ${mountainPath('M0 320 L90 270 L180 320 L290 264 L390 320 L460 292 V370 H0Z', '#6c8b83', 0.6)}
      ${sea(330, 460, 640, { seed: 21 })}
      ${ship(126, 424, 0.38, { oars: 2, flag: '#8b3b31' })}
      <path d="M0 486 Q120 456 250 500 Q350 532 460 492 V640 H0Z" fill="#d4b381"/>
      <path d="M0 500 Q130 474 250 514 Q352 546 460 508" fill="none" stroke="${P.foam}" stroke-width="3" opacity=".45"/>
      ${tree(70, 540, 0.55)}
      ${lotus(260, 574, 0.8, '#d77a81')}
      ${lotus(350, 598, 0.64, '#eab5b1')}
      ${figure(205, 588, 0.6, { robe: '#e1d0b1', robe2: '#8e4a3d', pose: 'reach', facing: 1 })}
      ${lotus(410, 536, 0.55, '#d77a81')}
      <rect width="460" height="640" fill="url(#vignette)" opacity=".24"/>
    </g>`,
    `<g>
      <rect width="460" height="640" fill="url(#p3sky)"/>
      <circle cx="240" cy="300" r="240" fill="${P.gold2}" opacity=".13" filter="url(#softGlow)"/>
      ${mountainPath('M0 310 Q90 278 170 300 Q270 326 360 294 Q420 276 460 300 V380 H0Z', '#8f8f72', 0.6)}
      ${sea(330, 460, 640, { seed: 31 })}
      ${ship(332, 390, 0.24, { oars: 1, flag: '#8b3b31' })}
      <path d="M0 430 Q120 410 240 438 Q350 462 460 430 V640 H0Z" fill="#8fa06c"/>
      ${lotus(150, 570, 1.28, '#d77a81')}
      ${lotus(350, 612, 1.0, '#eab5b1')}
      ${figure(230, 576, 0.7, { robe: '#b25f4d', robe2: '#e2c99e', pose: 'hold', facing: 1, hair: '#3d2a20' })}
      ${figure(308, 590, 0.62, { robe: '#5e7b70', robe2: '#d1b784', pose: 'stand', facing: -1, hair: '#251e1a' })}
      ${lotus(244, 500, 0.54, '#d77a81')}
      <path d="M0 620 q100 -20 200 0 q100 20 260 0" fill="none" stroke="${P.olive2}" stroke-width="8" opacity=".5"/>
      <rect width="460" height="640" fill="url(#vignette)" opacity=".22"/>
    </g>`
  ];
  return triptych(panels, defs);
}

export function cyclopsTriptych() {
  const defs = [
    grad('c1sky', [[0, '#0f2936'], [1, '#34565c']]),
    seaDefs('seaGrad', '#285c64', '#10272e'),
    grad('c2wall', [[0, '#35372f'], [1, '#111615']])
  ].join('');
  const panels = [
    `<g>
      <rect width="460" height="640" fill="url(#c1sky)"/>
      ${moon(354, 126, 34)}
      ${stars(0, 0, 460, 280, 18, 42)}
      ${sea(330, 460, 640, { seed: 41 })}
      <path d="M0 640 V234 Q20 146 112 118 Q200 94 264 168 Q300 214 300 306 V640Z" fill="#242e2d"/>
      <path d="M78 640 V342 Q84 276 154 254 Q224 238 252 300 Q268 338 268 640Z" fill="#0a171b"/>
      <path d="M86 638 V344 Q92 286 154 266 Q218 250 246 304 Q258 340 258 638" fill="none" stroke="${P.gold}" stroke-width="2" opacity=".25"/>
      ${ship(82, 430, 0.34, { oars: 2, sail: '#c7b792' })}
      <path d="M0 520 Q120 488 240 526 Q356 560 460 518 V640 H0Z" fill="#0c1b20" opacity=".8"/>
      <path d="M0 576 q130 -26 260 0 q100 20 200 -4" fill="none" stroke="${P.foam}" stroke-width="2" opacity=".18"/>
      <rect width="460" height="640" fill="url(#vignette)" opacity=".4"/>
    </g>`,
    `<g>
      <rect width="460" height="640" fill="url(#c2wall)"/>
      <path d="M0 640 V474 Q80 438 170 466 Q280 498 460 454 V640Z" fill="#1d211d"/>
      ${cyclops(338, 290, 0.62)}
      ${flame(126, 514, 0.8, 8)}
      ${figure(116, 578, 0.52, { robe: '#d7c4a5', robe2: '#8d4438', pose: 'hold', facing: 1 })}
      <path d="M0 530 Q120 506 240 532 T460 526" fill="none" stroke="${P.gold}" stroke-width="1.5" opacity=".14"/>
      ${smoke(126, 470, 0.6, 18)}
      <rect width="460" height="640" fill="url(#vignette)" opacity=".38"/>
    </g>`,
    `<g>
      <rect width="460" height="640" fill="#222923"/>
      <path d="M0 640 V470 Q120 438 240 470 Q360 500 460 464 V640Z" fill="#151b17"/>
      <path d="M0 0 H460 V170 Q320 210 220 162 Q110 110 0 158Z" fill="#2e342b" opacity=".7"/>
      ${wineSkin(164, 326, 1.45)}
      ${stake(292, 456, 1.2)}
      ${ember(118, 510, 1.05)}
      <g opacity=".75">
        <path d="M70 472 q-30 -20 -26 -58 q12 30 36 40" fill="#8a7357"/>
        <path d="M376 500 q32 -22 28 -60 q-16 30 -38 42" fill="#8a7357"/>
      </g>
      <path d="M112 360 q40 -26 86 0" fill="none" stroke="${P.gold}" stroke-width="1.5" opacity=".2"/>
      <rect width="460" height="640" fill="url(#vignette)" opacity=".4"/>
    </g>`
  ];
  return triptych(panels, defs);
}

export function circeTriptych() {
  const defs = [
    grad('m1sky', [[0, '#0f2627'], [1, '#28453b']]),
    grad('m2wall', [[0, '#4b3442'], [1, '#201c23']]),
    grad('m3sky', [[0, '#2a3d3c'], [1, '#8a6c53']])
  ].join('');
  const panels = [
    `<g>
      <rect width="460" height="640" fill="url(#m1sky)"/>
      ${stars(0, 30, 460, 220, 13, 40)}
      ${Array.from({ length: 7 }, (_, i) => `<path d="M${40 + i * 65} 640 V${150 + (i % 3) * 40}" stroke="#2b3b30" stroke-width="${18 + (i % 2) * 10}"/><circle cx="${40 + i * 65}" cy="${136 + (i % 3) * 40}" r="${50 + (i % 2) * 18}" fill="#24392d"/>`).join('')}
      <path d="M290 430 L310 350 L342 388 L366 332 L394 410 L430 390 V640 H290Z" fill="#394237"/>
      <g fill="${P.gold2}"><rect x="322" y="388" width="14" height="22" opacity=".9"/><rect x="354" y="404" width="12" height="18" opacity=".65"/></g>
      <circle cx="350" cy="386" r="92" fill="${P.gold2}" opacity=".12" filter="url(#softGlow)"/>
      ${figure(170, 574, 0.62, { robe: '#9e6b4f', robe2: '#cab184', pose: 'stand', facing: 1 })}
      ${figure(222, 584, 0.58, { robe: '#5f7569', robe2: '#c7ad7b', pose: 'reach', facing: 1 })}
      <path d="M0 590 Q120 566 250 598 T460 586 V640 H0Z" fill="#1c2a23"/>
      <rect width="460" height="640" fill="url(#vignette)" opacity=".4"/>
    </g>`,
    `<g>
      <rect width="460" height="640" fill="url(#m2wall)"/>
      ${column(46, 520, 390, 24, '#b7a17d', '#77654b')}
      ${column(414, 520, 390, 24, '#b7a17d', '#77654b')}
      <path d="M0 486 H460 V640 H0Z" fill="#3b2d2a"/>
      ${figure(174, 504, 0.88, { robe: '#7e3f4d', robe2: '#d5a85a', pose: 'hold', facing: 1, cloak: '#4c2a3b' })}
      ${goblet(208, 374, 0.8, { wine: true, jewel: '#d65a4a' })}
      ${pig(340, 540, 0.7)}
      ${pig(94, 566, 0.56, { body: '#bd7a6b' })}
      <path d="M230 320 q34 -30 66 0 q-34 30 -66 0Z" fill="none" stroke="${P.gold2}" stroke-width="1.5" opacity=".5"/>
      <path d="M262 392 q-20 60 -54 92 M280 392 q24 52 46 80" fill="none" stroke="${P.gold2}" stroke-width="1.5" opacity=".36"/>
      <rect width="460" height="640" fill="url(#vignette)" opacity=".35"/>
    </g>`,
    `<g>
      <rect width="460" height="640" fill="url(#m3sky)"/>
      <circle cx="220" cy="270" r="170" fill="${P.gold2}" opacity=".13" filter="url(#softGlow)"/>
      ${mountainPath('M0 400 Q90 366 180 396 Q280 430 370 392 Q420 372 460 390 V470 H0Z', '#637262', 0.7)}
      ${figure(210, 566, 0.94, { robe: '#d7be91', robe2: '#8c5d3b', pose: 'reach', facing: 1, hair: '#6b4a2d', cloak: '#8f6d3f' })}
      <g transform="translate(236 356)">
        <path d="M-24 -2 q-30 -20 -46 -44 q30 6 46 28Z" fill="${P.cream}"/>
        <path d="M24 -2 q30 -20 46 -44 q-30 6 -46 28Z" fill="${P.cream}"/>
        <path d="M-22 0 q22 -14 44 0" fill="none" stroke="${P.gold}" stroke-width="2"/>
      </g>
      ${moly(342, 448, 1.18)}
      <path d="M0 608 q120 -24 240 0 q110 20 220 -2" fill="none" stroke="${P.olive2}" stroke-width="9" opacity=".55"/>
      <rect width="460" height="640" fill="url(#vignette)" opacity=".24"/>
    </g>`
  ];
  return triptych(panels, defs);
}

export function sirensTriptych() {
  const defs = [
    grad('s1sky', [[0, '#172b40'], [1, '#9d6259']]),
    seaDefs('seaGrad', '#2b616a', '#112b35'),
    grad('s2deck', [[0, '#664c35'], [1, '#211b18']])
  ].join('');
  const panels = [
    `<g>
      <rect width="460" height="640" fill="url(#s1sky)"/>
      ${stars(0, 0, 460, 250, 23, 55)}
      ${moon(370, 118, 32)}
      ${sea(354, 460, 640, { seed: 51 })}
      <path d="M0 404 L48 302 L86 356 L124 286 L162 386 L204 330 L238 440 L120 486 L0 470Z" fill="#313c3c"/>
      <path d="M460 430 L420 318 L376 370 L346 300 L300 398 L258 350 L226 458 L338 500 L460 480Z" fill="#2d3838"/>
      ${siren(112, 334, 0.58)}
      ${siren(352, 324, 0.6, true)}
      ${ship(230, 470, 0.55, { oars: 3, flag: '#8f3f35' })}
      <path d="M0 526 Q120 496 240 530 T460 524 V640 H0Z" fill="#122b35" opacity=".75"/>
      <rect width="460" height="640" fill="url(#vignette)" opacity=".3"/>
    </g>`,
    `<g>
      <rect width="460" height="640" fill="url(#s1sky)"/>
      ${stars(0, 0, 460, 220, 27, 38)}
      ${sea(390, 460, 640, { seed: 52 })}
      <path d="M0 560 Q100 528 220 562 T460 550 V640 H0Z" fill="url(#s2deck)"/>
      <path d="M210 76 V640" stroke="#36271e" stroke-width="20"/>
      <path d="M230 142 H460" stroke="#36271e" stroke-width="12"/>
      <path d="M240 150 Q340 84 460 132 V362 Q352 392 242 346Z" fill="#d6c29e" opacity=".95"/>
      ${figure(212, 540, 0.92, { robe: '#d5c1a0', robe2: '#8d3e35', pose: 'bound', bound: true, facing: -1, cloak: '#6e3d38' })}
      <path d="M172 362 q42 -16 82 0 M178 418 q38 -14 74 0 M180 476 q36 -12 68 0" fill="none" stroke="${P.paper2}" stroke-width="4" opacity=".6"/>
      ${figure(96, 568, 0.64, { robe: '#42605b', robe2: '#b69969', pose: 'row', facing: 1 })}
      ${figure(370, 588, 0.58, { robe: '#775244', robe2: '#c2a06f', pose: 'row', facing: -1 })}
      <path d="M70 600 Q120 580 170 600" fill="none" stroke="${P.paper2}" stroke-width="5"/>
      <rect width="460" height="640" fill="url(#vignette)" opacity=".36"/>
    </g>`,
    `<g>
      <rect width="460" height="640" fill="url(#s1sky)"/>
      ${stars(0, 0, 460, 280, 33, 34)}
      ${moon(260, 170, 62)}
      ${sea(398, 460, 640, { seed: 53 })}
      <path d="M0 640 V404 Q40 350 110 370 Q170 386 190 458 V640Z" fill="#2d3435"/>
      ${siren(112, 352, 1.3)}
      <path d="M180 442 q60 -18 120 0" fill="none" stroke="${P.foam}" stroke-width="2" opacity=".2"/>
      <g fill="${P.cream}" opacity=".72">
        <path d="M300 360 q16 -30 32 0 q-16 12 -32 0Z"/><path d="M342 396 q12 -22 24 0 q-12 9 -24 0Z"/>
        <path d="M272 422 q10 -18 20 0 q-10 8 -20 0Z"/>
      </g>
      <path d="M300 500 q30 -20 54 4" fill="none" stroke="${P.gold}" stroke-width="2" opacity=".4"/>
      <rect width="460" height="640" fill="url(#vignette)" opacity=".4"/>
    </g>`
  ];
  return triptych(panels, defs);
}

export function ithacaTriptych() {
  const defs = [
    grad('i1sky', [[0, '#d7a06c'], [1, '#6d4d3d']]),
    grad('i2wall', [[0, '#574438'], [1, '#261f1b']]),
    grad('i3sky', [[0, '#c88b5c'], [1, '#4b3533']])
  ].join('');
  const panels = [
    `<g>
      <rect width="460" height="640" fill="url(#i1sky)"/>
      <path d="M0 0 H460 V150 Q340 188 260 150 Q130 92 0 144Z" fill="#3e3128"/>
      <path d="M84 640 V228 Q84 160 156 160 Q228 160 228 228 V640Z" fill="#2c2723"/>
      <path d="M104 640 V238 Q104 184 156 184 Q208 184 208 238 V640Z" fill="#e2b57d" opacity=".68"/>
      <path d="M156 184 V640" stroke="${P.ink}" stroke-width="3" opacity=".18"/>
      ${figure(300, 582, 0.78, { robe: '#71624c', robe2: '#96866c', pose: 'plead', facing: -1, hair: '#c4b79e' })}
      <path d="M330 578 L356 460" stroke="#5f4733" stroke-width="6"/>
      ${dog(386, 590, 0.46, '#5c4533')}
      <path d="M0 604 Q120 580 240 608 T460 598 V640 H0Z" fill="#3f332b"/>
      <path d="M32 604 q60 -10 120 0" fill="none" stroke="${P.gold}" stroke-width="1.5" opacity=".22"/>
      <rect width="460" height="640" fill="url(#vignette)" opacity=".3"/>
    </g>`,
    `<g>
      <rect width="460" height="640" fill="url(#i2wall)"/>
      <path d="M0 0 H460 V110 H0Z" fill="#2e2721" opacity=".8"/>
      ${bowOnWall(148, 310, 1.18)}
      ${axe(290, 420, 0.9, 3)}
      ${axe(350, 430, 0.9, -5)}
      ${axe(410, 438, 0.84, 3)}
      <path d="M278 500 H430" stroke="${P.gold}" stroke-width="2" opacity=".28"/>
      ${goblet(250, 520, 0.9, { wine: true })}
      <path d="M50 500 q60 -40 130 -6" fill="none" stroke="${P.ink}" stroke-width="3" opacity=".24"/>
      <rect width="460" height="640" fill="url(#vignette)" opacity=".4"/>
    </g>`,
    `<g>
      <rect width="460" height="640" fill="url(#i3sky)"/>
      <path d="M0 0 H460 V160 Q350 200 250 160 Q130 112 0 160Z" fill="#45332c" opacity=".8"/>
      <circle cx="236" cy="318" r="180" fill="${P.gold2}" opacity=".16" filter="url(#softGlow)"/>
      ${column(58, 560, 420, 26, '#c0a57d', '#816b4f')}
      ${column(402, 560, 420, 26, '#c0a57d', '#816b4f')}
      <path d="M0 558 H460 V640 H0Z" fill="#4f3930"/>
      ${figure(186, 552, 0.86, { robe: '#6a5845', robe2: '#94836a', pose: 'reach', facing: 1, hair: '#c1b49b' })}
      ${figure(270, 552, 0.86, { robe: '#6c4a56', robe2: '#d5a85a', pose: 'reach', facing: -1, hair: '#2e2220', cloak: '#40303a' })}
      <path d="M218 414 q24 -20 46 0 q-22 16 -46 0Z" fill="${P.gold2}" opacity=".55"/>
      <path d="M204 390 q32 -26 68 0" fill="none" stroke="${P.gold}" stroke-width="1.5" opacity=".3"/>
      <path d="M0 604 q120 -22 240 0 q100 18 220 0" fill="none" stroke="${P.gold}" stroke-width="1.5" opacity=".25"/>
      <rect width="460" height="640" fill="url(#vignette)" opacity=".24"/>
    </g>`
  ];
  return triptych(panels, defs);
}
