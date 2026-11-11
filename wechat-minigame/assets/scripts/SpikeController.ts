import {
  _decorator,
  Component,
  Node,
  Label,
  Graphics,
  Color,
  UITransform,
  Layers,
  view,
  ResolutionPolicy,
  sys,
  tween,
  Vec3,
  resources,
  JsonAsset,
} from 'cc';

const { ccclass } = _decorator;

const INK = new Color(12, 24, 33, 255);
const PANEL = new Color(17, 34, 44, 250);
const GOLD = new Color(213, 168, 90, 255);
const PAPER = new Color(243, 230, 201, 255);
const MUTED = new Color(168, 182, 198, 255);
const TEAL = new Color(46, 105, 112, 255);
const STORM = new Color(8, 18, 26, 255);
const PROGRESS_KEY = 'jiemi-jingwei-progress-v1';

interface PuzzleTarget {
  id: string;
  name: string;
  x: number;
  y: number;
  hint: string;
}

interface Puzzle {
  type: string;
  prompt: string;
  targets: PuzzleTarget[];
}

interface Act {
  id: string;
  title: string;
  kicker: string;
  pages: string[];
  knowledge: string[];
  puzzle: Puzzle;
}

interface Chapter {
  id: string;
  title: string;
  subtitle: string;
  source: string;
  acts: Act[];
}

@ccclass('SpikeController')
export class SpikeController extends Component {
  private chapter: Chapter | null = null;
  private viewLayer: Node | null = null;
  private safeTop = 0;
  private actIndex = 0;
  private pageIndex = 0;
  private foundIds = new Set<string>();
  private targetNodes: Node[] = [];
  private hintLeft = 3;
  private foundCount = 0;
  private progressAct = 0;
  private hintText: Label | null = null;
  private hintButtonLabel: Label | null = null;
  private progressLabel: Label | null = null;
  private autoTimer: any = null;

  onLoad() {
    view.setDesignResolutionSize(750, 1334, ResolutionPolicy.FIXED_WIDTH);
  }

  start() {
    this.safeTop = this.getSafeTop();
    this.progressAct = this.readProgress();
    this.showLoading();
    resources.load('chapters/jingwei', JsonAsset, (error, asset) => {
      if (error) {
        console.error('[Jingwei] chapter load failed', error);
        this.showError();
        return;
      }
      this.chapter = asset.json as unknown as Chapter;
      console.log('[Jingwei] chapter loaded', this.chapter?.title, 'progress', this.progressAct);
      this.showTitle();
    });
  }

  private getSafeTop(): number {
    const wxApi = (globalThis as any).wx;
    if (!wxApi) return 0;
    try {
      const info = wxApi.getWindowInfo
        ? wxApi.getWindowInfo()
        : (wxApi.getSystemInfoSync ? wxApi.getSystemInfoSync() : null);
      const rect = wxApi.getMenuButtonBoundingClientRect
        ? wxApi.getMenuButtonBoundingClientRect()
        : null;
      if (!info || !rect || !info.windowWidth) return 0;
      const scale = view.getVisibleSize().width / info.windowWidth;
      const safeTop = Math.max(0, rect.bottom * scale + 8);
      console.log('[Jingwei] safe top', { safeTop, scale, rect, windowWidth: info.windowWidth });
      return safeTop;
    } catch (error) {
      console.warn('[Jingwei] safe area failed', error);
      return 0;
    }
  }

  private setAuto(callback: () => void, delay: number) {
    this.clearAuto();
    this.autoTimer = setTimeout(() => {
      this.autoTimer = null;
      callback();
    }, delay);
  }

  private clearAuto() {
    if (this.autoTimer !== null) {
      clearTimeout(this.autoTimer);
      this.autoTimer = null;
    }
  }

  private readProgress(): number {
    try {
      const wxApi = (globalThis as any).wx;
      if (wxApi && typeof wxApi.getStorageSync === 'function') {
        return Number(wxApi.getStorageSync(PROGRESS_KEY) || 0);
      }
      return Number(sys.localStorage.getItem(PROGRESS_KEY) || 0);
    } catch {
      return 0;
    }
  }

  private writeProgress(act: number) {
    try {
      const wxApi = (globalThis as any).wx;
      if (wxApi && typeof wxApi.setStorageSync === 'function') {
        wxApi.setStorageSync(PROGRESS_KEY, act);
        return;
      }
      sys.localStorage.setItem(PROGRESS_KEY, String(act));
    } catch (error) {
      console.warn('[Jingwei] progress write failed', error);
    }
  }

  private clearView() {
    this.clearAuto();
    if (this.viewLayer) {
      this.viewLayer.destroy();
      this.viewLayer = null;
    }
    const layer = new Node('View');
    layer.layer = Layers.Enum.UI_2D;
    this.node.addChild(layer);
    this.viewLayer = layer;
    this.hintText = null;
    this.hintButtonLabel = null;
    this.progressLabel = null;
    this.targetNodes = [];
    this.foundIds.clear();
    this.foundCount = 0;
    this.hintLeft = 3;
  }

  private uiNode(name: string, width: number, height: number): Node {
    const n = new Node(name);
    n.layer = Layers.Enum.UI_2D;
    n.addComponent(UITransform).setContentSize(width, height);
    this.viewLayer!.addChild(n);
    return n;
  }

  private label(text: string, x: number, y: number, size: number, color: Color, width = 680, height = 0): Label {
    const n = this.uiNode('Label', width, size * 3);
    n.setPosition(x, y);
    const l = n.addComponent(Label);
    l.string = text;
    l.fontSize = size;
    l.lineHeight = Math.round(size * 1.45);
    l.color = color;
    l.horizontalAlign = Label.HorizontalAlign.CENTER;
    l.verticalAlign = Label.VerticalAlign.CENTER;
    l.enableWrapText = true;
    l.overflow = Label.Overflow.CLAMP;
    const boxHeight = height > 0 ? height : size * 5;
    n.getComponent(UITransform)!.setContentSize(width, boxHeight);
    return l;
  }

  private button(text: string, x: number, y: number, w: number, h: number, onClick: () => void, primary = true) {
    const n = this.uiNode('Button', w, h);
    n.setPosition(x, y);
    const g = n.addComponent(Graphics);
    g.fillColor = primary ? GOLD : new Color(20, 38, 48, 255);
    g.roundRect(-w / 2, -h / 2, w, h, 8);
    g.fill();
    g.lineWidth = 1;
    g.strokeColor = primary ? new Color(255, 229, 166, 180) : new Color(213, 168, 90, 120);
    g.roundRect(-w / 2, -h / 2, w, h, 8);
    g.stroke();
    const l = this.label(text, 0, 0, 24, primary ? INK : PAPER, w - 30);
    l.node.removeFromParent();
    n.addChild(l.node);
    l.node.setPosition(0, 0);
    n.on(Node.EventType.TOUCH_END, () => onClick(), this);
    return n;
  }

  private panel(x: number, y: number, w: number, h: number, fill = PANEL) {
    const n = this.uiNode('Panel', w, h);
    n.setPosition(x, y);
    const g = n.addComponent(Graphics);
    g.fillColor = fill;
    g.roundRect(-w / 2, -h / 2, w, h, 18);
    g.fill();
    g.lineWidth = 2;
    g.strokeColor = new Color(213, 168, 90, 90);
    g.roundRect(-w / 2, -h / 2, w, h, 18);
    g.stroke();
    return n;
  }

  private drawScene(actIndex: number, mode = 'story') {
    const w = 750;
    const h = view.getVisibleSize().height;
    const n = this.uiNode('Scene', w, h);
    const g = n.addComponent(Graphics);

    const dusk = actIndex === 0;
    const storm = actIndex === 1;
    const dawn = actIndex === 2;

    g.fillColor = storm ? STORM : (dusk ? new Color(37, 54, 59, 255) : new Color(48, 65, 68, 255));
    g.rect(-w / 2, -h / 2, w, h);
    g.fill();

    // Sky glow / moon
    g.fillColor = storm ? new Color(115, 135, 140, 24) : new Color(226, 202, 145, 32);
    g.circle(205, h / 2 - 300, 190);
    g.fill();
    g.fillColor = storm ? new Color(170, 180, 178, 210) : new Color(244, 224, 171, 230);
    g.circle(205, h / 2 - 300, 52);
    g.fill();

    // Distant mountains
    const horizon = -h / 2 + h * 0.42;
    g.fillColor = storm ? new Color(12, 26, 31, 255) : new Color(24, 43, 47, 255);
    g.moveTo(-w / 2, horizon - 20);
    g.lineTo(-260, horizon + 80);
    g.lineTo(-80, horizon + 4);
    g.lineTo(120, horizon + 110);
    g.lineTo(330, horizon + 20);
    g.lineTo(w / 2, horizon + 70);
    g.lineTo(w / 2, horizon - 100);
    g.lineTo(-w / 2, horizon - 100);
    g.close();
    g.fill();

    // Sea
    g.fillColor = storm ? new Color(15, 39, 47, 255) : (dawn ? new Color(37, 92, 94, 255) : new Color(28, 77, 82, 255));
    g.rect(-w / 2, -h / 2, w, horizon + h / 2 + 20);
    g.fill();

    // Waves
    g.lineWidth = 2;
    g.strokeColor = storm ? new Color(119, 163, 158, 90) : new Color(164, 210, 196, 90);
    for (let i = 0; i < 5; i++) {
      const y = horizon - 50 - i * 58;
      g.moveTo(-w / 2 + 30, y);
      for (let x = -330; x < 360; x += 60) {
        g.lineTo(x + 30, y + (i % 2 === 0 ? 8 : -8));
        g.lineTo(x + 60, y);
      }
      g.stroke();
    }

    // Storm lines
    if (storm) {
      g.lineWidth = 3;
      g.strokeColor = new Color(212, 192, 127, 130);
      g.moveTo(-230, h / 2 - 180);
      g.lineTo(-180, h / 2 - 300);
      g.lineTo(-220, h / 2 - 300);
      g.lineTo(-150, h / 2 - 450);
      g.stroke();
    }

    // A small bird silhouette in acts 2 and 3
    if (actIndex > 0) {
      const bx = dawn ? 170 : -190;
      const by = h / 2 - 250;
      g.lineWidth = 4;
      g.strokeColor = new Color(243, 230, 201, 180);
      g.moveTo(bx - 42, by + 8);
      g.lineTo(bx, by + 24);
      g.lineTo(bx + 42, by + 8);
      g.stroke();
      g.moveTo(bx - 42, by + 8);
      g.lineTo(bx - 16, by + 22);
      g.stroke();
    }

    if (mode === 'story') {
      const shade = this.uiNode('StoryShade', w, h);
      const sg = shade.addComponent(Graphics);
      sg.fillColor = new Color(7, 15, 20, 160);
      sg.rect(-w / 2, -h / 2, w, h * 0.44);
      sg.fill();
    }
  }

  private header(kicker: string, title: string) {
    const top = view.getVisibleSize().height / 2;
    const y = top - this.safeTop;
    this.label(kicker, 0, y - 42, 17, GOLD, 680);
    this.label(title, 0, y - 104, 31, PAPER, 680);
  }

  private showLoading() {
    this.clearView();
    this.drawScene(0, 'blank');
    this.label('解谜涨知识', 0, 40, 34, PAPER);
    this.label('正在展开山海卷……', 0, -20, 18, MUTED);
  }

  private showError() {
    this.clearView();
    this.drawScene(0, 'blank');
    this.label('山海卷没有打开', 0, 40, 28, PAPER);
    this.label('请重新编译后再试。', 0, -20, 18, MUTED);
  }

  private showTitle() {
    this.clearView();
    this.drawScene(0, 'title');
    const top = view.getVisibleSize().height / 2;
    const shift = this.safeTop;
    this.label('COCOS × WECHAT · 山海经', 0, top - shift - 80, 16, GOLD);
    this.label('解谜涨知识', 0, top - shift - 180, 66, PAPER);
    this.label('之 · 山海经', 0, top - shift - 255, 30, GOLD);
    this.label('读故事 · 寻线索 · 收小笺', 0, top - shift - 320, 20, MUTED);

    const label = this.progressAct >= 3 ? '再读一遍 · 精卫填海' : (this.progressAct > 0 ? '继续 · 精卫填海' : '开始 · 精卫填海');
    this.button(label, 0, -view.getVisibleSize().height / 2 + 155, 560, 86, () => {
      if (this.progressAct > 0 && this.progressAct < 3) {
        this.showActCard(this.progressAct);
      } else {
        this.showChapterCard();
      }
    }, true);

    this.label('每章三幕 · 一幕一谜 · 篇末一张山海小笺', 0, -view.getVisibleSize().height / 2 + 70, 15, MUTED);
  }

  private showChapterCard() {
    this.clearView();
    this.drawScene(0, 'blank');
    const h = view.getVisibleSize().height;
    this.label('第 一 篇', 0, 220, 18, GOLD);
    this.label('精卫填海', 0, 80, 52, PAPER);
    this.label('炎帝之少女，溺而不返，化为精卫。', 0, -10, 20, MUTED, 620);
    this.label('三幕 · 三个谜 · 一张山海小笺', 0, -70, 16, GOLD);
    this.label('点击继续', 0, -h / 2 + 90, 16, MUTED);

    const skip = this.uiNode('Skip', 750, h);
    skip.on(Node.EventType.TOUCH_END, () => {
      this.clearAuto();
      this.showActCard(0);
    }, this);
    this.setAuto(() => this.showActCard(0), 1800);
  }

  private showActCard(index: number) {
    if (!this.chapter || index >= this.chapter.acts.length) {
      this.showEnding();
      return;
    }
    this.actIndex = index;
    this.pageIndex = 0;
    this.writeProgress(index);
    this.clearView();
    this.drawScene(index, 'blank');
    const act = this.chapter.acts[index];
    this.label(act.kicker, 0, 190, 18, GOLD);
    this.label(act.title, 0, 80, 40, PAPER, 680);
    this.label('点击继续', 0, -view.getVisibleSize().height / 2 + 90, 16, MUTED);

    const skip = this.uiNode('Skip', 750, view.getVisibleSize().height);
    skip.on(Node.EventType.TOUCH_END, () => {
      this.clearAuto();
      this.showStory(index, 0);
    }, this);
    this.setAuto(() => this.showStory(index, 0), 1500);
  }

  private showStory(actIndex: number, pageIndex: number) {
    if (!this.chapter) return;
    const act = this.chapter.acts[actIndex];
    if (pageIndex >= act.pages.length) {
      this.showPuzzle(actIndex);
      return;
    }
    this.actIndex = actIndex;
    this.pageIndex = pageIndex;
    this.clearView();
    this.drawScene(actIndex, 'story');
    this.header(act.kicker, act.title);

    const h = view.getVisibleSize().height;
    const panelY = -h / 2 + 300;
    this.panel(0, panelY, 650, 390);
    this.label(act.pages[pageIndex], 0, panelY + 30, 25, PAPER, 590);
    this.label(`${pageIndex + 1} / ${act.pages.length}`, 0, panelY - 140, 15, MUTED);
    this.button(pageIndex === act.pages.length - 1 ? '进入本幕谜题' : '继续', 0, -h / 2 + 105, 540, 82, () => {
      this.showStory(actIndex, pageIndex + 1);
    });
  }

  private showPuzzle(actIndex: number) {
    if (!this.chapter) return;
    const act = this.chapter.acts[actIndex];
    this.actIndex = actIndex;
    this.foundIds.clear();
    this.foundCount = 0;
    this.hintLeft = 3;
    this.clearView();
    this.drawScene(actIndex, 'puzzle');
    this.header(act.kicker, act.title);

    const h = view.getVisibleSize().height;
    const top = h / 2;
    const bottom = -h / 2;
    const areaBottom = bottom + 255;
    const areaTop = top - this.safeTop - 175;

    this.label(act.puzzle.prompt, 0, top - this.safeTop - 165, 20, PAPER, 650);
    this.hintText = this.label('', 0, bottom + 190, 17, GOLD, 690);
    this.progressLabel = this.label(`0 / ${act.puzzle.targets.length}`, 0, bottom + 235, 18, GOLD, 300);

    for (const target of act.puzzle.targets) {
      const px = -330 + target.x * 660;
      const py = areaBottom + target.y * (areaTop - areaBottom);
      const n = this.uiNode(`target-${target.id}`, 110, 110);
      n.setPosition(px, py);
      const g = n.addComponent(Graphics);
      g.fillColor = new Color(243, 230, 201, 220);
      g.circle(0, 0, 22);
      g.fill();
      g.lineWidth = 2;
      g.strokeColor = GOLD;
      g.circle(0, 0, 22);
      g.stroke();
      const l = this.label(target.name, 0, -38, 15, PAPER, 100);
      l.node.removeFromParent();
      n.addChild(l.node);
      l.node.setPosition(0, -58);
      n.on(Node.EventType.TOUCH_END, () => this.findTarget(target, n), this);
      this.targetNodes.push(n);
    }

    const hintButton = this.button('提示 · 3', -160, bottom + 100, 260, 70, () => this.useHint(), false);
    this.hintButtonLabel = hintButton.getComponentInChildren(Label);
    this.label('找到所有线索即可继续', 170, bottom + 100, 15, MUTED, 330);
  }

  private findTarget(target: PuzzleTarget, node: Node) {
    if (this.foundIds.has(target.id)) return;
    this.foundIds.add(target.id);
    this.foundCount += 1;
    if (this.progressLabel) this.progressLabel.string = `${this.foundCount} / ${this.chapter!.acts[this.actIndex].puzzle.targets.length}`;
    tween(node).to(0.18, { scale: new Vec3(1.35, 1.35, 1) }).to(0.18, { scale: new Vec3(1, 1, 1) }).start();
    node.destroy();
    if (this.foundCount >= this.chapter!.acts[this.actIndex].puzzle.targets.length) {
      this.setAuto(() => this.showKnowledge(), 650);
    }
  }

  private useHint() {
    if (this.hintLeft <= 0) {
      this.setHint('本幕提示已用完，再仔细看看画面。');
      return;
    }
    const act = this.chapter!.acts[this.actIndex];
    const target = act.puzzle.targets.find((t) => !this.foundIds.has(t.id));
    if (!target) return;
    this.hintLeft -= 1;
    this.setHint(`提示：${target.hint}`);
    const node = this.targetNodes.find((n) => n.name === `target-${target.id}`);
    if (node) {
      tween(node).to(0.12, { scale: new Vec3(1.3, 1.3, 1) }).to(0.12, { scale: new Vec3(1, 1, 1) }).start();
    }
    if (this.hintButtonLabel) this.hintButtonLabel.string = `提示 · ${this.hintLeft}`;
  }

  private setHint(text: string) {
    if (this.hintText) this.hintText.string = text;
  }

  private showKnowledge() {
    if (!this.chapter) return;
    const act = this.chapter.acts[this.actIndex];
    this.clearView();
    this.drawScene(this.actIndex, 'blank');
    const h = view.getVisibleSize().height;
    this.panel(0, 30, 650, Math.min(720, h - 300));
    this.label('山 海 小 笺', 0, 260, 16, GOLD);
    this.label(act.title, 0, 190, 34, PAPER);
    let y = 95;
    for (const line of act.knowledge) {
      this.label(line, 0, y, 19, PAPER, 580);
      y -= 118;
    }
    this.button(this.actIndex < this.chapter.acts.length - 1 ? '收下小笺 · 进入下一幕' : '收下小笺 · 查看篇末', 0, -h / 2 + 105, 580, 82, () => {
      if (this.actIndex < this.chapter!.acts.length - 1) this.showActCard(this.actIndex + 1);
      else this.showEnding();
    });
  }

  private showEnding() {
    if (!this.chapter) return;
    this.writeProgress(3);
    this.clearView();
    this.drawScene(2, 'blank');
    const h = view.getVisibleSize().height;
    this.panel(0, 10, 660, Math.min(820, h - 260));
    this.label('篇 末 · 山 海 小 笺', 0, 300, 16, GOLD);
    this.label('精卫填海', 0, 230, 42, PAPER);
    this.label('出自《山海经·北山经》', 0, 175, 17, GOLD);
    this.label(this.chapter.source, 0, 60, 15, MUTED, 590);
    this.label('精卫填海：比喻意志坚决、不畏艰难。', 0, -190, 20, PAPER, 590);
    this.label('“精卫衔微木，将以填沧海。” —— 陶渊明', 0, -260, 17, GOLD, 590);
    this.button('回到卷首', 0, -h / 2 + 105, 520, 82, () => {
      this.showTitle();
    });
  }
}
