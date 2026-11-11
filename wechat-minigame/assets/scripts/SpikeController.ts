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
  SpriteFrame,
  Sprite,
  Texture2D,
  UIOpacity,
} from 'cc';

const { ccclass } = _decorator;

const INK = new Color(16, 26, 36, 255);
const PANEL = new Color(20, 36, 48, 255);
const GOLD = new Color(213, 168, 90, 255);
const PAPER = new Color(243, 230, 201, 255);
const MUTED = new Color(168, 182, 198, 255);
const STORAGE_KEY = 'gushi-youmi.spike.v1';

@ccclass('SpikeController')
export class SpikeController extends Component {
  private status!: Label;
  private eyeNode!: Node;
  private found = 0;
  private cardY = 0;

  onLoad() {
    view.setDesignResolutionSize(750, 1334, ResolutionPolicy.FIXED_WIDTH);
  }

  start() {
    const previous = sys.localStorage.getItem(STORAGE_KEY);
    this.buildBackground();
    this.buildHeader(previous === 'found');
    this.buildCard();
    this.buildEye(previous === 'found');
    this.buildFooter();

    console.log('[Spike] Cocos WeChat validation started', {
      width: view.getVisibleSize().width,
      height: view.getVisibleSize().height,
      previous,
    });
  }

  private makeNode(name: string, width: number, height: number): Node {
    const node = new Node(name);
    node.layer = Layers.Enum.UI_2D;
    node.addComponent(UITransform).setContentSize(width, height);
    this.node.addChild(node);
    return node;
  }

  private buildBackground() {
    const h = view.getVisibleSize().height;
    const node = this.makeNode('Background', 750, h);
    const g = node.addComponent(Graphics);
    g.fillColor = INK;
    g.rect(-375, -h / 2, 750, h);
    g.fill();

    const glow = this.makeNode('Glow', 750, h);
    const gg = glow.addComponent(Graphics);
    gg.fillColor = new Color(30, 62, 72, 90);
    gg.circle(260, h / 2 - 230, 280);
    gg.fill();
    gg.fillColor = new Color(213, 168, 90, 18);
    gg.circle(-300, -h / 2 + 250, 340);
    gg.fill();
  }

  private buildHeader(alreadyFound: boolean) {
    const top = view.getVisibleSize().height / 2;
    const eyebrowNode = this.makeNode('Eyebrow', 700, 40);
    eyebrowNode.setPosition(0, top - 40);
    const eyebrow = eyebrowNode.addComponent(Label);
    eyebrow.string = 'COCOS × WECHAT · VALIDATION';
    eyebrow.fontSize = 18;
    eyebrow.lineHeight = 24;
    eyebrow.color = GOLD;
    eyebrow.horizontalAlign = Label.HorizontalAlign.CENTER;

    const titleNode = this.makeNode('Title', 700, 110);
    titleNode.setPosition(0, top - 130);
    const title = titleNode.addComponent(Label);
    title.string = '解谜涨知识';
    title.fontSize = 68;
    title.lineHeight = 80;
    title.color = PAPER;
    title.horizontalAlign = Label.HorizontalAlign.CENTER;

    const subNode = this.makeNode('Subtitle', 700, 50);
    subNode.setPosition(0, top - 210);
    const sub = subNode.addComponent(Label);
    sub.string = '之 · 山海经';
    sub.fontSize = 32;
    sub.lineHeight = 40;
    sub.color = GOLD;
    sub.horizontalAlign = Label.HorizontalAlign.CENTER;

    const hintNode = this.makeNode('Hint', 700, 44);
    hintNode.setPosition(0, top - 255);
    const hint = hintNode.addComponent(Label);
    hint.string = alreadyFound ? '上次已找到，再点一次试试' : '找到画面里的眼睛';
    hint.fontSize = 22;
    hint.lineHeight = 30;
    hint.color = MUTED;
    hint.horizontalAlign = Label.HorizontalAlign.CENTER;
  }

  private buildCard() {
    const top = view.getVisibleSize().height / 2;
    this.cardY = top - 650;
    const card = this.makeNode('Card', 650, 700);
    card.setPosition(0, this.cardY);
    const g = card.addComponent(Graphics);
    g.fillColor = new Color(12, 24, 32, 245);
    g.roundRect(-325, -350, 650, 700, 18);
    g.fill();
    g.lineWidth = 2;
    g.strokeColor = GOLD;
    g.roundRect(-325, -350, 650, 700, 18);
    g.stroke();

    const art = this.makeNode('Artwork', 600, 338);
    art.setPosition(0, this.cardY + 150);
    const sprite = art.addComponent(Sprite);
    sprite.sizeMode = Sprite.SizeMode.CUSTOM;
    art.getComponent(UITransform)!.setContentSize(600, 338);
    const opacity = art.addComponent(UIOpacity);
    opacity.opacity = 210;

    resources.load('spike/texture', Texture2D, (error, texture) => {
      if (error) {
        console.warn('[Spike] image load failed', error);
        return;
      }
      const frame = new SpriteFrame();
      frame.texture = texture;
      sprite.spriteFrame = frame;
      console.log('[Spike] image loaded');
    });
  }

  private buildEye(alreadyFound: boolean) {
    this.eyeNode = this.makeNode('Eye', 220, 180);
    this.eyeNode.setPosition(0, this.cardY - 160);
    this.eyeNode.on(Node.EventType.TOUCH_END, this.onEyeTap, this);

    const g = this.eyeNode.addComponent(Graphics);
    g.fillColor = new Color(245, 230, 198, 255);
    g.circle(0, 0, 74);
    g.fill();
    g.lineWidth = 3;
    g.strokeColor = GOLD;
    g.circle(0, 0, 74);
    g.stroke();
    g.fillColor = new Color(80, 148, 146, 255);
    g.circle(0, 0, 38);
    g.fill();
    g.fillColor = new Color(16, 26, 36, 255);
    g.circle(0, 0, 18);
    g.fill();
    g.fillColor = new Color(243, 230, 201, 255);
    g.circle(-10, 12, 6);
    g.fill();

    const statusNode = this.makeNode('Status', 700, 44);
    statusNode.setPosition(0, this.cardY - 430);
    this.status = statusNode.addComponent(Label);
    this.status.fontSize = 24;
    this.status.lineHeight = 32;
    this.status.color = PAPER;
    this.status.horizontalAlign = Label.HorizontalAlign.CENTER;
    this.status.string = alreadyFound ? `存档：已找到 · ${this.found} 次点击` : '点击眼睛，验证触摸与存档';
  }

  private buildFooter() {
    const h = view.getVisibleSize().height;
    const footerNode = this.makeNode('Footer', 700, 60);
    footerNode.setPosition(0, -h / 2 + 50);
    const footer = footerNode.addComponent(Label);
    footer.string = 'Cocos Creator 3.8.8 · 微信小游戏测试号';
    footer.fontSize = 18;
    footer.lineHeight = 24;
    footer.color = MUTED;
    footer.horizontalAlign = Label.HorizontalAlign.CENTER;
  }

  private onEyeTap() {
    this.found += 1;
    sys.localStorage.setItem(STORAGE_KEY, 'found');
    this.status.string = `找到了！第 ${this.found} 次点击，已写入存档`;
    console.log('[Spike] eye tapped', this.found);

    this.eyeNode.setScale(1.12, 1.12, 1);
    tween(this.eyeNode)
      .to(0.16, { scale: new Vec3(1, 1, 1) })
      .start();
  }
}
