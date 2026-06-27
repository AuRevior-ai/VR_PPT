《你好，新小学》网页课件

线上蓝链：
https://aurevior-ai.github.io/VR_PPT/courseware/

推荐启动方式：
1. 双击“启动全屏课件.cmd”。
2. 浏览器会以 kiosk 全屏方式打开课件，不显示顶部标签栏、地址栏和 Windows 任务栏。
3. 退出时按 Alt + F4。

如果启动失败：
打开命令行运行“启动全屏课件.cmd -CheckOnly”，检查是否能找到 Node.js 和 Microsoft Edge。

备用启动方式：
直接打开 index.html 也能运行，但普通浏览器不允许网页在未交互时自动隐藏浏览器标签栏和系统任务栏。此时第一次点击页面会请求进入浏览器全屏。

页面流程：
1. 首页循环播放 assets/home-loop.mp4。
2. 点击后进入引入互动页。
3. 第 3/4 页为 VR 全景页，使用本地 assets 中的真实全景图。
4. 第 3/4 页使用左右小按钮切换上下页。
5. 第 5 页为 AI 学长对话页，点击三个气泡分别播放对应动画。
6. 封底页循环播放 assets/outro-loop.mp4。
