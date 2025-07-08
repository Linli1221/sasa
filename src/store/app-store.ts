import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { 
  User, 
  Project, 
  Character, 
  Chapter, 
  PlotOutline, 
  WorldSetting, 
  KnowledgeBase,
  GenerationTask,
  ContentReview
} from '@/types'

interface AppState {
  // 用户状态
  user: User | null
  isAuthenticated: boolean
  
  // 当前项目状态
  currentProject: Project | null
  projects: Project[]
  
  // 项目相关数据
  characters: Character[]
  chapters: Chapter[]
  plotOutline: PlotOutline | null
  worldSetting: WorldSetting | null
  knowledgeBase: KnowledgeBase[]
  generationTasks: GenerationTask[]
  contentReviews: ContentReview[]
  
  // UI 状态
  isLoading: boolean
  error: string | null
  sidebarOpen: boolean
  activeTab: string
  
  // 编辑器状态
  editorContent: string
  editorMode: 'write' | 'edit' | 'review'
  unsavedChanges: boolean
}

interface AppActions {
  // 用户操作
  setUser: (user: User | null) => void
  logout: () => void
  
  // 项目操作
  setCurrentProject: (project: Project | null) => void
  setProjects: (projects: Project[]) => void
  addProject: (project: Project) => void
  updateProject: (projectId: string, updates: Partial<Project>) => void
  removeProject: (projectId: string) => void
  
  // 角色操作
  setCharacters: (characters: Character[]) => void
  addCharacter: (character: Character) => void
  updateCharacter: (characterId: string, updates: Partial<Character>) => void
  removeCharacter: (characterId: string) => void
  
  // 章节操作
  setChapters: (chapters: Chapter[]) => void
  addChapter: (chapter: Chapter) => void
  updateChapter: (chapterId: string, updates: Partial<Chapter>) => void
  removeChapter: (chapterId: string) => void
  reorderChapters: (startIndex: number, endIndex: number) => void
  
  // 剧情大纲操作
  setPlotOutline: (outline: PlotOutline | null) => void
  updatePlotOutline: (updates: Partial<PlotOutline>) => void
  
  // 世界设定操作
  setWorldSetting: (setting: WorldSetting | null) => void
  updateWorldSetting: (updates: Partial<WorldSetting>) => void
  
  // 知识库操作
  setKnowledgeBase: (entries: KnowledgeBase[]) => void
  addKnowledgeEntry: (entry: KnowledgeBase) => void
  updateKnowledgeEntry: (entryId: string, updates: Partial<KnowledgeBase>) => void
  removeKnowledgeEntry: (entryId: string) => void
  
  // 生成任务操作
  setGenerationTasks: (tasks: GenerationTask[]) => void
  addGenerationTask: (task: GenerationTask) => void
  updateGenerationTask: (taskId: string, updates: Partial<GenerationTask>) => void
  removeGenerationTask: (taskId: string) => void
  
  // 内容审查操作
  setContentReviews: (reviews: ContentReview[]) => void
  addContentReview: (review: ContentReview) => void
  updateContentReview: (reviewId: string, updates: Partial<ContentReview>) => void
  removeContentReview: (reviewId: string) => void
  
  // UI 操作
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSidebarOpen: (open: boolean) => void
  setActiveTab: (tab: string) => void
  
  // 编辑器操作
  setEditorContent: (content: string) => void
  setEditorMode: (mode: 'write' | 'edit' | 'review') => void
  setUnsavedChanges: (hasChanges: boolean) => void
  
  // 重置操作
  resetProjectData: () => void
  resetAll: () => void
}

type AppStore = AppState & AppActions

const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  currentProject: null,
  projects: [],
  characters: [],
  chapters: [],
  plotOutline: null,
  worldSetting: null,
  knowledgeBase: [],
  generationTasks: [],
  contentReviews: [],
  isLoading: false,
  error: null,
  sidebarOpen: true,
  activeTab: 'overview',
  editorContent: '',
  editorMode: 'write',
  unsavedChanges: false,
}

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // 用户操作
        setUser: (user) => set({ user, isAuthenticated: !!user }),
        logout: () => set({ 
          user: null, 
          isAuthenticated: false,
          currentProject: null,
          projects: [],
          ...initialState
        }),
        
        // 项目操作
        setCurrentProject: (project) => set({ currentProject: project }),
        setProjects: (projects) => set({ projects }),
        addProject: (project) => set((state) => ({ 
          projects: [project, ...state.projects] 
        })),
        updateProject: (projectId, updates) => set((state) => ({
          projects: state.projects.map(p => 
            p.id === projectId ? { ...p, ...updates } : p
          ),
          currentProject: state.currentProject?.id === projectId 
            ? { ...state.currentProject, ...updates }
            : state.currentProject
        })),
        removeProject: (projectId) => set((state) => ({
          projects: state.projects.filter(p => p.id !== projectId),
          currentProject: state.currentProject?.id === projectId 
            ? null 
            : state.currentProject
        })),
        
        // 角色操作
        setCharacters: (characters) => set({ characters }),
        addCharacter: (character) => set((state) => ({ 
          characters: [...state.characters, character] 
        })),
        updateCharacter: (characterId, updates) => set((state) => ({
          characters: state.characters.map(c => 
            c.id === characterId ? { ...c, ...updates } : c
          )
        })),
        removeCharacter: (characterId) => set((state) => ({
          characters: state.characters.filter(c => c.id !== characterId)
        })),
        
        // 章节操作
        setChapters: (chapters) => set({ chapters }),
        addChapter: (chapter) => set((state) => ({ 
          chapters: [...state.chapters, chapter].sort((a, b) => a.chapter_number - b.chapter_number)
        })),
        updateChapter: (chapterId, updates) => set((state) => ({
          chapters: state.chapters.map(c => 
            c.id === chapterId ? { ...c, ...updates } : c
          )
        })),
        removeChapter: (chapterId) => set((state) => ({
          chapters: state.chapters.filter(c => c.id !== chapterId)
        })),
        reorderChapters: (startIndex, endIndex) => set((state) => {
          const newChapters = [...state.chapters]
          const [reorderedChapter] = newChapters.splice(startIndex, 1)
          newChapters.splice(endIndex, 0, reorderedChapter)
          
          // 重新分配章节号
          const updatedChapters = newChapters.map((chapter, index) => ({
            ...chapter,
            chapter_number: index + 1
          }))
          
          return { chapters: updatedChapters }
        }),
        
        // 剧情大纲操作
        setPlotOutline: (outline) => set({ plotOutline: outline }),
        updatePlotOutline: (updates) => set((state) => ({
          plotOutline: state.plotOutline 
            ? { ...state.plotOutline, ...updates }
            : null
        })),
        
        // 世界设定操作
        setWorldSetting: (setting) => set({ worldSetting: setting }),
        updateWorldSetting: (updates) => set((state) => ({
          worldSetting: state.worldSetting 
            ? { ...state.worldSetting, ...updates }
            : null
        })),
        
        // 知识库操作
        setKnowledgeBase: (entries) => set({ knowledgeBase: entries }),
        addKnowledgeEntry: (entry) => set((state) => ({ 
          knowledgeBase: [entry, ...state.knowledgeBase] 
        })),
        updateKnowledgeEntry: (entryId, updates) => set((state) => ({
          knowledgeBase: state.knowledgeBase.map(e => 
            e.id === entryId ? { ...e, ...updates } : e
          )
        })),
        removeKnowledgeEntry: (entryId) => set((state) => ({
          knowledgeBase: state.knowledgeBase.filter(e => e.id !== entryId)
        })),
        
        // 生成任务操作
        setGenerationTasks: (tasks) => set({ generationTasks: tasks }),
        addGenerationTask: (task) => set((state) => ({ 
          generationTasks: [task, ...state.generationTasks] 
        })),
        updateGenerationTask: (taskId, updates) => set((state) => ({
          generationTasks: state.generationTasks.map(t => 
            t.id === taskId ? { ...t, ...updates } : t
          )
        })),
        removeGenerationTask: (taskId) => set((state) => ({
          generationTasks: state.generationTasks.filter(t => t.id !== taskId)
        })),
        
        // 内容审查操作
        setContentReviews: (reviews) => set({ contentReviews: reviews }),
        addContentReview: (review) => set((state) => ({ 
          contentReviews: [review, ...state.contentReviews] 
        })),
        updateContentReview: (reviewId, updates) => set((state) => ({
          contentReviews: state.contentReviews.map(r => 
            r.id === reviewId ? { ...r, ...updates } : r
          )
        })),
        removeContentReview: (reviewId) => set((state) => ({
          contentReviews: state.contentReviews.filter(r => r.id !== reviewId)
        })),
        
        // UI 操作
        setLoading: (loading) => set({ isLoading: loading }),
        setError: (error) => set({ error }),
        setSidebarOpen: (open) => set({ sidebarOpen: open }),
        setActiveTab: (tab) => set({ activeTab: tab }),
        
        // 编辑器操作
        setEditorContent: (content) => set({ editorContent: content }),
        setEditorMode: (mode) => set({ editorMode: mode }),
        setUnsavedChanges: (hasChanges) => set({ unsavedChanges: hasChanges }),
        
        // 重置操作
        resetProjectData: () => set({
          characters: [],
          chapters: [],
          plotOutline: null,
          worldSetting: null,
          knowledgeBase: [],
          generationTasks: [],
          contentReviews: [],
          editorContent: '',
          unsavedChanges: false,
        }),
        resetAll: () => set(initialState),
      }),
      {
        name: 'novel-generator-store',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          projects: state.projects,
          sidebarOpen: state.sidebarOpen,
          activeTab: state.activeTab,
        }),
      }
    )
  )
)

// 选择器函数，用于提取特定的状态片段
export const selectUser = (state: AppStore) => state.user
export const selectCurrentProject = (state: AppStore) => state.currentProject
export const selectProjects = (state: AppStore) => state.projects
export const selectCharacters = (state: AppStore) => state.characters
export const selectChapters = (state: AppStore) => state.chapters
export const selectPlotOutline = (state: AppStore) => state.plotOutline
export const selectWorldSetting = (state: AppStore) => state.worldSetting
export const selectKnowledgeBase = (state: AppStore) => state.knowledgeBase
export const selectGenerationTasks = (state: AppStore) => state.generationTasks
export const selectContentReviews = (state: AppStore) => state.contentReviews
export const selectIsLoading = (state: AppStore) => state.isLoading
export const selectError = (state: AppStore) => state.error
export const selectSidebarOpen = (state: AppStore) => state.sidebarOpen
export const selectActiveTab = (state: AppStore) => state.activeTab
export const selectEditorState = (state: AppStore) => ({
  content: state.editorContent,
  mode: state.editorMode,
  unsavedChanges: state.unsavedChanges,
})