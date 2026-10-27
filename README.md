# riverhub-site

史晓河 · 技术架构师 / 独立技术顾问 个人主页（https://riverhub.top/ 的重新设计版本）。

- 纯静态 HTML / CSS / JS，无构建步骤、无框架依赖（仅通过 CDN 引入 Font Awesome 图标）。
- 移动优先，支持浅色 / 深色主题（跟随系统，并可手动切换，偏好存储于 localStorage）。
- 可交互终端：点击指令按钮或直接输入 `help`、`run pay-hub`、`cat packages.json`、`contact`、`clear` 等，支持 ↑/↓ 历史。

## 本地预览

```bash
python3 -m http.server 8000
# 打开 http://localhost:8000/
```

## 文件

- `index.html` 页面结构与内容
- `site.css` 视觉系统（设计令牌、双主题、响应式布局）
- `main.js` 终端模拟器、架构拓扑切换、项目筛选、主题与导航
