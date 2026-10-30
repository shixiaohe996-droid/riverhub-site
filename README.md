# riverhub-site

史晓河的个人官网，面向支付与复杂业务架构、Java 后端岗位和项目合作。纯静态 HTML / CSS / JavaScript，无构建步骤或运行时框架依赖。

## 本地预览

```bash
python3 -m http.server 8765 --bind 127.0.0.1
```

打开 http://127.0.0.1:8765/ 。英文首页在 `/en/`，在线简历在 `/resume/` 和 `/resume/en.html`。

## 内容与交互

- 首页先展示信付通、ECP、润臻三项核心案例，随后是服务、合作流程、更多交付与个人经历。
- 完整架构与设计取舍保留在 `work/` 案例页；首页技术演示与较早项目使用原生 `details` 折叠。
- 正文默认可见；JavaScript 关闭或加载失败时，导航、案例链接、简历下载和原生折叠仍可使用。
- 默认浅色，可切换深色并保存偏好。终端为浏览器内交互演示，输出不是生产运行指标。
- `assets/icons.svg` 是 Font Awesome 6.4.0 的实际使用图标子集，许可证在 `assets/icons-LICENSE.txt`；不请求外部图标字体。

## 检查

开发检查需要 Node.js 22+、Python 3 和已安装的 Chromium / Chrome；网站本身无需安装依赖。

```bash
npm ci --ignore-scripts
npm run check
```

`check` 验证 JavaScript 语法、17 个 HTML 页面的结构、本地文件和锚点、ARIA 引用、图片替代文字及外链属性，不请求外部网站。

启动预览服务后执行浏览器检查：

```bash
export CHROME_PATH='/absolute/path/to/chrome'
npm run test:browser
```

可选环境变量：`SITE_URL`（默认 `http://127.0.0.1:8765`）、`QA_OUTPUT`（默认 `/tmp/riverhub-review`）。检查覆盖中英文首页 390 / 768 / 1180px、图片加载、主题持久化、移动菜单、复制成功与拒绝、技术折叠、键盘切换、终端、导航历史、PDF 下载和无脚本回退。测试期间外部分析请求被阻断，不验证线上第三方服务。

## 更新简历

可编辑源：`resume/index.html`、`resume/en.html`、共享样式 `resume/resume.css`。两份简历保持两页 A4，以真实经历为准；ECP 明确为远程兼职，日均百万级交易归属于上海遒翔任职经历。

```bash
export CHROME_PATH='/absolute/path/to/chrome'
npm run resume:pdf
```

输出会覆盖 `assets/shixiaohe-resume.pdf` 和 `assets/shixiaohe-resume-en.pdf`。脚本检查打印容器溢出并生成带文本与链接的 PDF。发布前仍需逐页渲染检查分页、字体、链接和文字提取，不能只依赖脚本成功。

历史材料中上海遒翔的公司全称存在“信息科技 / 信息技术”差异，目前使用简称，完整法人名称待本人确认。

## 发布

部署方式见 `DEPLOY.md`。`.assetsignore` 排除开发脚本、依赖与仓库文档。更改本地文件不等于上线；需要另行授权推送与部署。
