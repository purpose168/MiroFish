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
          <span class="step-num">Step 5/5</span>
          <span class="step-name">深度互动</span>
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
          :currentPhase="5"
          :isSimulating="false"
          @refresh="refreshGraph"
          @toggle-maximize="toggleMaximize('graph')"
        />
      </div>

      <!-- 右侧面板：Step5 深度互动 -->
      <div class="panel-wrapper right" :style="rightPanelStyle">
        <!-- Step5 互动组件 -->
        <Step5Interaction
          :reportId="currentReportId"
          :simulationId="simulationId"
          :systemLogs="systemLogs"
          @add-log="addLog"
          @update-status="updateStatus"
        />
      </div>
    </main>
  </div>
</template>

<script setup>
// 导入 Vue 3 Composition API 核心函数
import { ref, computed, onMounted, watch } from 'vue'
// 导入 Vue Router 路由相关函数
import { useRoute, useRouter } from 'vue-router'
// 导入图谱面板组件
import GraphPanel from '../components/GraphPanel.vue'
// 导入 Step5 互动组件
import Step5Interaction from '../components/Step5Interaction.vue'
// 导入图谱相关 API
import { getProject, getGraphData } from '../api/graph'
// 导入模拟相关 API
import { getSimulation } from '../api/simulation'
// 导入报告相关 API
import { getReport } from '../api/report'

// 获取当前路由对象
const route = useRoute()
// 获取路由器实例
const router = useRouter()

// 定义组件属性
const props = defineProps({
  reportId: String // 报告 ID
})

// --- 布局状态管理 ---
// 视图模式：默认切换到工作台视角
// 可选值：'graph'（图谱）、'split'（双栏）、'workbench'（工作台）
const viewMode = ref('workbench')

// --- 数据状态管理 ---
// 当前报告 ID（从路由参数获取）
const currentReportId = ref(route.params.reportId)
// 模拟 ID
const simulationId = ref(null)
// 项目数据
const projectData = ref(null)
// 图谱数据
const graphData = ref(null)
// 图谱加载状态
const graphLoading = ref(false)
// 系统日志列表
const systemLogs = ref([])
// 当前状态：ready（就绪）| processing（处理中）| completed（已完成）| error（错误）
const currentStatus = ref('ready')

// --- 计算属性：左侧面板样式 ---
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
// 根据当前状态返回对应的 CSS 类名
const statusClass = computed(() => {
  return currentStatus.value
})

// --- 计算属性：状态文本 ---
// 根据当前状态返回可读的状态文本
const statusText = computed(() => {
  if (currentStatus.value === 'error') return 'Error'
  if (currentStatus.value === 'completed') return 'Completed'
  if (currentStatus.value === 'processing') return 'Processing'
  return 'Ready'
})

// --- 辅助函数：添加系统日志 ---
// 向系统日志列表添加一条新日志
// 参数：msg - 日志消息内容
const addLog = (msg) => {
  // 生成时间戳：时:分:秒.毫秒
  const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + '.' + new Date().getMilliseconds().toString().padStart(3, '0')
  // 将日志添加到列表
  systemLogs.value.push({ time, msg })
  // 限制日志数量，最多保留 200 条
  if (systemLogs.value.length > 200) {
    systemLogs.value.shift()
  }
}

// --- 辅助函数：更新状态 ---
// 更新当前状态
// 参数：status - 新的状态值
const updateStatus = (status) => {
  currentStatus.value = status
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

// --- 数据逻辑：加载报告数据 ---
// 异步加载报告相关的所有数据
const loadReportData = async () => {
  try {
    // 记录加载日志
    addLog(`加载报告数据: ${currentReportId.value}`)
    
    // 获取报告信息以获取 simulation_id
    const reportRes = await getReport(currentReportId.value)
    if (reportRes.success && reportRes.data) {
      const reportData = reportRes.data
      // 保存模拟 ID
      simulationId.value = reportData.simulation_id
      
      if (simulationId.value) {
        // 获取模拟信息
        const simRes = await getSimulation(simulationId.value)
        if (simRes.success && simRes.data) {
          const simData = simRes.data
          
          // 获取项目信息
          if (simData.project_id) {
            const projRes = await getProject(simData.project_id)
            if (projRes.success && projRes.data) {
              // 保存项目数据
              projectData.value = projRes.data
              addLog(`项目加载成功: ${projRes.data.project_id}`)
              
              // 获取图谱数据
              if (projRes.data.graph_id) {
                await loadGraph(projRes.data.graph_id)
              }
            }
          }
        }
      }
    } else {
      // 获取报告信息失败
      addLog(`获取报告信息失败: ${reportRes.error || '未知错误'}`)
    }
  } catch (err) {
    // 捕获并记录异常
    addLog(`加载异常: ${err.message}`)
  }
}

// --- 数据逻辑：加载图谱数据 ---
// 异步加载图谱数据
// 参数：graphId - 图谱 ID
const loadGraph = async (graphId) => {
  // 设置加载状态
  graphLoading.value = true
  
  try {
    // 调用 API 获取图谱数据
    const res = await getGraphData(graphId)
    if (res.success) {
      // 保存图谱数据
      graphData.value = res.data
      addLog('图谱数据加载成功')
    }
  } catch (err) {
    // 捕获并记录错误
    addLog(`图谱加载失败: ${err.message}`)
  } finally {
    // 无论成功或失败，都重置加载状态
    graphLoading.value = false
  }
}

// --- 数据逻辑：刷新图谱 ---
// 刷新当前图谱数据
const refreshGraph = () => {
  // 如果项目数据存在且包含 graph_id，则重新加载图谱
  if (projectData.value?.graph_id) {
    loadGraph(projectData.value.graph_id)
  }
}

// --- 监听器：监听路由参数变化 ---
// 监听路由参数中的 reportId 变化
watch(() => route.params.reportId, (newId) => {
  // 当 reportId 发生变化时，重新加载数据
  if (newId && newId !== currentReportId.value) {
    currentReportId.value = newId
    loadReportData()
  }
}, { immediate: true }) // 立即执行一次

// --- 生命周期钩子：组件挂载 ---
// 组件挂载到 DOM 后执行
onMounted(() => {
  // 记录初始化日志
  addLog('InteractionView 初始化')
  // 加载报告数据
  loadReportData()
})
</script>

<style scoped>
/* 主视图容器样式 */
.main-view {
  height: 100vh; /* 占满整个视口高度 */
  display: flex;
  flex-direction: column; /* 垂直布局 */
  background: #FFF; /* 白色背景 */
  overflow: hidden; /* 隐藏溢出内容 */
  font-family: 'Space Grotesk', 'Noto Sans SC', system-ui, sans-serif; /* 字体设置 */
}

/* 顶部导航栏样式 */
.app-header {
  height: 60px; /* 导航栏高度 */
  border-bottom: 1px solid #EAEAEA; /* 底部边框 */
  display: flex;
  align-items: center; /* 垂直居中 */
  justify-content: space-between; /* 两端对齐 */
  padding: 0 24px; /* 左右内边距 */
  background: #FFF; /* 白色背景 */
  z-index: 100; /* 层级，确保在其他元素之上 */
  position: relative; /* 相对定位 */
}

/* 头部中间区域样式 */
.header-center {
  position: absolute; /* 绝对定位 */
  left: 50%; /* 左侧偏移 50% */
  transform: translateX(-50%); /* 向左偏移自身宽度的一半，实现居中 */
}

/* 品牌标识样式 */
.brand {
  font-family: 'JetBrains Mono', monospace; /* 等宽字体 */
  font-weight: 800; /* 超粗体 */
  font-size: 18px; /* 字体大小 */
  letter-spacing: 1px; /* 字母间距 */
  cursor: pointer; /* 鼠标指针 */
}

/* 视图切换器样式 */
.view-switcher {
  display: flex;
  background: #F5F5F5; /* 浅灰色背景 */
  padding: 4px; /* 内边距 */
  border-radius: 6px; /* 圆角 */
  gap: 4px; /* 按钮间距 */
}

/* 切换按钮样式 */
.switch-btn {
  border: none; /* 无边框 */
  background: transparent; /* 透明背景 */
  padding: 6px 16px; /* 内边距 */
  font-size: 12px; /* 字体大小 */
  font-weight: 600; /* 半粗体 */
  color: #666; /* 灰色文字 */
  border-radius: 4px; /* 圆角 */
  cursor: pointer; /* 鼠标指针 */
  transition: all 0.2s; /* 过渡动画 */
}

/* 激活状态的切换按钮 */
.switch-btn.active {
  background: #FFF; /* 白色背景 */
  color: #000; /* 黑色文字 */
  box-shadow: 0 2px 4px rgba(0,0,0,0.05); /* 阴影效果 */
}

/* 头部右侧区域样式 */
.header-right {
  display: flex;
  align-items: center; /* 垂直居中 */
  gap: 16px; /* 元素间距 */
}

/* 工作流程步骤样式 */
.workflow-step {
  display: flex;
  align-items: center; /* 垂直居中 */
  gap: 8px; /* 元素间距 */
  font-size: 14px; /* 字体大小 */
}

/* 步骤编号样式 */
.step-num {
  font-family: 'JetBrains Mono', monospace; /* 等宽字体 */
  font-weight: 700; /* 粗体 */
  color: #999; /* 灰色文字 */
}

/* 步骤名称样式 */
.step-name {
  font-weight: 700; /* 粗体 */
  color: #000; /* 黑色文字 */
}

/* 步骤分隔线样式 */
.step-divider {
  width: 1px; /* 宽度 */
  height: 14px; /* 高度 */
  background-color: #E0E0E0; /* 浅灰色背景 */
}

/* 状态指示器样式 */
.status-indicator {
  display: flex;
  align-items: center; /* 垂直居中 */
  gap: 8px; /* 元素间距 */
  font-size: 12px; /* 字体大小 */
  color: #666; /* 灰色文字 */
  font-weight: 500; /* 中等粗细 */
}

/* 状态指示点样式 */
.dot {
  width: 8px; /* 宽度 */
  height: 8px; /* 高度 */
  border-radius: 50%; /* 圆形 */
  background: #CCC; /* 灰色背景 */
}

/* 就绪状态：绿色 */
.status-indicator.ready .dot { background: #4CAF50; }
/* 处理中状态：橙色，带脉冲动画 */
.status-indicator.processing .dot { background: #FF9800; animation: pulse 1s infinite; }
/* 完成状态：绿色 */
.status-indicator.completed .dot { background: #4CAF50; }
/* 错误状态：红色 */
.status-indicator.error .dot { background: #F44336; }

/* 脉冲动画关键帧 */
@keyframes pulse { 
  50% { opacity: 0.5; } /* 透明度变化 */
}

/* 主内容区域样式 */
.content-area {
  flex: 1; /* 占据剩余空间 */
  display: flex;
  position: relative; /* 相对定位 */
  overflow: hidden; /* 隐藏溢出内容 */
}

/* 面板包装器样式 */
.panel-wrapper {
  height: 100%; /* 占满高度 */
  overflow: hidden; /* 隐藏溢出内容 */
  /* 过渡动画：宽度、透明度、变换 */
  transition: width 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.3s ease, transform 0.3s ease;
  will-change: width, opacity, transform; /* 性能优化 */
}

/* 左侧面板样式 */
.panel-wrapper.left {
  border-right: 1px solid #EAEAEA; /* 右侧边框 */
}
</style>
