<template>
  <!-- 主视图容器 -->
  <div class="main-view">
    <!-- 顶部应用头部 -->
    <header class="app-header">
      <!-- 头部左侧：品牌标识 -->
      <div class="header-left">
        <!-- 品牌名称，点击返回首页 -->
        <div class="brand" @click="router.push('/')">MIROFISH</div>
      </div>
      
      <!-- 头部中间：视图切换器 -->
      <div class="header-center">
        <!-- 视图切换按钮组 -->
        <div class="view-switcher">
          <!-- 循环渲染视图模式按钮 -->
          <button 
            v-for="mode in ['graph', 'split', 'workbench']" 
            :key="mode"
            class="switch-btn"
            :class="{ active: viewMode === mode }"
            @click="viewMode = mode"
          >
            <!-- 根据模式显示不同的按钮文本 -->
            {{ { graph: '图谱', split: '双栏', workbench: '工作台' }[mode] }}
          </button>
        </div>
      </div>

      <!-- 头部右侧：工作流步骤和状态 -->
      <div class="header-right">
        <!-- 工作流步骤指示器 -->
        <div class="workflow-step">
          <!-- 步骤编号 -->
          <span class="step-num">Step 2/5</span>
          <!-- 步骤名称 -->
          <span class="step-name">环境搭建</span>
        </div>
        <!-- 步骤分隔符 -->
        <div class="step-divider"></div>
        <!-- 状态指示器，根据状态改变样式 -->
        <span class="status-indicator" :class="statusClass">
          <!-- 状态指示点 -->
          <span class="dot"></span>
          <!-- 状态文本 -->
          {{ statusText }}
        </span>
      </div>
    </header>

    <!-- 主内容区域 -->
    <main class="content-area">
      <!-- 左侧面板：图谱展示 -->
      <div class="panel-wrapper left" :style="leftPanelStyle">
        <!-- 图谱面板组件 -->
        <GraphPanel 
          :graphData="graphData"
          :loading="graphLoading"
          :currentPhase="2"
          @refresh="refreshGraph"
          @toggle-maximize="toggleMaximize('graph')"
        />
      </div>

      <!-- 右侧面板：步骤2 - 环境搭建 -->
      <div class="panel-wrapper right" :style="rightPanelStyle">
        <!-- 环境搭建步骤组件 -->
        <Step2EnvSetup
          :simulationId="currentSimulationId"
          :projectData="projectData"
          :graphData="graphData"
          :systemLogs="systemLogs"
          @go-back="handleGoBack"
          @next-step="handleNextStep"
          @add-log="addLog"
          @update-status="updateStatus"
        />
      </div>
    </main>
  </div>
</template>

<script setup>
// 导入 Vue 3 Composition API 核心函数
import { ref, computed, onMounted, onUnmounted } from 'vue'
// 导入 Vue Router 路由相关函数
import { useRoute, useRouter } from 'vue-router'
// 导入图谱面板组件
import GraphPanel from '../components/GraphPanel.vue'
// 导入环境搭建步骤组件
import Step2EnvSetup from '../components/Step2EnvSetup.vue'
// 导入图谱相关 API
import { getProject, getGraphData } from '../api/graph'
// 导入仿真相关 API
import { getSimulation, stopSimulation, getEnvStatus, closeSimulationEnv } from '../api/simulation'

// 获取当前路由对象
const route = useRoute()
// 获取路由器实例
const router = useRouter()

// 组件属性定义
const props = defineProps({
  simulationId: String // 仿真 ID
})

// 布局状态 - 默认切换到双栏视图
const viewMode = ref('split')

// 数据状态
const currentSimulationId = ref(route.params.simulationId) // 当前仿真 ID
const projectData = ref(null) // 项目数据
const graphData = ref(null) // 图谱数据
const graphLoading = ref(false) // 图谱加载状态
const systemLogs = ref([]) // 系统日志
const currentStatus = ref('processing') // 当前状态：processing（处理中）| completed（已完成）| error（错误）

// --- 计算布局样式 ---
// 左侧面板样式计算属性
const leftPanelStyle = computed(() => {
  // 如果是图谱模式，左侧面板占满整个宽度
  if (viewMode.value === 'graph') return { width: '100%', opacity:1, transform: 'translateX(0)' }
  // 如果是工作台模式，左侧面板隐藏
  if (viewMode.value === 'workbench') return { width: '0%', opacity: 0, transform: 'translateX(-20px)' }
  // 双栏模式，左侧面板占 50% 宽度
  return { width: '50%', opacity: 1, transform: 'translateX(0)' }
})

// 右侧面板样式计算属性
const rightPanelStyle = computed(() => {
  // 如果是工作台模式，右侧面板占满整个宽度
  if (viewMode.value === 'workbench') return { width: '100%', opacity:1, transform: 'translateX(0)' }
  // 如果是图谱模式，右侧面板隐藏
  if (viewMode.value === 'graph') return { width: '0%', opacity: 0, transform: 'translateX(20px)' }
  // 双栏模式，右侧面板占 50% 宽度
  return { width: '50%', opacity: 1, transform: 'translateX(0)' }
})

// --- 状态计算属性 ---
// 状态样式类计算属性
const statusClass = computed(() => {
  return currentStatus.value
})

// 状态文本计算属性
const statusText = computed(() => {
  if (currentStatus.value === 'error') return 'Error'
  if (currentStatus.value === 'completed') return 'Ready'
  return 'Preparing'
})

// --- 辅助函数 ---
// 添加日志函数
const addLog = (msg) => {
  // 生成时间戳，格式为 HH:MM:SS.mmm
  const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + '.' + new Date().getMilliseconds().toString().padStart(3, '0')
  // 将日志添加到日志数组
  systemLogs.value.push({ time, msg })
  // 保持日志数量不超过 100 条
  if (systemLogs.value.length > 100) {
    systemLogs.value.shift()
  }
}

// 更新状态函数
const updateStatus = (status) => {
  currentStatus.value = status
}

// --- 布局方法 ---
// 切换最大化/最小化面板
const toggleMaximize = (target) => {
  // 如果当前视图模式已经是目标模式，则切换到双栏模式
  if (viewMode.value === target) {
    viewMode.value = 'split'
  } else {
    // 否则切换到目标模式
    viewMode.value = target
  }
}

// 处理返回上一步的操作
const handleGoBack = () => {
  // 返回到 process 页面
  if (projectData.value?.project_id) {
    router.push({ name: 'Process', params: { projectId: projectData.value.project_id } })
  } else {
    router.push('/')
  }
}

// 处理下一步操作
const handleNextStep = (params = {}) => {
  addLog('进入 Step 3: 开始模拟')
  
  // 记录模拟轮数配置
  if (params.maxRounds) {
    addLog(`自定义模拟轮数: ${params.maxRounds} 轮`)
  } else {
    addLog('使用自动配置的模拟轮数')
  }
  
  // 构建路由参数
  const routeParams = {
    name: 'SimulationRun',
    params: { simulationId: currentSimulationId.value }
  }
  
  // 如果有自定义轮数，通过 query 参数传递
  if (params.maxRounds) {
    routeParams.query = { maxRounds: params.maxRounds }
  }
  
  // 跳转到 Step 3 页面
  router.push(routeParams)
}

// --- 数据逻辑 ---

/**
 * 检查并关闭正在运行的模拟
 * 当用户从 Step 3 返回到 Step 2 时，默认用户要退出模拟
 */
const checkAndStopRunningSimulation = async () => {
  if (!currentSimulationId.value) return
  
  try {
    // 先检查模拟环境是否存活
    const envStatusRes = await getEnvStatus({ simulation_id: currentSimulationId.value })
    
    if (envStatusRes.success && envStatusRes.data?.env_alive) {
      addLog('检测到模拟环境正在运行，正在关闭...')
      
      // 尝试优雅关闭模拟环境
      try {
        const closeRes = await closeSimulationEnv({ 
          simulation_id: currentSimulationId.value,
          timeout: 10  // 10秒超时
        })
        
        if (closeRes.success) {
          addLog('✓ 模拟环境已关闭')
        } else {
          addLog(`关闭模拟环境失败: ${closeRes.error || '未知错误'}`)
          // 如果优雅关闭失败，尝试强制停止
          await forceStopSimulation()
        }
      } catch (closeErr) {
        addLog(`关闭模拟环境异常: ${closeErr.message}`)
        // 如果优雅关闭异常，尝试强制停止
        await forceStopSimulation()
      }
    } else {
      // 环境未运行，但可能进程还在，检查模拟状态
      const simRes = await getSimulation(currentSimulationId.value)
      if (simRes.success && simRes.data?.status === 'running') {
        addLog('检测到模拟状态为运行中，正在停止...')
        await forceStopSimulation()
      }
    }
  } catch (err) {
    // 检查环境状态失败不影响后续流程
    console.warn('检查模拟状态失败:', err)
  }
}

/**
 * 强制停止模拟
 */
const forceStopSimulation = async () => {
  try {
    const stopRes = await stopSimulation({ simulation_id: currentSimulationId.value })
    if (stopRes.success) {
      addLog('✓ 模拟已强制停止')
    } else {
      addLog(`强制停止模拟失败: ${stopRes.error || '未知错误'}`)
    }
  } catch (err) {
    addLog(`强制停止模拟异常: ${err.message}`)
  }
}

// 加载模拟数据函数
const loadSimulationData = async () => {
  try {
    addLog(`加载模拟数据: ${currentSimulationId.value}`)
    
    // 获取仿真信息
    const simRes = await getSimulation(currentSimulationId.value)
    if (simRes.success && simRes.data) {
      const simData = simRes.data
      
      // 获取项目信息
      if (simData.project_id) {
        const projRes = await getProject(simData.project_id)
        if (projRes.success && projRes.data) {
          projectData.value = projRes.data
          addLog(`项目加载成功: ${projRes.data.project_id}`)
          
          // 获取图谱数据
          if (projRes.data.graph_id) {
            await loadGraph(projRes.data.graph_id)
          }
        }
      }
    } else {
      addLog(`加载模拟数据失败: ${simRes.error || '未知错误'}`)
    }
  } catch (err) {
    addLog(`加载异常: ${err.message}`)
  }
}

// 加载图谱数据函数
const loadGraph = async (graphId) => {
  graphLoading.value = true
  try {
    // 调用 API 获取图谱数据
    const res = await getGraphData(graphId)
    if (res.success) {
      graphData.value = res.data
      addLog('图谱数据加载成功')
    }
  } catch (err) {
    addLog(`图谱加载失败: ${err.message}`)
  } finally {
    // 无论成功或失败，都设置图谱加载状态为 false
    graphLoading.value = false
  }
}

// 刷新图谱函数
const refreshGraph = () => {
  // 如果项目数据存在且有图谱 ID，则重新加载图谱
  if (projectData.value?.graph_id) {
    loadGraph(projectData.value.graph_id)
  }
}

// 组件挂载时的生命周期钩子
onMounted(async () => {
  addLog('SimulationView 初始化')
  
  // 检查并关闭正在运行的模拟（用户从 Step 3 返回时）
  await checkAndStopRunningSimulation()
  
  // 加载模拟数据
  loadSimulationData()
})
</script>

<style scoped>
/* 主视图容器样式 */
.main-view {
  height: 100vh; /* 高度为视口高度的 100% */
  display: flex; /* 使用 Flex 布局 */
  flex-direction: column; /* 垂直方向排列子元素 */
  background: #FFF; /* 背景色为白色 */
  overflow: hidden; /* 隐藏溢出内容 */
  font-family: 'Space Grotesk', 'Noto Sans SC', system-ui, sans-serif; /* 字体设置 */
}

/* 应用头部样式 */
.app-header {
  height: 60px; /* 头部高度 */
  border-bottom: 1px solid #EAEAEA; /* 底部边框 */
  display: flex; /* 使用 Flex 布局 */
  align-items: center; /* 垂直居中对齐 */
  justify-content: space-between; /* 两端对齐 */
  padding: 0 24px; /* 内边距 */
  background: #FFF; /* 背景色为白色 */
  z-index: 100; /* 层级为 100 */
  position: relative; /* 相对定位 */
}

/* 品牌标识样式 */
.brand {
  font-family: 'JetBrains Mono', monospace; /* 使用等宽字体 */
  font-weight: 800; /* 字体粗细 */
  font-size: 18px; /* 字体大小 */
  letter-spacing: 1px; /* 字母间距 */
  cursor: pointer; /* 鼠标悬停时显示手型光标 */
}

/* 头部中间区域样式 */
.header-center {
  position: absolute; /* 绝对定位 */
  left: 50%; /* 左边距为 50% */
  transform: translateX(-50%); /* 向左平移自身宽度的 50% 以实现居中 */
}

/* 视图切换器样式 */
.view-switcher {
  display: flex; /* 使用 Flex 布局 */
  background: #F5F5F5; /* 背景色为浅灰色 */
  padding: 4px; /* 内边距 */
  border-radius: 6px; /* 圆角半径 */
  gap: 4px; /* 子元素之间的间距 */
}

/* 切换按钮样式 */
.switch-btn {
  border: none; /* 无边框 */
  background: transparent; /* 背景透明 */
  padding: 6px 16px; /* 内边距 */
  font-size: 12px; /* 字体大小 */
  font-weight: 600; /* 字体粗细 */
  color: #666; /* 文字颜色 */
  border-radius: 4px; /* 圆角半径 */
  cursor: pointer; /* 鼠标悬停时显示手型光标 */
  transition: all 0.2s; /* 所有属性的过渡动画时间为 0.2 秒 */
}

/* 激活状态的切换按钮样式 */
.switch-btn.active {
  background: #FFF; /* 背景色为白色 */
  color: #000; /* 文字颜色为黑色 */
  box-shadow: 0 2px 4px rgba(0,0,0,0.05); /* 添加阴影效果 */
}

/* 头部右侧区域样式 */
.header-right {
  display: flex; /* 使用 Flex 布局 */
  align-items: center; /* 垂直居中对齐 */
  gap: 16px; /* 子元素之间的间距 */
}

/* 工作流步骤样式 */
.workflow-step {
  display: flex; /* 使用 Flex 布局 */
  align-items: center; /* 垂直居中对齐 */
  gap: 8px; /* 子元素之间的间距 */
  font-size: 14px; /* 字体大小 */
}

/* 步骤编号样式 */
.step-num {
  font-family: 'JetBrains Mono', monospace; /* 使用等宽字体 */
  font-weight: 700; /* 字体粗细 */
  color: #999; /* 文字颜色为灰色 */
}

/* 步骤名称样式 */
.step-name {
  font-weight: 700; /* 字体粗细 */
  color: #000; /* 文字颜色为黑色 */
}

/* 步骤分隔符样式 */
.step-divider {
  width: 1px; /* 宽度为 1 像素 */
  height: 14px; /* 高度为 14 像素 */
  background-color: #E0E0E0; /* 背景色为浅灰色 */
}

/* 状态指示器样式 */
.status-indicator {
  display: flex; /* 使用 Flex 布局 */
  align-items: center; /* 垂直居中对齐 */
  gap: 8px; /* 子元素之间的间距 */
  font-size: 12px; /* 字体大小 */
  color: #666; /* 文字颜色为灰色 */
  font-weight: 500; /* 字体粗细 */
}

/* 状态指示点样式 */
.dot {
  width: 8px; /* 宽度为 8 像素 */
  height: 8px; /* 高度为 8 像素 */
  border-radius: 50%; /* 圆形 */
  background: #CCC; /* 背景色为浅灰色 */
}

/* 处理中状态的状态指示点样式 */
.status-indicator.processing .dot { background: #FF5722; animation: pulse 1s infinite; }
/* 已完成状态的状态指示点样式 */
.status-indicator.completed .dot { background: #4CAF50; }
/* 错误状态的状态指示点样式 */
.status-indicator.error .dot { background: #F44336; }

/* 脉冲动画关键帧 */
@keyframes pulse { 50% { opacity: 0.5; } }

/* 内容区域样式 */
.content-area {
  flex: 1; /* 占据剩余空间 */
  display: flex; /* 使用 Flex 布局 */
  position: relative; /* 相对定位 */
  overflow: hidden; /* 隐藏溢出内容 */
}

/* 面板包装器样式 */
.panel-wrapper {
  height: 100%; /* 高度为 100% */
  overflow: hidden; /* 隐藏溢出内容 */
  transition: width 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.3s ease, transform 0.3s ease; /* 宽度、透明度和变换的过渡动画 */
  will-change: width, opacity, transform; /* 优化动画性能 */
}

/* 左侧面板包装器样式 */
.panel-wrapper.left {
  border-right: 1px solid #EAEAEA; /* 右侧边框 */
}
</style>

