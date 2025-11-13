# 样式系统说明

## 已集成的功能

### 1. Tailwind CSS v3
- 使用 Tailwind CSS 作为主要样式系统
- 配置文件：`tailwind.config.js`
- 全局样式：`styles/globals.css`

### 2. Typography 插件
- 使用 `@tailwindcss/typography` 美化 Markdown 内容
- 在博客文章页面使用 `prose` 类来自动美化排版
- 支持暗色模式：`dark:prose-invert`

### 3. Shadcn UI 组件库
- 已创建的组件：
  - `Button` - 按钮组件（多种变体：default, outline, ghost, link 等）
  - `Card` - 卡片组件（包含 Header, Title, Description, Content, Footer）
- 组件位置：`components/ui/`
- 工具函数：`lib/utils.ts` 提供 `cn()` 函数用于合并 className

### 4. 暗色模式
- 使用 `next-themes` 实现主题切换
- 支持三种模式：light、dark、system（跟随系统）
- 主题切换按钮：`ThemeToggle` 组件（位于页面右上角）
- 主题提供者：`ThemeProvider` 已集成到 `_app.tsx`

## 使用方法

### 使用 Tailwind 类
```tsx
<div className="bg-background text-foreground p-4 rounded-lg">
  内容
</div>
```

### 使用 Shadcn UI 组件
```tsx
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>标题</CardTitle>
  </CardHeader>
  <CardContent>
    <Button>点击我</Button>
  </CardContent>
</Card>
```

### 美化 Markdown 内容
```tsx
<article className="prose prose-slate dark:prose-invert lg:prose-xl max-w-none">
  <MDXContent />
</article>
```

### 添加新的 Shadcn UI 组件
可以从 [shadcn/ui](https://ui.shadcn.com/) 复制组件代码到 `components/ui/` 目录。

## 颜色系统

项目使用 CSS 变量定义颜色，支持亮色和暗色两种主题：

- `--background` / `--foreground` - 背景和前景色
- `--primary` / `--primary-foreground` - 主色调
- `--secondary` / `--secondary-foreground` - 次要色
- `--muted` / `--muted-foreground` - 柔和色
- `--accent` / `--accent-foreground` - 强调色
- `--destructive` / `--destructive-foreground` - 危险/删除色
- `--border` / `--input` / `--ring` - 边框、输入框、焦点环

可以在 `styles/globals.css` 中自定义这些颜色值。

## 开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000 查看效果。
