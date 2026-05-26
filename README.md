# 幼儿教育绘本场景 2.5D 类 VR Demo

这是一个纯前端 MVP：Vite + React + TypeScript + Three.js，通过分层平面、轻微视差、凹面广角 shader、热点弹窗和控制面板，把课堂插画做成“伪 VR / 类 3D / 绘本广角镜头”的互动网页。

## 放置图片

把素材放在 `public/assets/classroom/`：

- 只有一张图时：放 `original.png`，项目会自动使用单图 fallback。
- 2:1 全景图：放 `full_classroom_2to1.png`，项目会优先识别为 360 equirectangular 全景模式。
- 有分层素材时：放 `bg_wall.png`、`teacher_podium.png`、`desks_students_mid.png`、`students_foreground.png`、`overlays.png`，项目会优先使用分层场景。
- `depth_map.png` 已预留路径，当前 MVP 暂未参与渲染。

## 运行

```bash
npm install
npm run dev
```

打开 `http://localhost:5173/` 预览。生产构建使用：

```bash
npm run build
```

## 替换为分层素材

优先保持所有分层 PNG 与 `original.png` 同尺寸、同构图、透明区域正确。图层顺序和视差倍率在 `src/config/sceneConfig.ts` 的 `layeredSceneLayers` 中调整：

- `parallaxFactor` 越大，移动幅度越大，适合前景。
- `scale` 控制图层放大，避免拖动时露边。
- `depth` 控制 Three.js 平面前后顺序。

## 调整热点

热点集中在 `src/config/hotspots.ts`。坐标是百分比：

- `x`、`y` 是热点中心点。
- `width`、`height` 是可点击区域大小。
- `title`、`description`、`details` 是弹窗内容。

## 调整凹面广角和视差

默认值在 `src/config/sceneConfig.ts` 的 `defaultSceneSettings`：

- `parallaxStrength`：默认视差强度。
- `fisheyeStrength`：默认凹面弯曲强度。
- `viewRotationMaxDegrees`：方案 A 下的最大伪旋转角度，默认是适合单张图的安全范围。
- `lensMode`：默认 `concaveWide`，保留 `convexFisheye` 作为后续对比模式。
- `fisheyeEnabled`、`autoDriftEnabled`：默认开关。

页面右下角控制面板也可以实时调节。

当前方案 C 初版会优先检测 `full_classroom_2to1.png` 是否存在，并确认图片接近 2:1。通过后会把图片贴到 Three.js 球体内壁，用透视相机在球心浏览；如果没有合格全景图，才回退到方案 A 的分层/单图凹面广角。

## 接入真实幼儿教育内容

后续可以把 `hotspots.ts` 中的文案替换成课程数据，也可以扩展为：

- 老师热点：接入音频讲解、口型动画、表情状态。
- 黑板热点：接入逐句高亮、拼音、词语解释、课堂问答。
- 公约热点：接入行为习惯卡片、奖励贴纸。
- 学生热点：接入跟读、举手、选择答案、对话分支。
