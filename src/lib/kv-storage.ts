// KV 存储操作类，用于 EdgeOne Pages Functions
// 注意：这个类只能在 EdgeOne Pages Functions 环境中使用

export interface KVNamespace {
  get(key: string, options?: { type?: 'text' | 'json' | 'arrayBuffer' | 'stream' }): Promise<any>;
  put(key: string, value: string | ArrayBuffer | ArrayBufferView | ReadableStream): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<{
    complete: boolean;
    cursor: string | null;
    keys: Array<{ key: string }>;
  }>;
}

declare global {
  // 这些变量将通过 EdgeOne Pages 环境变量绑定
  const NOVEL_CACHE: KVNamespace;
  const NOVEL_SETTINGS: KVNamespace;
}

export class KVStorageService {
  // 缓存相关操作
  static async getCachedChapter(projectId: string, chapterId: string): Promise<string | null> {
    try {
      const key = `chapter:${projectId}:${chapterId}`;
      return await NOVEL_CACHE.get(key);
    } catch (error) {
      console.error('Error getting cached chapter:', error);
      return null;
    }
  }

  static async setCachedChapter(projectId: string, chapterId: string, content: string): Promise<void> {
    try {
      const key = `chapter:${projectId}:${chapterId}`;
      await NOVEL_CACHE.put(key, content);
    } catch (error) {
      console.error('Error setting cached chapter:', error);
    }
  }

  static async deleteCachedChapter(projectId: string, chapterId: string): Promise<void> {
    try {
      const key = `chapter:${projectId}:${chapterId}`;
      await NOVEL_CACHE.delete(key);
    } catch (error) {
      console.error('Error deleting cached chapter:', error);
    }
  }

  // 生成状态缓存
  static async getGenerationStatus(taskId: string): Promise<any> {
    try {
      const key = `generation:${taskId}`;
      const result = await NOVEL_CACHE.get(key, { type: 'json' });
      return result;
    } catch (error) {
      console.error('Error getting generation status:', error);
      return null;
    }
  }

  static async setGenerationStatus(taskId: string, status: any): Promise<void> {
    try {
      const key = `generation:${taskId}`;
      await NOVEL_CACHE.put(key, JSON.stringify(status));
    } catch (error) {
      console.error('Error setting generation status:', error);
    }
  }

  // 用户设置相关
  static async getUserSettings(userId: string): Promise<any> {
    try {
      const key = `user_settings:${userId}`;
      const result = await NOVEL_SETTINGS.get(key, { type: 'json' });
      return result || {};
    } catch (error) {
      console.error('Error getting user settings:', error);
      return {};
    }
  }

  static async setUserSettings(userId: string, settings: any): Promise<void> {
    try {
      const key = `user_settings:${userId}`;
      await NOVEL_SETTINGS.put(key, JSON.stringify(settings));
    } catch (error) {
      console.error('Error setting user settings:', error);
    }
  }

  // 项目配置缓存
  static async getProjectConfig(projectId: string): Promise<any> {
    try {
      const key = `project_config:${projectId}`;
      const result = await NOVEL_SETTINGS.get(key, { type: 'json' });
      return result;
    } catch (error) {
      console.error('Error getting project config:', error);
      return null;
    }
  }

  static async setProjectConfig(projectId: string, config: any): Promise<void> {
    try {
      const key = `project_config:${projectId}`;
      await NOVEL_SETTINGS.put(key, JSON.stringify(config));
    } catch (error) {
      console.error('Error setting project config:', error);
    }
  }

  // 临时数据存储（用于生成过程中的中间结果）
  static async setTempData(key: string, data: any, ttl?: number): Promise<void> {
    try {
      const fullKey = `temp:${key}`;
      const payload = {
        data,
        timestamp: Date.now(),
        ttl: ttl || 3600000 // 默认1小时过期
      };
      await NOVEL_CACHE.put(fullKey, JSON.stringify(payload));
    } catch (error) {
      console.error('Error setting temp data:', error);
    }
  }

  static async getTempData(key: string): Promise<any> {
    try {
      const fullKey = `temp:${key}`;
      const result = await NOVEL_CACHE.get(fullKey, { type: 'json' });
      
      if (!result) return null;
      
      const { data, timestamp, ttl } = result;
      
      // 检查是否过期
      if (Date.now() - timestamp > ttl) {
        await NOVEL_CACHE.delete(fullKey);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error getting temp data:', error);
      return null;
    }
  }

  // 计数器功能（用于统计访问量、生成次数等）
  static async incrementCounter(counterName: string): Promise<number> {
    try {
      const key = `counter:${counterName}`;
      const current = await NOVEL_CACHE.get(key);
      const count = current ? parseInt(current) + 1 : 1;
      await NOVEL_CACHE.put(key, count.toString());
      return count;
    } catch (error) {
      console.error('Error incrementing counter:', error);
      return 0;
    }
  }

  static async getCounter(counterName: string): Promise<number> {
    try {
      const key = `counter:${counterName}`;
      const result = await NOVEL_CACHE.get(key);
      return result ? parseInt(result) : 0;
    } catch (error) {
      console.error('Error getting counter:', error);
      return 0;
    }
  }

  // 批量操作
  static async bulkSet(items: Array<{ key: string; value: any }>): Promise<void> {
    try {
      const promises = items.map(item => 
        NOVEL_CACHE.put(item.key, typeof item.value === 'string' ? item.value : JSON.stringify(item.value))
      );
      await Promise.all(promises);
    } catch (error) {
      console.error('Error in bulk set:', error);
    }
  }

  static async bulkGet(keys: string[]): Promise<Record<string, any>> {
    try {
      const promises = keys.map(key => NOVEL_CACHE.get(key, { type: 'json' }));
      const results = await Promise.all(promises);
      
      const output: Record<string, any> = {};
      keys.forEach((key, index) => {
        output[key] = results[index];
      });
      
      return output;
    } catch (error) {
      console.error('Error in bulk get:', error);
      return {};
    }
  }

  // 清理过期数据
  static async cleanupExpiredData(): Promise<void> {
    try {
      const tempKeys = await NOVEL_CACHE.list({ prefix: 'temp:' });
      
      for (const keyInfo of tempKeys.keys) {
        const data = await NOVEL_CACHE.get(keyInfo.key, { type: 'json' });
        if (data && data.timestamp && data.ttl) {
          if (Date.now() - data.timestamp > data.ttl) {
            await NOVEL_CACHE.delete(keyInfo.key);
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up expired data:', error);
    }
  }
}

// 供客户端使用的 Mock 版本（用于本地开发）
export class MockKVStorageService {
  private static cache: Map<string, any> = new Map();

  static async getCachedChapter(projectId: string, chapterId: string): Promise<string | null> {
    const key = `chapter:${projectId}:${chapterId}`;
    return this.cache.get(key) || null;
  }

  static async setCachedChapter(projectId: string, chapterId: string, content: string): Promise<void> {
    const key = `chapter:${projectId}:${chapterId}`;
    this.cache.set(key, content);
  }

  static async getUserSettings(userId: string): Promise<any> {
    const key = `user_settings:${userId}`;
    return this.cache.get(key) || {};
  }

  static async setUserSettings(userId: string, settings: any): Promise<void> {
    const key = `user_settings:${userId}`;
    this.cache.set(key, settings);
  }

  static async getProjectConfig(projectId: string): Promise<any> {
    const key = `project_config:${projectId}`;
    return this.cache.get(key) || null;
  }

  static async setProjectConfig(projectId: string, config: any): Promise<void> {
    const key = `project_config:${projectId}`;
    this.cache.set(key, config);
  }
}

// 根据环境选择使用哪个服务
export const KVService = typeof NOVEL_CACHE !== 'undefined' ? KVStorageService : MockKVStorageService;