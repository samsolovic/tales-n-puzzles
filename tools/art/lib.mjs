// Small, dependency-free SVG illustration kit for Tales & Puzzles.
// Everything is drawn from primitives so the art can evolve with the story data.

export const P = {
  ink: '#0b1720',
  ink2: '#132832',
  night: '#0d2230',
  deep: '#163844',
  sea: '#2b6871',
  sea2: '#3d7d80',
  sea3: '#6fa39a',
  foam: '#c9d9c9',
  cream: '#f2e5ca',
  paper: '#dfc9a4',
  paper2: '#c5aa7c',
  gold: '#d5a85a',
  gold2: '#f2cf8c',
  rust: '#a34f3c',
  rust2: '#7e372f',
  wine: '#67303a',
  plum: '#4b3045',
  rose: '#c47a6f',
  olive: '#6e7850',
  olive2: '#4d5d42',
  skin: '#d6a57e',
  skin2: '#b77b58',
  white: '#f7efdc',
  smoke: '#9aa6a0'
};

export function esc(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

export function rng(seed = 1) {
  let state = seed >>> 0 || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return ((state >>> 0) / 4294967296);
  };
}

export function grad(id, stops, { x1 = 0, y1 = 0, x2 = 0, y2 = 1 } = {}) {
  return `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops
    .map(([offset, color, opacity = 1]) => `<stop offset="${offset}" stop-color="${color}" stop-opacity="${opacity}"/>`)
    .join('')}</linearGradient>`;
}

export function radial(id, stops, { cx = 0.5, cy = 0.5, r = 0.5 } = {}) {
  return `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops
    .map(([offset, color, opacity = 1]) => `<stop offset="${offset}" stop-color="${color}" stop-opacity="${opacity}"/>`)
    .join('')}</radialGradient>`;
}

export const BASE_DEFS = `
  <filter id="softGlow" x="-80%" y="-80%" width="260%" height="260%">
    <feGaussianBlur stdDeviation="22"/>
  </filter>
  <filter id="tinyGlow" x="-80%" y="-80%" width="260%" height="260%">
    <feGaussianBlur stdDeviation="7"/>
  </filter>
  <filter id="grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" stitchTiles="stitch" seed="7"/>
    <feColorMatrix type="saturate" values="0"/>
    <feComponentTransfer><feFuncA type="linear" slope=".3"/></feComponentTransfer>
  </filter>
  <filter id="blur2"><feGaussianBlur stdDeviation="2"/></filter>
  <filter id="blur5"><feGaussianBlur stdDeviation="5"/></filter>
  <radialGradient id="vignette" cx="50%" cy="46%" r="72%">
    <stop offset="48%" stop-color="#000" stop-opacity="0"/>
    <stop offset="100%" stop-color="#02090d" stop-opacity=".58"/>
  </radialGradient>
  <linearGradient id="sailGrad" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#f3e6c9"/>
    <stop offset=".52" stop-color="#ddc9a5"/>
    <stop offset="1" stop-color="#c3ad88"/>
  </linearGradient>
  <linearGradient id="paperWash" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#f3e4c5" stop-opacity=".12"/>
    <stop offset=".5" stop-color="#d5a85a" stop-opacity=".04"/>
    <stop offset="1" stop-color="#0d1d26" stop-opacity=".12"/>
  </linearGradient>
`;

export function svgDoc(w, h, body, { defs = '', bg = P.ink, frame = false, texture = true, vignette = true, wash = true } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>${BASE_DEFS}${defs}</defs>
  ${bg === 'none' ? '' : `<rect width="${w}" height="${h}" fill="${bg}"/>`}
  ${body}
  ${texture ? `<rect width="${w}" height="${h}" filter="url(#grain)" opacity=".13" style="mix-blend-mode:soft-light"/>` : ''}
  ${vignette ? `<rect width="${w}" height="${h}" fill="url(#vignette)"/>` : ''}
  ${wash ? `<rect width="${w}" height="${h}" fill="url(#paperWash)" opacity=".8"/>` : ''}
  ${frame ? frameSvg(w, h) : ''}
</svg>`;
}

export function frameSvg(w, h, inset = 18, color = P.gold) {
  return `<g fill="none" stroke="${color}" stroke-opacity=".64">
    <rect x="${inset}" y="${inset}" width="${w - inset * 2}" height="${h - inset * 2}" stroke-width="1.4"/>
    <rect x="${inset + 6}" y="${inset + 6}" width="${w - inset * 2 - 12}" height="${h - inset * 2 - 12}" stroke-width=".55" stroke-opacity=".38"/>
    <path d="M${inset + 18} ${inset} h34 M${inset} ${inset + 18} v34 M${w - inset - 52} ${inset} h34 M${w - inset} ${inset + 18} v34
             M${inset + 18} ${h - inset} h34 M${inset} ${h - inset - 18} v-34 M${w - inset - 52} ${h - inset} h34 M${w - inset} ${h - inset - 18} v-34" stroke-width="2"/>
  </g>`;
}

export function sky(w, h, top = '#223f4b', bottom = '#e0a36e', id = 'sky') {
  return `<rect width="${w}" height="${h}" fill="url(#${id})"/>`;
}

export function skyDefs(id, top, bottom, { topStop = '0%', bottomStop = '100%' } = {}) {
  return grad(id, [[topStop, top], [bottomStop, bottom]]);
}

export function sun(x, y, r = 80, color = '#f6d58f', opacity = 0.9) {
  return `<g>
    <circle cx="${x}" cy="${y}" r="${r * 2.6}" fill="${color}" opacity="${opacity * 0.13}" filter="url(#softGlow)"/>
    <circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="${opacity}"/>
    <circle cx="${x}" cy="${y}" r="${r * 0.76}" fill="#fff1ca" opacity="${opacity * 0.5}"/>
  </g>`;
}

export function moon(x, y, r = 45, { phase = 'full', color = '#f5e8c5', opacity = 1 } = {}) {
  const glow = `<circle cx="${x}" cy="${y}" r="${r * 3}" fill="${color}" opacity=".12" filter="url(#softGlow)"/>`;
  if (phase === 'crescent') {
    return `${glow}<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="${opacity}"/>
      <circle cx="${x + r * 0.43}" cy="${y - r * 0.16}" r="${r * 0.84}" fill="${P.night}" opacity=".94"/>`;
  }
  if (phase === 'half') {
    return `${glow}<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="${opacity * 0.35}"/>
      <path d="M${x} ${y - r} A${r} ${r} 0 0 1 ${x} ${y + r} Z" fill="${color}" opacity="${opacity}"/>`;
  }
  return `${glow}<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="${opacity}"/>
    <circle cx="${x - r * 0.28}" cy="${y - r * 0.2}" r="${r * 0.14}" fill="#d8c8a4" opacity=".33"/>
    <circle cx="${x + r * 0.24}" cy="${y + r * 0.13}" r="${r * 0.09}" fill="#d8c8a4" opacity=".25"/>`;
}

export function stars(x, y, w, h, seed = 3, count = 90, color = P.cream) {
  const rand = rng(seed);
  let out = '';
  for (let i = 0; i < count; i += 1) {
    const px = x + rand() * w;
    const py = y + rand() * h;
    const r = 0.5 + rand() * 1.5;
    out += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${r.toFixed(2)}" fill="${color}" opacity="${(0.18 + rand() * 0.65).toFixed(2)}"/>`;
  }
  return `<g>${out}</g>`;
}

export function birds(x, y, count = 3, color = P.ink, s = 1, seed = 2) {
  const rand = rng(seed);
  let out = '';
  for (let i = 0; i < count; i += 1) {
    const px = x + (rand() - 0.5) * 150 * s;
    const py = y + (rand() - 0.5) * 70 * s;
    const size = (6 + rand() * 9) * s;
    out += `<path d="M${px - size} ${py} q${size * 0.55} -${size * 0.55} ${size} 0 q${size * 0.45} -${size * 0.55} ${size} 0" fill="none" stroke="${color}" stroke-width="${1.5 * s}" stroke-linecap="round" opacity=".8"/>`;
  }
  return out;
}

export function mountainPath(points, color, opacity = 1) {
  return `<path d="${points}" fill="${color}" opacity="${opacity}"/>`;
}

export function wavePath(y, width, amp = 10, step = 90, offset = 0) {
  let d = `M0 ${y}`;
  for (let x = 0; x <= width + step; x += step) {
    d += ` q${step * 0.25} ${-amp + offset} ${step * 0.5} 0 q${step * 0.25} ${amp - offset} ${step * 0.5} 0`;
  }
  d += ` V1000 H0 Z`;
  return d;
}

export function sea(y, w, h, { top = P.sea2, bottom = P.deep, seed = 4, foam = true } = {}) {
  const rand = rng(seed);
  let waves = '';
  for (let i = 0; i < 7; i += 1) {
    const wy = y + 12 + i * ((h - y) / 7);
    const opacity = 0.12 + i * 0.03;
    waves += `<path d="${wavePath(wy, w, 5 + i * 1.7, 85 + i * 10)}" fill="${i % 2 ? P.sea : P.sea3}" opacity="${opacity}"/>`;
  }
  let glints = '';
  if (foam) {
    for (let i = 0; i < 36; i += 1) {
      const gx = rand() * w;
      const gy = y + 20 + rand() * (h - y - 10);
      glints += `<path d="M${gx.toFixed(0)} ${gy.toFixed(0)} q${8 + rand() * 16} -4 ${18 + rand() * 28} 0" stroke="${P.foam}" stroke-width="${1 + rand() * 1.4}" fill="none" opacity="${(0.08 + rand() * 0.2).toFixed(2)}"/>`;
    }
  }
  return `<g><rect x="0" y="${y}" width="${w}" height="${h - y}" fill="url(#seaGrad)"/>${waves}${glints}</g>`;
}

export function seaDefs(id = 'seaGrad', top = P.sea2, bottom = P.deep) {
  return grad(id, [[0, top], [1, bottom]]);
}

export function ship(x, y, s = 1, { flip = false, sail = P.cream, sailShade = '#d8c4a1', eye = false, flag = P.rust, oars = 5, sailFurled = false } = {}) {
  const dir = flip ? -1 : 1;
  const oarLines = [];
  for (let i = 0; i < oars; i += 1) {
    const ox = -118 + i * 52;
    oarLines.push(`<path d="M${ox} -4 q-35 22 -58 46" stroke="${P.paper2}" stroke-width="4" stroke-linecap="round" opacity=".9"/>`);
    oarLines.push(`<path d="M${ox} -4 q-35 22 -58 46" stroke="${P.ink}" stroke-width="1" opacity=".18"/>`);
  }
  const sailShape = sailFurled
    ? `<path d="M-105 -238 q106 26 210 0 l-18 42 q-88 17 -174 0 Z" fill="${sail}" stroke="${P.ink}" stroke-opacity=".18"/>`
    : `<path d="M-114 -252 Q8 -224 116 -258 L98 -66 Q5 -42 -96 -72 Z" fill="url(#sailGrad)" stroke="${P.ink}" stroke-opacity=".15"/>
       <path d="M-90 -236 Q0 -214 91 -240" stroke="${P.ink}" fill="none" stroke-opacity=".12" stroke-width="2"/>
       <path d="M-84 -106 Q0 -86 92 -112" stroke="${P.ink}" fill="none" stroke-opacity=".1" stroke-width="2"/>`;
  return `<g transform="translate(${x} ${y}) scale(${s * dir} ${s})">
    <ellipse cx="0" cy="18" rx="185" ry="24" fill="${P.ink}" opacity=".22" filter="url(#blur5)"/>
    ${oarLines.join('')}
    <path d="M-160 -16 Q-130 54 0 62 Q128 56 166 -20 L144 -48 Q10 -7 -138 -46 Z" fill="${P.rust2}" stroke="${P.ink}" stroke-width="3" stroke-opacity=".55"/>
    <path d="M-142 -40 Q-4 -7 148 -44 L146 -25 Q-2 14 -141 -23 Z" fill="${P.gold}" opacity=".7"/>
    <path d="M-156 -24 q-24 -18 -35 -44 q-8 36 14 58 q15 12 30 10" fill="${P.rust2}" stroke="${P.ink}" stroke-opacity=".35" stroke-width="2"/>
    <path d="M156 -26 q22 -16 34 -45 q8 37 -14 59 q-15 11 -28 9" fill="${P.rust2}" stroke="${P.ink}" stroke-opacity=".35" stroke-width="2"/>
    <circle cx="-158" cy="-66" r="7" fill="${P.gold}"/><circle cx="159" cy="-69" r="7" fill="${P.gold}"/>
    <path d="M0 -58 V-278" stroke="${P.ink}" stroke-width="7" stroke-linecap="round"/>
    <path d="M0 -58 V-278" stroke="${P.paper2}" stroke-width="2" opacity=".55"/>
    <path d="M-146 -252 H142" stroke="${P.ink}" stroke-width="6" stroke-linecap="round"/>
    ${sailShape}
    ${eye ? `<g transform="translate(2 -166)"><path d="M-27 0 Q0 -25 27 0 Q0 25 -27 0Z" fill="none" stroke="${P.rust}" stroke-width="4"/><circle cx="0" cy="0" r="9" fill="${P.rust}"/><circle cx="0" cy="0" r="4" fill="${P.ink}"/></g>` : ''}
    <path d="M-148 -258 q-26 6 -45 -4 q17 21 45 16" fill="${flag}" stroke="${P.ink}" stroke-opacity=".25"/>
    <path d="M0 -278 q42 6 63 -6 q-17 24 -63 21" fill="${flag}" opacity=".9"/>
    <path d="M-146 -252 L-130 -54 M142 -252 L126 -58" stroke="${P.ink}" stroke-width="1.2" opacity=".45"/>
  </g>`;
}

export function figure(x, y, s = 1, opts = {}) {
  const {
    robe = P.cream,
    robe2 = P.rust,
    skin = P.skin,
    hair = P.ink,
    cloak = null,
    pose = 'stand',
    facing = 1,
    bound = false,
    barefoot = true
  } = opts;
  const dir = facing;
  let arms = '';
  if (pose === 'reach') {
    arms = `<path d="M-22 -126 q-32 8 -39 40" stroke="${skin}" stroke-width="11" stroke-linecap="round"/>
      <path d="M22 -126 q34 -22 49 -50" stroke="${skin}" stroke-width="11" stroke-linecap="round"/>`;
  } else if (pose === 'hold') {
    arms = `<path d="M-22 -124 q-17 27 1 49 q17 13 30 4" stroke="${skin}" stroke-width="11" fill="none" stroke-linecap="round"/>
      <path d="M22 -124 q18 27 -2 48 q-15 12 -28 3" stroke="${skin}" stroke-width="11" fill="none" stroke-linecap="round"/>`;
  } else if (pose === 'row') {
    arms = `<path d="M-22 -122 q-36 23 -48 53" stroke="${skin}" stroke-width="11" stroke-linecap="round"/>
      <path d="M22 -122 q36 23 48 53" stroke="${skin}" stroke-width="11" stroke-linecap="round"/>`;
  } else if (pose === 'plead') {
    arms = `<path d="M-22 -122 q-18 30 -12 54" stroke="${skin}" stroke-width="11" stroke-linecap="round"/>
      <path d="M22 -122 q28 20 22 53" stroke="${skin}" stroke-width="11" stroke-linecap="round"/>`;
  } else if (pose === 'bound') {
    arms = `<path d="M-22 -124 q-10 -17 -3 -34" stroke="${skin}" stroke-width="11" stroke-linecap="round"/>
      <path d="M22 -124 q10 -17 3 -34" stroke="${skin}" stroke-width="11" stroke-linecap="round"/>`;
  } else {
    arms = `<path d="M-24 -124 q-16 32 -10 53" stroke="${skin}" stroke-width="11" stroke-linecap="round"/>
      <path d="M24 -124 q15 31 9 52" stroke="${skin}" stroke-width="11" stroke-linecap="round"/>`;
  }
  const cloakShape = cloak
    ? `<path d="M-31 -132 Q-64 -72 -49 -4 Q0 -20 51 -3 Q65 -75 30 -132 Z" fill="${cloak}" opacity=".94" stroke="${P.ink}" stroke-opacity=".18"/>`
    : '';
  const binds = bound
    ? `<path d="M-33 -125 Q0 -112 33 -125 M-35 -103 Q0 -90 35 -103 M-28 -58 Q0 -48 28 -58" stroke="${P.paper2}" stroke-width="4" fill="none" opacity=".9"/>`
    : '';
  return `<g transform="translate(${x} ${y}) scale(${s * dir} ${s})">
    <ellipse cx="0" cy="3" rx="34" ry="7" fill="${P.ink}" opacity=".25" filter="url(#blur2)"/>
    ${cloakShape}
    <path d="M-16 -56 L-19 -5 ${barefoot ? 'q-6 5 -13 2' : 'l9 3'}" stroke="${skin2(skin)}" stroke-width="9" stroke-linecap="round" fill="none"/>
    <path d="M16 -56 L19 -5 ${barefoot ? 'q6 5 13 2' : 'l-9 3'}" stroke="${skin2(skin)}" stroke-width="9" stroke-linecap="round" fill="none"/>
    <path d="M-28 -126 Q0 -139 28 -126 L39 -64 Q0 -45 -39 -64 Z" fill="${robe}" stroke="${P.ink}" stroke-opacity=".2" stroke-width="2"/>
    <path d="M-28 -126 Q-12 -118 0 -120 Q14 -118 28 -126 L31 -106 Q0 -94 -31 -106 Z" fill="${robe2}" opacity=".85"/>
    <path d="M-37 -65 Q0 -48 38 -65 L43 -44 Q0 -28 -43 -44 Z" fill="${robe2}" opacity=".55"/>
    <path d="M0 -130 V-57" stroke="${P.ink}" opacity=".12" stroke-width="2"/>
    <path d="M-8 -136 h16 v12 h-16 z" fill="${skin}"/>
    <circle cx="0" cy="-157" r="23" fill="${skin}"/>
    <path d="M-23 -160 Q-18 -190 5 -184 Q27 -181 23 -154 Q17 -169 4 -169 Q-10 -169 -23 -160Z" fill="${hair}"/>
    <path d="M23 -160 q8 -3 11 8 q-8 4 -13 -3" fill="${hair}"/>
    <circle cx="8" cy="-158" r="1.7" fill="${P.ink}" opacity=".6"/>
    ${arms}
    ${binds}
  </g>`;
}

function skin2(color) {
  return color === P.skin ? P.skin2 : color;
}

export function column(x, y, h, w = 34, color = P.paper, shade = '#bca77f') {
  return `<g transform="translate(${x} ${y})">
    <ellipse cx="0" cy="2" rx="${w * 1.38}" ry="${w * 0.45}" fill="${P.ink}" opacity=".2" filter="url(#blur2)"/>
    <rect x="${-w * 0.72}" y="${-h}" width="${w * 1.44}" height="${h}" fill="${color}"/>
    <rect x="${-w * 0.72}" y="${-h}" width="${w * 0.32}" height="${h}" fill="${shade}" opacity=".5"/>
    <rect x="${-w * 0.98}" y="${-h - w * 0.38}" width="${w * 1.96}" height="${w * 0.38}" fill="${color}"/>
    <rect x="${-w * 1.12}" y="${-w * 0.66}" width="${w * 2.24}" height="${w * 0.66}" fill="${shade}"/>
    <rect x="${-w * 1.24}" y="0" width="${w * 2.48}" height="${w * 0.52}" fill="${color}"/>
    <path d="M${-w * 0.25} ${-h + 14} V-20 M${w * 0.12} ${-h + 14} V-20" stroke="${shade}" stroke-width="2" opacity=".55"/>
  </g>`;
}

export function arch(x, y, w, h, { wall = '#3d3430', inner = '#1a2b33', rim = P.gold } = {}) {
  const r = w / 2;
  return `<g>
    <path d="M${x - w / 2} ${y} V${y - h + r} A${r} ${r} 0 0 1 ${x + w / 2} ${y - h + r} V${y} Z" fill="${inner}"/>
    <path d="M${x - w / 2} ${y} V${y - h + r} A${r} ${r} 0 0 1 ${x + w / 2} ${y - h + r} V${y}" fill="none" stroke="${rim}" stroke-width="6" opacity=".5"/>
    <path d="M${x - w / 2 - 12} ${y} V${y - h + r} A${r + 12} ${r + 12} 0 0 1 ${x + w / 2 + 12} ${y - h + r} V${y}" fill="none" stroke="${wall}" stroke-width="18"/>
  </g>`;
}

export function tree(x, y, s = 1, { leaf = P.olive, trunk = '#5b4433' } = {}) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="0" cy="2" rx="74" ry="13" fill="${P.ink}" opacity=".2" filter="url(#blur2)"/>
    <path d="M-8 0 Q-12 -70 4 -128 M2 -80 Q-30 -104 -45 -128 M5 -100 Q35 -122 50 -143" stroke="${trunk}" stroke-width="13" fill="none" stroke-linecap="round"/>
    <g fill="${leaf}" opacity=".95">
      <ellipse cx="-55" cy="-142" rx="54" ry="30" transform="rotate(-18 -55 -142)"/>
      <ellipse cx="53" cy="-150" rx="60" ry="28" transform="rotate(16 53 -150)"/>
      <ellipse cx="-10" cy="-171" rx="57" ry="33"/>
      <ellipse cx="18" cy="-130" rx="58" ry="26" transform="rotate(-6 18 -130)"/>
    </g>
    <g fill="${P.olive2}" opacity=".4">
      <ellipse cx="-38" cy="-158" rx="25" ry="12"/><ellipse cx="40" cy="-138" rx="23" ry="10"/>
    </g>
  </g>`;
}

export function lotus(x, y, s = 1, color = '#d77a81', stem = P.olive) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M0 0 Q-7 -30 4 -58" stroke="${stem}" stroke-width="4" fill="none"/>
    <ellipse cx="-20" cy="-25" rx="25" ry="10" transform="rotate(-14 -20 -25)" fill="${P.olive2}"/>
    <g transform="translate(4 -61)">
      <ellipse cx="-18" cy="0" rx="19" ry="9" transform="rotate(28 -18 0)" fill="${color}"/>
      <ellipse cx="18" cy="0" rx="19" ry="9" transform="rotate(-28 18 0)" fill="${color}"/>
      <ellipse cx="-9" cy="-10" rx="11" ry="20" transform="rotate(27 -9 -10)" fill="${color}"/>
      <ellipse cx="9" cy="-10" rx="11" ry="20" transform="rotate(-27 9 -10)" fill="${color}"/>
      <ellipse cx="0" cy="-18" rx="9" ry="21" fill="${P.cream}"/>
      <circle cx="0" cy="-1" r="5" fill="${P.gold}"/>
    </g>
  </g>`;
}

export function pig(x, y, s = 1, { body = '#c98a79', dark = '#a5655c' } = {}) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="0" cy="10" rx="55" ry="32" fill="${body}"/>
    <path d="M-20 34 V62 M12 34 V62 M-44 30 V58 M36 30 V58" stroke="${dark}" stroke-width="9" stroke-linecap="round"/>
    <path d="M52 4 q18 -8 24 6 q-4 12 -19 9" fill="${body}"/>
    <ellipse cx="68" cy="10" rx="18" ry="13" fill="${body}"/>
    <ellipse cx="74" cy="10" rx="9" ry="7" fill="${dark}"/>
    <circle cx="69" cy="10" r="2" fill="${P.ink}"/><circle cx="79" cy="11" r="2" fill="${P.ink}"/>
    <path d="M57 -1 l-4 -13 l12 6 Z M76 -1 l6 -12 l8 9 Z" fill="${dark}"/>
    <circle cx="56" cy="1" r="2.2" fill="${P.ink}"/>
    <path d="M-54 0 q-14 -8 -8 -19 q4 11 15 8" fill="none" stroke="${dark}" stroke-width="3"/>
  </g>`;
}

export function amphora(x, y, s = 1, color = P.rust, trim = P.gold) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="0" cy="4" rx="30" ry="7" fill="${P.ink}" opacity=".24" filter="url(#blur2)"/>
    <path d="M-13 -65 q-34 22 -26 52 q7 27 39 25 q32 2 39 -25 q8 -30 -26 -52 Z" fill="${color}" stroke="${P.ink}" stroke-opacity=".22" stroke-width="2"/>
    <path d="M-14 -68 h28 v10 h-28 z" fill="${trim}" opacity=".85"/>
    <path d="M-32 -38 q-23 -4 -26 14 q15 3 24 -4" fill="none" stroke="${color}" stroke-width="6"/>
    <path d="M32 -38 q23 -4 26 14 q-15 3 -24 -4" fill="none" stroke="${color}" stroke-width="6"/>
    <path d="M-31 -31 q31 13 62 0" fill="none" stroke="${trim}" stroke-width="2" opacity=".6"/>
    <path d="M-10 -46 q10 12 0 25 q-10 -13 0 -25" fill="${trim}" opacity=".5"/>
  </g>`;
}

export function shield(x, y, s = 1, { field = P.rust, rim = P.gold } = {}) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <circle r="62" fill="${rim}" stroke="${P.ink}" stroke-opacity=".35" stroke-width="3"/>
    <circle r="53" fill="${field}"/>
    <circle r="41" fill="none" stroke="${rim}" stroke-width="3" opacity=".7"/>
    <path d="M-31 0 H31 M0 -31 V31" stroke="${rim}" stroke-width="3" opacity=".55"/>
    <circle r="12" fill="${rim}"/><circle r="5" fill="${P.ink}" opacity=".6"/>
  </g>`;
}

export function flame(x, y, s = 1, seed = 4) {
  const rand = rng(seed);
  let tongues = '';
  for (let i = 0; i < 5; i += 1) {
    const ox = (i - 2) * 16;
    const h = 55 + rand() * 55;
    tongues += `<path d="M${ox} 0 q-22 -${h * 0.45} -2 -${h} q7 26 21 ${h * 0.58} q7 22 -19 ${h * 0.42}" fill="${i % 2 ? '#e6a04b' : '#f2cd78'}" opacity="${0.55 + rand() * 0.35}"/>`;
  }
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <circle cx="0" cy="-16" r="88" fill="#efad55" opacity=".18" filter="url(#softGlow)"/>
    ${tongues}
    <ellipse cx="0" cy="6" rx="58" ry="13" fill="${P.ink}" opacity=".3"/>
    <path d="M-70 7 Q0 -8 70 7" stroke="${P.paper2}" stroke-width="9" fill="none" stroke-linecap="round"/>
  </g>`;
}

export function bird(x, y, s = 1, color = P.ink) {
  return `<path d="M${x - 12 * s} ${y} q${6 * s} -${8 * s} ${12 * s} 0 q${6 * s} -${8 * s} ${12 * s} 0" fill="none" stroke="${color}" stroke-width="${2 * s}" stroke-linecap="round"/>`;
}

export function tripod(x, y, s = 1, color = P.gold) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="0" cy="3" rx="30" ry="7" fill="${P.ink}" opacity=".25" filter="url(#blur2)"/>
    <path d="M-24 0 L-12 -50 M24 0 L12 -50 M0 2 L0 -54" stroke="${color}" stroke-width="5" stroke-linecap="round"/>
    <path d="M-28 -50 H28" stroke="${color}" stroke-width="4"/>
    <path d="M-20 -52 q20 -17 40 0 q-5 12 -20 12 q-15 0 -20 -12" fill="${P.rust}" stroke="${color}" stroke-width="2"/>
    <path d="M-12 -58 q-8 -16 8 -22 q2 14 8 20" fill="${P.rust}" opacity=".8"/>
  </g>`;
}

export function oliveBranch(x, y, s = 1, color = P.olive) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M0 0 q26 -18 54 -10" stroke="${color}" stroke-width="3" fill="none"/>
    <ellipse cx="16" cy="-12" rx="10" ry="4" transform="rotate(-28 16 -12)" fill="${color}"/>
    <ellipse cx="33" cy="-17" rx="10" ry="4" transform="rotate(14 33 -17)" fill="${color}"/>
    <ellipse cx="49" cy="-12" rx="9" ry="4" transform="rotate(-14 49 -12)" fill="${color}"/>
  </g>`;
}

export function ribbon(x, y, s = 1, color = P.rust) {
  return `<path d="M${x} ${y} q${30 * s} -${14 * s} ${62 * s} 0 q-${12 * s} ${18 * s} -${26 * s} 4 q-${16 * s} ${16 * s} -${36 * s} -4Z" fill="${color}" opacity=".9"/>`;
}

export function smoke(x, y, s = 1, seed = 3) {
  const rand = rng(seed);
  let out = '';
  for (let i = 0; i < 5; i += 1) {
    out += `<circle cx="${(rand() - 0.5) * 60}" cy="${-i * 35}" r="${18 + i * 7}" fill="${P.smoke}" opacity="${0.16 - i * 0.02}"/>`;
  }
  return `<g transform="translate(${x} ${y}) scale(${s})">${out}</g>`;
}

export function goat(x, y, s = 1, color = P.paper) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="0" cy="0" rx="28" ry="17" fill="${color}"/>
    <path d="M-16 14 V34 M12 14 V34" stroke="${P.ink}" stroke-width="4" opacity=".55"/>
    <path d="M22 -8 q15 0 19 10 q-9 8 -20 2" fill="${color}"/>
    <path d="M26 -6 q-5 -16 9 -23 q3 14 -2 23" fill="${P.paper2}"/>
    <circle cx="37" cy="1" r="1.6" fill="${P.ink}"/>
  </g>`;
}

export function banner(x, y, s = 1, color = P.rust) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M0 0 V-120" stroke="${P.ink}" stroke-width="4"/>
    <path d="M4 0 H78 L68 24 L78 48 H4 Z" fill="${color}" stroke="${P.gold}" stroke-width="1.5" stroke-opacity=".6"/>
    <path d="M22 12 q12 -12 30 0 q-14 18 -30 0Z" fill="${P.gold}" opacity=".8"/>
  </g>`;
}

export function mapCompass(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})" opacity=".52">
    <circle r="46" fill="none" stroke="${P.paper2}" stroke-width="1"/>
    <circle r="34" fill="none" stroke="${P.paper2}" stroke-width=".6" stroke-dasharray="2 5"/>
    <path d="M0 -42 L10 -8 L0 0 L-10 -8 Z" fill="${P.rust}"/>
    <path d="M0 42 L10 8 L0 0 L-10 8 Z" fill="${P.paper2}"/>
    <path d="M-42 0 L-8 -10 L0 0 L-8 10 Z M42 0 L8 -10 L0 0 L8 10 Z" fill="${P.paper2}" opacity=".6"/>
    <circle r="3" fill="${P.gold2}"/>
  </g>`;
}

export function seaMonster(x, y, s = 1, color = P.paper2) {
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${color}" stroke-width="2" opacity=".35">
    <path d="M-80 10 q20 -24 40 0 q20 24 40 0 q20 -24 40 0"/>
    <path d="M-30 10 q0 -40 28 -48 q-3 24 7 34"/>
    <path d="M22 -30 q15 -10 28 2 M-12 8 q-12 -8 -8 -22"/>
  </g>`;
}
