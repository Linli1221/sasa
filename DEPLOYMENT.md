# 部署指南

本文档详细介绍如何将 AI 小说生成工具部署到 EdgeOne Pages 平台，使用 PostgreSQL/MySQL + Redis 的传统数据库架构。

## 📋 部署前准备

### 1. 账户准备
- [EdgeOne Pages 账户](https://console.cloud.tencent.com/edgeone/pages)
- [OpenAI API 账户](https://platform.openai.com/)（可选，用于 AI 生成功能）
- PostgreSQL 或 MySQL 数据库服务
- Redis 缓存服务

### 2. 代码仓库
确保您的代码已推送到 Git 仓库（GitHub 或 Gitee）。

## 🗄️ 数据库设置

### 选择数据库类型

本项目支持两种数据库：
- **PostgreSQL**（推荐）：功能更强大，支持 JSON 类型和全文搜索
- **MySQL**：更普及，兼容性更好

### PostgreSQL 设置

1. **安装 PostgreSQL**
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   
   # CentOS/RHEL
   sudo yum install postgresql-server postgresql-contrib
   sudo postgresql-setup initdb
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   
   # macOS
   brew install postgresql
   brew services start postgresql
   
   # Docker
   docker run --name postgres-ai-novel \
     -e POSTGRES_PASSWORD=your_password \
     -e POSTGRES_DB=ai_novel \
     -p 5432:5432 -d postgres:15
   ```

2. **创建数据库和用户**
   ```sql
   -- 连接到 PostgreSQL
   sudo -u postgres psql
   
   -- 创建数据库
   CREATE DATABASE ai_novel;
   
   -- 创建用户
   CREATE USER ai_novel_user WITH PASSWORD 'your_password';
   
   -- 授权
   GRANT ALL PRIVILEGES ON DATABASE ai_novel TO ai_novel_user;
   
   -- 退出
   \q
   ```

3. **初始化数据表**
   ```bash
   # 执行初始化脚本
   psql -h localhost -U ai_novel_user -d ai_novel -f scripts/init-database.sql
   ```

### MySQL 设置

1. **安装 MySQL**
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install mysql-server
   
   # CentOS/RHEL
   sudo yum install mysql-server
   sudo systemctl start mysqld
   sudo systemctl enable mysqld
   
   # macOS
   brew install mysql
   brew services start mysql
   
   # Docker
   docker run --name mysql-ai-novel \
     -e MYSQL_ROOT_PASSWORD=your_root_password \
     -e MYSQL_DATABASE=ai_novel \
     -e MYSQL_USER=ai_novel_user \
     -e MYSQL_PASSWORD=your_password \
     -p 3306:3306 -d mysql:8.0
   ```

2. **创建数据库和用户**
   ```sql
   -- 连接到 MySQL
   mysql -u root -p
   
   -- 创建数据库
   CREATE DATABASE ai_novel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   
   -- 创建用户
   CREATE USER 'ai_novel_user'@'%' IDENTIFIED BY 'your_password';
   
   -- 授权
   GRANT ALL PRIVILEGES ON ai_novel.* TO 'ai_novel_user'@'%';
   FLUSH PRIVILEGES;
   
   -- 退出
   EXIT;
   ```

3. **修改初始化脚本为 MySQL 格式**
   
   将 `scripts/init-database.sql` 中的 PostgreSQL 特定语法替换为 MySQL 语法：
   ```sql
   -- 替换 UUID 类型
   -- PostgreSQL: id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   -- MySQL: id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
   
   -- 替换 TIMESTAMPTZ 类型
   -- PostgreSQL: created_at TIMESTAMPTZ DEFAULT NOW(),
   -- MySQL: created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   
   -- 替换 JSONB 类型
   -- PostgreSQL: settings JSONB DEFAULT '{}',
   -- MySQL: settings JSON,
   ```

4. **初始化数据表**
   ```bash
   # 执行初始化脚本
   mysql -h localhost -u ai_novel_user -p ai_novel < scripts/init-database.sql
   ```

## 🚀 Redis 设置

### 1. 安装 Redis

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install redis-server

# CentOS/RHEL
sudo yum install redis
sudo systemctl start redis
sudo systemctl enable redis

# macOS
brew install redis
brew services start redis

# Docker
docker run --name redis-ai-novel \
  -p 6379:6379 -d redis:7-alpine
```

### 2. 配置 Redis

编辑 Redis 配置文件 `/etc/redis/redis.conf`：

```bash
# 设置密码（推荐）
requirepass your_redis_password

# 设置最大内存
maxmemory 256mb
maxmemory-policy allkeys-lru

# 启用持久化
save 900 1
save 300 10
save 60 10000
```

重启 Redis 服务：
```bash
sudo systemctl restart redis
```

## 🚀 EdgeOne Pages 部署

### 1. 创建 EdgeOne Pages 项目

1. **登录控制台**
   - 访问 [EdgeOne Pages 控制台](https://console.cloud.tencent.com/edgeone/pages)
   - 使用腾讯云账户登录

2. **创建项目**
   - 点击 "创建项目"
   - 选择 "导入 Git 仓库"
   - 授权 GitHub 或 Gitee 账户
   - 选择您的项目仓库

3. **配置构建设置**
   ```
   项目名称: ai-novel-generator
   框架预设: Next.js
   构建命令: npm run build
   输出目录: out
   安装命令: npm install
   Node.js 版本: 20.18.0
   ```

### 2. 配置环境变量

在项目设置 -> 环境变量中添加：

```bash
# 数据库配置
DB_TYPE=postgresql
DB_HOST=your_database_host
DB_PORT=5432
DB_NAME=ai_novel
DB_USER=ai_novel_user
DB_PASSWORD=your_database_password
DB_SSL=false

# Redis 配置
REDIS_HOST=your_redis_host
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_DB=0

# AI 服务配置
AI_API_KEY=your_openai_api_key

# 应用配置
NEXT_PUBLIC_APP_NAME=AI小说生成工具
NEXT_PUBLIC_APP_VERSION=1.0.0
JWT_SECRET=your_jwt_secret_key_here

# 日志配置
LOG_LEVEL=info
```

### 3. 数据库连接

如果使用云数据库服务：

#### 腾讯云数据库
- **云数据库 PostgreSQL**：获取外网访问地址和端口
- **云数据库 MySQL**：获取外网访问地址和端口
- **云数据库 Redis**：获取连接地址和端口

#### 阿里云数据库
- **RDS PostgreSQL**：配置白名单，获取连接信息
- **RDS MySQL**：配置白名单，获取连接信息
- **云数据库 Redis**：获取连接信息

#### AWS 数据库
- **Amazon RDS**：配置安全组，获取端点信息
- **Amazon ElastiCache**：配置安全组，获取连接信息

### 4. 开始部署

1. 配置完成后点击 "开始部署"
2. 等待构建和部署完成（通常需要 2-5 分钟）
3. 部署成功后会生成预览链接

## 🌐 域名配置（可选）

### 1. 添加自定义域名

1. 在项目设置 -> 域名管理中点击 "添加域名"
2. 输入您的域名（如 `novel-ai.example.com`）
3. 在您的域名注册商处添加 CNAME 记录：
   ```
   记录类型: CNAME
   主机记录: novel-ai
   记录值: [EdgeOne Pages 提供的 CNAME 值]
   ```

### 2. SSL 证书配置

EdgeOne Pages 会自动为您的自定义域名申请 SSL 证书，无需手动配置。

## 🔧 部署后配置

### 1. 数据库优化

#### PostgreSQL 优化
```sql
-- 创建必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 创建全文搜索索引
CREATE INDEX idx_projects_search ON projects 
USING gin(to_tsvector('english', title || ' ' || coalesce(description, '')));

-- 分析表统计信息
ANALYZE;
```

#### MySQL 优化
```sql
-- 设置字符集
ALTER DATABASE ai_novel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建全文索引
ALTER TABLE projects ADD FULLTEXT(title, description);
ALTER TABLE characters ADD FULLTEXT(name, background);

-- 优化表
OPTIMIZE TABLE projects, characters, chapters;
```

### 2. Redis 优化

```bash
# 设置合适的内存策略
redis-cli CONFIG SET maxmemory-policy allkeys-lru

# 设置键过期时间
redis-cli CONFIG SET timeout 300
```

### 3. 验证功能

部署完成后，访问您的站点验证以下功能：

- [ ] 首页正常显示
- [ ] 数据库连接正常
- [ ] Redis 缓存工作
- [ ] 用户注册/登录功能
- [ ] 项目创建功能
- [ ] AI 生成功能（需要配置 OpenAI API Key）
- [ ] 数据持久化

## 🔒 安全配置

### 1. 数据库安全

#### PostgreSQL 安全
```sql
-- 创建只读用户
CREATE USER ai_novel_readonly WITH PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE ai_novel TO ai_novel_readonly;
GRANT USAGE ON SCHEMA public TO ai_novel_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO ai_novel_readonly;

-- 限制连接数
ALTER USER ai_novel_user CONNECTION LIMIT 20;
```

#### MySQL 安全
```sql
-- 创建只读用户
CREATE USER 'ai_novel_readonly'@'%' IDENTIFIED BY 'readonly_password';
GRANT SELECT ON ai_novel.* TO 'ai_novel_readonly'@'%';

-- 限制连接数
CREATE USER 'ai_novel_limited'@'%' IDENTIFIED BY 'limited_password'
WITH MAX_CONNECTIONS_PER_HOUR 100;
```

### 2. Redis 安全

```bash
# 设置强密码
requirepass your_very_strong_redis_password

# 禁用危险命令
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command KEYS ""

# 限制客户端连接
maxclients 100
```

### 3. 网络安全

- 配置防火墙规则，只允许必要的端口访问
- 使用 VPN 或专线连接数据库
- 启用数据库 SSL 连接
- 定期更新密码和证书

## 📊 监控和维护

### 1. 数据库监控

#### PostgreSQL 监控
```sql
-- 查看连接数
SELECT count(*) FROM pg_stat_activity;

-- 查看慢查询
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC LIMIT 10;

-- 查看表大小
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

#### MySQL 监控
```sql
-- 查看连接数
SHOW STATUS LIKE 'Threads_connected';

-- 查看慢查询
SELECT * FROM mysql.slow_log ORDER BY start_time DESC LIMIT 10;

-- 查看表大小
SELECT table_name, 
       ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.tables 
WHERE table_schema = 'ai_novel'
ORDER BY (data_length + index_length) DESC;
```

### 2. Redis 监控

```bash
# 查看内存使用
redis-cli INFO memory

# 查看连接数
redis-cli INFO clients

# 查看慢查询
redis-cli SLOWLOG GET 10

# 查看键统计
redis-cli INFO keyspace
```

### 3. 应用监控

- 设置日志收集和分析
- 监控 API 响应时间
- 设置错误告警
- 定期备份数据

## 🔄 备份和恢复

### 1. PostgreSQL 备份

```bash
# 全量备份
pg_dump -h localhost -U ai_novel_user -d ai_novel > backup_$(date +%Y%m%d_%H%M%S).sql

# 恢复
psql -h localhost -U ai_novel_user -d ai_novel < backup_20231201_120000.sql

# 自动化备份脚本
#!/bin/bash
BACKUP_DIR="/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U ai_novel_user -d ai_novel > $BACKUP_DIR/ai_novel_$DATE.sql
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
```

### 2. MySQL 备份

```bash
# 全量备份
mysqldump -h localhost -u ai_novel_user -p ai_novel > backup_$(date +%Y%m%d_%H%M%S).sql

# 恢复
mysql -h localhost -u ai_novel_user -p ai_novel < backup_20231201_120000.sql

# 自动化备份脚本
#!/bin/bash
BACKUP_DIR="/backups/mysql"
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -h localhost -u ai_novel_user -p ai_novel > $BACKUP_DIR/ai_novel_$DATE.sql
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
```

### 3. Redis 备份

```bash
# RDB 备份
redis-cli BGSAVE

# AOF 备份
redis-cli BGREWRITEAOF

# 复制备份文件
cp /var/lib/redis/dump.rdb /backups/redis/dump_$(date +%Y%m%d_%H%M%S).rdb
```

## 🐛 常见问题排查

### 1. 数据库连接问题

**问题**: 无法连接到数据库
**解决方案**:
- 检查数据库服务是否运行
- 验证连接参数（主机、端口、用户名、密码）
- 检查防火墙设置
- 确认数据库用户权限

### 2. Redis 连接问题

**问题**: Redis 连接失败
**解决方案**:
- 检查 Redis 服务状态
- 验证密码和端口配置
- 检查网络连接
- 查看 Redis 日志

### 3. 性能问题

**问题**: 数据库查询缓慢
**解决方案**:
- 检查并优化查询语句
- 添加必要的索引
- 分析慢查询日志
- 考虑数据库分区或分库

### 4. 内存问题

**问题**: Redis 内存不足
**解决方案**:
- 增加 Redis 内存限制
- 优化缓存策略
- 清理过期键
- 考虑 Redis 集群

## 🚀 性能优化

### 1. 数据库优化

- 定期分析表统计信息
- 优化索引策略
- 使用连接池
- 考虑读写分离

### 2. 缓存优化

- 合理设置缓存过期时间
- 使用缓存预热
- 实现缓存降级策略
- 监控缓存命中率

### 3. 应用优化

- 使用 CDN 加速静态资源
- 实现接口限流
- 优化数据库查询
- 使用异步处理

---

如有部署相关问题，请参考相关数据库和 Redis 的官方文档，或联系技术支持团队。