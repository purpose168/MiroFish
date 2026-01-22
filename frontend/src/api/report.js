import service, { requestWithRetry } from './index'

/**
 * 报告生成相关 API 接口模块
 * 
 * 本模块封装了所有与报告生成和 AI Agent 交互相关的后端 API 接口调用。
 * 报告生成是一个复杂的异步过程，涉及 AI Agent 的多轮对话、日志记录和状态跟踪。
 * 
 * 主要功能：
 * - 报告生成：启动报告生成任务，支持强制重新生成
 * - 状态查询：实时查询报告生成的进度和状态
 * - 日志获取：增量获取 Agent 日志和控制台日志，实现实时日志流
 * - 报告详情：获取生成的完整报告内容
 * - Agent 对话：与 Report Agent 进行交互式对话
 * 
 * 技术特点：
 * - 增量日志获取：使用 from_line 参数实现增量更新，减少数据传输量
 * - 异步任务处理：长时间运行的报告生成任务使用异步模式
 * - 实时日志流：通过增量获取实现类似 WebSocket 的实时日志效果
 * - AI Agent 交互：支持与 AI Agent 进行多轮对话
 * 
 * 增量日志获取原理：
 * - 客户端记录已读取的行号（from_line）
 * - 每次请求时携带 from_line 参数
 * - 服务器只返回 from_line 之后的新日志行
 * - 客户端更新 from_line 为最新行号
 * - 循环轮询实现实时日志流效果
 * 
 * 这种方式的优点：
 * 1. 减少网络传输：只传输新增的日志内容
 * 2. 降低服务器负载：不需要每次都返回完整日志
 * 3. 实时性好：通过短间隔轮询实现近实时效果
 * 4. 容错性强：网络中断后可以从断点继续获取
 * 
 * API 端点说明：
 * - POST /api/report/generate - 开始报告生成
 * - GET /api/report/generate/status - 获取报告生成状态
 * - GET /api/report/{reportId}/agent-log - 获取 Agent 日志（增量）
 * - GET /api/report/{reportId}/console-log - 获取控制台日志（增量）
 * - GET /api/report/{reportId} - 获取报告详情
 * - POST /api/report/chat - 与 Report Agent 对话
 */

/**
 * 开始报告生成
 * 
 * 启动一个报告生成任务。报告生成是一个复杂的多步骤过程，通常包括：
 * 1. 分析模拟数据和需求
 * 2. AI Agent 进行多轮推理和决策
 * 3. 生成报告的各个章节
 * 4. 格式化和优化报告内容
 * 
 * 这是一个耗时较长的操作，因此使用异步处理模式。
 * 函数返回一个报告 ID，客户端可以通过报告 ID 查询生成进度和日志。
 * 
 * @param {Object} data - 报告生成参数对象，包含以下字段：
 *   - simulation_id: String - 模拟 ID，指定要生成报告的模拟任务
 *   - force_regenerate: Boolean (可选) - 是否强制重新生成，默认为 false
 *     如果为 true，即使已存在报告也会重新生成
 *     如果为 false，且已存在报告则直接返回现有报告
 * @returns {Promise<Object>} 返回一个 Promise，解析后包含报告 ID：
 *   - report_id: String - 报告 ID，用于查询状态和获取报告
 *   - message: String - 提示信息
 *   - status: String - 初始状态（通常是 'pending' 或 'processing'）
 * 
 * @example
 * // 使用示例：开始生成报告
 * const result = await generateReport({
 *   simulation_id: 'sim_123',
 *   force_regenerate: false
 * })
 * console.log('报告 ID:', result.report_id)
 */
export const generateReport = (data) => {
  // 使用 requestWithRetry 实现自动重试
  // 最多重试 3 次，初始延迟 1000ms
  // 使用指数退避算法：1000ms, 2000ms, 4000ms
  return requestWithRetry(() => service.post('/api/report/generate', data), 3, 1000)
}

/**
 * 获取报告生成状态
 * 
 * 查询报告生成任务的当前状态和进度。
 * 客户端可以定期轮询此接口来跟踪报告生成的进度。
 * 
 * 常见状态：
 * - pending: 等待处理
 * - processing: 正在生成中
 * - completed: 生成完成
 * - failed: 生成失败
 * 
 * @param {String} reportId - 报告 ID，由 generateReport 接口返回
 * @returns {Promise<Object>} 返回一个 Promise，解析后包含状态信息：
 *   - status: String - 当前状态（pending/processing/completed/failed）
 *   - progress: Number - 进度百分比（0-100）
 *   - current_step: String - 当前执行的步骤描述
 *   - total_steps: Number - 总步骤数
 *   - current_step_index: Number - 当前步骤索引
 *   - error: String - 错误信息（仅在 failed 状态时存在）
 *   - created_at: String - 创建时间
 *   - updated_at: String - 最后更新时间
 * 
 * @example
 * // 使用示例：轮询报告生成状态
 * async function pollReportStatus(reportId) {
 *   while (true) {
 *     const status = await getReportStatus(reportId)
 *     console.log(`状态: ${status.status}, 进度: ${status.progress}%`)
 *     console.log(`当前步骤: ${status.current_step}`)
 *     
 *     if (status.status === 'completed') {
 *       console.log('报告生成完成！')
 *       break
 *     }
 *     
 *     if (status.status === 'failed') {
 *       throw new Error(status.error)
 *     }
 *     
 *     // 等待 2 秒后再次查询
 *     await new Promise(resolve => setTimeout(resolve, 2000))
 *   }
 * }
 */
export const getReportStatus = (reportId) => {
  // 使用 params 对象传递查询参数
  // Axios 会自动将 params 对象转换为 URL 查询字符串
  // 例如：/api/report/generate/status?report_id=report_123
  return service.get(`/api/report/generate/status`, { params: { report_id: reportId } })
}

/**
 * 获取 Agent 日志（增量）
 * 
 * 增量获取 AI Agent 的执行日志。Agent 日志记录了 AI Agent 在报告生成过程中的
 * 思考过程、决策和操作步骤，对于调试和理解 AI 行为非常有用。
 * 
 * 增量获取机制：
 * 1. 客户端维护一个 from_line 变量，记录已读取的行号
 * 2. 每次请求时携带 from_line 参数
 * 3. 服务器只返回 from_line 之后的新日志行
 * 4. 客户端将新日志追加到显示区域，并更新 from_line
 * 5. 循环执行上述步骤，实现实时日志流效果
 * 
 * @param {String} reportId - 报告 ID
 * @param {Number} fromLine - 从第几行开始获取，默认为 0（从头开始）
 *   第一次调用时传 0，后续调用传入上一次获取的最后一行行号 + 1
 * @returns {Promise<Object>} 返回一个 Promise，解析后包含日志信息：
 *   - logs: Array<String> - 日志行数组
 *   - from_line: Number - 本次请求的起始行号
 *   - to_line: Number - 本次请求的结束行号
 *   - total_lines: Number - 日志总行数
 *   - has_more: Boolean - 是否还有更多日志
 * 
 * @example
 * // 使用示例：实时获取 Agent 日志
 * async function streamAgentLogs(reportId) {
 *   let fromLine = 0
 *   
 *   while (true) {
 *     const result = await getAgentLog(reportId, fromLine)
 *     
 *     if (result.logs.length > 0) {
 *       // 显示新日志
 *       result.logs.forEach(log => console.log(log))
 *       
 *       // 更新 fromLine
 *       fromLine = result.to_line + 1
 *     }
 *     
 *     // 如果没有更多日志且报告已完成，则退出
 *     if (!result.has_more) {
 *       const status = await getReportStatus(reportId)
 *       if (status.status === 'completed' || status.status === 'failed') {
 *         break
 *       }
 *     }
 *     
 *     // 等待 1 秒后再次获取
 *     await new Promise(resolve => setTimeout(resolve, 1000))
 *   }
 * }
 */
export const getAgentLog = (reportId, fromLine = 0) => {
  // 使用 params 对象传递查询参数
  // from_line 参数指定从哪一行开始获取日志
  return service.get(`/api/report/${reportId}/agent-log`, { params: { from_line: fromLine } })
}

/**
 * 获取控制台日志（增量）
 * 
 * 增量获取系统控制台日志。控制台日志记录了报告生成过程中的系统级别信息，
 * 包括错误信息、警告、调试信息等。
 * 
 * 与 Agent 日志的区别：
 * - Agent 日志：记录 AI Agent 的思考过程和决策，更偏向业务逻辑
 * - 控制台日志：记录系统级别的运行信息，更偏向技术细节
 * 
 * 增量获取机制与 getAgentLog 相同，通过 from_line 参数实现增量更新。
 * 
 * @param {String} reportId - 报告 ID
 * @param {Number} fromLine - 从第几行开始获取，默认为 0（从头开始）
 *   第一次调用时传 0，后续调用传入上一次获取的最后一行行号 + 1
 * @returns {Promise<Object>} 返回一个 Promise，解析后包含日志信息：
 *   - logs: Array<String> - 日志行数组
 *   - from_line: Number - 本次请求的起始行号
 *   - to_line: Number - 本次请求的结束行号
 *   - total_lines: Number - 日志总行数
 *   - has_more: Boolean - 是否还有更多日志
 * 
 * @example
 * // 使用示例：同时获取 Agent 日志和控制台日志
 * async function streamAllLogs(reportId) {
 *   let agentFromLine = 0
 *   let consoleFromLine = 0
 *   
 *   while (true) {
 *     // 并行获取两种日志
 *     const [agentLogs, consoleLogs] = await Promise.all([
 *       getAgentLog(reportId, agentFromLine),
 *       getConsoleLog(reportId, consoleFromLine)
 *     ])
 *     
 *     // 处理 Agent 日志
 *     if (agentLogs.logs.length > 0) {
 *       agentLogs.logs.forEach(log => console.log('[Agent]', log))
 *       agentFromLine = agentLogs.to_line + 1
 *     }
 *     
 *     // 处理控制台日志
 *     if (consoleLogs.logs.length > 0) {
 *       consoleLogs.logs.forEach(log => console.log('[Console]', log))
 *       consoleFromLine = consoleLogs.to_line + 1
 *     }
 *     
 *     // 检查是否完成
 *     const status = await getReportStatus(reportId)
 *     if (status.status === 'completed' || status.status === 'failed') {
 *       break
 *     }
 *     
 *     await new Promise(resolve => setTimeout(resolve, 1000))
 *   }
 * }
 */
export const getConsoleLog = (reportId, fromLine = 0) => {
  // 使用 params 对象传递查询参数
  // from_line 参数指定从哪一行开始获取日志
  return service.get(`/api/report/${reportId}/console-log`, { params: { from_line: fromLine } })
}

/**
 * 获取报告详情
 * 
 * 获取已生成的完整报告内容。报告通常包含多个章节，如：
 * - 执行摘要
 * - 背景介绍
 * - 分析过程
 * - 结果和结论
 * - 建议和展望
 * 
 * 报告格式可能是 Markdown、HTML 或其他结构化格式。
 * 
 * @param {String} reportId - 报告 ID
 * @returns {Promise<Object>} 返回一个 Promise，解析后包含报告详情：
 *   - report_id: String - 报告 ID
 *   - title: String - 报告标题
 *   - content: String - 报告内容（通常是 Markdown 格式）
 *   - sections: Array<Object> - 报告章节数组
 *   - metadata: Object - 报告元数据
 *   - created_at: String - 创建时间
 *   - updated_at: String - 最后更新时间
 *   - status: String - 报告状态
 * 
 * @example
 * // 使用示例：获取并显示报告
 * const report = await getReport('report_123')
 * console.log('报告标题:', report.title)
 * console.log('报告内容:', report.content)
 * 
 * // 如果报告是 Markdown 格式，可以使用 Markdown 渲染器显示
 * // 例如：import ReactMarkdown from 'react-markdown'
 * // <ReactMarkdown>{report.content}</ReactMarkdown>
 */
export const getReport = (reportId) => {
  return service.get(`/api/report/${reportId}`)
}

/**
 * 与 Report Agent 对话
 * 
 * 与报告生成 AI Agent 进行交互式对话。用户可以向 Agent 提问，
 * Agent 会基于已生成的报告内容进行回答。
 * 
 * 对话场景：
 * - 询问报告中的某个细节
 * - 要求解释某个结论
 * - 请求补充分析
 * - 询问数据来源
 * 
 * 对话历史管理：
 * - 可选的 chat_history 参数用于维护多轮对话上下文
 * - 每次对话后，将用户消息和 Agent 回复添加到历史记录
 * - 下次对话时传递完整的历史记录，保持对话连贯性
 * 
 * @param {Object} data - 对话参数对象，包含以下字段：
 *   - simulation_id: String - 模拟 ID
 *   - message: String - 用户消息
 *   - chat_history: Array<Object> (可选) - 对话历史记录，包含之前的对话
 *     每个历史记录项包含：
 *     - role: String - 角色（'user' 或 'assistant'）
 *     - content: String - 消息内容
 * @returns {Promise<Object>} 返回一个 Promise，解析后包含 Agent 回复：
 *   - reply: String - Agent 的回复内容
 *   - chat_history: Array<Object> - 更新后的对话历史
 *   - timestamp: String - 回复时间戳
 * 
 * @example
 * // 使用示例：与 Agent 进行多轮对话
 * async function chatWithAgent(simulationId) {
 *   let chatHistory = []
 *   
 *   // 第一轮对话
 *   const result1 = await chatWithReport({
 *     simulation_id: simulationId,
 *     message: '请解释一下报告中的主要结论',
 *     chat_history: chatHistory
 *   })
 *   console.log('Agent:', result1.reply)
 *   chatHistory = result1.chat_history
 *   
 *   // 第二轮对话
 *   const result2 = await chatWithReport({
 *     simulation_id: simulationId,
 *     message: '这些结论的数据来源是什么？',
 *     chat_history: chatHistory
 *   })
 *   console.log('Agent:', result2.reply)
 *   chatHistory = result2.chat_history
 * }
 */
export const chatWithReport = (data) => {
  // 使用 requestWithRetry 实现自动重试
  // 最多重试 3 次，初始延迟 1000ms
  // 使用指数退避算法：1000ms, 2000ms, 4000ms
  return requestWithRetry(() => service.post('/api/report/chat', data), 3, 1000)
}
