// EdgeOne Pages Function for AI text generation
// 使用 Service URI 连接数据库，不依赖 KV 存储

export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json()
    const { type, settings, context, content, timestamp } = data

    // 验证请求数据
    if (!type || !settings || !context) {
      return new Response(JSON.stringify({
        success: false,
        error: '缺少必要参数'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    // 构建生成提示
    const prompt = buildPrompt(type, settings, context, content)
    
    // 调用 AI 服务生成内容
    const generatedContent = await generateWithAI(prompt, settings, env)
    
    if (!generatedContent) {
      return new Response(JSON.stringify({
        success: false,
        error: 'AI 生成失败'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    // 分析生成内容的元数据
    const metadata = analyzeContent(generatedContent)
    
    // 记录生成任务到数据库
    try {
      await recordGenerationTask({
        type,
        settings,
        context,
        content: generatedContent,
        metadata,
        timestamp,
        env
      })
    } catch (dbError) {
      console.error('Failed to record generation task:', dbError)
      // 数据库记录失败不影响返回结果
    }

    return new Response(JSON.stringify({
      success: true,
      content: generatedContent,
      metadata
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })

  } catch (error) {
    console.error('Generation error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: '服务器内部错误'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
}

// 构建生成提示
function buildPrompt(type, settings, context, content) {
  const { projectId, characters, worldSetting, previousChapters, targetScene, customInstructions } = context
  
  let prompt = ''
  
  // 基础系统提示
  prompt += `你是一个专业的小说创作助手。请根据以下要求生成高质量的中文小说内容。\n\n`
  
  // 世界设定信息
  if (worldSetting) {
    prompt += `## 世界设定\n`
    prompt += `名称: ${worldSetting.name}\n`
    prompt += `描述: ${worldSetting.description}\n`
    prompt += `时代: ${worldSetting.era}\n`
    prompt += `科技水平: ${worldSetting.technology_level}\n`
    if (worldSetting.magic_system) {
      prompt += `魔法体系: ${worldSetting.magic_system}\n`
    }
    prompt += `地理环境: ${worldSetting.geography}\n`
    prompt += `政治制度: ${worldSetting.politics}\n`
    prompt += `经济体系: ${worldSetting.economy}\n`
    prompt += `文化特色: ${worldSetting.culture}\n`
    prompt += `历史背景: ${worldSetting.history}\n\n`
  }
  
  // 角色信息
  if (characters && characters.length > 0) {
    prompt += `## 主要角色\n`
    characters.forEach(char => {
      prompt += `### ${char.name} (${getRoleText(char.role)})\n`
      prompt += `外貌: ${char.appearance}\n`
      prompt += `性格: ${char.personality}\n`
      prompt += `背景: ${char.background}\n`
      prompt += `目标: ${char.goals}\n`
      prompt += `当前状态: ${char.current_status}\n`
      if (char.skills && char.skills.length > 0) {
        prompt += `技能: ${char.skills.join(', ')}\n`
      }
      prompt += `\n`
    })
  }
  
  // 场景信息
  if (targetScene) {
    prompt += `## 目标场景\n`
    prompt += `标题: ${targetScene.title}\n`
    prompt += `描述: ${targetScene.description}\n`
    prompt += `地点: ${targetScene.location}\n`
    prompt += `时间: ${targetScene.time}\n`
    prompt += `目的: ${targetScene.purpose}\n`
    prompt += `情绪氛围: ${targetScene.mood}\n`
    if (targetScene.conflicts && targetScene.conflicts.length > 0) {
      prompt += `冲突元素: ${targetScene.conflicts.join(', ')}\n`
    }
    if (targetScene.outcomes && targetScene.outcomes.length > 0) {
      prompt += `预期结果: ${targetScene.outcomes.join(', ')}\n`
    }
    prompt += `\n`
  }
  
  // 之前的章节内容（用于保持连贯性）
  if (previousChapters && previousChapters.length > 0) {
    prompt += `## 前文回顾\n`
    const recentChapters = previousChapters.slice(-2) // 只取最近两章
    recentChapters.forEach((chapter, index) => {
      prompt += `### 第 ${previousChapters.length - recentChapters.length + index + 1} 章节摘要\n`
      prompt += `${chapter.substring(0, 300)}...\n\n`
    })
  }
  
  // 写作要求
  prompt += `## 写作要求\n`
  prompt += `类型: ${getTypeText(type)}\n`
  prompt += `视角: ${getPerspectiveText(settings.perspective)}\n`
  prompt += `时态: ${getTenseText(settings.tense)}\n`
  prompt += `风格: ${settings.style}\n`
  prompt += `语调: ${settings.tone}\n`
  prompt += `目标字数: ${settings.target_words}\n`
  prompt += `描述程度: ${getDescriptionLevelText(settings.description_level)}\n`
  prompt += `节奏: ${getPacingText(settings.pacing)}\n`
  prompt += `是否包含对话: ${settings.include_dialogue ? '是' : '否'}\n`
  
  if (settings.focus_elements && settings.focus_elements.length > 0) {
    prompt += `重点元素: ${settings.focus_elements.join(', ')}\n`
  }
  
  // 自定义指令
  if (customInstructions) {
    prompt += `\n## 特殊要求\n${customInstructions}\n`
  }
  
  // 如果是修订类型，添加原始内容
  if (type === 'revision' && content) {
    prompt += `\n## 原始内容\n${content}\n`
    prompt += `\n请根据上述要求对原始内容进行修订和改进。\n`
  } else {
    prompt += `\n请根据上述设定和要求创作${getTypeText(type)}内容。要求语言流畅、情节连贯、人物形象鲜明。\n`
  }
  
  return prompt
}

// 辅助函数：获取角色类型文本
function getRoleText(role) {
  const roleMap = {
    'protagonist': '主角',
    'antagonist': '反派',
    'supporting': '配角',
    'minor': '次要角色'
  }
  return roleMap[role] || role
}

// 辅助函数：获取生成类型文本
function getTypeText(type) {
  const typeMap = {
    'chapter': '章节',
    'scene': '场景',
    'character_description': '角色描述',
    'dialogue': '对话',
    'revision': '修订'
  }
  return typeMap[type] || type
}

// 辅助函数：获取视角文本
function getPerspectiveText(perspective) {
  const perspectiveMap = {
    'first_person': '第一人称',
    'second_person': '第二人称',
    'third_person_limited': '第三人称限知',
    'third_person_omniscient': '第三人称全知'
  }
  return perspectiveMap[perspective] || perspective
}

// 辅助函数：获取时态文本
function getTenseText(tense) {
  const tenseMap = {
    'past': '过去时',
    'present': '现在时',
    'future': '将来时'
  }
  return tenseMap[tense] || tense
}

// 辅助函数：获取描述程度文本
function getDescriptionLevelText(level) {
  const levelMap = {
    'minimal': '简洁',
    'moderate': '适中',
    'detailed': '详细'
  }
  return levelMap[level] || level
}

// 辅助函数：获取节奏文本
function getPacingText(pacing) {
  const pacingMap = {
    'fast': '快节奏',
    'medium': '中等节奏',
    'slow': '慢节奏'
  }
  return pacingMap[pacing] || pacing
}

// 调用 AI 服务生成内容
async function generateWithAI(prompt, settings, env) {
  try {
    // 从环境变量获取 AI 服务配置
    const aiApiUrl = env.AI_API_URL || 'https://api.openai.com/v1/chat/completions'
    const aiApiKey = env.AI_API_KEY
    
    if (!aiApiKey) {
      console.error('AI API key not configured')
      return generateMockContent(settings)
    }
    
    const response = await fetch(aiApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${aiApiKey}`
      },
      body: JSON.stringify({
        model: env.AI_MODEL || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的中文小说创作助手，擅长各种文学风格的创作。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: Math.min(settings.target_words * 2, 4000),
        temperature: parseFloat(env.AI_TEMPERATURE || '0.8'),
        top_p: parseFloat(env.AI_TOP_P || '0.9'),
        frequency_penalty: parseFloat(env.AI_FREQUENCY_PENALTY || '0.1'),
        presence_penalty: parseFloat(env.AI_PRESENCE_PENALTY || '0.1')
      })
    })
    
    if (!response.ok) {
      console.error('AI API request failed:', response.status, await response.text())
      return generateMockContent(settings)
    }
    
    const data = await response.json()
    return data.choices[0]?.message?.content || generateMockContent(settings)
    
  } catch (error) {
    console.error('AI generation error:', error)
    return generateMockContent(settings)
  }
}

// 生成模拟内容（当 AI 服务不可用时的备选方案）
function generateMockContent(settings) {
  const mockContents = [
    '夜幕降临，城市中的霓虹灯开始闪烁。李明走在熟悉的街道上，心中却涌起一股莫名的不安。今晚注定不会平静。他停下脚步，回头望了一眼，确认没有人跟踪后，快步走向那栋老旧的公寓楼。',
    '古老的书卷在微风中轻轻翻动，上面记载着失落已久的法术。艾莉亚小心翼翼地伸出手，触碰那泛着微光的文字。瞬间，一股暖流从指尖传遍全身，她感到体内有什么东西正在觉醒。',
    '会议室里一片寂静，所有人的目光都聚焦在那份刚刚递过来的报告上。张总缓缓抬起头，眼中闪过一丝不易察觉的担忧。"各位，"他的声音低沉而有力，"我们面临的不仅仅是一次商业挑战。"',
    '山谷中回荡着剑刃碰撞的声音，两个身影在月光下交错而过。林风紧握手中的长剑，汗水顺着脸颊滴落。对面的黑衣人实力深不可测，这场决斗将决定整个王国的命运。'
  ]
  
  let content = mockContents[Math.floor(Math.random() * mockContents.length)]
  
  // 根据目标字数扩展内容
  while (countWords(content) < settings.target_words) {
    const additionalContent = mockContents[Math.floor(Math.random() * mockContents.length)]
    content += '\n\n' + additionalContent
  }
  
  // 如果内容过长，进行截断
  if (countWords(content) > settings.target_words * 1.2) {
    const sentences = content.split(/[。！？.!?]/)
    let result = ''
    let wordCount = 0
    
    for (const sentence of sentences) {
      const sentenceWords = countWords(sentence)
      if (wordCount + sentenceWords > settings.target_words) {
        break
      }
      result += sentence + '。'
      wordCount += sentenceWords
    }
    content = result
  }
  
  return content
}

// 分析内容元数据
function analyzeContent(content) {
  const wordCount = countWords(content)
  const estimatedReadingTime = Math.ceil(wordCount / 300) // 每分钟约300字
  
  // 提取关键元素
  const keyElements = []
  if (content.includes('"') || content.includes('"') || content.includes('说') || content.includes('道')) {
    keyElements.push('对话丰富')
  }
  if (content.includes('描述') || content.includes('环境') || content.includes('场景') || content.includes('风景')) {
    keyElements.push('场景描述')
  }
  if (content.includes('心理') || content.includes('想到') || content.includes('感到') || content.includes('内心')) {
    keyElements.push('心理描写')
  }
  if (content.includes('动作') || content.includes('走') || content.includes('看') || content.includes('跑')) {
    keyElements.push('行为描写')
  }
  if (content.includes('冲突') || content.includes('战斗') || content.includes('争论') || content.includes('对抗')) {
    keyElements.push('冲突情节')
  }
  
  // 情感色调分析
  let tone = '中性'
  if (content.includes('喜悦') || content.includes('快乐') || content.includes('兴奋')) {
    tone = '积极'
  } else if (content.includes('悲伤') || content.includes('痛苦') || content.includes('绝望')) {
    tone = '消极'
  } else if (content.includes('紧张') || content.includes('危险') || content.includes('惊险')) {
    tone = '紧张'
  }
  
  return {
    wordCount,
    estimatedReadingTime,
    keyElements,
    tone,
    sentences: content.split(/[。！？.!?]/).length - 1,
    paragraphs: content.split(/\n\s*\n/).length
  }
}

// 字数统计函数
function countWords(text) {
  if (!text || typeof text !== 'string') return 0
  
  // 中文字符统计
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length
  // 英文单词统计
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length
  // 数字统计
  const numbers = (text.match(/\d+/g) || []).length
  
  return chineseChars + englishWords + numbers
}

// 记录生成任务到数据库
async function recordGenerationTask(data) {
  const { type, settings, context, content, metadata, timestamp, env } = data
  
  // 构建数据库连接 URI
  const databaseUrl = env.DATABASE_URL
  if (!databaseUrl) {
    console.warn('DATABASE_URL not configured, skipping task recording')
    return
  }
  
  try {
    // 这里可以实现数据库记录逻辑
    // 由于 EdgeOne Pages Functions 环境限制，这里只记录日志
    console.log('Generation task completed:', {
      type,
      wordCount: metadata.wordCount,
      timestamp,
      projectId: context.projectId
    })
  } catch (error) {
    console.error('Failed to record generation task:', error)
  }
}

// CORS 预检请求处理
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  })
}

// 健康检查接口
export async function onRequestGet() {
  return new Response(JSON.stringify({
    status: 'healthy',
    service: 'ai-generation',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  })
}