import fs from 'node:fs';
import path from 'node:path';

const build = path.resolve('wechat-minigame/build/wechatgame');
const gameFile = path.join(build, 'game.json');
const projectFile = path.join(build, 'project.config.json');
if (!fs.existsSync(gameFile)) throw new Error(`missing ${gameFile}`);

const game = JSON.parse(fs.readFileSync(gameFile, 'utf8'));
game.subpackages = [
  {
    name: 'chapter-jingwei',
    root: 'assets/chapter-jingwei/',
  },
];
fs.writeFileSync(gameFile, JSON.stringify(game, null, 4) + '\n');

const project = JSON.parse(fs.readFileSync(projectFile, 'utf8'));
project.appid = 'wx9f31155e9d70c411';
project.projectname = 'tales-and-puzzles';
fs.writeFileSync(projectFile, JSON.stringify(project, null, 2) + '\n');

function sizeOf(dir) {
  let total = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) total += sizeOf(p);
    else total += fs.statSync(p).size;
  }
  return total;
}

const chapter = path.join(build, 'assets/chapter-jingwei');
const all = sizeOf(build);
const sub = fs.existsSync(chapter) ? sizeOf(chapter) : 0;
console.log(JSON.stringify({
  subpackages: game.subpackages,
  totalBytes: all,
  chapterBytes: sub,
  mainBytes: all - sub,
  mainMB: Number(((all - sub) / 1024 / 1024).toFixed(2)),
  chapterMB: Number((sub / 1024 / 1024).toFixed(2)),
}, null, 2));
