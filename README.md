# Contentlayer + Next.js + GitHub Admin Template

一个使用 GitHub API 作为内容后台的无数据库 CMS 模板。

## 功能

- ✍️ 在线编辑 MDX 文件
- 🔒 GitHub OAuth 登录
- ⚙️ Contentlayer 自动内容建模
- 🚀 一键部署到 Vercel

## 配置

1. 复制 `.env.example` 到 `.env.local`
2. 配置 GitHub OAuth 应用：
   - 访问 https://github.com/settings/developers
   - 创建新的 OAuth App
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
   - 填入 `GITHUB_CLIENT_ID` 和 `GITHUB_CLIENT_SECRET`
3. 配置 JWT Secret：
   - 生成一个随机字符串作为 `JWT_SECRET`
   - 用于加密存储 GitHub token
4. 配置仓库信息：
   - `GITHUB_OWNER`: 你的 GitHub 用户名
   - `GITHUB_REPO`: 仓库名称
   - `GITHUB_BRANCH`: 分支名（通常是 main）

## 启动

```bash
pnpm install
pnpm run dev
```

访问 `/admin` 进入管理后台。

## 使用说明

1. 访问 `/admin`，点击"使用 GitHub 登录"
2. 授权 GitHub OAuth（确保勾选 `repo` 权限）
3. 登录成功后，系统自动获取 OAuth access token
4. 现在可以查看和编辑文章了

## 技术架构

- **认证**：自定义 GitHub OAuth 实现
- **Session 管理**：JWT + httpOnly Cookie
- **Token 存储**：GitHub OAuth access token 加密存储在 JWT 中
- **完全无数据库**：所有数据存储在 JWT cookie 中
- **安全性**：
  - GitHub OAuth 自动获取 access token
  - Token 通过 JWT 加密存储
  - httpOnly cookie 防止 XSS 攻击
  - 每个用户使用自己的 GitHub 权限
