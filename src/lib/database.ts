import { Pool, PoolConfig } from 'pg'
import mysql from 'mysql2/promise'
import Redis from 'ioredis'

// 数据库连接配置
interface DatabaseConfig {
  postgresql: PoolConfig
  mysql: mysql.PoolOptions
  redis: {
    url: string
    retryDelayOnFailover?: number
    maxRetriesPerRequest?: number
    lazyConnect?: boolean
  }
}

// 从环境变量构建配置
const getDbConfig = (): DatabaseConfig => {
  // PostgreSQL URI 格式: postgresql://username:password@host:port/database
  const postgresqlUri = process.env.DATABASE_URL || 
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME}`

  // MySQL URI 格式: mysql://username:password@host:port/database
  const mysqlUri = process.env.DATABASE_URL || 
    `mysql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || '3306'}/${process.env.DB_NAME}`

  // Redis URI 格式: redis://[:password]@host:port/db
  const redisUrl = process.env.REDIS_URL || 
    `redis://${process.env.REDIS_PASSWORD ? ':' + process.env.REDIS_PASSWORD + '@' : ''}${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}/${process.env.REDIS_DB || '0'}`

  return {
    postgresql: {
      connectionString: postgresqlUri,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
      max: parseInt(process.env.DB_POOL_MAX || '20'),
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000'),
    },
    mysql: {
      uri: mysqlUri,
      ssl: process.env.DB_SSL === 'true' ? {} : undefined,
      connectionLimit: parseInt(process.env.DB_POOL_MAX || '20'),
      acquireTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT || '60000'),
      timeout: parseInt(process.env.DB_TIMEOUT || '60000'),
    },
    redis: {
      url: redisUrl,
      retryDelayOnFailover: parseInt(process.env.REDIS_RETRY_DELAY || '100'),
      maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES || '3'),
      lazyConnect: process.env.REDIS_LAZY_CONNECT !== 'false',
    }
  }
}

// 数据库类型
type DatabaseType = 'postgresql' | 'mysql'
const DB_TYPE: DatabaseType = (process.env.DB_TYPE as DatabaseType) || 'postgresql'

// 连接池和客户端
let pgPool: Pool | null = null
let mysqlPool: mysql.Pool | null = null
let redisClient: Redis | null = null

// 初始化 PostgreSQL 连接池
function initPostgreSQL() {
  if (!pgPool) {
    const config = getDbConfig().postgresql
    pgPool = new Pool(config)
    
    pgPool.on('error', (err: any) => {
      console.error('PostgreSQL pool error:', err)
    })

    pgPool.on('connect', () => {
      console.log('PostgreSQL connected successfully')
    })
  }
  return pgPool
}

// 初始化 MySQL 连接池
function initMySQL() {
  if (!mysqlPool) {
    const config = getDbConfig().mysql
    mysqlPool = mysql.createPool(config.uri!)
  }
  return mysqlPool
}

// 初始化 Redis 连接
function initRedis() {
  if (!redisClient) {
    const config = getDbConfig().redis
    redisClient = new Redis(config.url, {
      retryDelayOnFailover: config.retryDelayOnFailover,
      maxRetriesPerRequest: config.maxRetriesPerRequest,
      lazyConnect: config.lazyConnect,
    })
    
    redisClient.on('error', (err: any) => {
      console.error('Redis connection error:', err)
    })
    
    redisClient.on('connect', () => {
      console.log('Redis connected successfully')
    })

    redisClient.on('ready', () => {
      console.log('Redis is ready')
    })
  }
  return redisClient
}

// 数据库连接管理类
export class DatabaseConnection {
  private static instance: DatabaseConnection
  private dbPool: Pool | mysql.Pool | null = null
  private redis: Redis | null = null
  private isConnected: boolean = false

  private constructor() {
    this.connect()
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection()
    }
    return DatabaseConnection.instance
  }

  private async connect() {
    try {
      // 初始化主数据库
      if (DB_TYPE === 'postgresql') {
        this.dbPool = initPostgreSQL()
        // 测试连接
        const client = await (this.dbPool as Pool).connect()
        await client.query('SELECT 1')
        client.release()
      } else {
        this.dbPool = initMySQL()
        // 测试连接
        const connection = await (this.dbPool as mysql.Pool).getConnection()
        await connection.execute('SELECT 1')
        connection.release()
      }

      // 初始化 Redis
      this.redis = initRedis()
      await this.redis.ping()

      this.isConnected = true
      console.log(`Database (${DB_TYPE}) and Redis connected successfully`)
    } catch (error) {
      console.error('Database connection failed:', error)
      this.isConnected = false
      throw error
    }
  }

  // 检查连接状态
  public async checkConnection(): Promise<boolean> {
    try {
      if (!this.dbPool || !this.redis) {
        return false
      }

      // 检查数据库连接
      if (DB_TYPE === 'postgresql') {
        const client = await (this.dbPool as Pool).connect()
        await client.query('SELECT 1')
        client.release()
      } else {
        const connection = await (this.dbPool as mysql.Pool).getConnection()
        await connection.execute('SELECT 1')
        connection.release()
      }

      // 检查 Redis 连接
      await this.redis.ping()

      return true
    } catch (error) {
      console.error('Connection check failed:', error)
      return false
    }
  }

  // 重新连接
  public async reconnect(): Promise<void> {
    try {
      await this.close()
      await this.connect()
    } catch (error) {
      console.error('Reconnection failed:', error)
      throw error
    }
  }

  // 执行 SQL 查询
  async query(sql: string, params: any[] = []): Promise<any> {
    if (!this.dbPool) {
      throw new Error('Database not connected')
    }

    try {
      if (DB_TYPE === 'postgresql') {
        const client = await (this.dbPool as Pool).connect()
        try {
          const result = await client.query(sql, params)
          return result.rows
        } finally {
          client.release()
        }
      } else {
        const connection = await (this.dbPool as mysql.Pool).getConnection()
        try {
          const [rows] = await connection.execute(sql, params)
          return rows
        } finally {
          connection.release()
        }
      }
    } catch (error) {
      console.error('Database query error:', error)
      console.error('SQL:', sql)
      console.error('Params:', params)
      throw error
    }
  }

  // 开始事务
  async beginTransaction(): Promise<any> {
    if (!this.dbPool) {
      throw new Error('Database not connected')
    }

    if (DB_TYPE === 'postgresql') {
      const client = await (this.dbPool as Pool).connect()
      await client.query('BEGIN')
      return client
    } else {
      const connection = await (this.dbPool as mysql.Pool).getConnection()
      await connection.beginTransaction()
      return connection
    }
  }

  // 提交事务
  async commitTransaction(transaction: any): Promise<void> {
    try {
      if (DB_TYPE === 'postgresql') {
        await transaction.query('COMMIT')
        transaction.release()
      } else {
        await transaction.commit()
        transaction.release()
      }
    } catch (error) {
      await this.rollbackTransaction(transaction)
      throw error
    }
  }

  // 回滚事务
  async rollbackTransaction(transaction: any): Promise<void> {
    try {
      if (DB_TYPE === 'postgresql') {
        await transaction.query('ROLLBACK')
        transaction.release()
      } else {
        await transaction.rollback()
        transaction.release()
      }
    } catch (error) {
      console.error('Transaction rollback error:', error)
      if (transaction.release) {
        transaction.release()
      }
    }
  }

  // Redis 操作
  async setCache(key: string, value: any, expireSeconds?: number): Promise<void> {
    if (!this.redis) {
      console.warn('Redis not connected, skipping cache operation')
      return
    }

    try {
      const serializedValue = JSON.stringify(value)
      if (expireSeconds) {
        await this.redis.setex(key, expireSeconds, serializedValue)
      } else {
        await this.redis.set(key, serializedValue)
      }
    } catch (error) {
      console.error('Redis set error:', error)
    }
  }

  async getCache(key: string): Promise<any> {
    if (!this.redis) {
      console.warn('Redis not connected, returning null')
      return null
    }

    try {
      const value = await this.redis.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error('Redis get error:', error)
      return null
    }
  }

  async deleteCache(key: string): Promise<void> {
    if (!this.redis) {
      console.warn('Redis not connected, skipping delete operation')
      return
    }

    try {
      await this.redis.del(key)
    } catch (error) {
      console.error('Redis delete error:', error)
    }
  }

  async deleteCachePattern(pattern: string): Promise<void> {
    if (!this.redis) {
      console.warn('Redis not connected, skipping pattern delete')
      return
    }

    try {
      const keys = await this.redis.keys(pattern)
      if (keys.length > 0) {
        await this.redis.del(...keys)
      }
    } catch (error) {
      console.error('Redis pattern delete error:', error)
    }
  }

  async setCacheHash(key: string, field: string, value: any): Promise<void> {
    if (!this.redis) {
      console.warn('Redis not connected, skipping hash operation')
      return
    }

    try {
      await this.redis.hset(key, field, JSON.stringify(value))
    } catch (error) {
      console.error('Redis hset error:', error)
    }
  }

  async getCacheHash(key: string, field: string): Promise<any> {
    if (!this.redis) {
      console.warn('Redis not connected, returning null')
      return null
    }

    try {
      const value = await this.redis.hget(key, field)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error('Redis hget error:', error)
      return null
    }
  }

  async getAllCacheHash(key: string): Promise<Record<string, any>> {
    if (!this.redis) {
      console.warn('Redis not connected, returning empty object')
      return {}
    }

    try {
      const hashData = await this.redis.hgetall(key)
      const result: Record<string, any> = {}
      
      for (const [field, value] of Object.entries(hashData)) {
        try {
          result[field] = JSON.parse(value as string)
        } catch {
          result[field] = value
        }
      }
      
      return result
    } catch (error) {
      console.error('Redis hgetall error:', error)
      return {}
    }
  }

  async incrementCounter(key: string): Promise<number> {
    if (!this.redis) {
      console.warn('Redis not connected, returning 0')
      return 0
    }

    try {
      return await this.redis.incr(key)
    } catch (error) {
      console.error('Redis incr error:', error)
      return 0
    }
  }

  async decrementCounter(key: string): Promise<number> {
    if (!this.redis) {
      console.warn('Redis not connected, returning 0')
      return 0
    }

    try {
      return await this.redis.decr(key)
    } catch (error) {
      console.error('Redis decr error:', error)
      return 0
    }
  }

  async expireKey(key: string, seconds: number): Promise<void> {
    if (!this.redis) {
      console.warn('Redis not connected, skipping expire operation')
      return
    }

    try {
      await this.redis.expire(key, seconds)
    } catch (error) {
      console.error('Redis expire error:', error)
    }
  }

  async addToSet(key: string, ...values: string[]): Promise<number> {
    if (!this.redis) {
      console.warn('Redis not connected, returning 0')
      return 0
    }

    try {
      return await this.redis.sadd(key, ...values)
    } catch (error) {
      console.error('Redis sadd error:', error)
      return 0
    }
  }

  async getSetMembers(key: string): Promise<string[]> {
    if (!this.redis) {
      console.warn('Redis not connected, returning empty array')
      return []
    }

    try {
      return await this.redis.smembers(key)
    } catch (error) {
      console.error('Redis smembers error:', error)
      return []
    }
  }

  async addToList(key: string, ...values: string[]): Promise<number> {
    if (!this.redis) {
      console.warn('Redis not connected, returning 0')
      return 0
    }

    try {
      return await this.redis.lpush(key, ...values)
    } catch (error) {
      console.error('Redis lpush error:', error)
      return 0
    }
  }

  async getListRange(key: string, start: number = 0, stop: number = -1): Promise<string[]> {
    if (!this.redis) {
      console.warn('Redis not connected, returning empty array')
      return []
    }

    try {
      return await this.redis.lrange(key, start, stop)
    } catch (error) {
      console.error('Redis lrange error:', error)
      return []
    }
  }

  // 获取连接状态
  public getConnectionStatus(): { database: boolean; redis: boolean } {
    return {
      database: this.isConnected && !!this.dbPool,
      redis: this.isConnected && !!this.redis
    }
  }

  // 关闭连接
  async close(): Promise<void> {
    try {
      if (this.dbPool) {
        if (DB_TYPE === 'postgresql') {
          await (this.dbPool as Pool).end()
        } else {
          await (this.dbPool as mysql.Pool).end()
        }
        this.dbPool = null
      }

      if (this.redis) {
        await this.redis.quit()
        this.redis = null
      }

      this.isConnected = false
      console.log('Database connections closed')
    } catch (error) {
      console.error('Error closing database connections:', error)
    }
  }
}

// 数据库服务类
export class DatabaseService {
  private static db = DatabaseConnection.getInstance()

  // 健康检查
  static async healthCheck(): Promise<{ status: string; database: boolean; redis: boolean; timestamp: string }> {
    const status = await this.db.checkConnection()
    const connectionStatus = this.db.getConnectionStatus()
    
    return {
      status: status ? 'healthy' : 'unhealthy',
      database: connectionStatus.database,
      redis: connectionStatus.redis,
      timestamp: new Date().toISOString()
    }
  }

  // 用户相关操作
  static async createUser(userData: {
    email: string
    name: string
    avatar?: string
    password_hash?: string
    provider?: string
  }) {
    const sql = DB_TYPE === 'postgresql' 
      ? `INSERT INTO users (email, name, avatar, password_hash, provider, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *`
      : `INSERT INTO users (email, name, avatar, password_hash, provider, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`
    
    const params = [
      userData.email, 
      userData.name, 
      userData.avatar || null,
      userData.password_hash || null,
      userData.provider || 'local'
    ]
    const result = await this.db.query(sql, params)
    
    if (DB_TYPE === 'mysql') {
      const insertId = (result as any).insertId
      return await this.getUserById(insertId)
    }
    
    const user = result[0]
    // 缓存用户信息
    await this.db.setCache(`user:${user.id}`, user, 3600)
    return user
  }

  static async getUserById(id: string) {
    // 先尝试从缓存获取
    const cached = await this.db.getCache(`user:${id}`)
    if (cached) {
      return cached
    }

    const sql = `SELECT * FROM users WHERE id = ${DB_TYPE === 'postgresql' ? '$1' : '?'}`
    const result = await this.db.query(sql, [id])
    const user = result[0] || null
    
    if (user) {
      // 缓存用户信息
      await this.db.setCache(`user:${id}`, user, 3600)
    }
    
    return user
  }

  static async getUserByEmail(email: string) {
    const sql = `SELECT * FROM users WHERE email = ${DB_TYPE === 'postgresql' ? '$1' : '?'}`
    const result = await this.db.query(sql, [email])
    return result[0] || null
  }

  static async updateUser(id: string, updates: any) {
    const fields: string[] = []
    const values: any[] = []
    let paramCount = 0

    Object.entries(updates).forEach(([key, value]: [string, any]) => {
      paramCount++
      if (key === 'settings' && value) {
        value = JSON.stringify(value)
      }
      if (DB_TYPE === 'postgresql') {
        fields.push(`${key} = $${paramCount}`)
      } else {
        fields.push(`${key} = ?`)
      }
      values.push(value)
    })

    paramCount++
    const sql = `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() 
                 WHERE id = ${DB_TYPE === 'postgresql' ? `$${paramCount}` : '?'}`
    
    values.push(id)
    await this.db.query(sql, values)
    
    // 删除缓存
    await this.db.deleteCache(`user:${id}`)
    
    return await this.getUserById(id)
  }

  // 项目相关操作
  static async createProject(projectData: {
    title: string
    description?: string
    genre: string
    target_words: number
    user_id: string
    settings?: any
  }) {
    const sql = DB_TYPE === 'postgresql'
      ? `INSERT INTO projects (title, description, genre, target_words, user_id, settings, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *`
      : `INSERT INTO projects (title, description, genre, target_words, user_id, settings, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`
    
    const params = [
      projectData.title,
      projectData.description || null,
      projectData.genre,
      projectData.target_words,
      projectData.user_id,
      JSON.stringify(projectData.settings || {})
    ]
    
    const result = await this.db.query(sql, params)
    
    if (DB_TYPE === 'mysql') {
      const insertId = (result as any).insertId
      const project = await this.getProjectById(insertId)
      // 删除用户项目列表缓存
      await this.db.deleteCache(`user_projects:${projectData.user_id}`)
      return project
    }
    
    const project = result[0]
    // 删除用户项目列表缓存
    await this.db.deleteCache(`user_projects:${projectData.user_id}`)
    return project
  }

  static async getProjectById(id: string) {
    const sql = `SELECT * FROM projects WHERE id = ${DB_TYPE === 'postgresql' ? '$1' : '?'}`
    const result = await this.db.query(sql, [id])
    return result[0] || null
  }

  static async getProjectsByUserId(userId: string) {
    // 先尝试从缓存获取
    const cached = await this.db.getCache(`user_projects:${userId}`)
    if (cached) {
      return cached
    }

    const sql = `SELECT * FROM projects WHERE user_id = ${DB_TYPE === 'postgresql' ? '$1' : '?'} ORDER BY updated_at DESC`
    const projects = await this.db.query(sql, [userId])
    
    // 缓存结果
    await this.db.setCache(`user_projects:${userId}`, projects, 1800) // 30分钟
    
    return projects
  }

  static async updateProject(id: string, updates: any) {
    const fields: string[] = []
    const values: any[] = []
    let paramCount = 0

    Object.entries(updates).forEach(([key, value]: [string, any]) => {
      paramCount++
      if (key === 'settings' && value) {
        value = JSON.stringify(value)
      }
      if (DB_TYPE === 'postgresql') {
        fields.push(`${key} = $${paramCount}`)
      } else {
        fields.push(`${key} = ?`)
      }
      values.push(value)
    })

    paramCount++
    const sql = `UPDATE projects SET ${fields.join(', ')}, updated_at = NOW() 
                 WHERE id = ${DB_TYPE === 'postgresql' ? `$${paramCount}` : '?'}`
    
    values.push(id)
    await this.db.query(sql, values)
    
    const project = await this.getProjectById(id)
    if (project) {
      // 删除相关缓存
      await this.db.deleteCache(`user_projects:${project.user_id}`)
    }
    
    return project
  }

  static async deleteProject(id: string) {
    const project = await this.getProjectById(id)
    if (!project) {
      throw new Error('Project not found')
    }

    const sql = `DELETE FROM projects WHERE id = ${DB_TYPE === 'postgresql' ? '$1' : '?'}`
    await this.db.query(sql, [id])
    
    // 删除相关缓存
    await this.db.deleteCache(`user_projects:${project.user_id}`)
    await this.db.deleteCachePattern(`project:${id}:*`)
  }

  // 其他数据库操作方法...
  // 为了简化，这里只保留核心方法
}

// 导出单例
export const db = DatabaseConnection.getInstance()
export default DatabaseService