# 个人博客系统

一个功能完善的个人博客系统，基于React、TypeScript、Node.js和MongoDB开发，支持文章发布、编辑、评论、用户认证等功能。

## 项目特点

- **现代化技术栈**：使用React 18、TypeScript、Ant Design等前沿技术
- **响应式设计**：适配各种屏幕尺寸的设备
- **Markdown编辑器**：支持富文本编辑和实时预览
- **数学公式支持**：集成KaTeX，支持数学公式渲染
- **文章管理**：支持文章的发布、编辑、分类、标签和定时发布
- **用户系统**：完整的用户注册、登录、权限管理功能
- **评论系统**：支持文章评论和回复
- **性能优化**：使用React.memo、useCallback等优化渲染性能
- **安全机制**：实现了JWT认证、CSRF防护、请求限流等安全措施

## 技术栈

### 前端
- **框架**：React 18
- **语言**：TypeScript
- **构建工具**：Vite
- **UI组件库**：Ant Design
- **路由**：React Router
- **状态管理**：React Context API
- **HTTP客户端**：Axios
- **Markdown解析**：markdown-it
- **数学公式**：KaTeX
- **代码高亮**：react-syntax-highlighter
- **样式**：Sass

### 后端
- **运行环境**：Node.js
- **Web框架**：Express
- **数据库**：MongoDB
- **ORM**：Mongoose
- **认证**：JWT (JSON Web Tokens)
- **日志**：Winston
- **验证**：Joi, Celebrate
- **安全**：Helmet, Express Rate Limit
- **CORS**：cors

## 项目结构

```
├── src/             # 前端源代码
│   ├── components/  # React组件
│   ├── pages/       # 页面组件
│   ├── services/    # API服务
│   ├── contexts/    # React Context
│   ├── utils/       # 工具函数
│   ├── styles/      # 样式文件
│   └── types/       # TypeScript类型定义
├── server/          # 后端源代码
│   ├── models/      # Mongoose模型
│   ├── routes/      # Express路由
│   ├── middleware/  # 中间件
│   └── index.js     # 后端入口文件
├── public/          # 静态资源
├── dist/            # 构建输出目录
├── package.json     # 项目配置和依赖
└── vite.config.js   # Vite配置
```

## 主要功能模块

### 1. 文章系统
- 文章发布、编辑、删除
- Markdown编辑器，支持实时预览
- 文章分类和标签管理
- 文章搜索功能
- 文章阅读量、点赞数统计
- 定时发布文章

### 2. 用户系统
- 用户注册、登录
- 用户信息管理
- 密码重置
- 会话管理（自动登出）

### 3. 评论系统
- 文章评论功能
- 评论回复功能
- 评论点赞

### 4. 管理员功能
- 文章管理
- 用户管理
- 评论管理
- 系统设置

### 5. 首页功能
- 文章列表展示
- 文章推荐、最新、热门排序
- 文章分类导航
- 关注作者功能

## 安装和运行

### 前提条件
- Node.js 16.x 或更高版本
- MongoDB 4.0 或更高版本
- npm 或 pnpm 包管理器

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <项目仓库地址>
   cd personal-blog-system
   ```

2. **安装依赖**
   ```bash
   # 使用pnpm（推荐）
   pnpm install
   
   # 或使用npm
   npm install
   ```

3. **配置环境变量**
   - 复制 `.env.example` 文件并重命名为 `.env`
   - 根据需要修改 `.env` 文件中的环境变量

4. **启动MongoDB服务**
   确保MongoDB服务已经启动，默认连接到 `mongodb://localhost:27017/blog_db`

5. **启动开发服务器**
   
   - 启动前端开发服务器：
   ```bash
   pnpm dev
   ```
   
   - 启动后端服务器：
   ```bash
   pnpm run server
   ```

6. **访问应用**
   - 前端应用：`http://localhost:5173`
   - 后端API：`http://localhost:5000`

### 构建生产版本

1. **构建前端应用**
   ```bash
   pnpm build
   ```

2. **预览生产版本**
   ```bash
   pnpm preview
   ```

## API接口文档

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/refresh` - 刷新令牌

### 文章接口
- `GET /api/articles` - 获取文章列表
- `GET /api/articles/:id` - 获取文章详情
- `POST /api/articles` - 创建文章
- `PUT /api/articles/:id` - 更新文章
- `DELETE /api/articles/:id` - 删除文章
- `POST /api/articles/:id/like` - 点赞文章

### 评论接口
- `GET /api/comments/:articleId` - 获取文章评论
- `POST /api/comments` - 创建评论
- `PUT /api/comments/:id` - 更新评论
- `DELETE /api/comments/:id` - 删除评论

### 用户接口
- `GET /api/users/profile` - 获取用户资料
- `PUT /api/users/profile` - 更新用户资料

### 管理员接口
- `GET /api/admin/articles` - 获取所有文章（管理员）
- `GET /api/admin/users` - 获取所有用户（管理员）
- `PUT /api/admin/users/:id/role` - 更新用户角色（管理员）

## 开发指南

### 代码规范
- 使用TypeScript进行类型检查
- 遵循ESLint和Prettier的代码规范
- 组件命名使用PascalCase
- 函数和变量命名使用camelCase
- 常量命名使用UPPER_SNAKE_CASE

### 组件开发
- 组件应遵循单一职责原则
- 使用React Hooks进行状态管理和副作用处理
- 对于频繁渲染的组件，使用React.memo进行优化
- 对于需要缓存的函数，使用useCallback进行优化

### 状态管理
- 全局状态使用React Context API管理
- 组件内部状态使用useState管理
- 复杂业务逻辑可以考虑使用自定义Hooks封装

### API调用
- 使用Axios进行HTTP请求
- API调用封装在services目录下
- 使用拦截器处理认证、错误等通用逻辑
