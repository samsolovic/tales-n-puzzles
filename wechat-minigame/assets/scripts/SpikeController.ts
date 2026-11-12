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
  assetManager,
  Sprite,
  SpriteFrame,
  Texture2D,
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

// Layout knobs. All values are in the 750-wide design space.
const LAYOUT = {
  headerHeight: 250,
  puzzleBarHeight: 300,
  storyPanelWidth: 660,
  storyPanelHeight: 300,
  storyButtonWidth: 540,
  storyButtonHeight: 86,
  pillWidth: 202,
  pillHeight: 58,
};

interface PuzzleTarget {
  id: string;
  name: string;
  icon: string;
  x: number;
  y: number;
  hint: string;
  cover?: string;
}

interface Cover {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  kind: string;
}

interface Puzzle {
  type: string;
  prompt: string;
  targets: PuzzleTarget[];
  covers?: Cover[];
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
  private safeBottom = 0;
  private actIndex = 0;
  private pageIndex = 0;
  private foundIds = new Set<string>();
  private targetNodes = new Map<string, Node>();
  private pillLabels = new Map<string, Label>();
  private coverNodes = new Map<string, Node>();
  private coversOpened = new Set<string>();
  private hintLeft = 3;
  private foundCount = 0;
  private progressAct = 0;
  private hintText: Label | null = null;
  private hintButtonLabel: Label | null = null;
  private progressLabel: Label | null = null;
  private autoTimer: any = null;
  private artBundle: any = null;
  private artFrames = new Map<string, SpriteFrame>();
  private iconFrames = new Map<string, SpriteFrame>();
  private loadingLabel: Label | null = null;
  private artViewportNode: Node | null = null;
  private artViewport = { y: 0, height: 0 };
  private artDisplay = { width: 0, height: 0 };

  onLoad() {
    view.setDesignResolutionSize(750, 1334, ResolutionPolicy.FIXED_WIDTH);
  }

  start() {
    this.safeTop = this.getSafeTop();
    this.safeBottom = this.getSafeBottom();
    this.progressAct = this.readProgress();
    this.showLoading();

    let pending = 2;
    const done = () => {
      pending -= 1;
      if (pending <= 0) this.showTitle();
    };

    resources.load('chapters/jingwei', JsonAsset, (error, asset) => {
      if (error) {
        console.error('[Jingwei] chapter load failed', error);
        this.showError();
        return;
      }
      this.chapter = asset.json as unknown as Chapter;
      console.log('[Jingwei] chapter loaded', this.chapter?.title, 'progress', this.progressAct);
      done();
    });

    this.loadArtBundle(done);
  }

  private loadArtBundle(done: () => void) {
    const loadBundle = () => {
      assetManager.loadBundle('chapter-jingwei', (error: Error | null, bundle: any) => {
        if (error) {
          console.warn('[Jingwei] art bundle failed', error);
          done();
          return;
        }
        this.artBundle = bundle;
        this.preloadArt(done);
      });
    };

    const wxApi = (globalThis as any).wx;
    if (wxApi && typeof wxApi.loadSubpackage === 'function') {
      wxApi.loadSubpackage({
        name: 'chapter-jingwei',
        success: () => loadBundle(),
        fail: (error: any) => {
          console.warn('[Jingwei] subpackage download failed', error);
          loadBundle();
        },
        onProgressUpdate: (res: any) => {
          if (this.loadingLabel && res && typeof res.progress === 'number') {
            this.loadingLabel.string = `正在展开山海卷…… ${Math.round(res.progress * 100)}%`;
          }
        },
      });
      return;
    }
    loadBundle();
  }

  private preloadArt(done: () => void) {
    if (!this.artBundle) {
      done();
      return;
    }
    const images = ['act1-story', 'act1-puzzle', 'act2', 'act3'];
    const icons = ['leaf', 'shell', 'boat', 'jade', 'bird'];
    let pending = images.length + icons.length;
    const finish = () => {
      pending -= 1;
      if (pending <= 0) {
        console.log('[Jingwei] art preload complete', this.artFrames.size, this.iconFrames.size);
        done();
      }
    };
    for (const name of images) {
      this.loadTextureFrame(name, (frame) => {
        if (frame) this.artFrames.set(name, frame);
        finish();
      });
    }
    for (const name of icons) {
      this.loadTextureFrame(`items/${name}`, (frame) => {
        if (frame) this.iconFrames.set(name, frame);
        finish();
      });
    }
  }

  private loadTextureFrame(name: string, onDone: (frame: SpriteFrame | null) => void) {
    if (!this.artBundle) {
      onDone(null);
      return;
    }
    this.artBundle.load(`${name}/texture`, Texture2D, (error: Error | null, texture: Texture2D) => {
      if (error || !texture) {
        console.warn('[Jingwei] texture load failed', name, error);
        onDone(null);
        return;
      }
      const frame = new SpriteFrame();
      frame.texture = texture;
      onDone(frame);
    });
  }

  private artDisplaySize(frame: SpriteFrame, width: number, height: number, fit: 'cover' | 'contain' = 'cover'): { width: number; height: number } {
    const imageWidth = frame.originalSize?.width || frame.rect?.width || width;
    const imageHeight = frame.originalSize?.height || frame.rect?.height || height;
    const scale = fit === 'contain'
      ? Math.min(width / imageWidth, height / imageHeight)
      : Math.max(width / imageWidth, height / imageHeight);
    return { width: imageWidth * scale, height: imageHeight * scale };
  }

  private artName(actIndex: number, mode: string): string {
    if (actIndex === 0) return mode === 'puzzle' ? 'act1-puzzle' : 'act1-story';
    return actIndex === 1 ? 'act2' : 'act3';
  }

  private artShade(y: number, height: number, alpha: number) {
    const n = this.uiNode('ArtShade', 750, height);
    n.setPosition(0, y);
    const g = n.addComponent(Graphics);
    g.fillColor = new Color(7, 15, 20, alpha);
    g.rect(-375, -height / 2, 750, height);
    g.fill();
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

  private getSafeBottom(): number {
    const wxApi = (globalThis as any).wx;
    if (!wxApi) return 0;
    try {
      const info = wxApi.getWindowInfo
        ? wxApi.getWindowInfo()
        : (wxApi.getSystemInfoSync ? wxApi.getSystemInfoSync() : null);
      if (!info || !info.safeArea || !info.windowWidth) return 0;
      const scale = view.getVisibleSize().width / info.windowWidth;
      const inset = (info.windowHeight - info.safeArea.bottom) * scale;
      const safeBottom = Math.max(112, inset + 36);
      console.log('[Jingwei] safe bottom', { safeBottom, inset, safeArea: info.safeArea });
      return safeBottom;
    } catch (error) {
      console.warn('[Jingwei] safe bottom failed', error);
      return 0;
    }
  }

  private bottomY(offset: number): number {
    return -view.getVisibleSize().height / 2 + this.safeBottom + offset;
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
    this.targetNodes.clear();
    this.pillLabels.clear();
    this.coverNodes.clear();
    this.coversOpened.clear();
    this.artViewportNode = null;
    this.artViewport = { y: 0, height: 0 };
    this.artDisplay = { width: 0, height: 0 };
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

  private uiNodeIn(parent: Node, name: string, width: number, height: number): Node {
    const n = new Node(name);
    n.layer = Layers.Enum.UI_2D;
    n.addComponent(UITransform).setContentSize(width, height);
    parent.addChild(n);
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
    const l = this.label(text, 0, 0, 32, primary ? INK : PAPER, w - 30);
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

  private viewportFor(mode: string): { y: number; height: number } {
    const h = view.getVisibleSize().height;
    const top = h / 2;
    const bottom = -h / 2;
    if (mode === 'puzzle') {
      const barHeight = LAYOUT.puzzleBarHeight;
      const imageTop = top - this.safeTop - LAYOUT.headerHeight;
      const imageBottom = bottom + this.safeBottom + barHeight + 14;
      return { y: (imageTop + imageBottom) / 2, height: Math.max(300, imageTop - imageBottom) };
    }
    const buttonY = this.bottomY(75);
    const panelHeight = LAYOUT.storyPanelHeight;
    const panelBottom = buttonY + 43 + 18;
    const imageTop = top - this.safeTop - LAYOUT.headerHeight;
    const imageBottom = panelBottom + panelHeight + 14;
    return { y: (imageTop + imageBottom) / 2, height: Math.max(300, imageTop - imageBottom) };
  }

  private storyLayout(): { panelY: number; buttonY: number } {
    const buttonY = this.bottomY(75);
    const panelHeight = LAYOUT.storyPanelHeight;
    const panelBottom = buttonY + 43 + 18;
    return { panelY: panelBottom + panelHeight / 2, buttonY };
  }

  private drawArtViewport(actIndex: number, mode: string) {
    const w = 750;
    const h = view.getVisibleSize().height;
    const bg = this.uiNode('PageBg', w, h);
    const bgGraphics = bg.addComponent(Graphics);
    bgGraphics.fillColor = INK;
    bgGraphics.rect(-w / 2, -h / 2, w, h);
    bgGraphics.fill();

    const viewport = this.viewportFor(mode);
    this.artViewport = viewport;
    this.artViewportNode = null;
    this.artDisplay = { width: 0, height: 0 };

    const frame = this.artFrames.get(this.artName(actIndex, mode));
    if (frame) {
      const shown = this.artDisplaySize(frame, w, viewport.height, mode === 'puzzle' ? 'cover' : 'contain');
      const vp = this.uiNode('ArtViewport', w, viewport.height);
      vp.setPosition(0, viewport.y);
      const image = new Node('ViewportArt');
      image.layer = Layers.Enum.UI_2D;
      image.addComponent(UITransform);
      const sprite = image.addComponent(Sprite);
      sprite.spriteFrame = frame;
      sprite.sizeMode = Sprite.SizeMode.CUSTOM;
      image.getComponent(UITransform)!.setContentSize(shown.width, shown.height);
      vp.addChild(image);
      image.setPosition(0, 0);
      this.artViewportNode = vp;
      this.artDisplay = shown;
    }

    // Cover the parts of the oversized image that would spill into the
    // header/footer. The screen clips the left/right overflow.
    const imageTop = viewport.y + viewport.height / 2;
    const imageBottom = viewport.y - viewport.height / 2;
    const headerHeight = h / 2 - imageTop;
    if (headerHeight > 0) {
      const headerBg = this.uiNode('HeaderBg', w, headerHeight);
      headerBg.setPosition(0, h / 2 - headerHeight / 2);
      const hg = headerBg.addComponent(Graphics);
      hg.fillColor = INK;
      hg.rect(-w / 2, -headerHeight / 2, w, headerHeight);
      hg.fill();
    }
    const footerHeight = imageBottom + h / 2;
    if (footerHeight > 0) {
      const footerBg = this.uiNode('FooterBg', w, footerHeight);
      footerBg.setPosition(0, -h / 2 + footerHeight / 2);
      const fg = footerBg.addComponent(Graphics);
      fg.fillColor = INK;
      fg.rect(-w / 2, -footerHeight / 2, w, footerHeight);
      fg.fill();
    }

    if (mode === 'puzzle') {
      const barHeight = this.safeBottom + LAYOUT.puzzleBarHeight;
      const bar = this.uiNode('PuzzleBar', w, barHeight);
      bar.setPosition(0, -h / 2 + barHeight / 2);
      const g = bar.addComponent(Graphics);
      g.fillColor = new Color(10, 22, 29, 255);
      g.rect(-w / 2, -barHeight / 2, w, barHeight);
      g.fill();
      g.lineWidth = 1;
      g.strokeColor = new Color(213, 168, 90, 95);
      g.moveTo(-w / 2, barHeight / 2);
      g.lineTo(w / 2, barHeight / 2);
      g.stroke();
    }
  }

  private drawScene(actIndex: number, mode = 'story') {
    const w = 750;
    const h = view.getVisibleSize().height;
    if (mode === 'story' || mode === 'puzzle') {
      this.drawArtViewport(actIndex, mode);
      return;
    }
    const frame = this.artFrames.get(this.artName(actIndex, mode));
    if (frame) {
      const shown = this.artDisplaySize(frame, w, h);
      const n = this.uiNode('SceneArt', shown.width, shown.height);
      const sp = n.addComponent(Sprite);
      sp.spriteFrame = frame;
      sp.sizeMode = Sprite.SizeMode.CUSTOM;
      n.getComponent(UITransform)!.setContentSize(shown.width, shown.height);
      if (mode === 'story') {
        this.artShade(-h / 2 + h * 0.22, h * 0.44, 190);
      } else if (mode === 'title' || mode === 'blank') {
        this.artShade(0, h, 118);
      } else if (mode === 'puzzle') {
        this.artShade(h / 2 - 110, 220, 55);
      }
      return;
    }
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
    g.circle(240, h / 2 - 300, 190);
    g.fill();
    g.fillColor = storm ? new Color(170, 180, 178, 210) : new Color(244, 224, 171, 230);
    g.circle(240, h / 2 - 300, 48);
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
    this.label(kicker, 0, y - 44, 24, GOLD, 680);
    this.label(title, 0, y - 112, 42, PAPER, 680);
  }

  private showLoading() {
    this.clearView();
    this.drawScene(0, 'blank');
    this.label('解谜涨知识', 0, 40, 34, PAPER);
    this.loadingLabel = this.label('正在展开山海卷……', 0, -20, 24, MUTED);
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
    this.label('解谜涨知识', 0, top - shift - 170, 76, PAPER);
    this.label('之 · 山海经', 0, top - shift - 252, 40, GOLD);
    this.label('读故事 · 寻线索 · 收小笺', 0, top - shift - 322, 28, MUTED);

    const label = this.progressAct >= 3 ? '再读一遍 · 精卫填海' : (this.progressAct > 0 ? '继续 · 精卫填海' : '开始 · 精卫填海');
    this.button(label, 0, this.bottomY(110), 560, 90, () => {
      if (this.progressAct > 0 && this.progressAct < 3) {
        this.showActCard(this.progressAct);
      } else {
        this.showChapterCard();
      }
    }, true);

    this.label('每章三幕 · 一幕一谜 · 篇末一张山海小笺', 0, this.bottomY(24), 24, MUTED);
  }

  private showChapterCard() {
    this.clearView();
    this.drawScene(0, 'blank');
    this.label('第 一 篇', 0, 220, 26, GOLD);
    this.label('精卫填海', 0, 80, 66, PAPER);
    this.label('炎帝之少女，溺而不返，化为精卫。', 0, -20, 30, MUTED, 620);
    this.label('三幕 · 三个谜 · 一张山海小笺', 0, -92, 24, GOLD);
    this.label('点击继续', 0, this.bottomY(24), 24, MUTED);

    const h = view.getVisibleSize().height;
    const skip = this.uiNode('Skip', 750, h);
    skip.on(Node.EventType.TOUCH_END, () => {
      this.clearAuto();
      this.showActCard(0);
    }, this);
    this.setAuto(() => this.showActCard(0), 3000);
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
    this.label(act.kicker, 0, 190, 26, GOLD);
    this.label(act.title, 0, 80, 56, PAPER, 680);
    this.label('点击继续', 0, this.bottomY(24), 24, MUTED);

    const skip = this.uiNode('Skip', 750, view.getVisibleSize().height);
    skip.on(Node.EventType.TOUCH_END, () => {
      this.clearAuto();
      this.showStory(index, 0);
    }, this);
    this.setAuto(() => this.showStory(index, 0), 2400);
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

    const layout = this.storyLayout();
    this.panel(0, layout.panelY, LAYOUT.storyPanelWidth, LAYOUT.storyPanelHeight);
    this.label(act.pages[pageIndex], 0, layout.panelY + 8, 38, PAPER, 590, 190);
    this.label(`${pageIndex + 1} / ${act.pages.length}`, 0, layout.panelY - 112, 26, MUTED);
    this.button(pageIndex === act.pages.length - 1 ? '进入本幕谜题' : '继续', 0, layout.buttonY, LAYOUT.storyButtonWidth, LAYOUT.storyButtonHeight, () => {
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
    const areaBottom = bottom + 355;
    const areaTop = top - this.safeTop - 190;

    this.label(act.puzzle.prompt, 0, top - this.safeTop - 170, 32, PAPER, 650);
    this.progressLabel = null;
    this.hintText = this.label('', 0, top - this.safeTop - 208, 22, GOLD, 690, 44);

    const display = this.artDisplay;
    const artMode = Boolean(this.artViewportNode) && display.width > 0 && display.height > 0;
    const parent = this.artViewportNode || this.viewLayer!;
    for (const target of act.puzzle.targets) {
      const px = artMode ? (target.x - 0.5) * display.width : -330 + target.x * 660;
      const py = artMode ? (target.y - 0.5) * display.height : areaBottom + target.y * (areaTop - areaBottom);
      const hitSize = artMode ? (['head', 'beak', 'stone'].includes(target.id) ? 86 : 112) : 130;
      const n = this.uiNodeIn(parent, `target-${target.id}`, hitSize, hitSize);
      n.setPosition(px, py);
      n.setScale(1.08, 1.08, 1);
      if (!artMode) {
        const g = n.addComponent(Graphics);
        this.drawIcon(g, target.icon);
      }
      n.active = !target.cover;
      n.on(Node.EventType.TOUCH_END, () => this.findTarget(target, n), this);
      this.targetNodes.set(target.id, n);
    }

    for (const cover of act.puzzle.covers || []) {
      const px = artMode ? (cover.x - 0.5) * display.width : -330 + cover.x * 660;
      const py = artMode ? (cover.y - 0.5) * display.height : areaBottom + cover.y * (areaTop - areaBottom);
      const n = this.uiNodeIn(parent, `cover-${cover.id}`, cover.w, cover.h);
      n.setPosition(px, py);
      const g = n.addComponent(Graphics);
      this.drawCover(g, cover);
      n.on(Node.EventType.TOUCH_END, () => this.openCover(cover), this);
      this.coverNodes.set(cover.id, n);
    }

    const pillW = LAYOUT.pillWidth;
    const pillH = LAYOUT.pillHeight;
    const listLift = this.safeBottom;
    const row1Y = bottom + 235 + listLift;
    const row2Y = bottom + 165 + listLift;
    act.puzzle.targets.forEach((target, index) => {
      let x = 0;
      let y = row1Y;
      if (index < 3) {
        x = -220 + index * 220;
      } else {
        x = -110 + (index - 3) * 220;
        y = row2Y;
      }
      this.makePill(target, x, y, pillW, pillH);
    });

    const hintButton = this.button('提示 · 3', -175, this.bottomY(55), 250, 70, () => this.useHint(), false);
    this.hintButtonLabel = hintButton.getComponentInChildren(Label);
    this.label('找到所有物品即可继续', 175, this.bottomY(55), 24, MUTED, 330);
  }

  private makePill(target: PuzzleTarget, x: number, y: number, w: number, h: number) {
    const n = this.uiNode(`pill-${target.id}`, w, h);
    n.setPosition(x, y);
    const g = n.addComponent(Graphics);
    g.fillColor = new Color(17, 35, 45, 255);
    g.roundRect(-w / 2, -h / 2, w, h, 12);
    g.fill();
    g.lineWidth = 1;
    g.strokeColor = new Color(213, 168, 90, 80);
    g.roundRect(-w / 2, -h / 2, w, h, 12);
    g.stroke();
    const icon = this.iconFrames.get(target.icon);
    const hasIcon = Boolean(icon) || this.artFrames.size > 0;
    const labelWidth = hasIcon ? w - 58 : w - 20;
    const l = this.label(target.name, hasIcon ? 18 : 0, 0, 26, PAPER, labelWidth);
    l.node.removeFromParent();
    n.addChild(l.node);
    l.node.setPosition(hasIcon ? 18 : 0, 0);
    this.pillLabels.set(target.id, l);
    if (hasIcon) {
      const iconNode = new Node('PillIcon');
      iconNode.layer = Layers.Enum.UI_2D;
      iconNode.addComponent(UITransform);
      if (icon) {
        const sp = iconNode.addComponent(Sprite);
        sp.spriteFrame = icon;
        sp.sizeMode = Sprite.SizeMode.CUSTOM;
        iconNode.getComponent(UITransform)!.setContentSize(38, 38);
      } else {
        const g = iconNode.addComponent(Graphics);
        iconNode.setScale(0.55, 0.55, 1);
        this.drawIcon(g, target.icon);
      }
      iconNode.getComponent(UITransform)!.setContentSize(38, 38);
      n.addChild(iconNode);
      iconNode.setPosition(-w / 2 + 28, 0);
    }
  }

  private drawIcon(g: Graphics, icon: string) {
    g.lineWidth = 3;
    g.strokeColor = GOLD;
    g.fillColor = PAPER;
    switch (icon) {
      case 'leaf':
        g.ellipse(0, 0, 20, 10);
        g.fill();
        g.moveTo(-22, 0);
        g.lineTo(22, 0);
        g.stroke();
        break;
      case 'shell':
        g.moveTo(0, 22);
        g.lineTo(-24, -2);
        g.lineTo(-14, -22);
        g.lineTo(0, -15);
        g.lineTo(14, -22);
        g.lineTo(24, -2);
        g.close();
        g.fill();
        for (let i = -2; i <= 2; i++) {
          g.moveTo(0, 22);
          g.lineTo(i * 10, -18);
        }
        g.stroke();
        break;
      case 'boat':
        g.moveTo(-30, 8);
        g.lineTo(30, 8);
        g.lineTo(18, 23);
        g.lineTo(-18, 23);
        g.close();
        g.fill();
        g.moveTo(0, 8);
        g.lineTo(0, -26);
        g.lineTo(20, -10);
        g.lineTo(0, -7);
        g.stroke();
        break;
      case 'jade':
        g.circle(0, 0, 18);
        g.stroke();
        g.circle(0, 0, 6);
        g.stroke();
        break;
      case 'bird':
        g.moveTo(-28, 6);
        g.lineTo(-8, -8);
        g.lineTo(0, 0);
        g.lineTo(8, -8);
        g.lineTo(28, 6);
        g.stroke();
        break;
      case 'feather':
        g.moveTo(-14, 20);
        g.lineTo(10, -20);
        g.stroke();
        for (let i = -1; i <= 2; i++) {
          g.moveTo(i * 6, i * -8 + 8);
          g.lineTo(i * 6 - 10, i * -8 + 2);
        }
        g.stroke();
        break;
      case 'head':
        g.circle(0, 0, 18);
        g.fill();
        g.moveTo(-10, 6);
        g.lineTo(10, 6);
        g.moveTo(-8, 12);
        g.lineTo(8, 12);
        g.stroke();
        break;
      case 'beak':
        g.moveTo(-18, 0);
        g.lineTo(20, -8);
        g.lineTo(20, 8);
        g.close();
        g.fill();
        break;
      case 'foot':
        g.moveTo(0, -16);
        g.lineTo(0, 14);
        g.moveTo(0, 14);
        g.lineTo(-16, 22);
        g.moveTo(0, 14);
        g.lineTo(16, 22);
        g.moveTo(-4, -18);
        g.lineTo(4, -18);
        g.stroke();
        break;
      case 'stone':
        g.moveTo(-20, 12);
        g.lineTo(-12, -12);
        g.lineTo(10, -18);
        g.lineTo(22, 0);
        g.lineTo(12, 16);
        g.close();
        g.fill();
        break;
      case 'branch':
        g.moveTo(-18, 18);
        g.lineTo(18, -18);
        g.moveTo(-2, -2);
        g.lineTo(-14, -12);
        g.moveTo(6, -8);
        g.lineTo(16, -16);
        g.stroke();
        break;
      case 'pine':
        g.moveTo(0, 20);
        g.lineTo(0, -20);
        for (let i = -2; i <= 2; i++) {
          g.moveTo(0, i * 7);
          g.lineTo(i * 9, i * 7 - 9);
        }
        g.stroke();
        break;
      case 'white-stone':
        g.fillColor = new Color(230, 224, 202, 255);
        g.moveTo(-20, 12);
        g.lineTo(-10, -14);
        g.lineTo(14, -18);
        g.lineTo(22, 4);
        g.lineTo(8, 16);
        g.close();
        g.fill();
        break;
      case 'green-stone':
        g.fillColor = new Color(76, 139, 135, 255);
        g.moveTo(-22, 8);
        g.lineTo(-8, -16);
        g.lineTo(18, -10);
        g.lineTo(20, 14);
        g.lineTo(-4, 18);
        g.close();
        g.fill();
        break;
      case 'reed':
        g.moveTo(0, 20);
        g.lineTo(0, -18);
        g.moveTo(0, 2);
        g.lineTo(-14, -8);
        g.moveTo(0, 8);
        g.lineTo(14, -2);
        g.stroke();
        break;
      default:
        g.circle(0, 0, 18);
        g.fill();
    }
  }

  private drawCover(g: Graphics, cover: Cover) {
    const w = cover.w;
    const h = cover.h;
    g.lineWidth = 2;
    g.strokeColor = new Color(213, 168, 90, 150);
    g.fillColor = new Color(24, 44, 52, 195);
    if (cover.kind === 'rock') {
      g.moveTo(-w / 2, h / 2);
      g.lineTo(-w * 0.32, -h / 2);
      g.lineTo(w * 0.15, -h * 0.4);
      g.lineTo(w / 2, h * 0.1);
      g.lineTo(w * 0.3, h / 2);
      g.close();
      g.fill();
      g.stroke();
    } else if (cover.kind === 'seaweed') {
      g.fillColor = new Color(18, 52, 47, 150);
      g.roundRect(-w / 2, -h / 2, w, h, 10);
      g.fill();
      for (let i = -2; i <= 2; i++) {
        g.moveTo(i * 12, h / 2);
        g.lineTo(i * 18, -h / 2);
      }
      g.stroke();
    } else if (cover.kind === 'driftwood') {
      g.fillColor = new Color(50, 38, 28, 165);
      g.roundRect(-w / 2, -h / 2, w, h, 10);
      g.fill();
      g.moveTo(-w / 2, h / 3);
      g.lineTo(w / 2, -h / 3);
      g.moveTo(-w / 4, -h / 6);
      g.lineTo(-w / 2, -h / 2);
      g.stroke();
    } else {
      g.roundRect(-w / 2, -h / 2, w, h, 14);
      g.fill();
      g.stroke();
      g.lineWidth = 1;
      g.moveTo(-w / 2 + 16, -h / 4);
      g.lineTo(w / 2 - 16, -h / 4);
      g.stroke();
    }
    g.lineWidth = 2;
    g.strokeColor = new Color(213, 168, 90, 200);
    g.roundRect(-w / 2, -h / 2, w, h, 10);
    g.stroke();
    // A small non-text sparkle marks the cover as movable.
    g.strokeColor = new Color(243, 230, 201, 200);
    const sx = w / 2 - 14;
    const sy = -h / 2 + 12;
    g.moveTo(sx - 6, sy);
    g.lineTo(sx + 6, sy);
    g.moveTo(sx, sy - 6);
    g.lineTo(sx, sy + 6);
    g.stroke();
    g.strokeColor = GOLD;
    g.moveTo(-10, h / 2 - 10);
    g.lineTo(0, h / 2 - 20);
    g.lineTo(10, h / 2 - 10);
    g.stroke();
  }

  private openCover(cover: Cover) {
    if (this.coversOpened.has(cover.id)) return;
    this.coversOpened.add(cover.id);
    const target = this.chapter!.acts[this.actIndex].puzzle.targets.find((t) => t.cover === cover.id);
    if (target) {
      const targetNode = this.targetNodes.get(target.id);
      if (targetNode) targetNode.active = true;
    }
    const coverNode = this.coverNodes.get(cover.id);
    if (coverNode) {
      tween(coverNode)
        .to(0.22, { scale: new Vec3(0.86, 0.86, 1) })
        .call(() => coverNode.destroy())
        .start();
    }
    this.setHint('盖住它的东西移开了。');
  }

  private findTarget(target: PuzzleTarget, node: Node) {
    if (this.foundIds.has(target.id)) return;
    if (target.cover && !this.coversOpened.has(target.cover)) return;
    this.foundIds.add(target.id);
    this.foundCount += 1;
    if (this.progressLabel) this.progressLabel.string = `${this.foundCount} / ${this.chapter!.acts[this.actIndex].puzzle.targets.length}`;
    const pill = this.pillLabels.get(target.id);
    if (pill) {
      pill.string = `✓  ${target.name}`;
      pill.color = GOLD;
    }
    tween(node).to(0.18, { scale: new Vec3(1.35, 1.35, 1) }).to(0.18, { scale: new Vec3(1, 1, 1) }).start();
    node.destroy();
    if (this.foundCount >= this.chapter!.acts[this.actIndex].puzzle.targets.length) {
      this.setAuto(() => this.showKnowledge(), 900);
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
    if (target.cover && !this.coversOpened.has(target.cover)) {
      this.setHint('提示：先移开盖住它的东西。');
      const coverNode = this.coverNodes.get(target.cover);
      if (coverNode) {
        tween(coverNode).to(0.12, { scale: new Vec3(1.12, 1.12, 1) }).to(0.12, { scale: new Vec3(1, 1, 1) }).start();
      }
    } else {
      this.setHint(`提示：${target.hint}`);
      const node = this.targetNodes.get(target.id);
      if (node) {
        tween(node).to(0.12, { scale: new Vec3(1.3, 1.3, 1) }).to(0.12, { scale: new Vec3(1, 1, 1) }).start();
      }
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
    this.panel(0, 30, 650, Math.min(840, h - 280));
    this.label('山 海 小 笺', 0, 290, 28, GOLD);
    this.label(act.title, 0, 210, 46, PAPER);
    let y = 120;
    for (const line of act.knowledge) {
      this.label(line, 0, y, 30, PAPER, 580, 160);
      y -= 170;
    }
    this.button(this.actIndex < this.chapter.acts.length - 1 ? '收下小笺 · 进入下一幕' : '收下小笺 · 查看篇末', 0, this.bottomY(75), 580, 86, () => {
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
    this.panel(0, 10, 660, Math.min(850, h - 240));
    this.label('篇 末 · 山 海 小 笺', 0, 330, 28, GOLD);
    this.label('精卫填海', 0, 250, 54, PAPER);
    this.label('出自《山海经·北山经》', 0, 185, 26, GOLD);
    this.label(this.chapter.source, 0, 45, 26, MUTED, 590, 330);
    this.label('精卫填海：比喻意志坚决、不畏艰难。', 0, -220, 30, PAPER, 590);
    this.label('“精卫衔微木，将以填沧海。” —— 陶渊明', 0, -300, 28, GOLD, 590);
    this.button('回到卷首', 0, this.bottomY(75), 520, 86, () => {
      this.showTitle();
    });
  }
}
