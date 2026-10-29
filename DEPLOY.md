# 部署说明

线上站点 https://riverhub.top （含 www）由 **Cloudflare Worker `riverhub`** 通过 Workers Static Assets 直接托管本仓库的静态文件。没有构建步骤，也**不会**在 push 到 GitHub 后自动部署。

## 重新部署

1. 更新 `main` 分支（生产分支）。
2. 为要上线的文件生成清单 `{"/路径": {hash, size}}`，调用
   `POST /accounts/{account_id}/workers/scripts/riverhub/assets-upload-session`。
3. 把返回 `buckets` 中列出的文件，用会话 JWT 以 base64 multipart 上传到
   `POST /accounts/{account_id}/workers/assets/upload?base64=true`，最后一批会返回完成 JWT。
4. `PUT /accounts/{account_id}/workers/scripts/riverhub`，在 metadata 里带上
   `assets.jwt`、`assets.config = { html_handling: "auto-trailing-slash", not_found_handling: "404-page" }`
   以及一个只转发 `env.ASSETS.fetch(request)` 的最小 Worker。

等价的命令行方式：`npx wrangler deploy --name riverhub --assets . --compatibility-date 2026-10-01`（需要 Cloudflare 登录）。

## 域名

`riverhub.top` 与 `www.riverhub.top` 是该 Worker 的 Custom Domains（证书由 Cloudflare 自动签发）。
区域内其他子域（ai、bid、invest、novel、payhub、study 及通配 `*`）不经过此 Worker。
