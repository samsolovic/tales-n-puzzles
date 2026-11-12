# 精卫章布局修改指南

所有运行时 UI 都在一个文件里：

[SpikeController.ts](../wechat-minigame/assets/scripts/SpikeController.ts)

构建产物 `wechat-minigame/build/wechatgame` 不要直接改；下次 Cocos 构建会被覆盖。

## 1. 先改布局常量

文件顶部，约第 35 行：

```ts
const LAYOUT = {
  sideMargin: 24,
  headerHeight: 250,
  puzzleBarHeight: 300,
  storyPanelWidth: 660, // legacy, story uses contentWidth()
  storyPanelHeight: 260,
  storyButtonWidth: 540,
  storyButtonHeight: 86,
  pillWidth: 202,
  pillHeight: 58,
};
```

### 想让图片更大

优先改这三个：

```ts
headerHeight: 250,       // 顶部标题区，改小 → 图片变高
puzzleBarHeight: 300,    // 底部操作栏，改小 → 寻物图片变高
storyPanelHeight: 300,   // 剧情文字面板，改小 → 剧情图片变高
```

注意：改小后要检查文字是否够放、底部安全区是否仍然够。

### 想让剧情文字更多

改：

```ts
storyPanelHeight: 260,
storyButtonHeight: 86,
```

同时调整 `showStory()` 里的文字框高度。剧情面板和按钮宽度现在由 `contentWidth()` 计算：

```ts
750 - LAYOUT.sideMargin * 2
```

## 2. 图片显示区

约第 424 行：

```ts
private viewportFor(mode: string)
```

这里计算图片显示区的中心和高度。

```ts
headerHeight: 250,
puzzleBarHeight: 300,
storyPanelHeight: 300,
```

对应逻辑：

- 寻物：图片下方留出 `safeBottom + puzzleBarHeight`
- 剧情：图片下方留出文字面板 + 按钮

### 图片填充方式

约第 449 行 `drawArtViewport()`：

```ts
const shown = this.artDisplaySize(frame, viewport.width, viewport.height, 'cover');
```

当前剧情和寻物都用 `cover`，让图片左右边缘与剧情面板的 24px 间隔对齐。

如果想让剧情完整显示、不裁切，把 `'cover'` 改成 `'contain'`；代价是左右会出现更大的深色留边。

- `cover`：填满显示区，裁掉多余部分
- `contain`：完整显示，留边

当前：

- 剧情：`cover`，图片左右边缘与面板对齐
- 寻物：`cover`，保证操作区干净、画面填满

如果想把剧情也改成填满：

```ts
mode === 'puzzle' || mode === 'story' ? 'cover' : 'contain'
```

如果想把寻物改成完整显示：

```ts
'contain'
```

## 3. 顶部渐变遮罩

`drawTopGradient()` 从屏幕顶部往下画 28 条半透明黑带：

- 顶部 `rgba(0,0,0,0.5)`
- 底部 `rgba(0,0,0,0)`

它画在图片上方、header 文字下方，用于压暗浅色天空。

顶部渐变高度由：

```ts
this.safeTop + LAYOUT.headerHeight
```

控制。

## 4. 底部物品栏

约第 735 行 `showPuzzle()`。

两行物品栏的位置：

```ts
const row1Y = bottom + 235 + listLift;
const row2Y = bottom + 165 + listLift;
```

`listLift` 是底部安全区。

- 想整体上移：把 `235`、`165` 调大
- 想整体下移：调小
- 想改胶囊大小：改 `LAYOUT.pillWidth` / `LAYOUT.pillHeight`

提示按钮：

```ts
this.button('提示 · 3', -175, this.bottomY(55), 250, 70, ...)
```

底部说明文字：

```ts
this.label('找到所有物品即可继续', 175, this.bottomY(55), 24, ...)
```

## 5. 寻物点击坐标

目标位置在：

[wechat-minigame/assets/resources/chapters/jingwei.json](../wechat-minigame/assets/resources/chapters/jingwei.json)

每个目标：

```json
{
  "id": "shell",
  "name": "贝壳",
  "x": 0.5057,
  "y": 0.3175
}
```

- `x`：0–1，从左到右
- `y`：0–1，从下到上
- 代码里的换算在 `showPuzzle()`：

```ts
const px = (target.x - 0.5) * display.width;
const py = (target.y - 0.5) * display.height;
```

如果图片换了、裁切方式变了，目标坐标要重新量。

## 6. 剧情页

约第 713 行 `showStory()`。

```ts
const layout = this.storyLayout();
this.panel(0, layout.panelY, LAYOUT.storyPanelWidth, LAYOUT.storyPanelHeight);
this.label(act.pages[pageIndex], 0, layout.panelY + 8, 38, PAPER, 590, 190);
this.label(`${pageIndex + 1} / ${act.pages.length}`, 0, layout.panelY - 112, 26, MUTED);
this.button(..., 0, layout.buttonY, LAYOUT.storyButtonWidth, LAYOUT.storyButtonHeight, ...)
```

文字和按钮都在图片外，不再覆盖画面。

## 7. 美术资源

章节资源在：

```text
wechat-minigame/assets/bundles/chapter-jingwei/
  act1-story.jpg
  act1-puzzle.jpg
  act2.jpg
  act3.jpg
  items/*.png
```

代码里按名字加载：

```ts
private artName(actIndex: number, mode: string) {
  if (actIndex === 0) return mode === 'puzzle' ? 'act1-puzzle' : 'act1-story';
  return actIndex === 1 ? 'act2' : 'act3';
}
```

增加第四幕时，需要：

1. 把图片放进 bundle
2. 在 `artName()` 里映射
3. 在 `preloadArt()` 的 `images` 数组里加名字
4. 在 `jingwei.json` 加目标坐标

## 8. 改完怎么跑

### Cocos 预览

保存 `SpikeController.ts` 后，Cocos 会自动编译。  
在 Cocos 里直接预览，不需要先构建微信包。

### 微信真机包

一条命令：

```bash
cd /Users/sam/AgentSharedProjects/tales-n-puzzles
./tools/art/build-wechat.sh
```

然后微信开发者工具重新导入：

```text
/Users/sam/AgentSharedProjects/tales-n-puzzles/wechat-minigame/build/wechatgame
```

如果是在 Cocos 图形界面里点“构建”，构建后运行一次：

```bash
node tools/art/patch-wechat-build.mjs
```

## 9. 不要改的地方

- 不要改 `build/wechatgame` 里的 JS/JSON，下一次构建会覆盖
- 不要改 `library/`、`temp/`
- 不要改 `assets/bundles/chapter-jingwei.meta` 里的 bundle 配置，除非你知道后果

## 10. 常见问题

### 图片被拉伸

检查 `artDisplaySize()` 是否使用 `cover`/`contain`，不要直接把 Sprite 设成屏幕宽高。

### 点击位置不对

`x/y` 是相对原图的归一化坐标；如果图片裁切方式变了，必须重新量。

### 底部被 Android 导航栏挡住

检查 `bottomY()` 和 `safeBottom`。布局里所有底部控件都应使用 `bottomY()` 或 `safeBottom`。

### 改了代码但真机没变化

Cocos 保存后需要重新构建微信包；微信开发者工具里的“编译”只重新编译已有产物。
