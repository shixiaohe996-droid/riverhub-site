# riverhub-site

史晓河 · 技术架构师 个人主页（https://riverhub.top/ 的重新设计版本）：个人介绍、代表作品、能力与合作方式，面向远程工作与项目合作。

- 纯静态 HTML / CSS / JS，无构建步骤、无框架依赖（仅通过 CDN 引入 Font Awesome 图标）。
- 移动优先（390px 下「其他项目」横向滑动、「技术细节」默认折叠可展开，内容不删减），默认深色主题，可手动切换浅色（偏好存储于 localStorage）。
- 可交互终端：点击指令按钮或直接输入 `help`、`run pay-hub`、`cat profile.json`、`contact`、`clear` 等，支持 ↑/↓ 历史。

## 本地预览

```bash
python3 -m http.server 8000
# 打开 http://localhost:8000/
```

## 文件

- `index.html` 页面结构与内容
- `site.css` 视觉系统（设计令牌、双主题、响应式布局）
- `main.js` 终端模拟器（交互演示，页面已标注「交互演示 / 示意代码」）、架构拓扑切换、主题与导航
- `assets/` 代表作品截图，均为线上站点真实截图：`ciftopay.jpg`（ciftopay.com「行业方案」+「服务对象」两段长截图，1200×1500）、`deals.jpg`（deals.ecommica.com 首页，1200×750）

## 替换个人照片

1. 把照片命名为 `avatar.jpg`，放到 `assets/avatar.jpg`（与 `ciftopay.jpg` 同目录）。
2. 建议正方形、不小于 480×480，脸部居中略偏上；页面以圆形裁切显示（`object-position: center 30%`，可在 `site.css` 的 `.avatar-img` 调整）。
3. 无需改 HTML：文件存在时自动显示照片；文件不存在时自动回退为「史」字占位（此时浏览器会对 avatar.jpg 记一条 404，放入照片后即消失）。
4. 如果想用 png/webp，同时修改 `index.html` 中 `.avatar-img` 的 `src`。
