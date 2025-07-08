// 应用配置服务 - 统一管理所有配置，避免使用 NEXT_PUBLIC

export interface AppConfig {
  appName: string
  appVersion: string
  appUrl: string
  appEnv: string
  enableRegistration: boolean
  enableSocialLogin: boolean
  enableEmailVerification: boolean
  enableAiGeneration: boolean
}

export interface DatabaseConfig {
  type: 'postgresql' | 'mysql'
  url: string
  poolMax: number
  ssl: boolean
}

export interface RedisConfig {
  url: string
  maxRetries: number
  retryDelay: number
}

export interface AIConfig {
  apiUrl: string
  apiKey: string
  model: string
  temperature: number
  topP: number
  frequencyPenalty: number
  presencePenalty: number
}

export interface SecurityConfig {
  jwtSecret: string
  jwtExpiresIn: string
  sessionSecret: string
  sessionMaxAge: number
  corsOrigin: string
  rateLimitWindowMs: number
  rateLimitMaxRequests: number
}

export interface EmailConfig {
  smtpHost: string
  smtpPort: number
  smtpUser: string
  smtpPass: string
  smtpFrom: string
}

export interface UploadConfig {
  maxSize: number
  uploadDir: string
  allowedTypes: string[]
}

export interface LogConfig {
  level: string
  file: string
}

// 完整配置接口
export interface Config {
  app: AppConfig
  database: DatabaseConfig
  redis: RedisConfig
  ai: AIConfig
  security: SecurityConfig
  email: EmailConfig
  upload: UploadConfig
  log: LogConfig
}

// 配置加载函数 - 仅在服务端使用
export function loadConfig(): Config {
  // 确保只在服务端运行
  if (typeof window !== 'undefined') {
    throw new Error('Config should only be loaded on server side')
  }

  return {
    app: {
      appName: process.env.APP_NAME || 'AI小说生成工具',
      appVersion: process.env.APP_VERSION || '1.0.0',
      appUrl: process.env.APP_URL || 'http://localhost:3000',
      appEnv: process.env.APP_ENV || 'development',
      enableRegistration: process.env.ENABLE_USER_REGISTRATION === 'true',
      enableSocialLogin: process.env.ENABLE_SOCIAL_LOGIN === 'true',
      enableEmailVerification: process.env.ENABLE_EMAIL_VERIFICATION === 'true',
      enableAiGeneration: process.env.ENABLE_AI_GENERATION !== 'false',
    },
    database: {
      type: (process.env.DB_TYPE as 'postgresql' | 'mysql') || 'postgresql',
      url: process.env.DATABASE_URL || '',
      poolMax: parseInt(process.env.DB_POOL_MAX || '20'),
      ssl: process.env.DB_SSL === 'true',
    },
    redis: {
      url: process.env.REDIS_URL || 'redis://localhost:6379/0',
      maxRetries: parseInt(process.env.REDIS_MAX_RETRIES || '3'),
      retryDelay: parseInt(process.env.REDIS_RETRY_DELAY || '100'),
    },
    ai: {
      apiUrl: process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions',
      apiKey: process.env.AI_API_KEY || process.env.OPENAI_API_KEY || '',
      model: process.env.AI_MODEL || 'gpt-3.5-turbo',
      temperature: parseFloat(process.env.AI_TEMPERATURE || '0.8'),
      topP: parseFloat(process.env.AI_TOP_P || '0.9'),
      frequencyPenalty: parseFloat(process.env.AI_FREQUENCY_PENALTY || '0.1'),
      presencePenalty: parseFloat(process.env.AI_PRESENCE_PENALTY || '0.1'),
    },
    security: {
      jwtSecret: process.env.JWT_SECRET || 'your-jwt-secret',
      jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
      sessionSecret: process.env.SESSION_SECRET || 'your-session-secret',
      sessionMaxAge: parseInt(process.env.SESSION_MAX_AGE || '86400000'),
      corsOrigin: process.env.CORS_ORIGIN || '*',
      rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
      rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    },
    email: {
      smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
      smtpPort: parseInt(process.env.SMTP_PORT || '587'),
      smtpUser: process.env.SMTP_USER || '',
      smtpPass: process.env.SMTP_PASS || '',
      smtpFrom: process.env.SMTP_FROM || 'AI小说生成工具 <noreply@example.com>',
    },
    upload: {
      maxSize: parseInt(process.env.UPLOAD_MAX_SIZE || '10485760'), // 10MB
      uploadDir: process.env.UPLOAD_DIR || '/tmp/uploads',
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'text/plain', 'application/pdf'],
    },
    log: {
      level: process.env.LOG_LEVEL || 'info',
      file: process.env.LOG_FILE || './logs/app.log',
    },
  }
}

// 单例配置实例
let configInstance: Config | null = null

export function getConfig(): Config {
  if (!configInstance) {
    configInstance = loadConfig()
  }
  return configInstance
}

// 验证必需的环境变量
export function validateConfig(config: Config): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // 验证数据库配置
  if (!config.database.url) {
    errors.push('DATABASE_URL is required')
  }

  // 验证 JWT 密钥
  if (!config.security.jwtSecret || config.security.jwtSecret === 'your-jwt-secret') {
    errors.push('JWT_SECRET must be set to a secure value')
  }

  // 验证会话密钥
  if (!config.security.sessionSecret || config.security.sessionSecret === 'your-session-secret') {
    errors.push('SESSION_SECRET must be set to a secure value')
  }

  // 验证 AI API 密钥（如果启用了 AI 生成）
  if (config.app.enableAiGeneration && !config.ai.apiKey) {
    errors.push('AI_API_KEY is required when AI generation is enabled')
  }

  // 验证邮件配置（如果启用了邮件验证）
  if (config.app.enableEmailVerification) {
    if (!config.email.smtpUser || !config.email.smtpPass) {
      errors.push('SMTP credentials are required when email verification is enabled')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// 获取安全的公开配置（可传递给前端）
export function getPublicConfig(config: Config): AppConfig {
  return {
    appName: config.app.appName,
    appVersion: config.app.appVersion,
    appUrl: config.app.appUrl,
    appEnv: config.app.appEnv,
    enableRegistration: config.app.enableRegistration,
    enableSocialLogin: config.app.enableSocialLogin,
    enableEmailVerification: config.app.enableEmailVerification,
    enableAiGeneration: config.app.enableAiGeneration,
  }
}

// 配置辅助函数
export class ConfigHelper {
  private static config: Config

  static init(): void {
    this.config = getConfig()
    const validation = validateConfig(this.config)
    
    if (!validation.valid) {
      console.error('Configuration validation failed:')
      validation.errors.forEach(error => console.error(`  - ${error}`))
      
      if (this.config.app.appEnv === 'production') {
        throw new Error('Invalid configuration in production environment')
      } else {
        console.warn('Invalid configuration detected, continuing in development mode')
      }
    }
  }

  static getConfig(): Config {
    if (!this.config) {
      this.init()
    }
    return this.config
  }

  static getPublicConfig(): AppConfig {
    return getPublicConfig(this.getConfig())
  }

  static isDevelopment(): boolean {
    return this.getConfig().app.appEnv === 'development'
  }

  static isProduction(): boolean {
    return this.getConfig().app.appEnv === 'production'
  }

  static isFeatureEnabled(feature: keyof AppConfig): boolean {
    const config = this.getPublicConfig()
    return !!config[feature]
  }

  static getAIConfig(): AIConfig {
    return this.getConfig().ai
  }

  static getDatabaseConfig(): DatabaseConfig {
    return this.getConfig().database
  }

  static getRedisConfig(): RedisConfig {
    return this.getConfig().redis
  }

  static getSecurityConfig(): SecurityConfig {
    return this.getConfig().security
  }

  static getEmailConfig(): EmailConfig {
    return this.getConfig().email
  }

  static getUploadConfig(): UploadConfig {
    return this.getConfig().upload
  }

  static getLogConfig(): LogConfig {
    return this.getConfig().log
  }
}

// 环境变量类型定义
export interface EnvironmentVariables {
  // App
  APP_NAME?: string
  APP_VERSION?: string
  APP_URL?: string
  APP_ENV?: string

  // Database
  DB_TYPE?: string
  DATABASE_URL?: string
  DB_POOL_MAX?: string
  DB_SSL?: string

  // Redis
  REDIS_URL?: string
  REDIS_MAX_RETRIES?: string
  REDIS_RETRY_DELAY?: string

  // AI
  AI_API_URL?: string
  AI_API_KEY?: string
  OPENAI_API_KEY?: string
  AI_MODEL?: string
  AI_TEMPERATURE?: string
  AI_TOP_P?: string
  AI_FREQUENCY_PENALTY?: string
  AI_PRESENCE_PENALTY?: string

  // Security
  JWT_SECRET?: string
  JWT_EXPIRES_IN?: string
  SESSION_SECRET?: string
  SESSION_MAX_AGE?: string
  CORS_ORIGIN?: string
  RATE_LIMIT_WINDOW_MS?: string
  RATE_LIMIT_MAX_REQUESTS?: string

  // Email
  SMTP_HOST?: string
  SMTP_PORT?: string
  SMTP_USER?: string
  SMTP_PASS?: string
  SMTP_FROM?: string

  // Upload
  UPLOAD_MAX_SIZE?: string
  UPLOAD_DIR?: string

  // Logging
  LOG_LEVEL?: string
  LOG_FILE?: string

  // Feature flags
  ENABLE_USER_REGISTRATION?: string
  ENABLE_SOCIAL_LOGIN?: string
  ENABLE_EMAIL_VERIFICATION?: string
  ENABLE_AI_GENERATION?: string
}

export default ConfigHelper