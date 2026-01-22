<template>
  <!-- 主视图容器 -->
  <div class="main-view">
    <!-- 顶部导航栏 -->
    <header class="app-header">
      <!-- 左侧品牌标识 -->
      <div class="header-left">
        <!-- 品牌名称，点击返回首页 -->
        <div class="brand" @click="router.push('/')">MIROFISH</div>
      </div>
      
      <!-- 中间视图切换器 -->
      <div class="header-center">
        <div class="view-switcher">
          <!-- 视图模式切换按钮：图谱、双栏、工作台 -->
          <button 
            v-for="mode in ['graph', 'split', 'workbench']" 
            :key="mode"
            class="switch-btn"
            :class="{ active: viewMode === mode }"
            @click="viewMode = mode"
          >
            {{ { graph: '图谱', split: '双栏', workbench: '工作台' }[mode] }}
          </button>
        </div>
      </div>

      <!-- 右侧状态信息 -->
      <div class="header-right">
        <!-- 工作流程步骤指示器 -->
        <div class="workflow-step">
          <span class="step-num">Step {{ currentStep }}/5</span>
          <span class="step-name">{{ stepNames[currentStep - 1] }}</span>
        </div>
        <!-- 步骤分隔线 -->
        <div class="step-divider"></div>
        <!-- 状态指示器 -->
        <span class="status-indicator" :class="statusClass">
          <span class="dot"></span>
          {{ statusText }}
        </span>
      </div>
    </header>

    <!-- 主内容区域 -->
    <main class="content-area">
      <!-- 左侧面板：图谱视图 -->
      <div class="panel-wrapper left" :style="leftPanelStyle">
        <!-- 图谱面板组件 -->
        <GraphPanel 
          :graphData="graphData"
          :loading="graphLoading"
          :currentPhase="currentPhase"
          @refresh="refreshGraph"
          @toggle-maximize="toggleMaximize('graph')"
        />
      </div>

      <!-- 右侧面板：步骤组件 -->
      <div class="panel-wrapper right" :style="rightPanelStyle">
        <!-- Step 1: 图谱构建 -->
        <Step1GraphBuild 
          v-if="currentStep === 1"
          :currentPhase="currentPhase"
          :projectData="projectData"
          :ontologyProgress="ontologyProgress"
          :buildProgress="buildProgress"
          :graphData="graphData"
          :systemLogs="systemLogs"
          @next-step="handleNextStep"
        />
        <!-- Step 2: 环境搭建 -->
        <Step2EnvSetup
          v-else-if="currentStep === 2"
          :projectData="projectData"
          :graphData="graphData"
          :systemLogs="systemLogs"
          @go-back="handleGoBack"
          @next-step="handleNextStep"
          @add-log="addLog"
        />
      </div>
    </main>
  </div>
</template>

<script setup>
// 导入 Vue 3 Composition API 核心函数
// 
// Vue 3 Composition API 是 Vue 3 引入的新 API，它提供了一种更灵活的方式来组织组件逻辑
// 相比于 Vue 2 的 Options API，Composition API 允许我们将相关的逻辑组织在一起，而不是分散在 data、methods、computed 等选项中
// 
// 主要的 Composition API 函数包括：
// - ref(): 创建响应式引用，用于包装基本类型或对象
// - computed(): 创建计算属性，自动缓存结果，只有依赖项变化时才重新计算
// - onMounted(): 组件挂载到 DOM 后执行的钩子函数
// - onUnmounted(): 组件从 DOM 卸载前执行的钩子函数
// - nextTick(): 在 DOM 更新后执行的回调函数
// - watch(): 监听响应式数据的变化
// - watchEffect(): 立即执行并追踪依赖的副作用函数
// 
// 使用 Composition API 的优势：
// 1. 更好的逻辑复用：可以将相关逻辑提取到自定义组合函数（Composables）中
// 2. 更好的类型推断：TypeScript 支持更好
// 3. 更灵活的代码组织：可以按照功能而不是选项来组织代码
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

// 导入 Vue Router 路由相关函数
// 
// Vue Router 是 Vue.js 官方的路由管理器，用于构建单页面应用（SPA）
// 它通过管理 URL 和组件之间的映射关系，实现页面切换而不刷新整个页面
// 
// 主要的 Vue Router 函数和概念：
// - useRoute(): 获取当前路由对象，包含当前路由的信息（路径、参数、查询参数等）
// - useRouter(): 获取路由器实例，用于编程式导航（push、replace、go 等）
// - 路由配置：在路由配置文件中定义路径和组件的映射关系
// - 动态路由：使用 :param 语法定义动态路由参数
// - 嵌套路由：在路由配置中使用 children 属性定义嵌套路由
// - 路由守卫：beforeEach、beforeResolve、afterEach 等钩子函数用于控制路由跳转
// 
// 单页面应用（SPA）的优势：
// 1. 更快的页面切换：不需要重新加载整个页面，只更新变化的部分
// 2. 更好的用户体验：页面切换流畅，无刷新感
// 3. 更好的状态管理：可以在页面之间共享状态
import { useRoute, useRouter } from 'vue-router'
// 导入图谱面板组件
import GraphPanel from '../components/GraphPanel.vue'
// 导入 Step1 图谱构建组件
import Step1GraphBuild from '../components/Step1GraphBuild.vue'
// 导入 Step2 环境搭建组件
import Step2EnvSetup from '../components/Step2EnvSetup.vue'
// 导入图谱相关 API
import { generateOntology, getProject, buildGraph, getTaskStatus, getGraphData } from '../api/graph'
// 导入待上传文件存储相关函数
import { getPendingUpload, clearPendingUpload } from '../store/pendingUpload'

// 获取当前路由对象
const route = useRoute()
// 获取路由器实例
const router = useRouter()

// --- 布局状态管理 ---
// 视图模式：默认双栏模式
// 可选值：'graph'（图谱）、'split'（双栏）、'workbench'（工作台）
const viewMode = ref('split')

// --- 步骤状态管理 ---
// 当前步骤：1-图谱构建, 2-环境搭建, 3-开始模拟, 4-报告生成, 5-深度互动
const currentStep = ref(1)
// 步骤名称数组，对应每个步骤的中文名称
const stepNames = ['图谱构建', '环境搭建', '开始模拟', '报告生成', '深度互动']

// --- 数据状态管理 ---
// 当前项目 ID（从路由参数获取）
const currentProjectId = ref(route.params.projectId)
// 全局加载状态
const loading = ref(false)
// 图谱加载状态
const graphLoading = ref(false)
// 错误信息
const error = ref('')
// 项目数据
const projectData = ref(null)
// 图谱数据
const graphData = ref(null)
// 当前阶段：-1-上传, 0-本体生成, 1-图谱构建, 2-完成
const currentPhase = ref(-1)
// 本体生成进度
const ontologyProgress = ref(null)
// 图谱构建进度
const buildProgress = ref(null)
// 系统日志列表
const systemLogs = ref([])

// --- 轮询定时器 ---
// 
// 轮询（Polling）是一种定期检查服务器是否有新数据的技术
// 在前端开发中，轮询常用于以下场景：
// 1. 长时间运行的任务：定期检查任务是否完成
// 2. 实时数据更新：定期获取最新的数据状态
// 3. 服务器推送不可用时的替代方案：当 WebSocket 或 SSE 不可用时使用
// 
// 轮询的实现方式：
// - setInterval(): 定期执行函数，适合固定间隔的轮询
// - setTimeout(): 递归调用，适合可变间隔的轮询（如指数退避）
// 
// 轮询的优缺点：
// 优点：
// 1. 实现简单，不需要特殊的服务器支持
// 2. 兼容性好，所有浏览器都支持
// 3. 可以控制轮询频率，减少服务器压力
// 
// 缺点：
// 1. 实时性差：数据更新可能有延迟
// 2. 资源浪费：即使没有新数据也会发送请求
// 3. 服务器压力：大量客户端轮询会增加服务器负载
// 
// 轮询的优化策略：
// 1. 指数退避：初始间隔短，逐渐增加间隔，减少服务器压力
// 2. 长轮询：服务器保持连接，直到有新数据或超时
// 3. 条件轮询：只在必要时才进行轮询
// 
// 本项目中的轮询场景：
// - 任务状态轮询：每 2 秒检查一次图谱构建任务的状态
// - 图谱数据轮询：每 10 秒获取一次最新的图谱数据
// 
// 注意：组件卸载时必须清除定时器，避免内存泄漏
// 任务状态轮询定时器
let pollTimer = null
// 图谱数据轮询定时器
let graphPollTimer = null

// --- 计算属性：左侧面板样式 ---
// 
// computed() 是 Vue 3 的响应式 API，用于创建计算属性
// 计算属性是基于响应式数据计算得出的值，具有以下特点：
// 
// 1. 自动缓存：计算属性会缓存结果，只有依赖项变化时才重新计算
//    这与 methods 不同，methods 每次调用都会重新执行
// 
// 2. 响应式：计算属性会自动追踪依赖，当依赖项变化时自动更新
// 
// 3. 只读性：默认情况下，计算属性是只读的，不能直接赋值
//    如果需要可写的计算属性，可以使用 getter 和 setter
// 
// 计算属性 vs 方法：
// - 计算属性：有缓存，适合计算开销大的操作，依赖项不变时不会重新计算
// - 方法：无缓存，每次调用都会执行，适合需要实时计算的场景
// 
// 计算属性 vs 侦听器（watch）：
// - 计算属性：用于派生数据，基于其他数据计算出新数据
// - 侦听器：用于副作用，当数据变化时执行异步操作或开销大的操作
// 
// 根据视图模式动态计算左侧面板的样式
const leftPanelStyle = computed(() => {
  // 图谱模式：左侧面板占满整个宽度
  if (viewMode.value === 'graph') return { width: '100%', opacity: 1, transform: 'translateX(0)' }
  // 工作台模式：左侧面板隐藏
  if (viewMode.value === 'workbench') return { width: '0%', opacity: 0, transform: 'translateX(-20px)' }
  // 双栏模式：左侧面板占 50% 宽度
  return { width: '50%', opacity: 1, transform: 'translateX(0)' }
})

// --- 计算属性：右侧面板样式 ---
// 根据视图模式动态计算右侧面板的样式
const rightPanelStyle = computed(() => {
  // 工作台模式：右侧面板占满整个宽度
  if (viewMode.value === 'workbench') return { width: '100%', opacity: 1, transform: 'translateX(0)' }
  // 图谱模式：右侧面板隐藏
  if (viewMode.value === 'graph') return { width: '0%', opacity: 0, transform: 'translateX(20px)' }
  // 双栏模式：右侧面板占 50% 宽度
  return { width: '50%', opacity: 1, transform: 'translateX(0)' }
})

// --- 计算属性：状态样式类 ---
// 根据当前状态和阶段返回对应的 CSS 类名
const statusClass = computed(() => {
  if (error.value) return 'error' // 错误状态
  if (currentPhase.value >= 2) return 'completed' // 完成状态
  return 'processing' // 处理中状态
})

// --- 计算属性：状态文本 ---
// 根据当前阶段返回可读的状态文本
const statusText = computed(() => {
  if (error.value) return '错误' // 错误
  if (currentPhase.value >= 2) return '就绪' // 就绪
  if (currentPhase.value === 1) return '构建图谱中' // 构建图谱中
  if (currentPhase.value === 0) return '生成本体中' // 生成本体中
  return '初始化中' // 初始化中
})

// --- 辅助函数：添加系统日志 ---
// 向系统日志列表添加一条新日志
// 参数：msg - 日志消息内容
const addLog = (msg) => {
  // 生成时间戳：时:分:秒.毫秒
  const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + '.' + new Date().getMilliseconds().toString().padStart(3, '0')
  // 将日志添加到列表
  systemLogs.value.push({ time, msg })
  // 限制日志数量，最多保留 100 条
  if (systemLogs.value.length > 100) {
    systemLogs.value.shift()
  }
}

// --- 布局方法：切换最大化 ---
// 切换面板最大化状态
// 参数：target - 目标面板（'graph' 或其他）
const toggleMaximize = (target) => {
  // 如果当前已经是目标视图，则切换到双栏模式
  if (viewMode.value === target) {
    viewMode.value = 'split'
  } else {
    // 否则切换到目标视图
    viewMode.value = target
  }
}

// --- 步骤控制：处理下一步 ---
// 处理进入下一步的操作
// 参数：params - 可选参数对象，可能包含 maxRounds 等配置
const handleNextStep = (params = {}) => {
  if (currentStep.value < 5) {
    // 增加步骤编号
    currentStep.value++
    // 记录日志
    addLog(`进入 Step ${currentStep.value}: ${stepNames[currentStep.value - 1]}`)
    
    // 如果是从 Step 2 进入 Step 3，记录模拟轮数配置
    if (currentStep.value === 3 && params.maxRounds) {
      addLog(`自定义模拟轮数: ${params.maxRounds} 轮`)
    }
  }
}

// --- 步骤控制：处理返回上一步 ---
// 处理返回上一步的操作
const handleGoBack = () => {
  if (currentStep.value > 1) {
    // 减少步骤编号
    currentStep.value--
    // 记录日志
    addLog(`返回 Step ${currentStep.value}: ${stepNames[currentStep.value - 1]}`)
  }
}

// --- 数据逻辑：初始化项目 ---
// 根据路由参数初始化项目
const initProject = async () => {
  addLog('项目视图已初始化。')
  // 判断是新建项目还是加载已有项目
  if (currentProjectId.value === 'new') {
    // 新建项目
    await handleNewProject()
  } else {
    // 加载已有项目
    await loadProject()
  }
}

// --- 数据逻辑：处理新建项目 ---
// 处理新建项目的逻辑，包括上传文件和生成本体
const handleNewProject = async () => {
  // 获取待上传的文件信息
  const pending = getPendingUpload()
  
  // 检查是否有待上传的文件
  if (!pending.isPending || pending.files.length === 0) {
    error.value = 'No pending files found.'
    addLog('错误：新建项目未找到待上传文件。')
    return
  }
  
  try {
    // 设置加载状态
    loading.value = true
    // 设置当前阶段为本体生成
    currentPhase.value = 0
    // 初始化进度信息
    ontologyProgress.value = { message: 'Uploading and analyzing docs...' }
    addLog('开始本体生成：正在上传文件...')
    
    // 准备表单数据
    const formData = new FormData()
    // 添加所有待上传的文件
    pending.files.forEach(f => formData.append('files', f))
    // 添加模拟需求描述
    formData.append('simulation_requirement', pending.simulationRequirement)
    
    // 调用 API 生成本体
    const res = await generateOntology(formData)
    if (res.success) {
      // 清除待上传文件记录
      clearPendingUpload()
      // 保存新项目 ID
      currentProjectId.value = res.data.project_id
      // 保存项目数据
      projectData.value = res.data
      
      // 更新路由，替换 'new' 为实际的项目 ID
      router.replace({ name: 'Process', params: { projectId: res.data.project_id } })
      // 清除进度信息
      ontologyProgress.value = null
      addLog(`项目 ${res.data.project_id} 本体生成成功`)
      // 开始构建图谱
      await startBuildGraph()
    } else {
      // 本体生成失败
      error.value = res.error || '本体生成失败'
      addLog(`本体生成错误：${error.value}`)
    }
  } catch (err) {
    // 捕获异常
    error.value = err.message
    addLog(`handleNewProject 异常：${err.message}`)
  } finally {
    // 无论成功或失败，都重置加载状态
    loading.value = false
  }
}

// --- 数据逻辑：加载项目 ---
// 加载已有项目的数据
const loadProject = async () => {
  try {
    // 设置加载状态
    loading.value = true
    addLog(`正在加载项目 ${currentProjectId.value}...`)
    
    // 调用 API 获取项目信息
    const res = await getProject(currentProjectId.value)
    if (res.success) {
      // 保存项目数据
      projectData.value = res.data
      // 根据项目状态更新当前阶段
      updatePhaseByStatus(res.data.status)
      addLog(`项目已加载。状态：${res.data.status}`)
      
      // 根据项目状态执行相应操作
      if (res.data.status === 'ontology_generated' && !res.data.graph_id) {
        // 本体已生成但图谱未构建，开始构建图谱
        await startBuildGraph()
      } else if (res.data.status === 'graph_building' && res.data.graph_build_task_id) {
        // 图谱正在构建中，开始轮询任务状态
        currentPhase.value = 1
        startPollingTask(res.data.graph_build_task_id)
        startGraphPolling()
      } else if (res.data.status === 'graph_completed' && res.data.graph_id) {
        // 图谱已完成，加载图谱数据
        currentPhase.value = 2
        await loadGraph(res.data.graph_id)
      }
    } else {
      // 加载项目失败
      error.value = res.error
      addLog(`加载项目错误：${res.error}`)
    }
  } catch (err) {
    // 捕获异常
    error.value = err.message
    addLog(`loadProject 异常：${err.message}`)
  } finally {
    // 无论成功或失败，都重置加载状态
    loading.value = false
  }
}

// --- 数据逻辑：根据状态更新阶段 ---
// 根据项目状态字符串更新当前阶段
// 参数：status - 项目状态字符串
const updatePhaseByStatus = (status) => {
  switch (status) {
    case 'created':
    case 'ontology_generated': 
      currentPhase.value = 0; // 本体生成阶段
      break;
    case 'graph_building': 
      currentPhase.value = 1; // 图谱构建阶段
      break;
    case 'graph_completed': 
      currentPhase.value = 2; // 图谱完成阶段
      break;
    case 'failed': 
      error.value = '项目失败'; // 项目失败
      break;
  }
}

// --- 数据逻辑：开始构建图谱 ---
// 启动图谱构建任务
const startBuildGraph = async () => {
  try {
    // 设置当前阶段为图谱构建
    currentPhase.value = 1
    // 初始化构建进度
    buildProgress.value = { progress: 0, message: 'Starting build...' }
    addLog('正在启动图谱构建...')
    
    // 调用 API 启动图谱构建
    const res = await buildGraph({ project_id: currentProjectId.value })
    if (res.success) {
      // 记录任务 ID
      addLog(`图谱构建任务已启动。任务 ID：${res.data.task_id}`)
      // 开始轮询图谱数据
      startGraphPolling()
      // 开始轮询任务状态
      startPollingTask(res.data.task_id)
    } else {
      // 启动构建失败
      error.value = res.error
      addLog(`启动构建错误：${res.error}`)
    }
  } catch (err) {
    // 捕获异常
    error.value = err.message
    addLog(`startBuildGraph 异常：${err.message}`)
  }
}

// --- 数据逻辑：开始轮询图谱数据 ---
// 启动定时轮询，获取最新的图谱数据
const startGraphPolling = () => {
  addLog('已开始轮询图谱数据...')
  // 立即获取一次图谱数据
  fetchGraphData()
  // 设置定时器，每 10 秒获取一次图谱数据
  graphPollTimer = setInterval(fetchGraphData, 10000)
}

// --- 数据逻辑：获取图谱数据 ---
// 从后端获取最新的图谱数据
const fetchGraphData = async () => {
  try {
    // 刷新项目信息以检查是否有 graph_id
    const projRes = await getProject(currentProjectId.value)
    if (projRes.success && projRes.data.graph_id) {
      // 获取图谱数据
      const gRes = await getGraphData(projRes.data.graph_id)
      if (gRes.success) {
        // 保存图谱数据
        graphData.value = gRes.data
        // 统计节点和边的数量
        const nodeCount = gRes.data.node_count || gRes.data.nodes?.length || 0
        const edgeCount = gRes.data.edge_count || gRes.data.edges?.length || 0
        addLog(`图谱数据已刷新。节点数：${nodeCount}，边数：${edgeCount}`)
      }
    }
  } catch (err) {
    // 捕获并警告错误
    console.warn('Graph fetch error:', err)
  }
}

// --- 数据逻辑：开始轮询任务状态 ---
// 启动定时轮询，检查任务状态
// 参数：taskId - 任务 ID
const startPollingTask = (taskId) => {
  // 立即查询一次任务状态
  pollTaskStatus(taskId)
  // 设置定时器，每 2 秒查询一次任务状态
  pollTimer = setInterval(() => pollTaskStatus(taskId), 2000)
}

// --- 数据逻辑：轮询任务状态 ---
// 查询任务状态并更新进度
// 参数：taskId - 任务 ID
const pollTaskStatus = async (taskId) => {
  try {
    // 调用 API 获取任务状态
    const res = await getTaskStatus(taskId)
    if (res.success) {
      const task = res.data
      
      // 如果进度消息发生变化，记录日志
      if (task.message && task.message !== buildProgress.value?.message) {
        addLog(task.message)
      }
      
      // 更新构建进度
      buildProgress.value = { progress: task.progress || 0, message: task.message }
      
      // 检查任务状态
      if (task.status === 'completed') {
        // 任务完成
        addLog('图谱构建任务已完成。')
        // 停止轮询
        stopPolling()
        stopGraphPolling() // 停止图谱轮询，进行最终加载
        // 设置当前阶段为完成
        currentPhase.value = 2
        
        // 最终加载图谱数据
        const projRes = await getProject(currentProjectId.value)
        if (projRes.success && projRes.data.graph_id) {
            projectData.value = projRes.data
            await loadGraph(projRes.data.graph_id)
        }
      } else if (task.status === 'failed') {
        // 任务失败
        stopPolling()
        error.value = task.error
        addLog(`图谱构建任务失败：${task.error}`)
      }
    }
  } catch (e) {
    // 捕获并记录错误
    console.error(e)
  }
}

// --- 数据逻辑：加载图谱 ---
// 
// async/await 是 JavaScript 中处理异步操作的语法糖，基于 Promise
// 它使异步代码看起来像同步代码，提高了代码的可读性和可维护性
// 
// async/await 的基本用法：
// - async: 声明一个异步函数，返回一个 Promise
// - await: 等待一个 Promise 完成，并返回其结果
// 
// 异步编程的重要性：
// 1. 避免阻塞：JavaScript 是单线程的，异步操作可以避免阻塞主线程
// 2. 提高性能：可以同时执行多个异步操作，提高应用性能
// 3. 改善用户体验：异步操作不会冻结 UI，保持界面响应
// 
// 常见的异步操作：
// - 网络请求：fetch、axios 等
// - 定时器：setTimeout、setInterval
// - 文件操作：FileReader、FileSystem API
// - 动画：requestAnimationFrame
// 
// 错误处理：
// - try/catch: 捕获异步操作中的错误
// - finally: 无论成功或失败都会执行的代码块
// 
// 本项目中的异步操作：
// - API 调用：获取项目数据、图谱数据等
// - 文件上传：上传文档到服务器
// - 任务轮询：定期检查任务状态
// 
// 加载完整的图谱数据
// 参数：graphId - 图谱 ID
const loadGraph = async (graphId) => {
  // 设置加载状态
  graphLoading.value = true
  addLog(`正在加载完整图谱数据：${graphId}`)
  try {
    // 调用 API 获取图谱数据
    const res = await getGraphData(graphId)
    if (res.success) {
      // 保存图谱数据
      graphData.value = res.data
      addLog('图谱数据加载成功。')
    } else {
      // 加载失败
      addLog(`加载图谱数据失败：${res.error}`)
    }
  } catch (e) {
    // 捕获异常
    addLog(`加载图谱异常：${e.message}`)
  } finally {
    // 无论成功或失败，都重置加载状态
    // finally 块中的代码总是会执行，即使 try 或 catch 中有 return 语句
    graphLoading.value = false
  }
}

// --- 数据逻辑：刷新图谱 ---
// 手动刷新当前图谱数据
const refreshGraph = () => {
  // 如果项目数据存在且包含 graph_id，则重新加载图谱
  if (projectData.value?.graph_id) {
    addLog('手动刷新图谱已触发。')
    loadGraph(projectData.value.graph_id)
  }
}

// --- 辅助函数：停止轮询 ---
// 停止任务状态轮询
const stopPolling = () => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

// --- 辅助函数：停止图谱轮询 ---
// 停止图谱数据轮询
const stopGraphPolling = () => {
  if (graphPollTimer) {
    clearInterval(graphPollTimer)
    graphPollTimer = null
    addLog('图谱轮询已停止。')
  }
}

// --- 生命周期钩子：组件挂载 ---
// 
// Vue 组件的生命周期是指组件从创建到销毁的整个过程
// Vue 3 提供了多个生命周期钩子函数，允许我们在组件的不同阶段执行代码
// 
// 主要的生命周期钩子：
// 
// 创建阶段：
// - setup(): 在组件创建之前执行，Composition API 的入口点
// - onBeforeCreate(): 组件实例创建之前（Options API）
// - onCreated(): 组件实例创建完成（Options API）
// 
// 挂载阶段：
// - onBeforeMount(): 组件挂载到 DOM 之前
// - onMounted(): 组件挂载到 DOM 之后（最常用的钩子之一）
// 
// 更新阶段：
// - onBeforeUpdate(): 组件更新之前
// - onUpdated(): 组件更新之后
// 
// 卸载阶段：
// - onBeforeUnmount(): 组件卸载之前
// - onUnmounted(): 组件卸载之后（最常用的钩子之一）
// 
// 生命周期钩子的使用场景：
// 
// onMounted():
// - 初始化数据：调用 API 获取初始数据
// - DOM 操作：访问或操作 DOM 元素
// - 设置定时器：启动定时任务
// - 添加事件监听器：监听 DOM 事件
// 
// onUnmounted():
// - 清理定时器：清除 setInterval、setTimeout
// - 移除事件监听器：移除 addEventListener 添加的监听器
// - 取消网络请求：取消未完成的 fetch 或 axios 请求
// - 清理订阅：取消第三方库的订阅
// 
// 内存泄漏：
// 如果不正确清理资源，会导致内存泄漏，常见原因：
// 1. 未清除的定时器
// 2. 未移除的事件监听器
// 3. 未取消的网络请求
// 4. 未清理的第三方库实例
// 
// 本项目中的生命周期使用：
// - onMounted(): 初始化项目，调用 API 获取项目数据
// - onUnmounted(): 清理轮询定时器，避免内存泄漏
// 
// 组件挂载到 DOM 后执行
onMounted(() => {
  // 初始化项目
  initProject()
})

// --- 生命周期钩子：组件卸载 ---
// 组件从 DOM 卸载前执行
onUnmounted(() => {
  // 清理所有轮询定时器
  // 这非常重要！如果不清理定时器，即使组件被销毁，定时器仍会继续运行
  // 这会导致内存泄漏和不必要的 API 调用
  stopPolling()
  stopGraphPolling()
})
</script>

<style scoped>
/* 
 * scoped 样式的作用域
 * 
 * Vue 的 scoped 样式通过添加唯一的 data 属性来实现样式隔离
 * 例如：<div data-v-xxxxx>，CSS 选择器会自动添加这个属性
 * 
 * scoped 样式的优势：
 * 1. 避免样式冲突：不同组件的样式不会互相影响
 * 2. 更好的可维护性：样式和组件绑定在一起，更容易理解
 * 3. 更小的 CSS 体积：未使用的样式会被 tree-shaking 移除
 * 
 * scoped 样式的限制：
 * 1. 无法影响子组件：scoped 样式不会穿透到子组件
 * 2. 深度选择器：需要使用 :deep() 或 ::v-deep 来影响子组件
 * 3. 动态类名：动态添加的类名可能不会被 scoped 样式影响
 * 
 * 深度选择器示例：
 * .parent :deep(.child) { ... }
 * 
 * 全局样式：
 * 如果需要全局样式，可以在不使用 scoped 的 <style> 标签中定义
 * 或者使用 :global() 选择器
 */

/* 
 * 主视图容器样式
 * 
 * 使用 Flexbox 布局实现垂直布局
 * Flexbox 是一种一维布局模型，适合在单个方向上排列元素
 * 
 * Flexbox 的主要概念：
 * - 主轴（main axis）：flex-direction 定义的方向（默认为水平方向）
 * - 交叉轴（cross axis）：垂直于主轴的方向
 * - flex 容器（flex container）：设置了 display: flex 的父元素
 * - flex 项目（flex item）：flex 容器的直接子元素
 * 
 * Flexbox 的主要属性：
 * 容器属性：
 * - flex-direction: 主轴方向（row、column、row-reverse、column-reverse）
 * - justify-content: 主轴对齐方式（flex-start、flex-end、center、space-between、space-around）
 * - align-items: 交叉轴对齐方式（flex-start、flex-end、center、stretch、baseline）
 * - flex-wrap: 是否换行（nowrap、wrap、wrap-reverse）
 * 
 * 项目属性：
 * - flex-grow: 放大比例（默认为 0）
 * - flex-shrink: 缩小比例（默认为 1）
 * - flex-basis: 初始大小（默认为 auto）
 * - flex: flex-grow、flex-shrink、flex-basis 的简写
 * - align-self: 单独项目的对齐方式
 * 
 * Flexbox vs Grid：
 * - Flexbox：一维布局，适合在单个方向上排列元素
 * - Grid：二维布局，适合同时在水平和垂直方向上排列元素
 */
.main-view {
  height: 100vh; /* 占满整个视口高度 */
  display: flex;
  flex-direction: column; /* 垂直布局：子元素从上到下排列 */
  background: #FFF; /* 白色背景 */
  overflow: hidden; /* 隐藏溢出内容，防止出现滚动条 */
  font-family: 'Space Grotesk', 'Noto Sans SC', system-ui, sans-serif; /* 字体设置 */
}

/* 
 * 顶部导航栏样式
 * 
 * 使用 Flexbox 布局实现两端对齐和垂直居中
 * 
 * position: relative 的作用：
 * - 相对定位：相对于元素原本的位置进行偏移
 * - 为绝对定位的子元素提供定位参考
 * - 不影响文档流：元素仍占据原本的空间
 * 
 * z-index 的作用：
 * - 控制元素的堆叠顺序
 * - 值越大，元素越靠上
 * - 只对定位元素（position 非 static）有效
 * - 默认值为 auto，按文档流顺序堆叠
 * 
 * border-bottom 的作用：
 * - 创建底部边框，作为视觉分隔线
 * - 使用浅灰色（#EAEAEA），不突兀
 * - 1px 实线，简洁清晰
 */
.app-header {
  height: 60px; /* 导航栏高度 */
  border-bottom: 1px solid #EAEAEA; /* 底部边框：浅灰色分隔线 */
  display: flex;
  align-items: center; /* 垂直居中：子元素在垂直方向上居中对齐 */
  justify-content: space-between; /* 两端对齐：左侧和右侧元素分别贴边，中间元素居中 */
  padding: 0 24px; /* 左右内边距：24px */
  background: #FFF; /* 白色背景 */
  z-index: 100; /* 层级：确保导航栏在其他元素之上，不会被遮挡 */
  position: relative; /* 相对定位：为绝对定位的子元素提供定位参考 */
}

/* 
 * 头部中间区域样式
 * 
 * 使用绝对定位实现水平居中
 * 
 * 绝对定位的居中技巧：
 * 1. left: 50%：将元素的左边缘移动到父元素的中心位置
 * 2. transform: translateX(-50%)：向左偏移自身宽度的一半，实现水平居中
 * 
 * 这种方法的优点：
 * - 不需要知道元素的宽度
 * - 适用于响应式布局
 * - 性能好，不会引起重排（reflow）
 * 
 * 其他居中方法：
 * 1. Flexbox：justify-content: center; align-items: center;
 * 2. Grid：place-items: center;
 * 3. margin: auto（需要固定宽高）
 * 4. text-align: center（仅适用于内联元素）
 */
.header-center {
  position: absolute; /* 绝对定位：脱离文档流，相对于最近的定位祖先元素定位 */
  left: 50%; /* 左侧偏移 50%：将元素的左边缘移动到父元素的中心位置 */
  transform: translateX(-50%); /* 向左偏移自身宽度的一半，实现水平居中 */
}

/* 
 * 品牌标识样式
 * 
 * 使用等宽字体和超粗体，突出品牌名称
 * 
 * 字体选择：
 * - JetBrains Mono：等宽字体，适合显示代码和品牌名称
 * - 等宽字体的优点：每个字符宽度相同，对齐整齐
 * - 等宽字体的应用场景：代码编辑器、终端、品牌标识
 * 
 * 字体粗细：
 * - font-weight: 800：超粗体，字重值为 800
 * - 字重范围：100-900，100 最细，900 最粗
 * - 常用字重：400（正常）、700（粗体）、800（超粗体）
 * 
 * 字母间距：
 * - letter-spacing: 1px：增加字母之间的间距
 * - 优点：提高可读性，使文字更易读
 * - 应用场景：标题、品牌标识、大写字母
 * 
 * 鼠标指针：
 * - cursor: pointer：手型指针，表示可点击
 * - 其他常用值：default（默认）、text（文本）、move（移动）、not-allowed（禁止）
 */
.brand {
  font-family: 'JetBrains Mono', monospace; /* 等宽字体：JetBrains Mono 是一款专为编程设计的等宽字体 */
  font-weight: 800; /* 超粗体：字重值为 800，非常粗的字体 */
  font-size: 18px; /* 字体大小：18px */
  letter-spacing: 1px; /* 字母间距：1px，增加字母之间的间距，使文字更易读 */
  cursor: pointer; /* 鼠标指针：当鼠标悬停时显示为手型指针，表示可点击 */
}

/* 
 * 视图切换器样式
 * 
 * 使用 Flexbox 布局和圆角设计，创建现代化的切换器
 * 
 * Flexbox 的 gap 属性：
 * - gap: 4px：设置子元素之间的间距
 * - 优点：不需要使用 margin，避免 margin 折叠问题
 * - 支持所有现代浏览器
 * 
 * 圆角设计：
 * - border-radius: 6px：使切换器边角圆润
 * - 圆角的优点：更现代、更友好、更美观
 * - 圆角的应用场景：按钮、卡片、输入框、切换器
 * 
 * 浅灰色背景：
 * - background: #F5F5F5：浅灰色背景
 * - 作用：区分切换器区域，提供视觉层次
 * - 颜色选择：#F5F5F5 是常用的浅灰色，不突兀
 */
.view-switcher {
  display: flex; /* 弹性布局：子元素水平排列 */
  background: #F5F5F5; /* 浅灰色背景：#F5F5F5，用于区分切换器区域 */
  padding: 4px; /* 内边距：4px，为按钮提供一定的间距 */
  border-radius: 6px; /* 圆角：6px，使切换器边角圆润 */
  gap: 4px; /* 按钮间距：4px，使用 gap 属性设置子元素之间的间距 */
}

/* 
 * 切换按钮样式
 * 
 * 使用透明背景和过渡动画，创建现代化的按钮样式
 * 
 * CSS 过渡（transition）：
 * - transition: all 0.2s：所有属性变化都有 0.2 秒的过渡效果
 * - 过渡属性：可以指定具体的属性（如 transition: background 0.2s）
 * - 过渡时间：可以是秒（s）或毫秒（ms）
 * - 过渡函数：ease、linear、ease-in、ease-out、ease-in-out、cubic-bezier()
 * 
 * 过渡动画的优点：
 * 1. 提升用户体验：平滑的过渡比突兀的变化更友好
 * 2. 提供视觉反馈：让用户知道状态发生了变化
 * 3. 增加交互感：使界面更有活力
 * 
 * 过渡动画 vs 关键帧动画：
 * - 过渡动画：简单的状态变化，自动触发
 * - 关键帧动画：复杂的动画序列，需要手动控制
 * 
 * 性能优化：
 * - 优先使用 transform 和 opacity，它们不会触发重排（reflow）
 * - 避免使用 width、height、left、top 等属性，它们会触发重排
 * - 使用 will-change 属性提示浏览器优化
 */
.switch-btn {
  border: none; /* 无边框：移除默认的按钮边框 */
  background: transparent; /* 透明背景：按钮背景透明，显示父元素的背景色 */
  padding: 6px 16px; /* 内边距：上下 6px，左右 16px */
  font-size: 12px; /* 字体大小：12px */
  font-weight: 600; /* 半粗体：字重值为 600，中等粗细 */
  color: #666; /* 灰色文字：#666，未激活状态的文字颜色 */
  border-radius: 4px; /* 圆角：4px，使按钮边角圆润 */
  cursor: pointer; /* 鼠标指针：当鼠标悬停时显示为手型指针，表示可点击 */
  transition: all 0.2s; /* 过渡动画：所有属性变化都有 0.2 秒的过渡效果 */
}

/* 
 * 激活状态的切换按钮
 * 
 * 使用白色背景和阴影效果，突出显示激活状态
 * 
 * CSS 阴影（box-shadow）：
 * - box-shadow: 0 2px 4px rgba(0,0,0,0.05)
 * - 参数说明：
 *   1. 水平偏移：0（无水平偏移）
 *   2. 垂直偏移：2px（向下偏移 2px）
 *   3. 模糊半径：4px（阴影的模糊程度）
 *   4. 扩展半径：未指定（默认为 0）
 *   5. 颜色：rgba(0,0,0,0.05)（黑色，5% 不透明度）
 * 
 * 阴影的作用：
 * 1. 创建深度感：使元素看起来浮起
 * 2. 突出显示：激活状态的元素有阴影，更醒目
 * 3. 提供视觉层次：阴影可以区分不同的层级
 * 
 * 阴影的性能：
 * - 阴影会影响性能，因为需要额外的渲染层
 * - 避免使用大模糊半径和多个阴影
 * - 使用 will-change: transform 提示浏览器优化
 */
.switch-btn.active {
  background: #FFF; /* 白色背景：激活状态的按钮背景色为白色 */
  color: #000; /* 黑色文字：激活状态的文字颜色为黑色 */
  box-shadow: 0 2px 4px rgba(0,0,0,0.05); /* 阴影效果：轻微的阴影，使按钮浮起 */
}

/* 
 * 状态指示器样式
 * 
 * 使用 Flexbox 布局和圆点，显示当前状态
 * 
 * Flexbox 的 gap 属性：
 * - gap: 8px：设置子元素之间的间距
 * - 优点：不需要使用 margin，避免 margin 折叠问题
 * - 支持所有现代浏览器
 * 
 * 字体粗细：
 * - font-weight: 500：中等粗细，字重值为 500
 * - 字重范围：100-900，100 最细，900 最粗
 * - 常用字重：400（正常）、500（中等）、600（半粗体）、700（粗体）
 * 
 * 颜色选择：
 * - color: #666：灰色，降低视觉权重
 * - 作用：不抢夺用户的注意力，但仍然清晰可读
 */
.status-indicator {
  display: flex; /* 弹性布局：子元素水平排列 */
  align-items: center; /* 垂直居中：子元素在垂直方向上居中对齐 */
  gap: 8px; /* 元素间距：8px，使用 gap 属性设置子元素之间的间距 */
  font-size: 12px; /* 字体大小：12px */
  color: #666; /* 灰色文字：#666，状态指示器的文字颜色 */
  font-weight: 500; /* 中等粗细：字重值为 500，介于正常和半粗体之间 */
}

/* 
 * 头部右侧区域样式
 * 
 * 使用 Flexbox 布局，排列右侧的元素
 * 
 * Flexbox 的 gap 属性：
 * - gap: 16px：设置子元素之间的间距
 * - 优点：不需要使用 margin，避免 margin 折叠问题
 * - 支持所有现代浏览器
 * 
 * 间距选择：
 * - 16px：常用的间距值，适中的间距
 * - 间距原则：使用 4px 的倍数（4px、8px、12px、16px、24px、32px）
 * - 间距的作用：提供视觉呼吸空间，使界面更舒适
 */
.header-right {
  display: flex; /* 弹性布局：子元素水平排列 */
  align-items: center; /* 垂直居中：子元素在垂直方向上居中对齐 */
  gap: 16px; /* 元素间距：16px，使用 gap 属性设置子元素之间的间距 */
}

/* 
 * 工作流程步骤样式
 * 
 * 使用 Flexbox 布局，显示步骤编号和名称
 * 
 * 工作流程设计原则：
 * 1. 清晰的步骤指示：让用户知道当前处于哪个步骤
 * 2. 可视化的进度：使用编号、颜色、图标等表示进度
 * 3. 友好的提示：提供步骤名称和描述
 * 
 * 字体大小：
 * - font-size: 14px：中等字体大小
 * - 字体大小原则：使用 12px、14px、16px、18px 等标准值
 * - 字体大小的作用：控制文字的可读性和视觉权重
 */
.workflow-step {
  display: flex; /* 弹性布局：子元素水平排列 */
  align-items: center; /* 垂直居中：子元素在垂直方向上居中对齐 */
  gap: 8px; /* 元素间距：8px，使用 gap 属性设置子元素之间的间距 */
  font-size: 14px; /* 字体大小：14px */
}

/* 
 * 步骤编号样式
 * 
 * 使用等宽字体和粗体，突出显示步骤编号
 * 
 * 等宽字体的应用场景：
 * 1. 代码和编号：每个字符宽度相同，对齐整齐
 * 2. 品牌标识：独特的视觉风格
 * 3. 数据显示：表格、日志等需要对齐的内容
 * 
 * 颜色选择：
 * - color: #999：浅灰色，降低视觉权重
 * - 作用：不抢夺用户的注意力，但仍然清晰可读
 * - 颜色层次：#999（浅灰）< #666（中灰）< #333（深灰）< #000（黑色）
 */
.step-num {
  font-family: 'JetBrains Mono', monospace; /* 等宽字体：JetBrains Mono 是一款专为编程设计的等宽字体 */
  font-weight: 700; /* 粗体：字重值为 700，粗体 */
  color: #999; /* 灰色文字：#999，步骤编号的颜色 */
}

/* 
 * 步骤名称样式
 * 
 * 使用粗体和黑色，突出显示步骤名称
 * 
 * 字体粗细：
 * - font-weight: 700：粗体，字重值为 700
 * - 粗体的作用：突出显示重要信息
 * - 粗体的应用场景：标题、重要文字、强调内容
 * 
 * 颜色选择：
 * - color: #000：黑色，最高的视觉权重
 * - 作用：突出显示，吸引用户的注意力
 * - 颜色层次：黑色 > 深灰 > 中灰 > 浅灰
 */
.step-name {
  font-weight: 700; /* 粗体：字重值为 700，粗体 */
  color: #000; /* 黑色文字：#000，步骤名称的颜色 */
}

/* 
 * 步骤分隔线样式
 * 
 * 使用细线分隔不同的元素
 * 
 * 分隔线的作用：
 * 1. 视觉分隔：将不同的元素分组或分隔
 * 2. 提供层次：创建视觉层次，帮助用户理解界面结构
 * 3. 美化界面：使界面更有条理和美感
 * 
 * 分隔线的设计原则：
 * 1. 颜色浅：使用浅灰色，不突兀
 * 2. 线条细：使用 1px，不抢夺注意力
 * 3. 位置恰当：放在合适的位置，不影响布局
 */
.step-divider {
  width: 1px; /* 宽度：1px，创建一条细线 */
  height: 14px; /* 高度：14px，分隔线的高度 */
  background-color: #E0E0E0; /* 浅灰色背景：#E0E0E0，分隔线的颜色 */
}

/* 
 * 状态指示点样式
 * 
 * 使用圆形和颜色，显示当前状态
 * 
 * 圆形的设计：
 * - border-radius: 50%：创建完美的圆形
 * - 圆形的应用场景：状态指示、头像、图标背景
 * - 圆形的优点：友好、现代、美观
 * 
 * 尺寸选择：
 * - width: 8px, height: 8px：小尺寸，不抢夺注意力
 * - 尺寸原则：使用 4px 的倍数（4px、8px、12px、16px）
 * - 尺寸的作用：控制元素的视觉权重
 */
.dot {
  width: 8px; /* 宽度：8px */
  height: 8px; /* 高度：8px */
  border-radius: 50%; /* 圆形：50% 的圆角使元素变成圆形 */
  background: #CCC; /* 灰色背景：#CCC，默认状态的颜色 */
}

/* 
 * 状态指示器的不同状态样式
 * 
 * 使用颜色和动画，区分不同的状态
 * 
 * 状态设计原则：
 * 1. 颜色语义：使用符合用户预期的颜色（绿色=成功，红色=错误，橙色=处理中）
 * 2. 动画反馈：使用动画提供视觉反馈，让用户知道系统正在工作
 * 3. 一致性：在整个应用中使用一致的颜色和动画
 * 
 * 常见的状态颜色：
 * - 绿色（#4CAF50）：成功、完成、正常
 * - 红色（#F44336）：错误、失败、警告
 * - 橙色（#FF5722）：处理中、警告、注意
 * - 蓝色（#2196F3）：信息、提示
 * - 灰色（#CCC）：默认、禁用、未知
 * 
 * CSS 动画（animation）：
 * - animation: pulse 1s infinite：1 秒循环，无限重复
 * - animation-name: 动画名称（pulse）
 * - animation-duration: 动画持续时间（1s）
 * - animation-iteration-count: 动画重复次数（infinite）
 * - animation-timing-function: 动画时间函数（默认 ease）
 * 
 * 脉冲动画的作用：
 * 1. 吸引注意力：让用户注意到正在处理的状态
 * 2. 提供反馈：让用户知道系统正在工作
 * 3. 增加活力：使界面更有活力和现代感
 */

/* 处理中状态：橙色，带脉冲动画 */
.status-indicator.processing .dot { 
  background: #FF5722; /* 橙色背景：#FF5722，表示正在处理中 */
  animation: pulse 1s infinite; /* 脉冲动画：1 秒循环，无限重复 */
}

/* 完成状态：绿色 */
.status-indicator.completed .dot { 
  background: #4CAF50; /* 绿色背景：#4CAF50，表示已完成 */
}

/* 错误状态：红色 */
.status-indicator.error .dot { 
  background: #F44336; /* 红色背景：#F44336，表示错误 */
}


@keyframes pulse { 
  50% { opacity: 0.5; } /* 透明度变化：在动画的 50% 处，透明度变为 0.5，创建闪烁效果 */
}

/* 主内容区域样式 */
.content-area {
  flex: 1; /* 占据剩余空间：flex: 1 表示该元素占据父容器中所有可用的剩余空间 */
  display: flex; /* 弹性布局：子元素水平排列 */
  position: relative; /* 相对定位：为绝对定位的子元素提供定位参考 */
  overflow: hidden; /* 隐藏溢出内容：防止出现滚动条 */
}

/* 面板包装器样式 */
.panel-wrapper {
  height: 100%; /* 占满高度 */
  overflow: hidden; /* 隐藏溢出内容 */
  /* 
    过渡动画：宽度、透明度、变换
    cubic-bezier(0.25, 0.8, 0.25, 1) 是一个贝塞尔曲线函数，用于创建平滑的动画效果
    参数说明：
    - 0.25: 第一个控制点的 x 坐标（时间）
    - 0.8: 第一个控制点的 y 坐标（进度）
    - 0.25: 第二个控制点的 x 坐标（时间）
    - 1: 第二个控制点的 y 坐标（进度）
    这个曲线创建了一个先快后慢的动画效果，类似于 ease-in-out 但更平滑
  */
  transition: width 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.3s ease, transform 0.3s ease;
  /* 
    性能优化：will-change 属性告诉浏览器哪些属性会发生变化
    浏览器可以提前为这些属性创建独立的图层，提高动画性能
    注意：不要过度使用 will-change，只在确实需要优化的动画上使用
  */
  will-change: width, opacity, transform; /* 性能优化 */
}

/* 左侧面板样式 */
.panel-wrapper.left {
  border-right: 1px solid #EAEAEA; /* 右侧边框：1px 实线，浅灰色，用于分隔左右面板 */
}
</style>
