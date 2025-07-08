import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useAppStore } from '@/store/app-store'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import type { Project } from '@/types'

interface AppConfig {
  appName: string
  appVersion: string
  enableRegistration: boolean
  enableSocialLogin: boolean
}

export default function HomePage({ appConfig }: { appConfig: AppConfig }) {
  const { 
    user, 
    projects, 
    setProjects, 
    isLoading, 
    setLoading, 
    error, 
    setError 
  } = useAppStore()
  
  const [recentProjects, setRecentProjects] = useState<Project[]>([])

  useEffect(() => {
    if (user) {
      loadProjects()
    }
  }, [user])

  const loadProjects = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // 调用 API 获取用户项目
      const response = await fetch('/api/projects', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('获取项目列表失败')
      }

      const data = await response.json()
      setProjects(data.projects || [])
      setRecentProjects((data.projects || []).slice(0, 3))
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载项目失败')
      
      // 使用模拟数据作为降级方案
      const mockProjects: Project[] = [
        {
          id: '1',
          title: '修真传说',
          description: '一个关于修真者的传奇故事',
          genre: '修真',
          target_words: 200000,
          current_words: 45000,
          status: 'writing',
          user_id: user?.id || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          title: '都市异能',
          description: '现代都市中的超能力者',
          genre: '都市',
          target_words: 150000,
          current_words: 12000,
          status: 'draft',
          user_id: user?.id || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
      
      setProjects(mockProjects)
      setRecentProjects(mockProjects.slice(0, 3))
    } finally {
      setLoading(false)
    }
  }

  const getStatusText = (status: Project['status']) => {
    const statusMap = {
      'draft': '草稿',
      'writing': '写作中',
      'completed': '已完成',
      'published': '已发布'
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status: Project['status']) => {
    const colorMap = {
      'draft': 'bg-gray-100 text-gray-800',
      'writing': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'published': 'bg-purple-100 text-purple-800'
    }
    return colorMap[status] || 'bg-gray-100 text-gray-800'
  }

  const calculateProgress = (current: number, target: number) => {
    if (target === 0) return 0
    return Math.min((current / target) * 100, 100)
  }

  if (!user) {
    return (
      <>
        <Head>
          <title>{appConfig.appName}</title>
          <meta name="description" content="智能小说创作助手，助您轻松创作精彩小说" />
        </Head>
        
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          {/* Hero Section */}
          <div className="container-wide py-20">
            <div className="text-center">
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                {appConfig.appName}
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                结合人工智能与创作灵感，打造全新的小说创作体验。
                从世界观构建到章节生成，让AI成为您最得力的创作伙伴。
              </p>
              <div className="flex gap-4 justify-center">
                <Link 
                  href="/auth/login"
                  className="btn btn-primary btn-lg"
                >
                  开始创作
                </Link>
                <Link 
                  href="/demo"
                  className="btn btn-outline btn-lg"
                >
                  查看演示
                </Link>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="container-wide py-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              强大功能特性
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="card p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">智能世界观构建</h3>
                <p className="text-gray-600">
                  AI 协助构建完整的世界观体系，包括历史、地理、政治、文化等各个方面
                </p>
              </div>
              
              <div className="card p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">角色关系管理</h3>
                <p className="text-gray-600">
                  创建立体的角色形象，管理复杂的人物关系网络，追踪角色发展轨迹
                </p>
              </div>
              
              <div className="card p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">智能章节生成</h3>
                <p className="text-gray-600">
                  基于剧情大纲和角色设定，AI 生成连贯的章节内容，支持多种写作风格
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="container-wide py-16">
            <div className="card p-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <h2 className="text-3xl font-bold mb-4">
                准备开始您的创作之旅了吗？
              </h2>
              <p className="text-xl mb-6 opacity-90">
                立即注册，体验AI辅助创作的无限可能
              </p>
              {appConfig.enableRegistration && (
                <Link 
                  href="/auth/register"
                  className="btn bg-white text-blue-600 hover:bg-gray-100 btn-lg"
                >
                  免费注册
                </Link>
              )}
            </div>
          </div>

          {/* Footer */}
          <footer className="bg-gray-900 text-white py-12">
            <div className="container-wide">
              <div className="grid md:grid-cols-4 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">{appConfig.appName}</h3>
                  <p className="text-gray-400">
                    基于人工智能的智能小说创作平台
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    版本 {appConfig.appVersion}
                  </p>
                </div>
                <div>
                  <h4 className="text-md font-semibold mb-4">功能特色</h4>
                  <ul className="space-y-2 text-gray-400">
                    <li>AI智能生成</li>
                    <li>世界观构建</li>
                    <li>角色管理</li>
                    <li>剧情设计</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-md font-semibold mb-4">帮助支持</h4>
                  <ul className="space-y-2 text-gray-400">
                    <li><Link href="/help">使用指南</Link></li>
                    <li><Link href="/faq">常见问题</Link></li>
                    <li><Link href="/contact">联系我们</Link></li>
                    <li><Link href="/feedback">意见反馈</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-md font-semibold mb-4">关于我们</h4>
                  <ul className="space-y-2 text-gray-400">
                    <li><Link href="/about">关于项目</Link></li>
                    <li><Link href="/privacy">隐私政策</Link></li>
                    <li><Link href="/terms">服务条款</Link></li>
                    <li><Link href="/changelog">更新日志</Link></li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                <p>&copy; 2024 {appConfig.appName}. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>工作台 - {appConfig.appName}</title>
        <meta name="description" content="您的创作工作台" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="container-wide py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                创作工作台
              </h1>
              <div className="flex items-center gap-4">
                <span className="text-gray-600">
                  欢迎，{user.name}
                </span>
                <Link 
                  href="/projects/new"
                  className="btn btn-primary"
                >
                  新建项目
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container-wide py-8">
          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="card p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">总项目数</p>
                  <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">已完成</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {projects.filter(p => p.status === 'completed').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">写作中</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {projects.filter(p => p.status === 'writing').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6H2a1 1 0 110-2h4z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">总字数</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {projects.reduce((total, p) => total + p.current_words, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Projects */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  最近项目
                </h2>
                <Link 
                  href="/projects"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  查看全部
                </Link>
              </div>
            </div>
            <div className="card-content">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="spinner w-8 h-8"></div>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-600">{error}</p>
                  <button 
                    onClick={loadProjects}
                    className="btn btn-outline btn-sm mt-4"
                  >
                    重试
                  </button>
                </div>
              ) : recentProjects.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="empty-state-title">还没有项目</h3>
                  <p className="empty-state-description">
                    创建您的第一个小说项目，开始AI创作之旅
                  </p>
                  <Link 
                    href="/projects/new"
                    className="btn btn-primary"
                  >
                    创建项目
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentProjects.map((project) => (
                    <div 
                      key={project.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Link 
                            href={`/projects/${project.id}`}
                            className="text-lg font-medium text-gray-900 hover:text-blue-600"
                          >
                            {project.title}
                          </Link>
                          <span className={`badge ${getStatusColor(project.status)}`}>
                            {getStatusText(project.status)}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">
                          {project.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>类型: {project.genre}</span>
                          <span>
                            进度: {project.current_words.toLocaleString()} / {project.target_words.toLocaleString()} 字
                          </span>
                          <span>更新: {formatRelativeTime(project.updated_at)}</span>
                        </div>
                      </div>
                      <div className="w-32">
                        <div className="progress mb-1">
                          <div 
                            className="progress-bar"
                            style={{ 
                              width: `${calculateProgress(project.current_words, project.target_words)}%` 
                            }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 text-center">
                          {Math.round(calculateProgress(project.current_words, project.target_words))}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

// 服务端获取配置
export async function getServerSideProps() {
  const appConfig: AppConfig = {
    appName: process.env.APP_NAME || 'AI小说生成工具',
    appVersion: process.env.APP_VERSION || '1.0.0',
    enableRegistration: process.env.ENABLE_USER_REGISTRATION === 'true',
    enableSocialLogin: process.env.ENABLE_SOCIAL_LOGIN === 'true',
  }

  return {
    props: {
      appConfig,
    },
  }
}