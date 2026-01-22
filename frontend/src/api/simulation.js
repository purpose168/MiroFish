import service, { requestWithRetry } from './index'

/**
 * 模拟系统相关 API 接口模块
 * 
 * 本模块封装了所有与社交网络模拟系统相关的后端 API 接口调用。
 * 模拟系统是一个复杂的多智能体系统，用于模拟真实社交网络中的用户行为和交互。
 * 
 * 核心概念：
 * - 模拟（Simulation）：一个完整的社交网络模拟实例，包含多个 Agent 和环境配置
 * - Agent（智能体）：模拟中的虚拟用户，具有独立的性格、偏好和行为模式
 * - 平台（Platform）：模拟的社交网络平台，如 Reddit、Twitter 等
 * - 轮次（Round）：模拟的时间单位，每轮代表一个时间周期
 * - Profile（用户档案）：Agent 的个人信息，包括姓名、年龄、兴趣、性格等
 * - 图谱记忆（Graph Memory）：基于知识图谱的长期记忆系统，用于存储和检索历史信息
 * 
 * 主要功能：
 * - 模拟管理：创建、启动、停止、关闭模拟
 * - 环境准备：生成 Agent Profiles、配置模拟环境
 * - 实时监控：获取模拟运行状态、Agent 行为、帖子内容
 * - 数据分析：获取统计信息、时间线、动作历史
 * - Agent 交互：批量采访 Agent，获取其观点和反馈
 * - 历史记录：查询历史模拟列表和详情
 * 
 * 模拟流程：
 * 1. 创建模拟：指定项目 ID 和可选参数
 * 2. 准备环境：生成 Agent Profiles 和配置（异步任务）
 * 3. 启动模拟：开始模拟运行
 * 4. 监控运行：实时获取状态和内容
 * 5. 停止模拟：结束模拟运行
 * 6. 关闭环境：清理资源（优雅退出）
 * 
 * 技术特点：
 * - 异步任务处理：环境准备等耗时操作使用异步模式
 * - 实时数据获取：支持实时获取正在生成的数据
 * - 多平台支持：同时支持 Reddit 和 Twitter 平台
 * - 批量操作：支持批量采访等批量操作
 * - 优雅退出：支持超时控制的优雅关闭机制
 * 
 * API 端点说明：
 * - POST /api/simulation/create - 创建模拟
 * - POST /api/simulation/prepare - 准备模拟环境
 * - POST /api/simulation/prepare/status - 查询准备任务进度
 * - GET /api/simulation/{simulationId} - 获取模拟状态
 * - GET /api/simulation/{simulationId}/profiles - 获取 Agent Profiles
 * - GET /api/simulation/{simulationId}/profiles/realtime - 实时获取生成中的 Profiles
 * - GET /api/simulation/{simulationId}/config - 获取模拟配置
 * - GET /api/simulation/{simulationId}/config/realtime - 实时获取生成中的配置
 * - GET /api/simulation/list - 列出所有模拟
 * - POST /api/simulation/start - 启动模拟
 * - POST /api/simulation/stop - 停止模拟
 * - GET /api/simulation/{simulationId}/run-status - 获取运行状态
 * - GET /api/simulation/{simulationId}/run-status/detail - 获取详细运行状态
 * - GET /api/simulation/{simulationId}/posts - 获取模拟帖子
 * - GET /api/simulation/{simulationId}/timeline - 获取模拟时间线
 * - GET /api/simulation/{simulationId}/agent-stats - 获取 Agent 统计信息
 * - GET /api/simulation/{simulationId}/actions - 获取动作历史
 * - POST /api/simulation/close-env - 关闭模拟环境
 * - POST /api/simulation/env-status - 获取环境状态
 * - POST /api/simulation/interview/batch - 批量采访 Agent
 * - GET /api/simulation/history - 获取历史模拟列表
 */

/**
 * 创建模拟
 * 
 * 创建一个新的社交网络模拟实例。模拟是基于知识图谱和 Agent 技术构建的，
 * 可以模拟真实社交网络中的用户行为和交互模式。
 * 
 * 创建模拟后，需要调用 prepareSimulation 来准备模拟环境（生成 Agent Profiles 等）。
 * 
 * @param {Object} data - 模拟创建参数对象，包含以下字段：
 *   - project_id: String - 项目 ID，关联到知识图谱项目
 *   - graph_id: String (可选) - 图谱 ID，如果提供则使用指定图谱
 *   - enable_twitter: Boolean (可选) - 是否启用 Twitter 平台，默认为 false
 *   - enable_reddit: Boolean (可选) - 是否启用 Reddit 平台，默认为 true
 * @returns {Promise<Object>} 返回一个 Promise，解析后包含模拟信息：
 *   - simulation_id: String - 模拟 ID
 *   - project_id: String - 项目 ID
 *   - status: String - 模拟状态（created/prepared/running/stopped/closed）
 *   - created_at: String - 创建时间
 *   - config: Object - 模拟配置信息
 * 
 * @example
 * // 使用示例：创建模拟
 * const result = await createSimulation({
 *   project_id: 'proj_123',
 *   graph_id: 'graph_456',
 *   enable_twitter: true,
 *   enable_reddit: true
 * })
 * console.log('模拟 ID:', result.simulation_id)
 */
export const createSimulation = (data) => {
  // 使用 requestWithRetry 实现自动重试
  // 最多重试 3 次，初始延迟 1000ms
  // 使用指数退避算法：1000ms, 2000ms, 4000ms
  return requestWithRetry(() => service.post('/api/simulation/create', data), 3, 1000)
}

/**
 * 准备模拟环境（异步任务）
 * 
 * 准备模拟运行所需的环境，包括生成 Agent Profiles、配置参数等。
 * 这是一个耗时的异步操作，因为需要：
 * 1. 根据知识图谱生成多个 Agent 的详细档案
 * 2. 为每个 Agent 分配性格、兴趣、偏好等属性
 * 3. 配置模拟环境的各种参数
 * 4. 初始化平台特定的配置（如 Reddit 的子版块、Twitter 的标签等）
 * 
 * 准备过程可能需要几分钟时间，具体取决于 Agent 数量和配置复杂度。
 * 
 * @param {Object} data - 准备参数对象，包含以下字段：
 *   - simulation_id: String - 模拟 ID
 *   - entity_types: Array<String> (可选) - Agent 实体类型列表
 *   - use_llm_for_profiles: Boolean (可选) - 是否使用 LLM 生成 Profile，默认为 true
 *     如果为 true，使用大语言模型生成更真实的 Agent 档案
 *     如果为 false，使用模板或规则生成档案
 *   - parallel_profile_count: Number (可选) - 并行生成 Profile 的数量，默认为 5
 *     控制同时生成多少个 Agent 的档案，影响生成速度和资源消耗
 *   - force_regenerate: Boolean (可选) - 是否强制重新生成，默认为 false
 *     如果为 true，即使已存在 Profile 也会重新生成
 *     如果为 false，且已存在 Profile 则跳过生成
 * @returns {Promise<Object>} 返回一个 Promise，解析后包含任务信息：
 *   - task_id: String - 异步任务 ID，用于查询准备进度
 *   - simulation_id: String - 模拟 ID
 *   - status: String - 任务状态（pending/processing/completed/failed）
 *   - message: String - 提示信息
 * 
 * @example
 * // 使用示例：准备模拟环境
 * const result = await prepareSimulation({
 *   simulation_id: 'sim_123',
 *   entity_types: ['user', 'influencer', 'brand'],
 *   use_llm_for_profiles: true,
 *   parallel_profile_count: 10,
 *   force_regenerate: false
 * })
 * console.log('任务 ID:', result.task_id)
 * 
 * // 然后轮询任务状态
 * const status = await getPrepareStatus({ task_id: result.task_id })
 */
export const prepareSimulation = (data) => {
  // 使用 requestWithRetry 实现自动重试
  // 最多重试 3 次，初始延迟 1000ms
  return requestWithRetry(() => service.post('/api/simulation/prepare', data), 3, 1000)
}

/**
 * 查询准备任务进度
 * 
 * 查询模拟环境准备任务的执行进度和状态。
 * 客户端可以定期轮询此接口来跟踪准备进度。
 * 
 * @param {Object} data - 查询参数对象，包含以下字段之一：
 *   - task_id: String (可选) - 任务 ID，通过 task_id 查询
 *   - simulation_id: String (可选) - 模拟 ID，通过 simulation_id 查询
 *     如果同时提供 task_id 和 simulation_id，优先使用 task_id
 * @returns {Promise<Object>} 返回一个 Promise，解析后包含任务状态：
 *   - task_id: String - 任务 ID
 *   - simulation_id: String - 模拟 ID
 *   - status: String - 任务状态（pending/processing/completed/failed）
 *   - progress: Number - 进度百分比（0-100）
 *   - current_step: String - 当前执行的步骤描述
 *   - total_steps: Number - 总步骤数
 *   - current_step_index: Number - 当前步骤索引
 *   - profiles_generated: Number - 已生成的 Profile 数量
 *   - total_profiles: Number - 总 Profile 数量
 *   - error: String - 错误信息（仅在 failed 状态时存在）
 *   - created_at: String - 创建时间
 *   - updated_at: String - 最后更新时间
 * 
 * @example
 * // 使用示例：轮询准备任务状态
 * async function pollPrepareStatus(taskId) {
 *   while (true) {
 *     const status = await getPrepareStatus({ task_id: taskId })
 *     console.log(`进度: ${status.progress}%`)
 *     console.log(`已生成 Profile: ${status.profiles_generated}/${status.total_profiles}`)
 *     
 *     if (status.status === 'completed') {
 *       console.log('环境准备完成！')
 *       break
 *     }
 *     
 *     if (status.status === 'failed') {
 *       throw new Error(status.error)
 *     }
 *     
 *     await new Promise(resolve => setTimeout(resolve, 2000))
 *   }
 * }
 */
export const getPrepareStatus = (data) => {
  return service.post('/api/simulation/prepare/status', data)
}

/**
 * 获取模拟状态
 * 
 * 获取模拟的完整状态信息，包括基本信息、配置、统计数据等。
 * 
 * @param {String} simulationId - 模拟 ID
 * @returns {Promise<Object>} 返回一个 Promise，解析后包含模拟状态：
 *   - simulation_id: String - 模拟 ID
 *   - project_id: String - 项目 ID
 *   - graph_id: String - 图谱 ID
 *   - status: String - 模拟状态（created/prepared/running/stopped/closed）
 *   - created_at: String - 创建时间
 *   - started_at: String - 启动时间
 *   - stopped_at: String - 停止时间
 *   - config: Object - 模拟配置
 *   - stats: Object - 统计信息
 *   - platforms: Array<String> - 启用的平台列表
 * 
 * @example
 * // 使用示例：获取模拟状态
 * const simulation = await getSimulation('sim_123')
 * console.log('模拟状态:', simulation.status)
 * console.log('启用平台:', simulation.platforms)
 */
export const getSimulation = (simulationId) => {
  return service.get(`/api/simulation/${simulationId}`)
}

/**
 * 获取模拟的 Agent Profiles
 * 
 * 获取模拟中所有 Agent 的详细档案信息。
 * Agent Profile 包含 Agent 的个人信息、性格特征、兴趣偏好等。
 * 
 * @param {String} simulationId - 模拟 ID
 * @param {String} platform - 平台类型，可选值：'reddit' 或 'twitter'，默认为 'reddit'
 * @returns {Promise<Object>} 返回一个 Promise，解析后包含 Profiles：
 *   - profiles: Array<Object> - Agent 档案数组
 *     每个档案包含：
 *     - agent_id: String - Agent ID
 *     - name: String - 姓名
 *     - age: Number - 年龄
 *     - gender: String - 性别
 *     - interests: Array<String> - 兴趣列表
 *     - personality: Object - 性格特征
 *     - bio: String - 个人简介
 *     - platform_specific: Object - 平台特定信息
 *   - total: Number - 总数量
 *   - platform: String - 平台类型
 * 
 * @example
 * // 使用示例：获取 Reddit 平台的 Agent Profiles
 * const result = await getSimulationProfiles('sim_123', 'reddit')
 * console.log(`共有 ${result.total} 个 Agent`)
 * result.profiles.forEach(profile => {
 *   console.log(`${profile.name}: ${profile.bio}`)
 * })
 */
export const getSimulationProfiles = (simulationId, platform = 'reddit') => {
  // 使用 params 对象传递查询参数
  return service.get(`/api/simulation/${simulationId}/profiles`, { params: { platform } })
}

/**
 * 实时获取生成中的 Agent Profiles
 * 
 * 获取正在生成的 Agent Profiles 的实时数据。
 * 在环境准备过程中，Agent Profiles 是逐步生成的，此接口可以获取已生成的部分数据。
 * 
 * 与 getSimulationProfiles 的区别：
 * - getSimulationProfiles：获取已完成的完整 Profiles
 * - getSimulationProfilesRealtime：获取正在生成的实时 Profiles（可能不完整）
 * 
 * @param {String} simulationId - 模拟 ID
 * @param {String} platform - 平台类型，可选值：'reddit' 或 'twitter'，默认为 'reddit'
 * @returns {Promise<Object>} 返回一个 Promise，解析后包含实时 Profiles：
 *   - profiles: Array<Object> - 已生成的 Agent 档案数组
 *   - generated_count: Number - 已生成的数量
 *   - total_count: Number - 总数量
 *   - is_complete: Boolean - 是否生成完成
 *   - platform: String - 平台类型
 * 
 * @example
 * // 使用示例：实时获取正在生成的 Profiles
 * async function watchProfileGeneration(simulationId) {
 *   while (true) {
 *     const result = await getSimulationProfilesRealtime(simulationId, 'reddit')
 *     console.log(`已生成: ${result.generated_count}/${result.total_count}`)
 *     
 *     if (result.is_complete) {
 *       console.log('Profile 生成完成！')
 *       break
 *     }
 *     
 *     await new Promise(resolve => setTimeout(resolve, 2000))
 *   }
 * }
 */
export const getSimulationProfilesRealtime = (simulationId, platform = 'reddit') => {
  return service.get(`/api/simulation/${simulationId}/profiles/realtime`, { params: { platform } })
}

/**
 * 获取模拟配置
 * 
 * 获取模拟的完整配置信息，包括环境参数、Agent 配置、平台配置等。
 * 
 * @param {String} simulationId - 模拟 ID
 * @returns {Promise<Object>} 返回一个 Promise，解析后包含配置信息：
 *   - simulation_id: String - 模拟 ID
 *   - config: Object - 完整配置对象
 *     - environment: Object - 环境配置
 *     - agents: Object - Agent 配置
 *     - platforms: Object - 平台配置
 *     - simulation: Object - 模拟参数配置
 *   - metadata: Object - 配置元数据
 *   - updated_at: String - 最后更新时间
 * 
 * @example
 * // 使用示例：获取模拟配置
 * const result = await getSimulationConfig('sim_123')
 * console.log('环境配置:', result.config.environment)
 * console.log('Agent 配置:', result.config.agents)
 */
export const getSimulationConfig = (simulationId) => {
  return service.get(`/api/simulation/${simulationId}/config`)
}

/**
 * 实时获取生成中的模拟配置
 * 
 * 获取正在生成的模拟配置的实时数据。
 * 在环境准备过程中，配置是逐步生成的，此接口可以获取已生成的部分配置。
 * 
 * @param {String} simulationId - 模拟 ID
 * @returns {Promise<Object>} 返回一个 Promise，解析后包含实时配置：
 *   - config: Object - 已生成的配置对象
 *   - is_complete: Boolean - 是否生成完成
 *   - progress: Number - 生成进度百分比
 *   - metadata: Object - 配置元数据
 * 
 * @example
 * // 使用示例：实时获取正在生成的配置
 * const result = await getSimulationConfigRealtime('sim_123')
 * console.log('配置进度:', result.progress)
 * console.log('当前配置:', result.config)
 */
export const getSimulationConfigRealtime = (simulationId) => {
  return service.get(`/api/simulation/${simulationId}/config/realtime`)
}

/**
 * 列出所有模拟
 * 
 * 获取项目中的所有模拟列表，可以按项目 ID 过滤。
 * 
 * @param {String} projectId - 项目 ID（可选），如果提供则只返回该项目的模拟
 * @returns {Promise<Object>} 返回一个 Promise，解析后包含模拟列表：
 *   - simulations: Array<Object> - 模拟数组
 *     每个模拟包含：
 *     - simulation_id: String - 模拟 ID
 *     - project_id: String - 项目 ID
 *     - status: String - 模拟状态
 *     - created_at: String - 创建时间
 *     - platforms: Array<String> - 启用的平台
 *   - total: Number - 总数量
 * 
 * @example
 * // 使用示例：列出所有模拟
 * const result = await listSimulations()
 * console.log(`共有 ${result.total} 个模拟`)
 * 
 * // 使用示例：列出特定项目的模拟
 * const projectResult = await listSimulations('proj_123')
 * console.log(`项目中有 ${projectResult.total} 个模拟`)
 */
export const listSimulations = (projectId) => {
  // 如果提供了 projectId，则添加到查询参数中
  const params = projectId ? { project_id: projectId } : {}
  return service.get('/api/simulation/list', { params })
}

/**
 * 启动模拟
 * 
 * 启动模拟运行，开始 Agent 之间的社交交互。
 * 启动后，Agent 会根据其档案和行为规则在社交平台上发布内容、回复、点赞等。
 * 
 * @param {Object} data - 启动参数对象，包含以下字段：
 *   - simulation_id: String - 模拟 ID
 *   - platform: String (可选) - 指定启动的平台，默认为所有平台
 *   - max_rounds: Number (可选) - 最大轮次数，默认为无限
 *     指定模拟运行的最大轮次，达到后自动停止
 *   - enable_graph_memory_update: Boolean (可选) - 是否启用图谱记忆更新，默认为 true
 *     如果为 true，Agent 的行为会更新知识图谱
 *     如果为 false，知识图谱保持不变
 * @returns {Promise<Object>} 返回一个 Promise，解析后包含启动结果：
 *   - simulation_id: String - 模拟 ID
 *   - status: String - 新状态（running）
 *   - started_at: String - 启动时间
 *   - message: String - 提示信息
 * 
 * @example
 * // 使用示例：启动模拟
 * const result = await startSimulation({
 *   simulation_id: 'sim_123',
 *   platform: 'reddit',
 *   max_rounds: 100,
 *   enable_graph_memory_update: true
 * })
 * console.log('模拟已启动，状态:', result.status)
 */
export const startSimulation = (data) => {
  // 使用 requestWithRetry 实现自动重试
  // 最多重试 3 次，初始延迟 1000ms
  return requestWithRetry(() => service.post('/api/simulation/start', data), 3, 1000)
}

/**
 * 停止模拟
 * 
 * 停止正在运行的模拟。停止后，Agent 不再进行新的交互，
 * 但模拟环境仍然保持打开状态，可以重新启动或获取数据。
 * 
 * @param {Object} data - 停止参数对象，包含以下字段：
 *   - simulation_id: String - 模拟 ID
 * @returns {Promise<Object>} 返回一个 Promise，解析后包含停止结果：
 *   - simulation_id: String - 模拟 ID
 *   - status: String - 新状态（stopped）
 *   - stopped_at: String - 停止时间
 *   - message: String - 提示信息
 * 
 * @example
 * // 使用示例：停止模拟
 * const result = await stopSimulation({ simulation_id: 'sim_123' })
 * console.log('模拟已停止，状态:', result.status)
 */
export const stopSimulation = (data) => {
  return service.post('/api/simulation/stop', data)
}

/**
 * 获取模拟运行实时状态
 * 
 * 获取模拟运行的实时状态信息，包括当前轮次、Agent 活动情况等。
 * 
 * @param {String} simulationId - 模拟 ID
 * @returns {Promise<Object>} 返回一个 Promise，解析后包含运行状态：
 *   - simulation_id: String - 模拟 ID
 *   - status: String - 运行状态（running/stopped）
 *   - current_round: Number - 当前轮次
 *   - total_rounds: Number - 总轮次数
 *   - active_agents: Number - 活跃 Agent 数量
 *   - total_posts: Number - 总帖子数
 *   - total_actions: Number - 总动作数
 *   - started_at: String - 启动时间
 *   - last_action_at: String - 最后动作时间
 * 
 * @example
 * // 使用示例：获取运行状态
 * const status = await getRunStatus('sim_123')
 * console.log(`当前轮次: ${status.current_round}`)
 * console.log(`活跃 Agent: ${status.active_agents}`)
 * console.log(`总帖子数: ${status.total_posts}`)
 */
export const getRunStatus = (simulationId) => {
  return service.get(`/api/simulation/${simulationId}/run-status`)
}

/**
 * 获取模拟运行详细状态（包含最近动作）
 * 
 * 获取模拟运行的详细状态信息，包括最近发生的动作、Agent 活动详情等。
 * 
 * @param {String} simulationId - 模拟 ID
 * @returns {Promise<Object>} 返回一个 Promise，解析后包含详细状态：
 *   - simulation_id: String - 模拟 ID
 *   - status: String - 运行状态
 *   - current_round: Number - 当前轮次
 *   - recent_actions: Array<Object> - 最近动作数组
 *     每个动作包含：
 *     - action_id: String - 动作 ID
 *     - agent_id: String - Agent ID
 *     - agent_name: String - Agent 名称
 *     - action_type: String - 动作类型（post/comment/like/share）
 *     - platform: String - 平台类型
 *     - timestamp: String - 时间戳
 *     - content: Object - 动作内容
 *   - agent_activities: Object - Agent 活动统计
 *   - platform_stats: Object - 平台统计信息
 * 
 * @example
 * // 使用示例：获取详细运行状态
 * const detail = await getRunStatusDetail('sim_123')
 * console.log('最近动作:')
 * detail.recent_actions.forEach(action => {
 *   console.log(`${action.agent_name} ${action.action_type}: ${action.content}`)
 * })
 */
export const getRunStatusDetail = (simulationId) => {
  return service.get(`/api/simulation/${simulationId}/run-status/detail`)
}

/**
 * 获取模拟中的帖子
 * 
 * 获取模拟中 Agent 发布的帖子内容，支持分页查询。
 * 
 * @param {String} simulationId - 模拟 ID
 * @param {String} platform - 平台类型，可选值：'reddit' 或 'twitter'，默认为 'reddit'
 * @param {Number} limit - 返回数量限制，默认为 50
 * @param {Number} offset - 偏移量，用于分页，默认为 0
 * @returns {Promise<Object>} 返回一个 Promise，解析后包含帖子列表：
 *   - posts: Array<Object> - 帖子数组
 *     每个帖子包含：
 *     - post_id: String - 帖子 ID
 *     - agent_id: String - 发布者 Agent ID
 *     - agent_name: String - 发布者名称
 *     - platform: String - 平台类型
 *     - content: String - 帖子内容
 *     - timestamp: String - 发布时间
 *     - round: Number - 发布轮次
 *     - likes: Number - 点赞数
 *     - comments: Number - 评论数
 *     - shares: Number - 分享数
 *   - total: Number - 总帖子数
 *   - limit: Number - 本次返回数量
 *   - offset: Number - 偏移量
 * 
 * @example
 * // 使用示例：获取前 50 个帖子
 * const result = await getSimulationPosts('sim_123', 'reddit', 50, 0)
 * console.log(`共有 ${result.total} 个帖子`)
 * result.posts.forEach(post => {
 *   console.log(`${post.agent_name}: ${post.content}`)
 * })
 * 
 * // 使用示例：分页获取帖子
 * const page2 = await getSimulationPosts('sim_123', 'reddit', 50, 50)
 */
export const getSimulationPosts = (simulationId, platform = 'reddit', limit = 50, offset = 0) => {
  return service.get(`/api/simulation/${simulationId}/posts`, {
    params: { platform, limit, offset }
  })
}

/**
 * 获取模拟时间线（按轮次汇总）
 * 
 * 获取模拟的时间线数据，按轮次汇总统计信息。
 * 时间线展示了模拟随时间的发展过程，包括每轮的活动统计。
 * 
 * @param {String} simulationId - 模拟 ID
 * @param {Number} startRound - 起始轮次，默认为 0
 * @param {Number} endRound - 结束轮次，默认为 null（表示到最新轮次）
 * @returns {Promise<Object>} 返回一个 Promise，解析后包含时间线数据：
 *   - timeline: Array<Object> - 时间线数组
 *     每个时间点包含：
 *     - round: Number - 轮次
 *     - timestamp: String - 时间戳
 *     - posts: Number - 该轮帖子数
 *     - comments: Number - 该轮评论数
 *     - likes: Number - 该轮点赞数
 *     - active_agents: Number - 该轮活跃 Agent 数
 *   - total_rounds: Number - 总轮次数
 *   - start_round: Number - 起始轮次
 *   - end_round: Number - 结束轮次
 * 
 * @example
 * // 使用示例：获取完整时间线
 * const timeline = await getSimulationTimeline('sim_123', 0, null)
 * timeline.timeline.forEach(point => {
 *   console.log(`轮次 ${point.round}: ${point.posts} 帖子, ${point.active_agents} 活跃 Agent`)
 * })
 * 
 * // 使用示例：获取特定轮次范围的时间线
 * const partial = await getSimulationTimeline('sim_123', 10, 20)
 */
export const getSimulationTimeline = (simulationId, startRound = 0, endRound = null) => {
  const params = { start_round: startRound }
  // 如果指定了结束轮次，则添加到参数中
  if (endRound !== null) {
    params.end_round = endRound
  }
  return service.get(`/api/simulation/${simulationId}/timeline`, { params })
}

/**
 * 获取 Agent 统计信息
 * 
 * 获取模拟中所有 Agent 的统计信息，包括发帖数、互动数等。
 * 
 * @param {String} simulationId - 模拟 ID
 * @returns {Promise<Object>} 返回一个 Promise，解析后包含统计信息：
 *   - agent_stats: Array<Object> - Agent 统计数组
 *     每个 Agent 包含：
 *     - agent_id: String - Agent ID
 *     - agent_name: String - Agent 名称
 *     - posts: Number - 发帖数
 *     - comments: Number - 评论数
 *     - likes: Number - 点赞数
 *     - shares: Number - 分享数
 *     - received_likes: Number - 被点赞数
 *     - received_comments: Number - 被评论数
 *     - total_interactions: Number - 总互动数
 *   - summary: Object - 汇总统计
 *     - total_agents: Number - 总 Agent 数
 *     - total_posts: Number - 总帖子数
 *     - total_interactions: Number - 总互动数
 * 
 * @example
 * // 使用示例：获取 Agent 统计
 * const stats = await getAgentStats('sim_123')
 * console.log(`总 Agent 数: ${stats.summary.total_agents}`)
 * stats.agent_stats.forEach(agent => {
 *   console.log(`${agent.agent_name}: ${agent.posts} 帖子, ${agent.total_interactions} 互动`)
 * })
 */
export const getAgentStats = (simulationId) => {
  return service.get(`/api/simulation/${simulationId}/agent-stats`)
}

/**
 * 获取模拟动作历史
 * 
 * 获取模拟中所有 Agent 的动作历史记录，支持多种过滤条件。
 * 
 * @param {String} simulationId - 模拟 ID
 * @param {Object} params - 查询参数对象，包含以下可选字段：
 *   - limit: Number - 返回数量限制，默认为 100
 *   - offset: Number - 偏移量，用于分页，默认为 0
 *   - platform: String - 平台过滤（'reddit' 或 'twitter'）
 *   - agent_id: String - Agent ID 过滤
 *   - round_num: Number - 轮次过滤
 * @returns {Promise<Object>} 返回一个 Promise，解析后包含动作历史：
 *   - actions: Array<Object> - 动作数组
 *     每个动作包含：
 *     - action_id: String - 动作 ID
 *     - agent_id: String - Agent ID
 *     - agent_name: String - Agent 名称
 *     - action_type: String - 动作类型
 *     - platform: String - 平台类型
 *     - round: Number - 轮次
 *     - timestamp: String - 时间戳
 *     - content: Object - 动作内容
 *   - total: Number - 总动作数
 *   - limit: Number - 本次返回数量
 *   - offset: Number - 偏移量
 * 
 * @example
 * // 使用示例：获取所有动作
 * const result = await getSimulationActions('sim_123')
 * console.log(`共有 ${result.total} 个动作`)
 * 
 * // 使用示例：获取特定 Agent 的动作
 * const agentActions = await getSimulationActions('sim_123', {
 *   agent_id: 'agent_123',
 *   limit: 50
 * })
 * 
 * // 使用示例：获取特定轮次的动作
 * const roundActions = await getSimulationActions('sim_123', {
 *   round_num: 10
 * })
 */
export const getSimulationActions = (simulationId, params = {}) => {
  return service.get(`/api/simulation/${simulationId}/actions`, { params })
}

/**
 * 关闭模拟环境（优雅退出）
 * 
 * 优雅地关闭模拟环境，释放资源。
 * 优雅退出会：
 * 1. 停止所有正在运行的 Agent
 * 2. 保存当前状态和数据
 * 3. 清理临时文件和资源
 * 4. 关闭数据库连接等
 * 
 * 与 stopSimulation 的区别：
 * - stopSimulation：停止模拟运行，但环境保持打开
 * - closeSimulationEnv：完全关闭环境，释放所有资源
 * 
 * @param {Object} data - 关闭参数对象，包含以下字段：
 *   - simulation_id: String - 模拟 ID
 *   - timeout: Number (可选) - 超时时间（秒），默认为 30
 *     指定优雅退出的最大等待时间，超时后强制关闭
 * @returns {Promise<Object>} 返回一个 Promise，解析后包含关闭结果：
 *   - simulation_id: String - 模拟 ID
 *   - status: String - 新状态（closed）
 *   - closed_at: String - 关闭时间
 *   - message: String - 提示信息
 *   - resources_freed: Boolean - 资源是否已释放
 * 
 * @example
 * // 使用示例：关闭模拟环境
 * const result = await closeSimulationEnv({
 *   simulation_id: 'sim_123',
 *   timeout: 60
 * })
 * console.log('环境已关闭，状态:', result.status)
 */
export const closeSimulationEnv = (data) => {
  return service.post('/api/simulation/close-env', data)
}

/**
 * 获取模拟环境状态
 * 
 * 获取模拟环境的当前状态，包括资源使用情况、进程状态等。
 * 
 * @param {Object} data - 查询参数对象，包含以下字段：
 *   - simulation_id: String - 模拟 ID
 * @returns {Promise<Object>} 返回一个 Promise，解析后包含环境状态：
 *   - simulation_id: String - 模拟 ID
 *   - env_status: String - 环境状态（running/stopped/closed）
 *   - resource_usage: Object - 资源使用情况
 *     - memory: Object - 内存使用
 *     - cpu: Object - CPU 使用
 *     - disk: Object - 磁盘使用
 *   - process_info: Object - 进程信息
 *   - connections: Object - 连接信息
 *   - last_updated: String - 最后更新时间
 * 
 * @example
 * // 使用示例：获取环境状态
 * const status = await getEnvStatus({ simulation_id: 'sim_123' })
 * console.log('环境状态:', status.env_status)
 * console.log('内存使用:', status.resource_usage.memory)
 */
export const getEnvStatus = (data) => {
  return service.post('/api/simulation/env-status', data)
}

/**
 * 批量采访 Agent
 * 
 * 批量向多个 Agent 提问，获取其观点和反馈。
 * 采访可以用于：
 * - 了解 Agent 对特定话题的看法
 * - 收集 Agent 的意见和建议
 * - 分析 Agent 的思维模式
 * - 生成报告或分析材料
 * 
 * @param {Object} data - 采访参数对象，包含以下字段：
 *   - simulation_id: String - 模拟 ID
 *   - interviews: Array<Object> - 采访问题数组
 *     每个采访包含：
 *     - agent_id: String - Agent ID
 *     - prompt: String - 采访问题
 * @returns {Promise<Object>} 返回一个 Promise，解析后包含采访结果：
 *   - simulation_id: String - 模拟 ID
 *   - results: Array<Object> - 采访结果数组
 *     每个结果包含：
 *     - agent_id: String - Agent ID
 *     - agent_name: String - Agent 名称
 *     - prompt: String - 采访问题
 *     - response: String - Agent 回复
 *     - timestamp: String - 回复时间
 *   - total: Number - 总采访数
 *   - successful: Number - 成功数
 *   - failed: Number - 失败数
 * 
 * @example
 * // 使用示例：批量采访 Agent
 * const result = await interviewAgents({
 *   simulation_id: 'sim_123',
 *   interviews: [
 *     { agent_id: 'agent_1', prompt: '你对当前话题有什么看法？' },
 *     { agent_id: 'agent_2', prompt: '你认为应该如何解决这个问题？' },
 *     { agent_id: 'agent_3', prompt: '你有什么建议吗？' }
 *   ]
 * })
 * 
 * result.results.forEach(item => {
 *   console.log(`${item.agent_name}: ${item.response}`)
 * })
 */
export const interviewAgents = (data) => {
  // 使用 requestWithRetry 实现自动重试
  // 最多重试 3 次，初始延迟 1000ms
  return requestWithRetry(() => service.post('/api/simulation/interview/batch', data), 3, 1000)
}

/**
 * 获取历史模拟列表（带项目详情）
 * 
 * 获取历史模拟列表，包含关联的项目详情信息。
 * 用于首页历史项目展示，让用户快速查看和访问之前的模拟。
 * 
 * @param {Number} limit - 返回数量限制，默认为 20
 * @returns {Promise<Object>} 返回一个 Promise，解析后包含历史模拟列表：
 *   - simulations: Array<Object> - 模拟数组
 *     每个模拟包含：
 *     - simulation_id: String - 模拟 ID
 *     - project_id: String - 项目 ID
 *     - project_name: String - 项目名称
 *     - status: String - 模拟状态
 *     - created_at: String - 创建时间
 *     - platforms: Array<String> - 启用的平台
 *     - summary: Object - 模拟摘要
 *       - total_rounds: Number - 总轮次数
 *       - total_posts: Number - 总帖子数
 *       - total_agents: Number - 总 Agent 数
 *   - total: Number - 总数量
 *   - limit: Number - 返回数量限制
 * 
 * @example
 * // 使用示例：获取历史模拟列表
 * const history = await getSimulationHistory(20)
 * console.log(`共有 ${history.total} 个历史模拟`)
 * 
 * history.simulations.forEach(sim => {
 *   console.log(`${sim.project_name} - ${sim.status}`)
 *   console.log(`  轮次: ${sim.summary.total_rounds}, 帖子: ${sim.summary.total_posts}`)
 * })
 */
export const getSimulationHistory = (limit = 20) => {
  return service.get('/api/simulation/history', { params: { limit } })
}

