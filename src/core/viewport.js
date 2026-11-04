const vw = Math.max(1, window.innerWidth);
const vh = Math.max(1, window.innerHeight);

// The portrait stage is 900 units wide and as tall as the device needs, so the
// canvas fills a phone without letterboxing. Landscape keeps the original
// 1600 x 900 stage, which scales cleanly from laptops to ultrawide monitors.
export const IS_PORTRAIT = vh > vw * 1.02;
export const W = IS_PORTRAIT ? 900 : 1600;
export const H = IS_PORTRAIT ? Math.round((W * vh) / vw) : 900;
export const MODE = IS_PORTRAIT ? 'portrait' : 'landscape';

export function isPortrait() {
  return IS_PORTRAIT;
}
