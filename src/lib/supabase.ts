import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 数据库表名常量
export const TABLES = {
  USERS: 'users',
  PROJECTS: 'projects',
  WORLD_SETTINGS: 'world_settings',
  CHARACTERS: 'characters',
  CHARACTER_RELATIONSHIPS: 'character_relationships',
  PLOT_OUTLINES: 'plot_outlines',
  PLOT_ACTS: 'plot_acts',
  PLOT_SCENES: 'plot_scenes',
  PLOT_CONFLICTS: 'plot_conflicts',
  CHAPTERS: 'chapters',
  GENERATION_TASKS: 'generation_tasks',
  CONTENT_REVIEWS: 'content_reviews',
  KNOWLEDGE_BASE: 'knowledge_base',
  STYLE_TEMPLATES: 'style_templates',
} as const

// 数据库操作辅助函数
export class DatabaseService {
  // 用户相关
  static async getUserById(id: string) {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  static async createUser(userData: any) {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .insert(userData)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // 项目相关
  static async getProjectsByUserId(userId: string) {
    const { data, error } = await supabase
      .from(TABLES.PROJECTS)
      .select(`
        *,
        world_settings(*),
        characters(*),
        chapters(*)
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  static async getProjectById(id: string) {
    const { data, error } = await supabase
      .from(TABLES.PROJECTS)
      .select(`
        *,
        world_settings(*),
        characters(*),
        plot_outlines(*),
        chapters(*),
        knowledge_base(*)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  static async createProject(projectData: any) {
    const { data, error } = await supabase
      .from(TABLES.PROJECTS)
      .insert(projectData)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async updateProject(id: string, updates: any) {
    const { data, error } = await supabase
      .from(TABLES.PROJECTS)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async deleteProject(id: string) {
    const { error } = await supabase
      .from(TABLES.PROJECTS)
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  // 世界设定相关
  static async createWorldSetting(worldData: any) {
    const { data, error } = await supabase
      .from(TABLES.WORLD_SETTINGS)
      .insert(worldData)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async updateWorldSetting(id: string, updates: any) {
    const { data, error } = await supabase
      .from(TABLES.WORLD_SETTINGS)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // 角色相关
  static async getCharactersByProjectId(projectId: string) {
    const { data, error } = await supabase
      .from(TABLES.CHARACTERS)
      .select(`
        *,
        relationships:character_relationships(*)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  static async createCharacter(characterData: any) {
    const { data, error } = await supabase
      .from(TABLES.CHARACTERS)
      .insert(characterData)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async updateCharacter(id: string, updates: any) {
    const { data, error } = await supabase
      .from(TABLES.CHARACTERS)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async deleteCharacter(id: string) {
    const { error } = await supabase
      .from(TABLES.CHARACTERS)
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  // 章节相关
  static async getChaptersByProjectId(projectId: string) {
    const { data, error } = await supabase
      .from(TABLES.CHAPTERS)
      .select('*')
      .eq('project_id', projectId)
      .order('chapter_number', { ascending: true })
    
    if (error) throw error
    return data
  }

  static async createChapter(chapterData: any) {
    const { data, error } = await supabase
      .from(TABLES.CHAPTERS)
      .insert(chapterData)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async updateChapter(id: string, updates: any) {
    const { data, error } = await supabase
      .from(TABLES.CHAPTERS)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async deleteChapter(id: string) {
    const { error } = await supabase
      .from(TABLES.CHAPTERS)
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  // 生成任务相关
  static async createGenerationTask(taskData: any) {
    const { data, error } = await supabase
      .from(TABLES.GENERATION_TASKS)
      .insert(taskData)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async updateGenerationTask(id: string, updates: any) {
    const { data, error } = await supabase
      .from(TABLES.GENERATION_TASKS)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async getGenerationTasksByStatus(status: string) {
    const { data, error } = await supabase
      .from(TABLES.GENERATION_TASKS)
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data
  }

  // 知识库相关
  static async getKnowledgeBaseByProjectId(projectId: string) {
    const { data, error } = await supabase
      .from(TABLES.KNOWLEDGE_BASE)
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  static async createKnowledgeEntry(entryData: any) {
    const { data, error } = await supabase
      .from(TABLES.KNOWLEDGE_BASE)
      .insert(entryData)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async searchKnowledgeBase(projectId: string, query: string) {
    const { data, error } = await supabase
      .from(TABLES.KNOWLEDGE_BASE)
      .select('*')
      .eq('project_id', projectId)
      .eq('searchable', true)
      .textSearch('content', query)
    
    if (error) throw error
    return data
  }
}