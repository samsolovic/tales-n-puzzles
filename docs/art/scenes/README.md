# Act 1 场景图评审

## 当前选择

| 用途 | 文件 | 说明 |
|---|---|---|
| 剧情主图 | `act1-candidate-4.jpg` | 女娃更大，夕阳和海岸叙事完整，适合剧情页 |
| 寻物底板 | `act1-puzzle-plate-v2-...jpg` | 女娃缩小，五个目标在中间带，底部 25% 留空 |
| 备用主图 | `act1-key-art-...jpg` | Seedream API 生成，石青黄昏，和 UI 更接近 |

![Act 1 contact sheet](act1-contact-sheet.jpg)

## 为什么选这两张

### 剧情：Candidate 4

- 女娃的体量适合做剧情页
- 夕阳、海面、远山、孤舟、海鸟都有
- 画面干净，适合叠加三页剧情文字
- 贝壳和玉佩虽然在底部，但剧情页不要求点击

### 寻物：Puzzle Plate v2

- 女娃缩小到左侧，给中间留出寻物区
- 柘叶、贝壳、小舟、玉佩、海鸟都在中间带
- 底部 25% 是干净沙滩和岩石，给物品栏和按钮留空间
- 顶部 15% 是天空，给微信胶囊留空间
- 9:16，1440×2560，463KB

## 图层分解已跑通

Seedream 5.0 Pro 的 `layer_decomposition: true` 确实可用。

一次请求返回了：

- `z0` 底图 1584×2816
- `z1` Sea water
- `z2` Shore rocks
- `z3` Wooden boat
- `z4` Ancient style girl
- `z5` Dry leaf
- `z6` Shell
- `z7` Jade pendant on cloth
- `z8` Seabird
- `z9` Reeds

每个非底层图层都带 `z_index`、`name`、`description`、`bounding_box`，并且是透明 PNG。

我把 boat、leaf、shell、jade、bird 五个图层裁成了 256px 图标：

![Layer-derived item icons](act1-item-icons.jpg)

原始图层体积太大（单张 2–8MB，总计约 38MB），没有直接进游戏和 Git。保留的是：

- 优化后的图标：`docs/art/scenes/items/`
- 图层坐标：`act1-layer-map.json`
- 图标预览：`act1-item-icons.jpg`

### 当前用法

- 背景：`act1-puzzle-plate-v2` 整图，底部 25% 留空
- 点击：按 `act1-layer-map.json` 的归一化坐标做热区
- 物品栏：用裁切后的透明图标
- 遮挡：Cocos 叠加布/石头
- 不依赖“干净底图”，因为底图仍保留了部分场景元素；整图作背景即可

## API 已跑通

本轮用 Seedream 5.0 Pro 生成：

- 第一张 key art：`act1-key-art-20261112-095121-1.jpg`
- 第一版 puzzle plate：`act1-puzzle-plate-20261112-095412-1.jpg`
- 第二版 puzzle plate：`act1-puzzle-plate-v2-20261112-095633-1.jpg`

模型：`doubao-seedream-5-0-pro-260628`  
尺寸：`1440×2560`  
生成脚本：`tools/art/generate.mjs`

## 下一步

1. 以 `act1-puzzle-plate-v2` 为准，量出五个目标的归一化坐标
2. 更新 `jingwei.json`
3. Cocos 接入真实背景图
4. 遮挡物用布/石头叠加
5. 物品栏图标改为真实物品小图
6. 再生成第二幕、第三幕
