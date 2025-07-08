# AI 小说生成工具

基于 Next.js + EdgeOne Pages + PostgreSQL/MySQL + Redis 构建的智能小说创作助手，结合人工智能技术，为创作者提供从世界观构建到章节生成的全流程创作支持。

## 🌟 功能特性

### 📚 智能创作引擎
- **世界观架构**：AI 辅助构建完整的世界观体系，包括历史、地理、政治、文化等
- **角色设定**：创建立体的角色形象，管理复杂的人物关系网络
- **剧情蓝图**：设计用于规划核心剧情、转折点和结局的工具

### ✍️ 智能生成系统
- **多阶段生成**：章节生成分为大纲、草稿、精修等阶段，确保剧情连贯性
- **风格仿写**：支持自定义风格源文件进行文本风格迁移
- **内置风格库**：提供古风、悬疑、热血等多种预设风格

### 🧠 智能维护系统
- **状态追踪**：跟踪角色发展轨迹和伏笔管理
- **语义检索**：基于向量数据库的长程上下文维护
- **自动审校**：剧情矛盾检测和设定一致性检查

### 🖥️ 可视化工作台
- **一体化操作**：统一的图形界面集成所有核心功能
- **可视化编辑**：节点拖拽、时间线等直观编辑方式
- **项目管理**：专属输出目录和配置管理

## 🚀 技术架构

### 前端技术栈
- **Next.js 14**：React 全栈框架，支持静态导出
- **TypeScript**：类型安全的 JavaScript 超集
- **Tailwind CSS**：原子化 CSS 框架
- **Zustand**：轻量级状态管理
- **React Hook Form**：高性能表单库

### 后端技术栈
- **EdgeOne Pages Functions**：边缘计算函数
- **PostgreSQL/MySQL**：关系型数据库，存储结构化数据
- **Redis**：内存缓存数据库，提供高性能缓存服务

### 部署平台
- **EdgeOne Pages**：腾讯云边缘计算平台
- **全球CDN**：3200+ 边缘节点分布式部署

## 📦 项目结构

```
ai-novel-generator/
├── doc/                    # 文档目录
│   └── EdgeOne_Pages/     # EdgeOne Pages 相关文档
├── functions/              # EdgeOne Pages Functions
│   └── api/               # API 函数
│       └── ai/            # AI 相关 API
├── scripts/               # 脚本目录
│   └── init-database.sql # 数据库初始化脚本
├── src/                   # 源代码目录
│   ├── components/        # React 组件
│   ├── hooks/            # 自定义 Hooks
│   ├── lib/              # 工具库
│   │   ├── ai-service.ts # AI 生成服务
│   │   ├── cache-service.ts # 缓存服务
│   │   ├── config.ts     # 配置管理
│   │   ├── database.ts   # 数据库连接服务
│   │   └── utils.ts      # 工具函数
│   ├── pages/            # Next.js 页面
│   ├── store/            # 状态管理
│   ├── styles/           # 样式文件
│   └── types/            # TypeScript 类型定义
├── edgeone.json          # EdgeOne Pages 配置
├── next.config.js        # Next.js 配置
├── tailwind.config.js    # Tailwind CSS 配置
└── tsconfig.json         # TypeScript 配置
```

## 🛠️ 快速开始

### 环境要求
- Node.js 18+ 
- PostgreSQL 12+ 或 MySQL 8.0+
- Redis 6.0+
- npm 或 yarn 包管理器

### 本地开发

1. **克隆项目**
```bash
git clone <repository-url>
cd ai-novel-generator
```

2. **安装依赖**
```bash
npm install
# 或
yarn install
```

3. **配置数据库**

#### PostgreSQL 配置
```bash
# 安装 PostgreSQL
sudo apt install postgresql postgresql-contrib

# 创建数据库
sudo -u postgres createdb ai_novel

# 创建用户
sudo -u postgres createuser --pwprompt ai_novel_user

# 初始化数据表
psql -h localhost -U ai_novel_user -d ai_novel -f scripts/init-database.sql
```

#### MySQL 配置
```bash
# 安装 MySQL
sudo apt install mysql-server

# 创建数据库和用户
mysql -u root -p << EOF
CREATE DATABASE ai_novel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'ai_novel_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON ai_novel.* TO 'ai_novel_user'@'localhost';
FLUSH PRIVILEGES;
EOF

# 初始化数据表（需先修改脚本为 MySQL 语法）
mysql -h localhost -u ai_novel_user -p ai_novel < scripts/init-database.sql
```

#### Redis 配置
```bash
# 安装 Redis
sudo apt install redis-server

# 启动 Redis
sudo systemctl start redis
```

4. **配置环境变量**
```bash
cp .env.local.example .env.local
```

编辑 `.env.local` 文件，填入以下配置：
```env
# 数据库配置
DB_TYPE=postgresql
DATABASE_URL=postgresql://ai_novel_user:your_password@localhost:5432/ai_novel

# Redis 配置
REDIS_URL=redis://localhost:6379/0

# AI 服务配置
AI_API_KEY=your_openai_api_key

# 应用配置
APP_NAME=AI小说生成工具
APP_VERSION=1.0.0
JWT_SECRET=your_jwt_secret_key_here
```

5. **启动开发服务器**
```bash
npm run dev
# 或
yarn dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 部署到 EdgeOne Pages

详细部署指南请参考 [DEPLOYMENT.md](./DEPLOYMENT.md) 文档。

## 📊 数据库设计

### 核心表结构

- **users**：用户信息和认证数据
- **projects**：项目基本信息和设置
- **world_settings**：世界观设定
- **characters**：角色信息和关系
- **plot_outlines**：剧情大纲
- **plot_acts**：剧情幕结构
- **plot_scenes**：具体场景设计
- **chapters**：章节内容
- **chapter_versions**：章节版本历史
- **generation_tasks**：AI 生成任务记录
- **content_reviews**：内容审查记录
- **knowledge_base**：知识库文档
- **style_templates**：写作风格模板

### 数据关系图

```mermaid
erDiagram
    users ||--o{ projects : creates
    projects ||--o{ world_settings : has
    projects ||--o{ characters : contains
    projects ||--o{ plot_outlines : has
    projects ||--o{ chapters : contains
    projects ||--o{ knowledge_base : includes
    plot_outlines ||--o{ plot_acts : contains
    plot_acts ||--o{ plot_scenes : includes
    characters ||--o{ character_relationships : has
    chapters ||--o{ chapter_versions : tracks
    generation_tasks }o--|| projects : for
    content_reviews }o--|| chapters : reviews
```

详细的数据库 Schema 请参考 `scripts/init-database.sql` 文件。

## 🔧 配置说明

### 环境变量配置

项目使用统一的配置管理系统，所有配置通过环境变量进行设置，不使用 `NEXT_PUBLIC_` 前缀：

#### 必需配置
```env
# 数据库连接
DATABASE_URL=postgresql://user:pass@host:port/db
REDIS_URL=redis://[:pass]@host:port/db

# 安全密钥
JWT_SECRET=your_jwt_secret_key
SESSION_SECRET=your_session_secret_key

# AI 服务
AI_API_KEY=your_openai_api_key
```

#### 可选配置
```env
# 应用信息
APP_NAME=AI小说生成工具
APP_VERSION=1.0.0
APP_ENV=development

# 功能开关
ENABLE_USER_REGISTRATION=true
ENABLE_AI_GENERATION=true
ENABLE_EMAIL_VERIFICATION=false

# AI 模型参数
AI_MODEL=gpt-3.5-turbo
AI_TEMPERATURE=0.8
AI_TOP_P=0.9
```

### EdgeOne Pages 配置
项目根目录的 `edgeone.json` 文件包含了部署配置：
- 构建命令和输出目录设置
- 缓存策略配置
- HTTP 头部设置

### Next.js 配置
`next.config.js` 文件配置了：
- 静态导出模式（`output: 'export'`）
- 图片优化禁用（静态导出必需）
- 基础路径和资源前缀设置

### 数据库配置
支持多种数据库配置：
- **PostgreSQL**：功能丰富，支持 JSON 类型和全文搜索
- **MySQL**：兼容性好，性能稳定
- **Redis**：高性能缓存，支持多种数据结构

## 🎨 开发指南

### 代码规范
- 使用 TypeScript 进行类型检查
- 遵循 ESLint 代码规范
- 使用 Prettier 格式化代码
- 采用 Conventional Commits 提交规范

### 配置管理
- 使用统一的配置管理服务 (`src/lib/config.ts`)
- 避免在前端代码中硬编码配置值
- 所有敏感信息仅在服务端使用
- 提供配置验证和错误提示

### 组件开发
- 使用函数式组件和 Hooks
- 遵循单一职责原则
- 提供完整的 TypeScript 类型定义
- 编写可复用的组件

### 数据库操作
- 使用连接池管理数据库连接
- 支持事务处理
- 实现自动重连机制
- 提供缓存层优化性能

### 状态管理
- 使用 Zustand 进行状态管理
- 按功能模块组织 Store
- 提供选择器函数优化性能

## 🚀 功能路线图

### 已完成 ✅
- [x] 基础项目架构
- [x] 数据库设计和连接
- [x] Redis 缓存集成
- [x] AI 生成服务集成
- [x] 统一配置管理系统
- [x] 用户界面框架
- [x] 类型定义系统

### 进行中 🚧
- [ ] 用户认证系统
- [ ] 世界观管理模块
- [ ] 角色关系管理
- [ ] 剧情大纲编辑器
- [ ] 章节生成功能

### 计划中 📋
- [ ] 风格仿写功能
- [ ] 内容审校系统
- [ ] 营销内容生成
- [ ] 实时协作功能
- [ ] 移动端适配
- [ ] 多语言支持
- [ ] 插件系统

## 🔒 安全特性

### 数据安全
- 所有敏感配置仅在服务端使用
- 数据库连接加密传输
- JWT 令牌安全验证
- 用户数据隔离

### API 安全
- CORS 跨域保护
- 请求频率限制
- 输入数据验证
- 错误信息脱敏

### 部署安全
- 环境变量隔离
- SSL/TLS 加密传输
- 静态资源 CDN 分发
- 自动安全更新

## 🤝 贡献指南

我们欢迎社区贡献！请遵循以下步骤：

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 开发环境设置

1. 安装依赖：`npm install`
2. 配置数据库：参考上述数据库配置步骤
3. 启动开发服务器：`npm run dev`
4. 运行测试：`npm test`（待实现）

### 代码贡献规范

- 所有代码必须通过 TypeScript 类型检查
- 新功能需要包含相应的测试用例
- 遵循现有的代码风格和架构模式
- 提交信息使用 Conventional Commits 格式

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🆘 支持与帮助

如果您在使用过程中遇到问题，可以通过以下方式获取帮助：

- 📧 邮件：support@example.com
- 💬 微信群：扫描二维码加入开发者交流群
- 🐛 问题反馈：[GitHub Issues](https://github.com/your-repo/issues)
- 📖 文档：[项目文档](./doc/)

### 常见问题

**Q: 支持哪些数据库？**
A: 目前支持 PostgreSQL 和 MySQL，推荐使用 PostgreSQL 以获得更好的功能支持。

**Q: 如何配置 AI 服务？**
A: 在环境变量中设置 `AI_API_KEY`，支持 OpenAI GPT 系列模型。

**Q: 可以在本地运行吗？**
A: 可以，按照快速开始部分的步骤配置本地环境即可。

**Q: 如何备份数据？**
A: 请参考 DEPLOYMENT.md 中的备份和恢复章节。

**Q: 为什么不使用 NEXT_PUBLIC 环境变量？**
A: 为了安全考虑，所有配置都在服务端管理，避免敏感信息暴露到客户端。

## 🙏 致谢

感谢以下开源项目和服务：

- [Next.js](https://nextjs.org/) - React 应用框架
- [PostgreSQL](https://www.postgresql.org/) - 强大的开源数据库
- [Redis](https://redis.io/) - 高性能内存数据库
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [EdgeOne Pages](https://edgeone.cloud.tencent.com/pages/) - 边缘计算平台
- [OpenAI](https://openai.com/) - AI 技术支持

### 特别感谢

- 所有参与测试和反馈的用户
- 开源社区的贡献者们
- 提供技术支持的各个平台

---

⭐ 如果这个项目对您有帮助，请给它一个星标！

## 📈 项目统计

- 🚀 **架构设计**：现代化全栈架构
- 📊 **数据库表**：15+ 核心业务表
- 🎨 **UI 组件**：基于 Tailwind CSS 的响应式设计
- 🔧 **API 接口**：RESTful API 设计
- 🛡️ **类型安全**：100% TypeScript 覆盖
- 📱 **响应式设计**：支持各种设备尺寸
- 🌍 **国际化准备**：支持多语言扩展
- ⚡ **性能优化**：缓存策略和数据库优化
- 🔒 **安全配置**：统一配置管理和安全防护