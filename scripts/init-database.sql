-- AI 小说生成工具数据库初始化脚本
-- 支持 PostgreSQL 和 MySQL

-- PostgreSQL 版本
-- 创建数据库扩展 (仅 PostgreSQL)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 用户表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- PostgreSQL
    -- id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()), -- MySQL
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    avatar TEXT,
    password_hash VARCHAR(255), -- 用于本地认证
    provider VARCHAR(50) DEFAULT 'local', -- 认证提供商: local, google, github
    provider_id VARCHAR(255), -- 第三方认证ID
    email_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMPTZ,
    settings JSONB DEFAULT '{}', -- 用户设置
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 项目表
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- PostgreSQL
    -- id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()), -- MySQL
    title VARCHAR(200) NOT NULL,
    description TEXT,
    genre VARCHAR(50) NOT NULL,
    target_words INTEGER DEFAULT 0,
    current_words INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft', -- draft, writing, completed, published
    cover_image TEXT, -- 封面图片URL
    tags JSONB DEFAULT '[]', -- 标签数组
    settings JSONB DEFAULT '{}', -- 项目设置
    user_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 世界设定表
CREATE TABLE world_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- PostgreSQL
    -- id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()), -- MySQL
    project_id UUID NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    era VARCHAR(100),
    technology_level VARCHAR(100),
    magic_system TEXT,
    geography TEXT,
    politics TEXT,
    economy TEXT,
    culture TEXT,
    history TEXT,
    languages JSONB DEFAULT '[]', -- 语言系统
    religions JSONB DEFAULT '[]', -- 宗教系统
    organizations JSONB DEFAULT '[]', -- 组织机构
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 角色表
CREATE TABLE characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- PostgreSQL
    -- id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()), -- MySQL
    project_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL, -- protagonist, antagonist, supporting, minor
    age INTEGER,
    gender VARCHAR(20),
    appearance TEXT,
    personality TEXT,
    background TEXT,
    goals TEXT,
    fears TEXT, -- 恐惧和弱点
    skills JSONB DEFAULT '[]', -- 技能数组
    equipment JSONB DEFAULT '[]', -- 装备道具
    relationships JSONB DEFAULT '[]', -- 关系数组
    development_arc TEXT, -- 角色发展弧线
    current_status TEXT,
    important_events JSONB DEFAULT '[]', -- 重要事件记录
    quotes JSONB DEFAULT '[]', -- 经典台词
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 角色关系表
CREATE TABLE character_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- PostgreSQL
    -- id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()), -- MySQL
    character_id UUID NOT NULL,
    related_character_id UUID NOT NULL,
    relationship_type VARCHAR(50) NOT NULL, -- family, friend, enemy, lover, mentor, student, colleague, other
    description TEXT,
    intensity INTEGER DEFAULT 5, -- 1-10, 关系强度
    status VARCHAR(20) DEFAULT 'active', -- active, past, complicated
    history TEXT, -- 关系历史
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
    FOREIGN KEY (related_character_id) REFERENCES characters(id) ON DELETE CASCADE,
    UNIQUE(character_id, related_character_id)
);

-- 剧情大纲表
CREATE TABLE plot_outlines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- PostgreSQL
    -- id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()), -- MySQL
    project_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    structure VARCHAR(50) DEFAULT 'three_act', -- three_act, heros_journey, kishotenketsu, custom
    themes JSONB DEFAULT '[]', -- 主题数组
    main_conflict TEXT, -- 主要冲突
    resolution TEXT, -- 解决方案
    acts JSONB DEFAULT '[]', -- 幕结构
    plot_points JSONB DEFAULT '[]', -- 情节点
    timeline JSONB DEFAULT '{}', -- 时间线
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 剧情幕表
CREATE TABLE plot_acts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- PostgreSQL
    -- id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()), -- MySQL
    outline_id UUID NOT NULL,
    act_number INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    word_target INTEGER DEFAULT 0,
    scenes JSONB DEFAULT '[]', -- 场景数组
    goals TEXT, -- 该幕目标
    conflicts TEXT, -- 该幕冲突
    resolution TEXT, -- 该幕解决
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (outline_id) REFERENCES plot_outlines(id) ON DELETE CASCADE
);

-- 剧情场景表
CREATE TABLE plot_scenes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- PostgreSQL
    -- id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()), -- MySQL
    act_id UUID NOT NULL,
    scene_number INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    purpose TEXT, -- 场景目的
    location VARCHAR(200), -- 地点
    time_period VARCHAR(100), -- 时间
    characters JSONB DEFAULT '[]', -- 参与角色ID数组
    mood VARCHAR(50), -- 情绪氛围
    conflicts JSONB DEFAULT '[]', -- 冲突数组
    outcomes JSONB DEFAULT '[]', -- 结果数组
    notes TEXT, -- 备注
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (act_id) REFERENCES plot_acts(id) ON DELETE CASCADE
);

-- 章节表
CREATE TABLE chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- PostgreSQL
    -- id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()), -- MySQL
    project_id UUID NOT NULL,
    chapter_number INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    summary TEXT,
    content TEXT,
    word_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'planned', -- planned, outlined, drafted, revised, completed
    scene_id UUID, -- 关联的场景ID
    generation_settings JSONB, -- 生成设置
    version INTEGER DEFAULT 1, -- 版本号
    notes TEXT, -- 创作备注
    publish_at TIMESTAMPTZ, -- 发布时间
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (scene_id) REFERENCES plot_scenes(id) ON DELETE SET NULL,
    UNIQUE(project_id, chapter_number)
);

-- 章节版本历史表
CREATE TABLE chapter_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- PostgreSQL
    -- id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()), -- MySQL
    chapter_id UUID NOT NULL,
    version INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    word_count INTEGER DEFAULT 0,
    changes_summary TEXT, -- 修改摘要
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
    UNIQUE(chapter_id, version)
);

-- 生成任务表
CREATE TABLE generation_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- PostgreSQL
    -- id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()), -- MySQL
    project_id UUID,
    type VARCHAR(50) NOT NULL, -- chapter, scene, character_description, dialogue, revision
    status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed, cancelled
    priority INTEGER DEFAULT 5, -- 1-10, 优先级
    input_data JSONB, -- 输入数据
    output_data JSONB, -- 输出数据
    error_message TEXT, -- 错误信息
    progress INTEGER DEFAULT 0, -- 0-100, 进度百分比
    estimated_completion TIMESTAMPTZ, -- 预计完成时间
    started_at TIMESTAMPTZ, -- 开始时间
    completed_at TIMESTAMPTZ, -- 完成时间
    user_id UUID, -- 创建用户
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 内容审查表
CREATE TABLE content_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- PostgreSQL
    -- id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()), -- MySQL
    content_id UUID NOT NULL, -- 可以是 chapter_id 或 character_id
    content_type VARCHAR(20) NOT NULL, -- chapter, character, plot
    review_type VARCHAR(30) NOT NULL, -- consistency, quality, plot_holes, character_development
    status VARCHAR(20) DEFAULT 'pending', -- pending, reviewed, approved, rejected
    score INTEGER, -- 1-10, 评分
    issues JSONB DEFAULT '[]', -- 问题数组
    suggestions JSONB DEFAULT '[]', -- 建议数组
    reviewer VARCHAR(20) DEFAULT 'ai', -- ai, user
    reviewer_id UUID, -- 审查者ID
    notes TEXT, -- 审查备注
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 知识库表
CREATE TABLE knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- PostgreSQL
    -- id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()), -- MySQL
    project_id UUID NOT NULL,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(50), -- reference_book, character_notes, world_building, research, style_guide
    content TEXT,
    summary TEXT, -- 内容摘要
    tags JSONB DEFAULT '[]', -- 标签数组
    searchable BOOLEAN DEFAULT TRUE,
    file_path TEXT, -- 文件路径 (如果是上传的文件)
    file_size INTEGER, -- 文件大小
    metadata JSONB DEFAULT '{}', -- 元数据
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 风格模板表
CREATE TABLE style_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- PostgreSQL
    -- id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()), -- MySQL
    name VARCHAR(100) NOT NULL,
    description TEXT,
    sample_text TEXT NOT NULL, -- 样本文本
    characteristics JSONB DEFAULT '{}', -- 风格特征
    genre_tags JSONB DEFAULT '[]', -- 适用类型标签
    is_public BOOLEAN DEFAULT FALSE, -- 是否公开
    usage_count INTEGER DEFAULT 0, -- 使用次数
    rating DECIMAL(3,2) DEFAULT 0.00, -- 评分 0.00-10.00
    creator_id UUID, -- 创建者
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 用户收藏表
CREATE TABLE user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- PostgreSQL
    -- id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()), -- MySQL
    user_id UUID NOT NULL,
    item_type VARCHAR(20) NOT NULL, -- project, character, template
    item_id UUID NOT NULL,
    notes TEXT, -- 收藏备注
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, item_type, item_id)
);

-- 访问统计表
CREATE TABLE access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- PostgreSQL
    -- id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()), -- MySQL
    user_id UUID,
    project_id UUID,
    action VARCHAR(50) NOT NULL, -- view, create, edit, delete, generate
    resource_type VARCHAR(20), -- project, chapter, character
    resource_id UUID,
    ip_address INET, -- PostgreSQL 使用 INET, MySQL 使用 VARCHAR(45)
    user_agent TEXT,
    duration INTEGER, -- 持续时间(秒)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
);

-- 创建索引
-- 用户表索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_provider ON users(provider, provider_id);

-- 项目表索引
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_genre ON projects(genre);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

-- 角色表索引
CREATE INDEX idx_characters_project_id ON characters(project_id);
CREATE INDEX idx_characters_role ON characters(role);
CREATE INDEX idx_characters_name ON characters(project_id, name);

-- 章节表索引
CREATE INDEX idx_chapters_project_id ON chapters(project_id);
CREATE INDEX idx_chapters_number ON chapters(project_id, chapter_number);
CREATE INDEX idx_chapters_status ON chapters(status);
CREATE INDEX idx_chapters_scene_id ON chapters(scene_id);

-- 生成任务表索引
CREATE INDEX idx_generation_tasks_status ON generation_tasks(status);
CREATE INDEX idx_generation_tasks_user_id ON generation_tasks(user_id);
CREATE INDEX idx_generation_tasks_project_id ON generation_tasks(project_id);
CREATE INDEX idx_generation_tasks_type ON generation_tasks(type);

-- 知识库表索引
CREATE INDEX idx_knowledge_base_project_id ON knowledge_base(project_id);
CREATE INDEX idx_knowledge_base_type ON knowledge_base(type);
CREATE INDEX idx_knowledge_base_searchable ON knowledge_base(searchable) WHERE searchable = TRUE;

-- 审查表索引
CREATE INDEX idx_content_reviews_content ON content_reviews(content_type, content_id);
CREATE INDEX idx_content_reviews_status ON content_reviews(status);

-- 访问日志索引
CREATE INDEX idx_access_logs_user_id ON access_logs(user_id);
CREATE INDEX idx_access_logs_project_id ON access_logs(project_id);
CREATE INDEX idx_access_logs_created_at ON access_logs(created_at DESC);

-- 全文搜索索引 (PostgreSQL)
-- CREATE INDEX idx_projects_search ON projects USING gin(to_tsvector('chinese', title || ' ' || coalesce(description, '')));
-- CREATE INDEX idx_characters_search ON characters USING gin(to_tsvector('chinese', name || ' ' || coalesce(background, '')));
-- CREATE INDEX idx_knowledge_base_search ON knowledge_base USING gin(to_tsvector('chinese', name || ' ' || coalesce(content, '')));

-- 触发器函数 (PostgreSQL)
-- 自动更新 updated_at 字段
/*
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表添加触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_characters_updated_at BEFORE UPDATE ON characters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chapters_updated_at BEFORE UPDATE ON chapters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_world_settings_updated_at BEFORE UPDATE ON world_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_plot_outlines_updated_at BEFORE UPDATE ON plot_outlines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
*/

-- 初始数据
-- 插入一些基础的风格模板
INSERT INTO style_templates (name, description, sample_text, characteristics, genre_tags, is_public) VALUES
('古风武侠', '古典武侠小说风格，文雅含蓄，意境深远', '月夜如水，江湖如梦。剑客独立于山巅，望着远方的灯火，心中涌起无限感慨。', '{"vocabulary_level": "complex", "sentence_structure": "varied", "descriptive_style": "rich", "dialogue_style": "period_appropriate", "narrative_voice": "omniscient"}', '["武侠", "古风", "仙侠"]', TRUE),
('现代都市', '现代都市小说风格，语言简洁，节奏明快', '街头的霓虹灯闪烁着五彩的光芒，林城快步走过人群，手机突然响起。', '{"vocabulary_level": "moderate", "sentence_structure": "simple", "descriptive_style": "minimal", "dialogue_style": "casual", "narrative_voice": "limited"}', '["都市", "现代", "职场"]', TRUE),
('悬疑推理', '悬疑推理小说风格，氛围紧张，逻辑严密', '房间里弥漫着淡淡的血腥味，探长皱起眉头，仔细观察着现场的每一个细节。', '{"vocabulary_level": "moderate", "sentence_structure": "varied", "descriptive_style": "detailed", "dialogue_style": "formal", "narrative_voice": "detached"}', '["悬疑", "推理", "犯罪"]', TRUE),
('轻松幽默', '轻松幽默风格，语言诙谐，气氛轻松', '王小明觉得自己可能是世界上最倒霉的人，刚出门就被鸟粪砸中，这运气也是没谁了。', '{"vocabulary_level": "simple", "sentence_structure": "simple", "descriptive_style": "moderate", "dialogue_style": "casual", "narrative_voice": "intimate"}', '["喜剧", "日常", "轻小说"]', TRUE);

-- 插入示例用户 (仅用于开发测试)
-- INSERT INTO users (email, name, password_hash) VALUES
-- ('admin@example.com', '管理员', '$2b$12$example_hash_here'),
-- ('user@example.com', '测试用户', '$2b$12$example_hash_here');

COMMIT;