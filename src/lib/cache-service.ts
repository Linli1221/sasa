// 统一缓存服务 - 基于 Redis
import { db } from './database'

export class CacheService {
  // 章节内容缓存
  static async setCachedChapter(projectId: string, chapterId: string, content: string): Promise<void> {
    const key = `chapter:${projectId}:${chapterId}`
    await db.setCache(key, content, 3600) // 1小时过期
  }

  static async getCachedChapter(projectId: string, chapterId: string): Promise<string | null> {
    const key = `chapter:${projectId}:${chapterId}`
    return await db.getCache(key)
  }

  static async deleteCachedChapter(projectId: string, chapterId: string): Promise<void> {
    const key = `chapter:${projectId}:${chapterId}`
    await db.deleteCache(key)
  }

  // 生成状态缓存
  static async setGenerationStatus(taskId: string, status: any): Promise<void> {
    const key = `generation:${taskId}`
    await db.setCache(key, status, 7200) // 2小时过期
  }

  static async getGenerationStatus(taskId: string): Promise<any> {
    const key = `generation:${taskId}`
    return await db.getCache(key)
  }

  static async deleteGenerationStatus(taskId: string): Promise<void> {
    const key = `generation:${taskId}`
    await db.deleteCache(key)
  }

  // 用户设置缓存
  static async setUserSettings(userId: string, settings: any): Promise<void> {
    const key = `user_settings:${userId}`
    await db.setCache(key, settings) // 永久缓存，手动删除
  }

  static async getUserSettings(userId: string): Promise<any> {
    const key = `user_settings:${userId}`
    return await db.getCache(key) || {}
  }

  static async deleteUserSettings(userId: string): Promise<void> {
    const key = `user_settings:${userId}`
    await db.deleteCache(key)
  }

  // 项目配置缓存
  static async setProjectConfig(projectId: string, config: any): Promise<void> {
    const key = `project_config:${projectId}`
    await db.setCache(key, config, 1800) // 30分钟过期
  }

  static async getProjectConfig(projectId: string): Promise<any> {
    const key = `project_config:${projectId}`
    return await db.getCache(key)
  }

  static async deleteProjectConfig(projectId: string): Promise<void> {
    const key = `project_config:${projectId}`
    await db.deleteCache(key)
  }

  // AI 生成结果缓存
  static async setCachedGeneration(hash: string, result: any): Promise<void> {
    const key = `ai_gen:${hash}`
    await db.setCache(key, result, 86400) // 24小时过期
  }

  static async getCachedGeneration(hash: string): Promise<any> {
    const key = `ai_gen:${hash}`
    return await db.getCache(key)
  }

  // 会话缓存
  static async setSession(sessionId: string, sessionData: any): Promise<void> {
    const key = `session:${sessionId}`
    await db.setCache(key, sessionData, 86400) // 24小时过期
  }

  static async getSession(sessionId: string): Promise<any> {
    const key = `session:${sessionId}`
    return await db.getCache(key)
  }

  static async deleteSession(sessionId: string): Promise<void> {
    const key = `session:${sessionId}`
    await db.deleteCache(key)
  }

  // 临时数据存储
  static async setTempData(key: string, data: any, expireSeconds: number = 3600): Promise<void> {
    const fullKey = `temp:${key}`
    await db.setCache(fullKey, {
      data,
      timestamp: Date.now(),
      ttl: expireSeconds * 1000
    }, expireSeconds)
  }

  static async getTempData(key: string): Promise<any> {
    const fullKey = `temp:${key}`
    const result = await db.getCache(fullKey)
    
    if (!result) return null
    
    const { data, timestamp, ttl } = result
    
    // 检查是否过期
    if (Date.now() - timestamp > ttl) {
      await db.deleteCache(fullKey)
      return null
    }
    
    return data
  }

  static async deleteTempData(key: string): Promise<void> {
    const fullKey = `temp:${key}`
    await db.deleteCache(fullKey)
  }

  // 计数器功能
  static async incrementCounter(counterName: string): Promise<number> {
    const key = `counter:${counterName}`
    return await db.incrementCounter(key)
  }

  static async decrementCounter(counterName: string): Promise<number> {
    const key = `counter:${counterName}`
    return await db.decrementCounter(key)
  }

  static async getCounter(counterName: string): Promise<number> {
    const key = `counter:${counterName}`
    const value = await db.getCache(key)
    return value ? parseInt(value) : 0
  }

  static async resetCounter(counterName: string): Promise<void> {
    const key = `counter:${counterName}`
    await db.deleteCache(key)
  }

  // 集合操作
  static async addToSet(setName: string, ...values: string[]): Promise<number> {
    const key = `set:${setName}`
    return await db.addToSet(key, ...values)
  }

  static async getSetMembers(setName: string): Promise<string[]> {
    const key = `set:${setName}`
    return await db.getSetMembers(key)
  }

  static async removeFromSet(setName: string, value: string): Promise<void> {
    const key = `set:${setName}`
    await db.deleteCache(`${key}:${value}`)
  }

  // 列表操作
  static async addToList(listName: string, ...values: string[]): Promise<number> {
    const key = `list:${listName}`
    return await db.addToList(key, ...values)
  }

  static async getListRange(listName: string, start: number = 0, stop: number = -1): Promise<string[]> {
    const key = `list:${listName}`
    return await db.getListRange(key, start, stop)
  }

  // 哈希操作
  static async setHashField(hashName: string, field: string, value: any): Promise<void> {
    const key = `hash:${hashName}`
    await db.setCacheHash(key, field, value)
  }

  static async getHashField(hashName: string, field: string): Promise<any> {
    const key = `hash:${hashName}`
    return await db.getCacheHash(key, field)
  }

  static async getAllHashFields(hashName: string): Promise<Record<string, any>> {
    const key = `hash:${hashName}`
    return await db.getAllCacheHash(key)
  }

  // 批量操作
  static async bulkSet(items: Array<{ key: string; value: any; expire?: number }>): Promise<void> {
    const promises = items.map(item => {
      if (item.expire) {
        return db.setCache(item.key, item.value, item.expire)
      } else {
        return db.setCache(item.key, item.value)
      }
    })
    await Promise.all(promises)
  }

  static async bulkGet(keys: string[]): Promise<Record<string, any>> {
    const promises = keys.map(key => db.getCache(key))
    const results = await Promise.all(promises)
    
    const output: Record<string, any> = {}
    keys.forEach((key, index) => {
      output[key] = results[index]
    })
    
    return output
  }

  static async bulkDelete(keys: string[]): Promise<void> {
    const promises = keys.map(key => db.deleteCache(key))
    await Promise.all(promises)
  }

  // 模式删除
  static async deletePattern(pattern: string): Promise<void> {
    await db.deleteCachePattern(pattern)
  }

  // 缓存统计
  static async getCacheStats(): Promise<{
    totalKeys: number
    memoryUsage: string
    hitRate: number
  }> {
    // 这里可以实现缓存统计逻辑
    // 由于 Redis 客户端限制，这里返回模拟数据
    return {
      totalKeys: 0,
      memoryUsage: '0MB',
      hitRate: 0
    }
  }

  // 清理过期数据
  static async cleanupExpiredData(): Promise<void> {
    try {
      // 清理临时数据
      const tempPattern = 'temp:*'
      await db.deleteCachePattern(tempPattern)
      
      // 清理过期的生成任务状态
      const genPattern = 'generation:*'
      await db.deleteCachePattern(genPattern)
      
      console.log('Cache cleanup completed')
    } catch (error) {
      console.error('Error cleaning up expired data:', error)
    }
  }

  // 预热缓存
  static async warmupCache(userId: string): Promise<void> {
    try {
      // 预加载用户相关的常用数据
      const userSettings = await this.getUserSettings(userId)
      if (!userSettings || Object.keys(userSettings).length === 0) {
        // 设置默认用户设置
        await this.setUserSettings(userId, {
          theme: 'light',
          language: 'zh-CN',
          autoSave: true,
          notifications: true
        })
      }
      
      console.log(`Cache warmed up for user: ${userId}`)
    } catch (error) {
      console.error('Error warming up cache:', error)
    }
  }

  // 缓存健康检查
  static async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      // 测试基本缓存操作
      const testKey = 'health_check_' + Date.now()
      const testValue = { timestamp: Date.now() }
      
      await db.setCache(testKey, testValue, 60)
      const retrieved = await db.getCache(testKey)
      await db.deleteCache(testKey)
      
      const isHealthy = retrieved && retrieved.timestamp === testValue.timestamp
      
      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        details: {
          canWrite: true,
          canRead: !!retrieved,
          canDelete: true,
          timestamp: new Date().toISOString()
        }
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      }
    }
  }
}

export default CacheService