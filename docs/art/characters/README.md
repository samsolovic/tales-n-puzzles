# 精卫填海 · 角色设定评审

## 结论

方向成立，可以作为后续主图的角色与风格参考。

- **女娃**：青蓝交领衣、赭色披帛、玉簪、赤足，和现有 UI 的石青/赭石/淡金色板一致。气质安静，适合第一幕。
- **精卫**：黑羽、文首、白喙、赤足、衔枝五个关键点都成立，和《山海经》原文对得上。整体像一本中国古代博物志里的神鸟，而不是普通乌鸦。

不需要重做整套风格，只需要补动作和局部强化。

## 需要调整

### 女娃

- 视觉年龄建议从现在的 10–11 岁，略微提高到 **13–15 岁**。她不是孩童，是炎帝的少女。
- 目前是静态正面偏三分之四，适合做设定，不适合直接做第一幕主图。
- 下一张需要：**侧身站在礁石上，望向东海，风吹披帛**。脸可以只露侧脸。
- 表情从“安静”再加一点“决定”：不是害怕，也不是天真。
- 保留：青蓝衣、赭色披帛、玉簪、赤足、素净配色。

### 精卫

- 文首的纹样在 2048 原图里很好看，但缩到 390px 手机宽度后容易消失。
- 需要把头顶纹样做得更明显一点，或者在纹样边缘加一线淡金/石青反光。
- 目前站立衔枝的姿态很好，但第二幕和第三幕需要**飞行姿态**：
  - 第二幕：从风暴海浪中升起，双翼展开
  - 第三幕：晨光中飞行，嘴里衔一小段柘枝
- 白喙、红足、黑羽的对比要保留。

### 文件命名

`nvwa-character.jpg` 容易和“女娲”混淆。建议后续统一改为：

```text
nvwa-girl-character.jpg
```

或：

```text
shaonv-character.jpg
```

精卫可以保持 `jingwei-character.jpg`。

## 当前图片

![女娃角色设定](nvwa-character.jpg)

![精卫角色设定](jingwei-character.jpg)

## 下一批生成 Prompt

### 第一幕主图：女娃在海边

以 `nvwa-girl-character.jpg` 作为人物参考图。

```text
Use the provided character reference exactly: a 13–15-year-old ancient Chinese girl, the youngest daughter of the Fire Emperor. Same face, same blue cross-collar robe, same ochre shawl, same jade hairpin, barefoot. She stands on a rocky shore at dusk, side profile, looking out at the East Sea, wind lifting the shawl. A small wooden boat is moored on the left. Distant Mount Fajiu on the horizon. Pale moon upper right. Foreground: zebrawood leaves, shells, reeds, a jade pendant on cloth, a seabird on a rock. Vertical 9:16, Chinese mythological storybook illustration, mineral pigment on silk, fine ink linework, muted azurite, malachite, ochre and pale gold, cinematic wide shot, subtle paper grain. Keep the top 15% and bottom 22% visually simple for UI. No text, no watermark, no logo, no modern objects, no anime, no 3D render.
```

### 第二幕主图：风暴中升起

以 `jingwei-character.jpg` 作为神鸟参考图。

```text
Use the provided bird reference exactly: a mythical black crow-like bird with a patterned crown, bright white beak and vivid cinnabar red feet. The bird rises from a violent stormy East Sea, wings spread wide, holding a small stone in its beak. Diagonal walls of dark waves, a single lightning bolt from upper left, seaweed, driftwood and broken boat planks in the foreground. Cold ink-black and deep teal palette, strong white and cinnabar accents. Vertical 9:16, Chinese mythological storybook illustration, mineral pigment on silk, fine ink linework, subtle paper grain. Keep the top 15% and bottom 22% simple for UI. No text, no watermark, no anime, no 3D render.
```

### 第三幕主图：晨光中衔枝

```text
Use the provided bird reference exactly: the same black mythical bird with patterned crown, white beak and red feet, now flying in the pale gold dawn between Mount Fajiu and the East Sea. It carries a small zebrawood branch in its beak. Left side: dark mountain slopes with zebrawood and pine. Right side: vast calm sea. Foreground: white stones, green stones, reeds. The bird is small against the enormous sea, but clearly visible. Vertical 9:16, Chinese mythological storybook illustration, mineral pigment on silk, fine ink linework, muted malachite and pale gold, quiet determined mood, large negative space of sea. Keep the top 15% and bottom 22% simple for UI. No text, no watermark, no anime, no 3D render.
```

### 物品图标

```text
A set of 15 matching game item icons for a Chinese mythological storybook game: zebrawood leaf, shell, small wooden boat, jade pendant, seabird, black feather, patterned bird head, white beak, red bird foot, grey stone, zebrawood branch, pine branch, white stone, green stone, reed. Each icon isolated on a plain dark teal background, mineral pigment and fine ink line, muted palette with pale gold accents, soft top-left light, readable at 48px. No text, no labels, no watermark, consistent style.
```

## 工具用法

- **Seedream 4.0**：用参考图生成主图和飞行姿态；强度 0.55–0.75；每张 4 个候选。
- **ChatGPT**：做局部修图、去掉背景、补全披帛/手脚、统一色调；不要让它重设计角色。
- **Photopea / Photoshop**：把人物和鸟从深色背景中扣出，处理成透明 PNG；物品图标也在这里裁切。
- **Cocos**：最终合成，不要在 AI 图里生成任何文字。

## 验收

- 女娃视觉年龄 13–15 岁
- 精卫在 390px 宽度下仍能看出文首、白喙、赤足
- 三幕主图色光递进，但五官、服装、鸟的特征一致
- 顶部 15%、底部 22% 没有关键内容
- 没有文字、水印、现代物件
- 主图 1500×2668，JPG 300–500KB
