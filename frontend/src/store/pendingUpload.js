/**
 * 待上传文件和需求的状态管理模块
 * 
 * 本模块实现了一个简单的状态管理系统，用于临时存储用户在首页选择的文件和模拟需求。
 * 这种设计模式解决了跨页面传递数据的问题，避免了使用复杂的全局状态管理库（如 Pinia）。
 * 
 * 使用场景：
 * 用户在首页（Home.vue）选择文件并输入模拟需求后，点击"启动引擎"按钮，
 * 此时需要跳转到处理页面（Process.vue）进行实际的文件上传和 API 调用。
 * 在跳转过程中，需要临时保存用户选择的文件和需求信息。
 * 
 * 工作流程：
 * 1. 用户在首页选择文件并输入需求
 * 2. 调用 setPendingUpload() 保存文件和需求
 * 3. 跳转到处理页面
 * 4. 处理页面调用 getPendingUpload() 获取文件和需求
 * 5. 处理页面调用 clearPendingUpload() 清除临时数据
 * 
 * 技术实现：
 * - 使用 Vue 3 的 reactive() API 创建响应式状态对象
 * - 响应式状态会自动追踪依赖，当状态变化时自动更新视图
 * - 导出操作函数（set、get、clear）来管理状态
 * - 导出 state 对象本身，允许组件直接访问和监听状态变化
 * 
 * Vue 响应式系统核心概念：
 * - reactive(): 创建响应式对象，对象的属性变化会被 Vue 追踪
 * - 响应式依赖追踪：Vue 自动追踪哪些组件使用了哪些响应式数据
 * - 自动更新：当响应式数据变化时，Vue 自动更新使用了这些数据的组件
 * - 状态管理：集中管理应用状态，便于维护和调试
 * 
 * 优点：
 * - 简单轻量：不需要引入额外的状态管理库
 * - 响应式：状态变化自动触发视图更新
 * - 类型安全：使用 JavaScript 原生类型，无需额外配置
 * - 易于理解：代码结构清晰，易于维护
 * 
 * 注意事项：
 * - 这是一个简单的状态管理方案，适合小型应用或临时数据存储
 * - 对于复杂应用，建议使用 Pinia 或 Vuex 等专业状态管理库
 * - 状态存储在内存中，页面刷新后会丢失
 * - 如果需要持久化，可以使用 localStorage 或 sessionStorage
 * 
 * 与专业状态管理库的对比：
 * - Pinia/Vuex：提供完整的生态系统（插件、开发者工具、中间件等）
 * - 本模块：简单直接，适合临时数据存储和跨页面传递
 * - 选择依据：根据应用复杂度和团队需求选择合适的方案
 */

import { reactive } from 'vue'

/**
 * 响应式状态对象
 * 
 * 使用 Vue 3 的 reactive() API 创建响应式状态对象。
 * 响应式对象的属性变化会被 Vue 自动追踪，当属性值变化时，
 * 所有依赖这些属性的组件都会自动更新。
 * 
 * 状态结构：
 * - files: Array<File> - 待上传的文件数组
 *   用户在首页选择的文件，通常是 PDF、Word、TXT 等文档格式
 * - simulationRequirement: String - 模拟需求描述
 *   用户输入的模拟需求，用于指导知识图谱和模拟的生成
 * - isPending: Boolean - 是否有待上传的数据
 *   标记状态，用于判断是否有待处理的上传任务
 * 
 * 响应式原理：
 * 1. reactive() 创建一个智能体对象（Proxy）
 * 2. 当访问或修改对象的属性时，智能体会拦截操作
 * 3. Vue 记录哪些组件使用了哪些属性（依赖收集）
 * 4. 当属性值变化时，Vue 通知所有依赖的组件重新渲染
 * 
 * 使用示例：
 * ```javascript
 * import state from '@/store/pendingUpload'
 * 
 * // 在组件中直接使用
 * console.log(state.files)
 * console.log(state.simulationRequirement)
 * 
 * // 监听状态变化
 * watch(() => state.isPending, (newVal) => {
 *   console.log('待上传状态变化:', newVal)
 * })
 * ```
 */
const state = reactive({
  files: [],
  simulationRequirement: '',
  isPending: false
})

/**
 * 设置待上传的文件和需求
 * 
 * 将用户选择的文件和输入的模拟需求保存到状态中，
 * 并标记为待处理状态（isPending = true）。
 * 
 * @param {Array<File>} files - 待上传的文件数组
 *   用户在首页选择的文件，通常是文档文件（PDF、Word、TXT 等）
 *   每个文件对象包含：
 *   - name: String - 文件名
 *   - size: Number - 文件大小（字节）
 *   - type: String - 文件 MIME 类型
 *   - lastModified: Number - 最后修改时间戳
 * @param {String} requirement - 模拟需求描述
 *   用户输入的模拟需求，用于指导知识图谱和模拟的生成
 *   例如："构建一个电商领域的知识图谱，模拟用户在社交媒体上的行为"
 * 
 * @example
 * // 使用示例：在首页保存用户输入
 * import { setPendingUpload } from '@/store/pendingUpload'
 * 
 * const files = [file1, file2, file3]
 * const requirement = '构建电商领域知识图谱'
 * 
 * setPendingUpload(files, requirement)
 * 
 * // 然后跳转到处理页面
 * router.push({ name: 'Process', params: { projectId: 'new' } })
 */
export function setPendingUpload(files, requirement) {
  state.files = files
  state.simulationRequirement = requirement
  state.isPending = true
}

/**
 * 获取待上传的文件和需求
 * 
 * 返回当前存储的待上传数据，包括文件、需求和状态标记。
 * 返回的是状态对象的副本，避免直接修改原始状态。
 * 
 * @returns {Object} 包含待上传数据的对象
 *   - files: Array<File> - 待上传的文件数组
 *   - simulationRequirement: String - 模拟需求描述
 *   - isPending: Boolean - 是否有待上传的数据
 * 
 * @example
 * // 使用示例：在处理页面获取数据
 * import { getPendingUpload, clearPendingUpload } from '@/store/pendingUpload'
 * 
 * const pending = getPendingUpload()
 * 
 * if (pending.isPending) {
 *   console.log('待上传文件:', pending.files)
 *   console.log('模拟需求:', pending.simulationRequirement)
 *   
 *   // 进行文件上传和 API 调用
 *   await uploadFiles(pending.files)
 *   await generateOntology(pending.simulationRequirement)
 *   
 *   // 清除临时数据
 *   clearPendingUpload()
 * }
 */
export function getPendingUpload() {
  return {
    files: state.files,
    simulationRequirement: state.simulationRequirement,
    isPending: state.isPending
  }
}

/**
 * 清除待上传的文件和需求
 * 
 * 清空状态中的所有数据，将文件数组、需求描述和状态标记重置为初始值。
 * 通常在处理完上传任务后调用，避免数据残留。
 * 
 * 清除操作：
 * - files: 重置为空数组 []
 * - simulationRequirement: 重置为空字符串 ''
 * - isPending: 重置为 false
 * 
 * @example
 * // 使用示例：处理完成后清除数据
 * import { clearPendingUpload } from '@/store/pendingUpload'
 * 
 * async function handleUpload() {
 *   const pending = getPendingUpload()
 *   
 *   try {
 *     // 上传文件
 *     await uploadFiles(pending.files)
 *     
 *     // 生成本体
 *     await generateOntology(pending.simulationRequirement)
 *     
 *     console.log('上传成功')
 *   } catch (error) {
 *     console.error('上传失败:', error)
 *   } finally {
 *     // 无论成功或失败，都清除临时数据
 *     clearPendingUpload()
 *   }
 * }
 */
export function clearPendingUpload() {
  state.files = []
  state.simulationRequirement = ''
  state.isPending = false
}

export default state
