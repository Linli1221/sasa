import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 格式化日期
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  }
  
  return dateObj.toLocaleDateString('zh-CN', defaultOptions)
}

// 格式化相对时间
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - dateObj.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutes < 1) return '刚刚'
  if (diffMinutes < 60) return `${diffMinutes}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`
  
  return formatDate(dateObj)
}

// 字数统计
export function countWords(text: string): number {
  if (!text.trim()) return 0
  
  // 中文字符统计
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length
  // 英文单词统计
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length
  // 数字统计
  const numbers = (text.match(/\d+/g) || []).length
  
  return chineseChars + englishWords + numbers
}

// 估算阅读时间（中文每分钟约300字）
export function estimateReadingTime(text: string): number {
  const wordCount = countWords(text)
  return Math.ceil(wordCount / 300)
}

// 生成唯一ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// 生成UUID（简化版）
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// 深拷贝
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T
  if (typeof obj === 'object') {
    const clonedObj = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
  return obj
}

// 防抖函数
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | undefined
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// 节流函数
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let lastFunc: NodeJS.Timeout
  let lastRan: number
  
  return function executedFunction(...args: Parameters<T>) {
    if (!lastRan) {
      func(...args)
      lastRan = Date.now()
    } else {
      clearTimeout(lastFunc)
      lastFunc = setTimeout(() => {
        if ((Date.now() - lastRan) >= limit) {
          func(...args)
          lastRan = Date.now()
        }
      }, limit - (Date.now() - lastRan))
    }
  }
}

// 文本截断
export function truncateText(text: string, maxLength: number, suffix = '...'): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - suffix.length) + suffix
}

// 高亮搜索关键词
export function highlightText(text: string, keyword: string): string {
  if (!keyword.trim()) return text
  
  const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

// 验证邮箱
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 验证中文姓名
export function isValidChineseName(name: string): boolean {
  const chineseNameRegex = /^[\u4e00-\u9fa5]{2,10}$/
  return chineseNameRegex.test(name)
}

// 格式化文件大小
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 数组随机排序
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

// 数组去重
export function uniqueArray<T>(array: T[], key?: keyof T): T[] {
  if (!key) {
    return [...new Set(array)]
  }
  
  const seen = new Set()
  return array.filter(item => {
    const value = item[key]
    if (seen.has(value)) {
      return false
    }
    seen.add(value)
    return true
  })
}

// 数组分组
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const group = String(item[key])
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

// 计算进度百分比
export function calculateProgress(current: number, total: number): number {
  if (total === 0) return 0
  return Math.min(Math.max((current / total) * 100, 0), 100)
}

// 格式化数字
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('zh-CN').format(num)
}

// 颜色工具
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

// 本地存储工具
export const storage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    if (typeof window === 'undefined') return defaultValue || null
    
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue || null
    } catch (error) {
      console.error(`Error getting item from localStorage:`, error)
      return defaultValue || null
    }
  },
  
  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return
    
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error setting item to localStorage:`, error)
    }
  },
  
  remove: (key: string): void => {
    if (typeof window === 'undefined') return
    
    try {
      window.localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing item from localStorage:`, error)
    }
  },
  
  clear: (): void => {
    if (typeof window === 'undefined') return
    
    try {
      window.localStorage.clear()
    } catch (error) {
      console.error(`Error clearing localStorage:`, error)
    }
  }
}

// 文本处理工具
export const textUtils = {
  // 提取文本摘要
  extractSummary: (text: string, maxLength: number = 100): string => {
    const sentences = text.split(/[。！？.!?]/).filter(s => s.trim())
    let summary = ''
    
    for (const sentence of sentences) {
      if ((summary + sentence).length > maxLength) break
      summary += sentence + '。'
    }
    
    return summary || truncateText(text, maxLength)
  },
  
  // 提取关键词
  extractKeywords: (text: string, maxCount: number = 10): string[] => {
    // 简单的关键词提取逻辑
    const words = text
      .replace(/[^\u4e00-\u9fa5a-zA-Z\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 1)
    
    const wordCount = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, maxCount)
      .map(([word]) => word)
  },
  
  // 文本清理
  cleanText: (text: string): string => {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim()
  },
  
  // 段落分割
  splitParagraphs: (text: string): string[] => {
    return text
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(p => p.length > 0)
  }
}

// 验证工具
export const validators = {
  required: (value: any): boolean => {
    return value !== null && value !== undefined && value !== ''
  },
  
  minLength: (value: string, min: number): boolean => {
    return value.length >= min
  },
  
  maxLength: (value: string, max: number): boolean => {
    return value.length <= max
  },
  
  email: isValidEmail,
  
  chineseName: isValidChineseName,
  
  positiveNumber: (value: number): boolean => {
    return value > 0
  },
  
  range: (value: number, min: number, max: number): boolean => {
    return value >= min && value <= max
  }
}

// 常用常量
export const CONSTANTS = {
  GENRES: [
    '玄幻', '修真', '都市', '历史', '军事', '游戏', '科幻',
    '悬疑', '武侠', '仙侠', '言情', '青春', '职场', '重生',
    '穿越', '系统', '末世', '无限流', '二次元'
  ],
  
  CHARACTER_ROLES: [
    'protagonist', 'antagonist', 'supporting', 'minor'
  ],
  
  CHAPTER_STATUSES: [
    'planned', 'outlined', 'drafted', 'revised', 'completed'
  ],
  
  PROJECT_STATUSES: [
    'draft', 'writing', 'completed', 'published'
  ],
  
  GENERATION_PRESETS: [
    'fast_draft', 'detailed_narrative', 'dialogue_heavy', 'atmospheric'
  ]
} as const

export type Genre = typeof CONSTANTS.GENRES[number]
export type CharacterRole = typeof CONSTANTS.CHARACTER_ROLES[number]
export type ChapterStatus = typeof CONSTANTS.CHAPTER_STATUSES[number]
export type ProjectStatus = typeof CONSTANTS.PROJECT_STATUSES[number]
export type GenerationPreset = typeof CONSTANTS.GENERATION_PRESETS[number]