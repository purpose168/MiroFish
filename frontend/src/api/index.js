import axios from 'axios'

/**
 * Axios HTTP 客户端配置模块
 * 
 * 本模块封装了 Axios 实例，提供了统一的 HTTP 请求配置、拦截器和错误处理机制。
 * Axios 是一个基于 Promise 的 HTTP 客户端，用于浏览器和 Node.js 环境。
 * 
 * 主要功能：
 * - 统一的 API 基础 URL 配置
 * - 请求/响应拦截器
 * - 自动错误处理和重试机制
 * - 超时控制
 */

// 创建 axios 实例
// 使用 axios.create() 创建一个独立的实例，避免修改全局的 axios 默认配置
// 这样可以在同一个应用中配置多个不同的 axios 实例，每个实例有不同的配置
const service = axios.create({
  // API 基础 URL，所有请求都会拼接这个地址
  // 使用环境变量 VITE_API_BASE_URL，如果没有设置则默认使用本地开发服务器地址
  // Vite 环境变量以 VITE_ 开头的变量会暴露给客户端代码
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001',
  
  // 请求超时时间，单位为毫秒
  // 设置为 5 分钟（300000ms）是因为本体生成可能需要较长时间
  // 超时后请求会被自动取消，并抛出 ECONNABORTED 错误
  timeout: 300000,
  
  // 请求头配置
  // Content-Type: application/json 表示请求体使用 JSON 格式
  // 这是现代 Web API 最常用的数据交换格式
  headers: {
    'Content-Type': 'application/json'
  }
})

/**
 * 请求拦截器
 * 
 * 在发送请求之前执行的拦截器，可以在这里统一处理请求配置。
 * 常见用途：
 * - 添加认证 token 到请求头
 * - 统一处理请求数据格式
 * - 添加时间戳防止缓存
 * - 显示加载动画
 */
service.interceptors.request.use(
  config => {
    // 在这里可以修改请求配置
    // 例如：添加认证 token
    // config.headers['Authorization'] = 'Bearer ' + getToken()
    
    return config
  },
  error => {
    // 请求配置错误处理
    // 这种错误通常发生在请求发送之前，例如无效的 URL 配置
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

/**
 * 响应拦截器
 * 
 * 在收到响应后执行的拦截器，可以在这里统一处理响应数据。
 * 常见用途：
 * - 统一处理响应数据格式
 * - 处理错误状态码
 * - 自动重试失败的请求
 * - 隐藏加载动画
 */
service.interceptors.response.use(
  response => {
    // 获取响应数据
    // response.data 是服务器返回的实际数据
    const res = response.data
    
    // 检查业务状态码
    // 如果后端返回的数据中包含 success 字段且为 false，说明业务逻辑出错
    // 这与 HTTP 状态码不同，HTTP 状态码表示请求是否成功到达服务器
    // 业务状态码表示服务器处理请求的业务逻辑是否成功
    if (!res.success && res.success !== undefined) {
      console.error('API 错误:', res.error || res.message || '未知错误')
      return Promise.reject(new Error(res.error || res.message || '错误'))
    }
    
    // 返回处理后的响应数据
    return res
  },
  error => {
    // HTTP 响应错误处理
    // 这种错误发生在请求发送后，例如网络错误、服务器错误、超时等
    console.error('响应错误:', error)
    
    // 处理请求超时错误
    // ECONNABORTED 是 Axios 超时错误的代码
    // 当请求超过 timeout 设置的时间时触发
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      console.error('请求超时，请检查网络连接或稍后重试')
    }
    
    // 处理网络连接错误
    // Network Error 通常表示无法连接到服务器
    // 可能的原因：服务器未启动、网络断开、跨域问题等
    if (error.message === 'Network Error') {
      console.error('网络错误 - 请检查您的网络连接')
    }
    
    // 将错误传递给调用者处理
    return Promise.reject(error)
  }
)

/**
 * 带重试机制的请求函数
 * 
 * 使用指数退避算法（Exponential Backoff）实现自动重试机制。
 * 指数退避是一种错误处理策略，在重试失败的操作时，每次重试之间的等待时间逐渐增加。
 * 
 * 优点：
 * - 减少服务器负载：避免在服务器繁忙时频繁重试
 * - 提高成功率：给服务器恢复时间
 * - 防止雪崩效应：避免多个客户端同时重试导致服务器过载
 * 
 * @param {Function} requestFn - 返回 Promise 的请求函数
 * @param {number} maxRetries - 最大重试次数，默认为 3 次
 * @param {number} delay - 初始延迟时间（毫秒），默认为 1000ms
 * @returns {Promise} 返回请求结果的 Promise
 * 
 * @example
 * // 使用示例
 * const fetchData = () => service.get('/api/data')
 * const result = await requestWithRetry(fetchData, 3, 1000)
 */
export const requestWithRetry = async (requestFn, maxRetries = 3, delay = 1000) => {
  // 循环尝试请求，最多重试 maxRetries 次
  for (let i = 0; i < maxRetries; i++) {
    try {
      // 尝试执行请求函数
      return await requestFn()
    } catch (error) {
      // 如果是最后一次重试，直接抛出错误
      if (i === maxRetries - 1) throw error
      
      // 输出重试警告信息
      console.warn(`请求失败，正在重试 (${i + 1}/${maxRetries})...`)
      
      // 使用指数退避算法计算等待时间
      // 每次重试的等待时间是前一次的 2 倍
      // 例如：1000ms, 2000ms, 4000ms, ...
      // 这样可以避免在服务器繁忙时频繁重试，给服务器恢复时间
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
    }
  }
}

// 导出配置好的 axios 实例
// 其他模块可以导入这个实例来发送 HTTP 请求
// 例如：import service from '@/api/index'; service.get('/api/users')
export default service
