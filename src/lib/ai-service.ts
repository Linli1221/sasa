import type { 
  GenerationSettings, 
  Character, 
  PlotScene, 
  WorldSetting,
  StyleTemplate 
} from '@/types'

export interface GenerationContext {
  projectId: string
  characters: Character[]
  worldSetting?: WorldSetting
  previousChapters?: string[]
  targetScene?: PlotScene
  customInstructions?: string
}

export interface GenerationRequest {
  type: 'chapter' | 'scene' | 'character_description' | 'dialogue' | 'revision'
  settings: GenerationSettings
  context: GenerationContext
  content?: string // 用于修订
}

export interface GenerationResponse {
  success: boolean
  content?: string
  metadata?: {
    wordCount: number
    estimatedReadingTime: number
    keyElements: string[]
  }
  error?: string
}

export interface StyleAnalysis {
  vocabularyLevel: 'simple' | 'moderate' | 'complex'
  sentenceStructure: 'simple' | 'varied' | 'complex'
  descriptiveStyle: 'minimal' | 'balanced' | 'rich'
  dialogueStyle: 'formal' | 'casual' | 'period_appropriate'
  narrativeVoice: 'detached' | 'intimate' | 'omniscient'
  averageSentenceLength: number
  paragraphStructure: string
  commonPhrases: string[]
}

export class AIGenerationService {
  private static apiEndpoint = '/api/ai/generate'
  private static styleEndpoint = '/api/ai/analyze-style'

  // 章节生成
  static async generateChapter(request: GenerationRequest): Promise<GenerationResponse> {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...request,
          timestamp: Date.now(),
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error generating chapter:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  // 场景生成
  static async generateScene(
    scene: PlotScene,
    context: GenerationContext,
    settings: GenerationSettings
  ): Promise<GenerationResponse> {
    const request: GenerationRequest = {
      type: 'scene',
      settings: {
        ...settings,
        focus_elements: [
          scene.purpose,
          scene.mood,
          ...scene.conflicts,
          ...scene.outcomes
        ]
      },
      context: {
        ...context,
        targetScene: scene,
        customInstructions: `
          场景: ${scene.title}
          地点: ${scene.location}
          时间: ${scene.time}
          目的: ${scene.purpose}
          情绪: ${scene.mood}
          冲突: ${scene.conflicts.join(', ')}
          结果: ${scene.outcomes.join(', ')}
          参与角色: ${scene.characters.join(', ')}
        `
      }
    }

    return this.generateChapter(request)
  }

  // 角色描述生成
  static async generateCharacterDescription(
    character: Character,
    context: GenerationContext,
    settings: GenerationSettings
  ): Promise<GenerationResponse> {
    const request: GenerationRequest = {
      type: 'character_description',
      settings: {
        ...settings,
        target_words: Math.min(settings.target_words, 500), // 角色描述通常较短
        focus_elements: [
          'appearance',
          'personality',
          'background',
          'goals',
          'skills'
        ]
      },
      context: {
        ...context,
        customInstructions: `
          角色名称: ${character.name}
          角色定位: ${character.role}
          年龄: ${character.age || '未知'}
          性别: ${character.gender || '未知'}
          外貌: ${character.appearance}
          性格: ${character.personality}
          背景: ${character.background}
          目标: ${character.goals}
          技能: ${character.skills.join(', ')}
          当前状态: ${character.current_status}
        `
      }
    }

    return this.generateChapter(request)
  }

  // 对话生成
  static async generateDialogue(
    participants: Character[],
    situation: string,
    context: GenerationContext,
    settings: GenerationSettings
  ): Promise<GenerationResponse> {
    const request: GenerationRequest = {
      type: 'dialogue',
      settings: {
        ...settings,
        include_dialogue: true,
        target_words: Math.min(settings.target_words, 800), // 对话通常中等长度
        focus_elements: ['character_voice', 'conflict', 'revelation']
      },
      context: {
        ...context,
        customInstructions: `
          对话情况: ${situation}
          参与者: ${participants.map(p => `${p.name} (${p.role})`).join(', ')}
          角色特点: ${participants.map(p => `${p.name}: ${p.personality}`).join('; ')}
        `
      }
    }

    return this.generateChapter(request)
  }

  // 内容修订
  static async reviseContent(
    originalContent: string,
    revisionGoals: string[],
    context: GenerationContext,
    settings: GenerationSettings
  ): Promise<GenerationResponse> {
    const request: GenerationRequest = {
      type: 'revision',
      settings: {
        ...settings,
        focus_elements: revisionGoals
      },
      context: {
        ...context,
        customInstructions: `
          修订目标: ${revisionGoals.join(', ')}
          请基于以下目标对内容进行修订，保持原有的核心情节和人物设定。
        `
      },
      content: originalContent
    }

    return this.generateChapter(request)
  }

  // 风格分析
  static async analyzeStyle(text: string): Promise<StyleAnalysis | null> {
    try {
      const response = await fetch(this.styleEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result.analysis
    } catch (error) {
      console.error('Error analyzing style:', error)
      return null
    }
  }

  // 风格模仿生成
  static async generateWithStyle(
    request: GenerationRequest,
    styleTemplate: StyleTemplate
  ): Promise<GenerationResponse> {
    const enhancedRequest = {
      ...request,
      settings: {
        ...request.settings,
        style: styleTemplate.name
      },
      context: {
        ...request.context,
        customInstructions: `
          ${request.context.customInstructions || ''}
          
          请模仿以下写作风格:
          风格名称: ${styleTemplate.name}
          风格描述: ${styleTemplate.description}
          词汇水平: ${styleTemplate.characteristics.vocabulary_level}
          句式结构: ${styleTemplate.characteristics.sentence_structure}
          描述风格: ${styleTemplate.characteristics.descriptive_style}
          对话风格: ${styleTemplate.characteristics.dialogue_style}
          叙述声音: ${styleTemplate.characteristics.narrative_voice}
          
          参考文本片段:
          ${styleTemplate.sample_text}
        `
      }
    }

    return this.generateChapter(enhancedRequest)
  }

  // 批量生成章节大纲
  static async generateChapterOutlines(
    chapterCount: number,
    plotSummary: string,
    context: GenerationContext
  ): Promise<Array<{ title: string; summary: string; keyEvents: string[] }>> {
    try {
      const response = await fetch('/api/ai/generate-outlines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chapterCount,
          plotSummary,
          context,
          timestamp: Date.now(),
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result.outlines || []
    } catch (error) {
      console.error('Error generating chapter outlines:', error)
      return []
    }
  }

  // 内容一致性检查
  static async checkConsistency(
    content: string,
    context: GenerationContext
  ): Promise<{
    issues: Array<{
      type: string
      description: string
      suggestions: string[]
    }>
    score: number
  }> {
    try {
      const response = await fetch('/api/ai/check-consistency', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          context,
          timestamp: Date.now(),
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error checking consistency:', error)
      return {
        issues: [],
        score: 0
      }
    }
  }

  // 生成营销内容
  static async generateMarketingContent(
    projectSummary: string,
    genre: string,
    targetAudience: string
  ): Promise<{
    titles: string[]
    descriptions: string[]
    taglines: string[]
    coverPrompts: string[]
  }> {
    try {
      const response = await fetch('/api/ai/generate-marketing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectSummary,
          genre,
          targetAudience,
          timestamp: Date.now(),
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error generating marketing content:', error)
      return {
        titles: [],
        descriptions: [],
        taglines: [],
        coverPrompts: []
      }
    }
  }
}

// 预设的生成配置
export const GENERATION_PRESETS = {
  FAST_DRAFT: {
    style: 'simple',
    tone: 'neutral',
    perspective: 'third_person_limited' as const,
    tense: 'past' as const,
    include_dialogue: true,
    description_level: 'minimal' as const,
    pacing: 'fast' as const,
    focus_elements: ['plot_advancement', 'action']
  },
  DETAILED_NARRATIVE: {
    style: 'literary',
    tone: 'immersive',
    perspective: 'third_person_omniscient' as const,
    tense: 'past' as const,
    include_dialogue: true,
    description_level: 'detailed' as const,
    pacing: 'medium' as const,
    focus_elements: ['character_development', 'world_building', 'atmosphere']
  },
  DIALOGUE_HEAVY: {
    style: 'conversational',
    tone: 'dynamic',
    perspective: 'third_person_limited' as const,
    tense: 'present' as const,
    include_dialogue: true,
    description_level: 'moderate' as const,
    pacing: 'fast' as const,
    focus_elements: ['character_interaction', 'conflict', 'revelation']
  },
  ATMOSPHERIC: {
    style: 'descriptive',
    tone: 'moody',
    perspective: 'third_person_omniscient' as const,
    tense: 'past' as const,
    include_dialogue: false,
    description_level: 'detailed' as const,
    pacing: 'slow' as const,
    focus_elements: ['setting', 'mood', 'symbolism', 'internal_thoughts']
  }
} as const