# 2:1 全景图交互 Demo

这是一个极简前端 Demo：Vite + TypeScript + Three.js。它只做一件事：把 2:1 equirectangular 全景图贴到球体内壁，并提供拖拽环视、滚轮缩放和本地图片上传预览。

## 放置图片

默认全景图放在：

```text
public/assets/classroom/full_classroom_2to1.png
```

图片需要接近 2:1 比例。页面右下角也可以临时上传本地 2:1 图片预览全景效果；上传内容只在本次浏览会话生效，刷新后恢复默认素材。

## 分享远程素材

跨设备分享需要先把图片放到公开可访问的线上地址。当前素材仓库为：

```text
https://aurevior-ai.github.io/VR_PPT_assets/
```

主页面支持通过 `source` 参数加载远程 2:1 全景图，例如：

```text
https://aurevior-ai.github.io/VR_PPT/?source=/VR_PPT_assets/playground.png
```

`source` 支持 `https://` 图片链接，也支持同域路径如 `/VR_PPT_assets/school_gate.png`。浏览器不能从 GitHub Pages 读取 `D:\...` 或 `file://...` 这类本机路径。

## 运行

```bash
npm install
npm run dev
```

打开 `http://localhost:5173/` 预览。生产构建使用：

```bash
npm run build
```

## 交互

- 鼠标或触控拖拽：环视全景。
- 滚轮：缩放视角。
- 上传全景图：选择本地 2:1 图片后即时替换当前全景。

漂移默认关闭，界面只保留上传入口。
