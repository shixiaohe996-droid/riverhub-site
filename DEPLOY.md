# 部署说明

线上站点 https://riverhub.top （含 www）由 **Cloudflare Worker `riverhub`** 通过 Workers Static Assets 托管本仓库的静态文件，没有构建步骤。

## 自动部署（GitHub Actions）

- 每次 push 到 `main`（生产分支），`.github/workflows/deploy.yml` 会运行 `wrangler deploy`；也可以在 Actions 页手动 **Run workflow**。
- 配置在 `wrangler.toml`：仓库根目录作为静态资源目录，`html_handling = auto-trailing-slash`，`not_found_handling = 404-page`；`riverhub.top` 与 `www.riverhub.top` 以 `custom_domain = true` 声明，部署不会解绑域名。
- `.assetsignore` 排除了 `README.md`、`DEPLOY.md`、`wrangler.toml`、`.github`、`.git` 等，线上只发布 `index.html`、`main.js`、`site.css` 与 `assets/`。
- 同一时间只跑一个部署（concurrency 组 `cloudflare-deploy-production`）。
- 需要两个仓库 Secret：`CLOUDFLARE_ACCOUNT_ID`（已设置）和 `CLOUDFLARE_API_TOKEN`（需本人创建，见下）。

## 一次性设置：创建 API Token

1. 打开 Cloudflare 控制台 **My Profile → API Tokens**（https://dash.cloudflare.com/profile/api-tokens），点 **Create Token**。
2. 在模板列表里找到 **Edit Cloudflare Workers**，点 **Use template**。
3. **Account Resources**：Include → 选择本账号（Shixiaohe996@gmail.com's Account）。
   **Zone Resources**：Include → Specific zone → `riverhub.top`。
4. **Continue to summary → Create Token**，复制生成的 Token（只显示一次）。
5. 打开 GitHub 仓库 **Settings → Secrets and variables → Actions**（https://github.com/shixiaohe996-droid/riverhub-site/settings/secrets/actions），点 **New repository secret**，Name 填 `CLOUDFLARE_API_TOKEN`，Secret 粘贴 Token，**Add secret**。
6. 到 **Actions → Deploy to Cloudflare Workers**，重新运行失败的那次（Re-run jobs），或点 **Run workflow**。

## 本地手动部署（可选）

```bash
npx wrangler@4 deploy   # 需要 Node.js 22+，并已 wrangler login 或设置 CLOUDFLARE_API_TOKEN
```
