import service, { requestWithRetry } from './index'

/**
 * 图谱相关 API 接口模块
 * 
 * 本模块封装了所有与知识图谱相关的后端 API 接口调用。
 * 知识图谱是一种用图结构表示知识的结构化方法，由节点（实体）和边（关系）组成。
 * 
 * 主要功能：
 * - 生成本体：从文档和模拟需求中提取知识，构建领域本体
 * - 构建图谱：基于本体生成可视化知识图谱
 * - 任务管理：查询异步任务的执行状态
 * - 数据获取：获取图谱数据和项目信息
 * 
 * 技术说明：
 * - 使用 RESTful API 设计风格
 * - 遵循 HTTP 方法的语义：GET 用于查询，POST 用于创建
 * - 使用 multipart/form-data 处理文件上传
 * - 长时间运行的任务使用异步处理模式
 * 
 * RESTful API 设计原则：
 * 1. 使用名词表示资源（如 ontology、graph、task、project）
 * 2. 使用 HTTP 方法表示操作（GET 查询、POST 创建、PUT 更新、DELETE 删除）
 * 3. 使用层次化的 URL 结构表示资源关系
 * 4. 使用状态码表示请求结果
 * 
 * 示例 URL 结构：
 * - /api/graph/ontology/generate - 生成本体
 * - /api/graph/build - 构建图谱
 * - /api/graph/task/{taskId} - 查询任务状态
 * - /api/graph/data/{graphId} - 获取图谱数据
 * - /api/graph/project/{projectId} - 获取项目信息
 */

/**
 * 生成本体（上传文档和模拟需求）
 * 
 * 本体（Ontology）是对领域概念及其相互关系的规范化描述。
 * 生成本体的过程包括：
 * 1. 解析上传的文档文件（PDF、Word、TXT 等）
 * 2. 提取文档中的关键概念和实体
 * 3. 根据模拟需求定义概念之间的关系
 * 4. 构建结构化的本体模型
 * 
 * 这是一个耗时较长的操作，因此使用异步处理模式。
 * 函数返回一个任务 ID，客户端可以通过任务 ID 查询处理进度。
 * 
 * @param {FormData} formData - 表单数据对象，包含以下字段：
 *   - files: FileList - 上传的文档文件数组
 *   - simulation_requirement: String - 模拟需求描述
 *   - project_name: String - 项目名称
 * @returns {Promise<Object>} 返回一个 Promise，解析后包含任务 ID：
 *   - taskId: String - 异步任务 ID，用于查询处理状态
 *   - message: String - 提示信息
 * 
 * @example
 * // 使用示例
 * const formData = new FormData()
 * formData.append('files', file1)
 * formData.append('files', file2)
 * formData.append('simulation_requirement', '构建电商领域知识图谱')
 * formData.append('project_name', '电商项目')
 * 
 * const result = await generateOntology(formData)
 * console.log('任务 ID:', result.taskId)
 */
export function generateOntology(formData) {
  return requestWithRetry(() => 
    service({
      url: '/api/graph/ontology/generate',
      method: 'post',
      data: formData,
      headers: {
        // 使用 multipart/form-data 格式传输文件
        // 这是浏览器处理文件上传的标准格式
        // Axios 会自动设置 boundary 分隔符
        'Content-Type': 'multipart/form-data'
      }
    })
  )
}

/**
 * 构建图谱
 * 
 * 基于已生成的本体，构建可视化知识图谱。
 * 构建过程包括：
 * 1. 加载本体数据
 * 2. 应用图谱布局算法（如力导向布局、层次布局等）
 * 3. 生成节点和边的坐标信息
 * 4. 返回可用于前端渲染的图谱数据
 * 
 * @param {Object} data - 构建图谱的参数对象，包含以下字段：
 *   - project_id: String - 项目 ID，用于关联本体数据
 *   - graph_name: String - 图谱名称
 *   - [可选] layout: String - 布局算法类型
 *   - [可选] config: Object - 其他配置参数
 * @returns {Promise<Object>} 返回一个 Promise，解析后包含任务 ID：
 *   - taskId: String - 异步任务 ID
 *   - message: String - 提示信息
 * 
 * @example
 * // 使用示例
 * const result = await buildGraph({
 *   project_id: 'proj_123',
 *   graph_name: '电商知识图谱',
 *   layout: 'force'
 * })
 */
export function buildGraph(data) {
  return requestWithRetry(() =>
    service({
      url: '/api/graph/build',
      method: 'post',
      data
    })
  )
}

/**
 * 查询任务状态
 * 
 * 用于查询长时间运行任务的执行状态。
 * 异步任务处理流程：
 * 1. 客户端发起请求（如生成本体、构建图谱）
 * 2. 服务器立即返回任务 ID
 * 3. 客户端定期轮询任务状态
 * 4. 服务器返回当前状态和进度
 * 5. 任务完成后，客户端获取最终结果
 * 
 * 常见任务状态：
 * - pending: 等待处理
 * - processing: 处理中
 * - completed: 已完成
 * - failed: 失败
 * 
 * @param {String} taskId - 任务 ID，由生成本体或构建图谱接口返回
 * @returns {Promise<Object>} 返回一个 Promise，解析后包含任务状态信息：
 *   - status: String - 任务状态（pending/processing/completed/failed）
 *   - progress: Number - 进度百分比（0-100）
 *   - result: Object - 任务结果（仅在 completed 状态时存在）
 *   - error: String - 错误信息（仅在 failed 状态时存在）
 * 
 * @example
 * // 使用示例：轮询任务状态
 * async function pollTask(taskId) {
 *   while (true) {
 *     const status = await getTaskStatus(taskId)
 *     console.log(`进度: ${status.progress}%`)
 *     
 *     if (status.status === 'completed') {
 *       return status.result
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
export function getTaskStatus(taskId) {
  return service({
    url: `/api/graph/task/${taskId}`,
    method: 'get'
  })
}

/**
 * 获取图谱数据
 * 
 * 获取已构建的图谱的完整数据，用于前端可视化渲染。
 * 图谱数据结构：
 * - nodes: 节点数组，每个节点包含 id、label、type 等属性
 * - edges: 边数组，每条边包含 source、target、label 等属性
 * - layout: 布局信息
 * 
 * @param {String} graphId - 图谱 ID，由构建图谱接口返回
 * @returns {Promise<Object>} 返回一个 Promise，解析后包含图谱数据：
 *   - nodes: Array<Object> - 节点数组
 *   - edges: Array<Object> - 边数组
 *   - metadata: Object - 图谱元数据
 * 
 * @example
 * // 使用示例
 * const graphData = await getGraphData('graph_123')
 * console.log('节点数量:', graphData.nodes.length)
 * console.log('边数量:', graphData.edges.length)
 */
export function getGraphData(graphId) {
  return service({
    url: `/api/graph/data/${graphId}`,
    method: 'get'
  })
}

/**
 * 获取项目信息
 * 
 * 获取项目的详细信息，包括本体数据、配置参数等。
 * 项目信息包含：
 * - 基本信息：项目名称、创建时间、描述等
 * - 本体数据：概念、属性、关系定义
 * - 配置信息：图谱布局、样式配置等
 * 
 * @param {String} projectId - 项目 ID
 * @returns {Promise<Object>} 返回一个 Promise，解析后包含项目信息：
 *   - project_id: String - 项目 ID
 *   - project_name: String - 项目名称
 *   - created_at: String - 创建时间
 *   - ontology: Object - 本体数据
 *   - config: Object - 配置信息
 * 
 * @example
 * // 使用示例
 * const project = await getProject('proj_123')
 * console.log('项目名称:', project.project_name)
 * console.log('本体概念数量:', project.ontology.concepts.length)
 */
export function getProject(projectId) {
  return service({
    url: `/api/graph/project/${projectId}`,
    method: 'get'
  })
}
