# 2:1 全景图交互 Demo

这是一个极简前端 Demo：Vite + TypeScript + Three.js。它只做一件事：把 2:1 equirectangular 全景图贴到球体内壁，并提供拖拽环视、滚轮缩放和本地图片上传预览。

## 放置图片

默认全景图放在：

```text
public/assets/classroom/full_classroom_2to1.png
```

图片需要接近 2:1 比例。页面右下角也可以临时上传本地 2:1 图片预览全景效果；上传内容只在本次浏览会话生效，刷新后恢复默认素材。

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
