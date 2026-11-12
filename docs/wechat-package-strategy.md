# 微信小游戏资源与分包策略

## 结论

- 不可能把所有章节美术都塞进 4MB 主包。
- 不要启动时一次性下载全部资源。
- 正确方案：**按篇做分包**，进入前下载，下载后缓存。
- 分包下载不等于“联网游戏”。没有服务器、账号、排行榜、多人、云存档，它仍然是单机游戏。首次进入和广告需要网络，但这是微信小游戏的正常机制。

## 微信包体限制

根据微信官方：

- 主包：**≤ 4MB**
- 代码包总大小：**≤ 30MB**
- 单个分包：不限制大小
- 分包由微信 CDN 分发，不需要自己的服务器或域名白名单

参考：

- https://developers.weixin.qq.com/minigame/dev/guide/base-ability/code-package.html
- https://developers.weixin.qq.com/minigame/dev/guide/base-ability/subPackage/useSubPackage.html

## 推荐结构

```text
主包（≤4MB）
  engine
  common UI / theme
  title
  chapter map
  chapter loader
  第一篇封面/小图

分包：chapter-jingwei（约 2–4MB）
  三幕剧情图
  三幕寻物图
  15 个物品图标
  6 个遮挡物
  精卫篇知识小笺

分包：chapter-kuafu
分包：chapter-houyi
...
```

不要把“剧情图”和“寻物图”拆成两个分包，否则进入一幕要下载两次。**一篇一个分包**最稳。

## 下载时机

### 首次进入

```text
主包启动
→ 标题页
→ 后台下载 chapter-jingwei
→ 显示“正在展开山海卷… 42%”
→ 下载完成，进入第一篇
```

### 后续进入

```text
标题 / 卷首
→ 用户选择《精卫填海》
→ 已缓存：直接进入
→ 未缓存：显示文件大小和进度，下载后进入
```

### 下一章预加载

```text
精卫第一幕开始后
→ 后台预加载 chapter-jingwei 剩余资源（如果按幕拆）
或
→ 精卫篇结束后，预加载下一篇
```

不要同时下载全部篇章。移动网络下会显著拖慢首启。

## Cocos 实现

1. 把每篇美术放入独立 Asset Bundle，例如 `chapter-jingwei`。
2. 在构建面板把这个 Bundle 设为 **Subpackage**。
3. 主包只保留 engine、UI、标题、地图和 loader。
4. 用 `assetManager.loadBundle('chapter-jingwei')` 加载。
5. Cocos 会生成对应的 `game.json` subpackages 配置。
6. 加载时显示进度和重试按钮。
7. 下载失败时不要卡死，保留“重试”和“返回卷首”。

伪代码：

```ts
assetManager.loadBundle('chapter-jingwei', (err, bundle) => {
  if (err) {
    showRetry();
    return;
  }
  bundle.load('act1-bg', SpriteFrame, (err2, frame) => {
    // enter chapter
  });
});
```

## 资源体积控制

- 剧情/寻物背景：1500×2668，JPG 300–500KB
- 物品图标：256×256，PNG，20–50KB
- 遮挡物：512×512，PNG，30–80KB
- 同一幕的剧情和寻物尽量复用一张主图
- 不使用 WebP 进主包；使用 JPG/PNG
- 大图不要进 `resources` 主包，放进章节 Bundle

当前状态：

- 主包：**3.51MB**
- 精卫篇分包：**2.34MB**
- 总包：**5.85MB**
- 仍远低于 30MB

构建后需要运行一次补丁：

```bash
node tools/art/patch-wechat-build.mjs
```

或直接使用一键构建：

```bash
./tools/art/build-wechat.sh
```

它会把 `assets/chapter-jingwei/` 写进微信 `game.json` 的 `subpackages`，并修正 AppID。这个脚本在 **Cocos 构建之后**运行，不是在微信开发者工具里运行。微信开发者工具只负责导入 `build/wechatgame` 后预览。

## 单机还是联网

### 分包下载

这是微信的**包体分发机制**，不是游戏玩法联网。

### 仍然是单机的情况

- 没有服务器 API
- 没有微信登录
- 没有云存档
- 没有排行榜
- 没有多人
- 只使用 `wx.setStorageSync` 本地存档
- 广告是微信客户端能力，不要求你自建服务器

### 会变成联网功能的情况

- 微信云开发存档
- 好友排行榜
- 服务端校验广告奖励
- 远程活动配置
- 多人/对战

### 结论

**不要因为用了分包就改选“联网游戏”。**

但如果备案/审核表单问的是“是否需要网络”，要如实说明：

- 首次进入需要网络下载分包
- 广告需要网络
- 游戏逻辑本身是单机，无服务器交互

最终以微信后台和备案审核的口径为准。

## 推荐决策

| 方案 | 评价 |
|---|---|
| 全部资源塞主包 | 不可能，超过 4MB |
| 启动时统一下载全部 | 不推荐，首启慢、流失高 |
| 进入每篇前下载 | ✅ 推荐 |
| 进入每一幕前下载 | 太碎，体验差 |
| 自建 CDN 远程资源 | 不推荐，增加域名/备案/网络依赖 |
| 微信引擎插件 | 可作为减小主包的备选，不是必需 |

**最终方案：主包 + 每篇一个分包 + 首篇启动下载 + 后续按需下载 + 缓存。**
