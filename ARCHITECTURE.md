# 架构说明

## 认证流程

### 1. 用户登录
- 用户访问 `/admin`
- 点击"使用 GitHub 登录"
- Better Auth 处理 GitHub OAuth 流程
- 用户授权后，Better Auth 创建 session

### 2. GitHub Token 配置
- 登录成功后，系统检测是否已配置 GitHub token
- 如果没有，显示输入框要求用户提供 GitHub Personal Access Token
- 用户创建并输入 token（需要 `repo` 权限）

### 3. Token 存储
- 前端将 token 发送到 `/api/auth/github-callback`
- 后端使用 JWT 加密 token（包含 userId 和 githubToken）
- 将 JWT 存储在 httpOnly cookie 中（名称：`github_token_jwt`）
- Cookie 有效期：7 天

### 4. API 调用
- 用户访问管理页面或编辑文章
- 前端调用 GitHub API 端点（list/get/update）
- 后端从 cookie 中读取 JWT
- 解密 JWT 获取 GitHub token
- 使用 token 调用 GitHub API
- 返回结果给前端

## 安全性

### JWT 加密
- 使用 HS256 算法
- Secret 存储在环境变量 `JWT_SECRET` 中
- JWT 包含：userId、githubToken、过期时间

### Cookie 安全
- httpOnly：防止 JavaScript 访问
- SameSite=Lax：防止 CSRF 攻击
- 7 天过期

### 权限控制
- 每个用户使用自己的 GitHub token
- 每个用户只能访问自己有权限的仓库
- Better Auth session 验证用户身份

## 数据流

```
用户登录 (GitHub OAuth)
    ↓
Better Auth 创建 session
    ↓
用户输入 GitHub token
    ↓
后端创建 JWT (userId + githubToken)
    ↓
JWT 存储在 httpOnly cookie
    ↓
用户访问管理页面
    ↓
前端调用 API
    ↓
后端验证 session + 从 JWT 获取 token
    ↓
使用 token 调用 GitHub API
    ↓
返回结果
```

## 文件说明

### 认证相关
- `lib/auth.ts` - Better Auth 配置 + JWT 工具函数
- `pages/api/auth/[...all].ts` - Better Auth 处理器
- `pages/api/auth/github-callback.ts` - 接收 token 并创建 JWT

### GitHub API
- `lib/github.ts` - GitHub API 客户端（Octokit）
- `pages/api/github/list.ts` - 列出文件
- `pages/api/github/get.ts` - 获取文件内容
- `pages/api/github/update.ts` - 更新文件

### 前端页面
- `pages/admin/index.tsx` - 管理后台首页（文章列表）
- `pages/admin/edit/[...slug].tsx` - 文章编辑器

## 环境变量

```env
# GitHub OAuth
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx

# JWT Secret
JWT_SECRET=xxx

# GitHub 仓库信息
GITHUB_OWNER=xxx
GITHUB_REPO=xxx
GITHUB_BRANCH=main
```

## 优势

1. **无数据库**：使用 JWT + Cookie 存储，无需配置数据库
2. **安全**：JWT 加密 + httpOnly cookie
3. **简单**：用户只需提供一次 GitHub token
4. **灵活**：每个用户使用自己的权限
5. **可扩展**：易于添加更多功能
