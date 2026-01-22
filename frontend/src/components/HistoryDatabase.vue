<template>
  <!-- 历史数据库主容器 -->
  <!-- 根据是否有项目和加载状态动态添加 no-projects 类 -->
  <div 
    class="history-database"
    :class="{ 'no-projects': projects.length === 0 && !loading }"
    ref="historyContainer"
  >
    <!-- 背景装饰：技术网格线（只在有项目时显示） -->
    <!-- 使用 CSS 渐变创建网格图案，增强科技感 -->
    <div v-if="projects.length > 0 || loading" class="tech-grid-bg">
      <!-- 网格图案层 -->
      <div class="grid-pattern"></div>
      <!-- 渐变遮罩层，使网格边缘柔和 -->
      <div class="gradient-overlay"></div>
    </div>

    <!-- 标题区域 -->
    <!-- 显示"推演记录"标题，两侧有装饰线 -->
    <div class="section-header">
      <!-- 左侧装饰线 -->
      <div class="section-line"></div>
      <!-- 标题文本 -->
      <span class="section-title">推演记录</span>
      <!-- 右侧装饰线 -->
      <div class="section-line"></div>
    </div>

    <!-- 卡片容器（只在有项目时显示） -->
    <!-- 根据展开状态动态调整高度和布局 -->
    <div v-if="projects.length > 0" class="cards-container" :class="{ expanded: isExpanded }" :style="containerStyle">
      <!-- 循环渲染每个项目卡片 -->
      <div 
        v-for="(project, index) in projects" 
        :key="project.simulation_id"
        class="project-card"
        :class="{ expanded: isExpanded, hovering: hoveringCard === index }"
        :style="getCardStyle(index)"
        @mouseenter="hoveringCard = index"
        @mouseleave="hoveringCard = null"
        @click="navigateToProject(project)"
      >
        <!-- 卡片头部：显示 simulation_id 和功能可用状态 -->
        <div class="card-header">
          <!-- 格式化显示的模拟 ID -->
          <span class="card-id">{{ formatSimulationId(project.simulation_id) }}</span>
          <!-- 功能状态图标组 -->
          <div class="card-status-icons">
            <!-- 图谱构建状态图标 -->
            <span 
              class="status-icon" 
              :class="{ available: project.project_id, unavailable: !project.project_id }"
              title="图谱构建"
            >◇</span>
            <!-- 环境搭建状态图标（始终可用） -->
            <span 
              class="status-icon available" 
              title="环境搭建"
            >◈</span>
            <!-- 分析报告状态图标 -->
            <span 
              class="status-icon" 
              :class="{ available: project.report_id, unavailable: !project.report_id }"
              title="分析报告"
            >◆</span>
          </div>
        </div>

        <!-- 文件列表区域 -->
        <!-- 显示项目关联的文件，最多显示 3 个 -->
        <div class="card-files-wrapper">
          <!-- 角落装饰 - 取景框风格 -->
          <div class="corner-mark top-left-only"></div>
          
          <!-- 文件列表 -->
          <div class="files-list" v-if="project.files && project.files.length > 0">
            <!-- 循环渲染文件项（最多 3 个） -->
            <div 
              v-for="(file, fileIndex) in project.files.slice(0, 3)" 
              :key="fileIndex"
              class="file-item"
            >
              <!-- 文件类型标签 -->
              <span class="file-tag" :class="getFileType(file.filename)">{{ getFileTypeLabel(file.filename) }}</span>
              <!-- 文件名（截断显示） -->
              <span class="file-name">{{ truncateFilename(file.filename, 20) }}</span>
            </div>
            <!-- 如果有更多文件，显示数量提示 -->
            <div v-if="project.files.length > 3" class="files-more">
              +{{ project.files.length - 3 }} 个文件
            </div>
          </div>
          <!-- 无文件时的占位显示 -->
          <div class="files-empty" v-else>
            <span class="empty-file-icon">◇</span>
            <span class="empty-file-text">暂无文件</span>
          </div>
        </div>

        <!-- 卡片标题（使用模拟需求的前20字作为标题） -->
        <h3 class="card-title">{{ getSimulationTitle(project.simulation_requirement) }}</h3>

        <!-- 卡片描述（模拟需求完整展示，最多 55 字） -->
        <p class="card-desc">{{ truncateText(project.simulation_requirement, 55) }}</p>

        <!-- 卡片底部 -->
        <!-- 显示创建时间和轮数进度 -->
        <div class="card-footer">
          <!-- 日期时间组合 -->
          <div class="card-datetime">
            <span class="card-date">{{ formatDate(project.created_at) }}</span>
            <span class="card-time">{{ formatTime(project.created_at) }}</span>
          </div>
          <!-- 轮数进度显示 -->
          <span class="card-progress" :class="getProgressClass(project)">
            <span class="status-dot">●</span> {{ formatRounds(project) }}
          </span>
        </div>
        
        <!-- 底部装饰线 (hover时展开) -->
        <!-- 鼠标悬停时显示黑色装饰线 -->
        <div class="card-bottom-line"></div>
      </div>
    </div>

    <!-- 加载状态 -->
    <!-- 数据加载时显示加载动画 -->
    <div v-if="loading" class="loading-state">
      <span class="loading-spinner"></span>
      <span class="loading-text">加载中...</span>
    </div>

    <!-- 历史回放详情弹窗 -->
    <!-- 使用 Teleport 将弹窗渲染到 body 元素下，避免被父容器遮挡 -->
    <Teleport to="body">
      <!-- 使用 Transition 组件实现弹窗动画 -->
      <Transition name="modal">
        <!-- 弹窗遮罩层 -->
        <div v-if="selectedProject" class="modal-overlay" @click.self="closeModal">
          <!-- 弹窗内容 -->
          <div class="modal-content">
            <!-- 弹窗头部 -->
            <div class="modal-header">
              <!-- 头部信息区域 -->
              <div class="modal-title-section">
                <!-- 模拟 ID -->
                <span class="modal-id">{{ formatSimulationId(selectedProject.simulation_id) }}</span>
                <!-- 轮数进度 -->
                <span class="modal-progress" :class="getProgressClass(selectedProject)">
                  <span class="status-dot">●</span> {{ formatRounds(selectedProject) }}
                </span>
                <!-- 创建时间 -->
                <span class="modal-create-time">{{ formatDate(selectedProject.created_at) }} {{ formatTime(selectedProject.created_at) }}</span>
              </div>
              <!-- 关闭按钮 -->
              <button class="modal-close" @click="closeModal">×</button>
            </div>

            <!-- 弹窗内容 -->
            <div class="modal-body">
              <!-- 模拟需求部分 -->
              <div class="modal-section">
                <div class="modal-label">模拟需求</div>
                <div class="modal-requirement">{{ selectedProject.simulation_requirement || '无' }}</div>
              </div>

              <!-- 文件列表部分 -->
              <div class="modal-section">
                <div class="modal-label">关联文件</div>
                <!-- 文件列表（支持滚动） -->
                <div class="modal-files" v-if="selectedProject.files && selectedProject.files.length > 0">
                  <!-- 循环渲染文件项 -->
                  <div v-for="(file, index) in selectedProject.files" :key="index" class="modal-file-item">
                    <span class="file-tag" :class="getFileType(file.filename)">{{ getFileTypeLabel(file.filename) }}</span>
                    <span class="modal-file-name">{{ file.filename }}</span>
                  </div>
                </div>
                <!-- 无文件时的占位 -->
                <div class="modal-empty" v-else>暂无关联文件</div>
              </div>
            </div>

            <!-- 推演回放分割线 -->
            <!-- 分隔项目信息和导航按钮 -->
            <div class="modal-divider">
              <span class="divider-line"></span>
              <span class="divider-text">推演回放</span>
              <span class="divider-line"></span>
            </div>

            <!-- 导航按钮 -->
            <!-- 提供跳转到不同功能页面的按钮 -->
            <div class="modal-actions">
              <!-- 图谱构建按钮 (Step1) -->
              <button 
                class="modal-btn btn-project" 
                @click="goToProject"
                :disabled="!selectedProject.project_id"
              >
                <span class="btn-step">Step1</span>
                <span class="btn-icon">◇</span>
                <span class="btn-text">图谱构建</span>
              </button>
              <!-- 环境搭建按钮 (Step2) -->
              <button 
                class="modal-btn btn-simulation" 
                @click="goToSimulation"
              >
                <span class="btn-step">Step2</span>
                <span class="btn-icon">◈</span>
                <span class="btn-text">环境搭建</span>
              </button>
              <!-- 分析报告按钮 (Step4) -->
              <button 
                class="modal-btn btn-report" 
                @click="goToReport"
                :disabled="!selectedProject.report_id"
              >
                <span class="btn-step">Step4</span>
                <span class="btn-icon">◆</span>
                <span class="btn-text">分析报告</span>
              </button>
            </div>
            <!-- 不可回放提示 -->
            <!-- 说明 Step3 和 Step5 不支持历史回放 -->
            <div class="modal-playback-hint">
              <span class="hint-text">Step3「开始模拟」与 Step5「深度互动」需在运行中启动，不支持历史回放</span>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
// 导入 Vue 3 Composition API 的响应式函数和生命周期钩子
import { ref, computed, onMounted, onUnmounted, onActivated, watch, nextTick } from 'vue'
// 导入 Vue Router 的路由管理功能
import { useRouter, useRoute } from 'vue-router'
// 导入模拟历史数据的 API 函数
import { getSimulationHistory } from '../api/simulation'

// 初始化路由实例
const router = useRouter()
const route = useRoute()

// ========== 响应式状态定义 ==========

// 项目列表数据
const projects = ref([])
// 加载状态标志
const loading = ref(true)
// 卡片展开状态标志（false=折叠态，true=展开态）
const isExpanded = ref(false)
// 当前悬停的卡片索引
const hoveringCard = ref(null)
// 历史容器 DOM 引用
const historyContainer = ref(null)
// 当前选中的项目（用于弹窗显示）
const selectedProject = ref(null)

// ========== 内部变量（非响应式） ==========

// IntersectionObserver 实例，用于检测容器是否在视口中
let observer = null
// 动画锁，防止卡片展开/收起时快速闪烁
let isAnimating = false
// 防抖定时器，用于延迟状态切换
let expandDebounceTimer = null
// 记录待执行的目标状态（用于处理动画期间的滚动事件）
let pendingState = null

// ========== 卡片布局配置 ==========

// 每行显示的卡片数量
const CARDS_PER_ROW = 4
// 卡片宽度（像素）
const CARD_WIDTH = 280  
// 卡片高度（像素）
const CARD_HEIGHT = 280 
// 卡片间距（像素）
const CARD_GAP = 24

// ========== 计算属性 ==========

// 动态计算容器高度样式
// 根据展开状态和卡片数量返回不同的高度值
const containerStyle = computed(() => {
  if (!isExpanded.value) {
    // 折叠态：使用固定高度，保持卡片扇形堆叠效果
    return { minHeight: '420px' }
  }
  
  // 展开态：根据卡片数量动态计算高度
  const total = projects.value.length
  if (total === 0) {
    return { minHeight: '280px' }
  }
  
  // 计算需要的行数
  const rows = Math.ceil(total / CARDS_PER_ROW)
  // 计算实际需要的高度：行数 * 卡片高度 + (行数-1) * 间距 + 少量底部间距
  const expandedHeight = rows * CARD_HEIGHT + (rows - 1) * CARD_GAP + 10
  
  return { minHeight: `${expandedHeight}px` }
})

// ========== 卡片样式计算 ==========

// 获取卡片样式（根据展开状态和索引计算位置）
// 实现了两种布局模式：折叠态的扇形堆叠和展开态的网格布局
const getCardStyle = (index) => {
  const total = projects.value.length
  
  if (isExpanded.value) {
    // 展开态：网格布局
    // 使用 CSS transform 实现平滑的过渡动画
    const transition = 'transform 700ms cubic-bezier(0.23, 1, 0.32, 1), opacity 700ms cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.3s ease, border-color 0.3s ease'

    // 计算卡片在网格中的列和行
    const col = index % CARDS_PER_ROW
    const row = Math.floor(index / CARDS_PER_ROW)
    
    // 计算当前行的卡片数量，确保每行居中显示
    const currentRowStart = row * CARDS_PER_ROW
    const currentRowCards = Math.min(CARDS_PER_ROW, total - currentRowStart)
    
    // 计算当前行的总宽度
    const rowWidth = currentRowCards * CARD_WIDTH + (currentRowCards - 1) * CARD_GAP
    
    // 计算起始 X 坐标（使行居中）
    const startX = -(rowWidth / 2) + (CARD_WIDTH / 2)
    const colInRow = index % CARDS_PER_ROW
    const x = startX + colInRow * (CARD_WIDTH + CARD_GAP)
    
    // 计算 Y 坐标（向下展开，增加与标题的间距）
    const y = 20 + row * (CARD_HEIGHT + CARD_GAP)

    // 返回展开态的样式
    return {
      transform: `translate(${x}px, ${y}px) rotate(0deg) scale(1)`,
      zIndex: 100 + index,
      opacity: 1,
      transition: transition
    }
  } else {
    // 折叠态：扇形堆叠布局
    // 卡片以扇形方式堆叠在标题下方，营造层次感
    const transition = 'transform 700ms cubic-bezier(0.23, 1, 0.32, 1), opacity 700ms cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.3s ease, border-color 0.3s ease'

    // 计算中心索引
    const centerIndex = (total - 1) / 2
    // 计算当前卡片相对于中心的偏移量
    const offset = index - centerIndex
    
    // 计算扇形堆叠的位置和角度
    const x = offset * 35  // 水平偏移
    // 调整起始位置，靠近标题但保持适当间距
    const y = 25 + Math.abs(offset) * 8  // 垂直偏移（越靠外的卡片越靠下）
    const r = offset * 3  // 旋转角度
    const s = 0.95 - Math.abs(offset) * 0.05  // 缩放比例（越靠外的卡片越小）
    
    // 返回折叠态的样式
    return {
      transform: `translate(${x}px, ${y}px) rotate(${r}deg) scale(${s})`,
      zIndex: 10 + index,
      opacity: 1,
      transition: transition
    }
  }
}

// ========== 数据格式化函数 ==========

// 根据轮数进度获取样式类
// 返回 'not-started'、'in-progress' 或 'completed'
const getProgressClass = (simulation) => {
  const current = simulation.current_round || 0
  const total = simulation.total_rounds || 0
  
  if (total === 0 || current === 0) {
    // 未开始
    return 'not-started'
  } else if (current >= total) {
    // 已完成
    return 'completed'
  } else {
    // 进行中
    return 'in-progress'
  }
}

// 格式化日期（只显示日期部分，格式：YYYY-MM-DD）
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    return date.toISOString().slice(0, 10)
  } catch {
    return dateStr?.slice(0, 10) || ''
  }
}

// 格式化时间（显示时:分，格式：HH:MM）
const formatTime = (dateStr) => {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  } catch {
    return ''
  }
}

// 截断文本（超过最大长度时添加省略号）
const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
}

// 从模拟需求生成标题（取前20字）
const getSimulationTitle = (requirement) => {
  if (!requirement) return '未命名模拟'
  const title = requirement.slice(0, 20)
  return requirement.length > 20 ? title + '...' : title
}

// 格式化 simulation_id 显示（截取前6位并添加前缀）
const formatSimulationId = (simulationId) => {
  if (!simulationId) return 'SIM_UNKNOWN'
  const prefix = simulationId.replace('sim_', '').slice(0, 6)
  return `SIM_${prefix.toUpperCase()}`
}

// 格式化轮数显示（当前轮/总轮数）
const formatRounds = (simulation) => {
  const current = simulation.current_round || 0
  const total = simulation.total_rounds || 0
  if (total === 0) return '未开始'
  return `${current}/${total} 轮`
}

// 获取文件类型（用于样式）
// 根据文件扩展名返回对应的类型标识
const getFileType = (filename) => {
  if (!filename) return 'other'
  const ext = filename.split('.').pop()?.toLowerCase()
  // 文件类型映射表
  const typeMap = {
    'pdf': 'pdf',
    'doc': 'doc', 'docx': 'doc',
    'xls': 'xls', 'xlsx': 'xls', 'csv': 'xls',
    'ppt': 'ppt', 'pptx': 'ppt',
    'txt': 'txt', 'md': 'txt', 'json': 'code',
    'jpg': 'img', 'jpeg': 'img', 'png': 'img', 'gif': 'img',
    'zip': 'zip', 'rar': 'zip', '7z': 'zip'
  }
  return typeMap[ext] || 'other'
}

// 获取文件类型标签文本（返回大写的文件扩展名）
const getFileTypeLabel = (filename) => {
  if (!filename) return 'FILE'
  const ext = filename.split('.').pop()?.toUpperCase()
  return ext || 'FILE'
}

// 截断文件名（保留扩展名）
// 当文件名过长时，截断主文件名但保留扩展名
const truncateFilename = (filename, maxLength) => {
  if (!filename) return '未知文件'
  if (filename.length <= maxLength) return filename
  
  // 提取文件扩展名
  const ext = filename.includes('.') ? '.' + filename.split('.').pop() : ''
  // 获取不带扩展名的文件名
  const nameWithoutExt = filename.slice(0, filename.length - ext.length)
  // 截断主文件名并添加省略号
  const truncatedName = nameWithoutExt.slice(0, maxLength - ext.length - 3) + '...'
  return truncatedName + ext
}

// ========== 交互处理函数 ==========

// 打开项目详情弹窗
// 点击卡片时触发，显示项目的详细信息
const navigateToProject = (simulation) => {
  selectedProject.value = simulation
}

// 关闭弹窗
const closeModal = () => {
  selectedProject.value = null
}

// 导航到图谱构建页面（Project）
// 跳转到知识图谱构建页面
const goToProject = () => {
  if (selectedProject.value?.project_id) {
    router.push({
      name: 'Process',
      params: { projectId: selectedProject.value.project_id }
    })
    closeModal()
  }
}

// 导航到环境配置页面（Simulation）
// 跳转到模拟环境配置页面
const goToSimulation = () => {
  if (selectedProject.value?.simulation_id) {
    router.push({
      name: 'Simulation',
      params: { simulationId: selectedProject.value.simulation_id }
    })
    closeModal()
  }
}

// 导航到分析报告页面（Report）
// 跳转到分析报告页面
const goToReport = () => {
  if (selectedProject.value?.report_id) {
    router.push({
      name: 'Report',
      params: { reportId: selectedProject.value.report_id }
    })
    closeModal()
  }
}

// ========== 数据加载函数 ==========

// 加载历史项目
// 从后端 API 获取模拟历史数据
const loadHistory = async () => {
  try {
    loading.value = true
    // 调用 API 获取最近 20 条历史记录
    const response = await getSimulationHistory(20)
    if (response.success) {
      projects.value = response.data || []
    }
  } catch (error) {
    console.error('加载历史项目失败:', error)
    projects.value = []
  } finally {
    loading.value = false
  }
}

// ========== IntersectionObserver 初始化 ==========

// 初始化 IntersectionObserver
// 用于检测历史容器是否进入视口，从而触发展开/收起动画
const initObserver = () => {
  // 如果已存在观察器，先断开连接
  if (observer) {
    observer.disconnect()
  }
  
  // 创建新的 IntersectionObserver
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        // 判断容器是否在视口中
        const shouldExpand = entry.isIntersecting
        
        // 更新待执行的目标状态（无论是否在动画中都要记录最新的目标状态）
        pendingState = shouldExpand
        
        // 清除之前的防抖定时器（新的滚动意图会覆盖旧的）
        if (expandDebounceTimer) {
          clearTimeout(expandDebounceTimer)
          expandDebounceTimer = null
        }
        
        // 如果正在动画中，只记录状态，等动画结束后处理
        if (isAnimating) return
        
        // 如果目标状态与当前状态相同，不需要处理
        if (shouldExpand === isExpanded.value) {
          pendingState = null
          return
        }
        
        // 使用防抖延迟状态切换，防止快速闪烁
        // 展开时延迟较短(50ms)，收起时延迟较长(200ms)以增加稳定性
        const delay = shouldExpand ? 50 : 200
        
        expandDebounceTimer = setTimeout(() => {
          // 检查是否正在动画
          if (isAnimating) return
          
          // 检查待执行状态是否仍需要执行（可能已被后续滚动覆盖）
          if (pendingState === null || pendingState === isExpanded.value) return
          
          // 设置动画锁
          isAnimating = true
          isExpanded.value = pendingState
          pendingState = null
          
          // 动画完成后解除锁定，并检查是否有待处理的状态变化
          setTimeout(() => {
            isAnimating = false
            
            // 动画结束后，检查是否有新的待执行状态
            if (pendingState !== null && pendingState !== isExpanded.value) {
              // 延迟一小段时间再执行，避免太快切换
              expandDebounceTimer = setTimeout(() => {
                if (pendingState !== null && pendingState !== isExpanded.value) {
                  isAnimating = true
                  isExpanded.value = pendingState
                  pendingState = null
                  setTimeout(() => {
                    isAnimating = false
                  }, 750)
                }
              }, 100)
            }
          }, 750)
        }, delay)
      })
    },
    {
      // 使用多个阈值，使检测更平滑
      threshold: [0.4, 0.6, 0.8],
      // 调整 rootMargin，视口底部向上收缩，需要滚动更多才触发展开
      rootMargin: '0px 0px -150px 0px'
    }
  )
  
  // 开始观察历史容器
  if (historyContainer.value) {
    observer.observe(historyContainer.value)
  }
}

// ========== 生命周期钩子 ==========

// 监听路由变化，当返回首页时重新加载数据
watch(() => route.path, (newPath) => {
  if (newPath === '/') {
    loadHistory()
  }
})

// 组件挂载时执行
onMounted(async () => {
  // 确保 DOM 渲染完成后再加载数据
  await nextTick()
  await loadHistory()
  
  // 等待 DOM 渲染后初始化观察器
  setTimeout(() => {
    initObserver()
  }, 100)
})

// 如果使用 keep-alive，在组件激活时重新加载数据
onActivated(() => {
  loadHistory()
})

// 组件卸载时执行
onUnmounted(() => {
  // 清理 Intersection Observer
  if (observer) {
    observer.disconnect()
    observer = null
  }
  // 清理防抖定时器
  if (expandDebounceTimer) {
    clearTimeout(expandDebounceTimer)
    expandDebounceTimer = null
  }
})
</script>

<style scoped>
/* ========== 容器样式 ========== */

/* 历史数据库主容器 */
.history-database {
  position: relative;
  width: 100%;
  min-height: 280px;
  margin-top: 40px;
  padding: 35px 0 40px;
  overflow: visible;
}

/* 无项目时简化显示 */
/* 当没有项目且不在加载状态时，减少高度和内边距 */
.history-database.no-projects {
  min-height: auto;
  padding: 40px 0 20px;
}

/* ========== 背景装饰样式 ========== */

/* 技术网格背景容器 */
.tech-grid-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
}

/* 使用CSS背景图案创建固定间距的正方形网格 */
/* 通过线性渐变创建网格线效果 */
.grid-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
  background-size: 50px 50px;
  /* 从左上角开始定位，高度变化时只在底部扩展，不影响已有网格位置 */
  background-position: top left;
}

/* 渐变遮罩层 */
/* 使网格边缘柔和，增强视觉层次感 */
.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    linear-gradient(to right, rgba(255, 255, 255, 0.9) 0%, transparent 15%, transparent 85%, rgba(255, 255, 255, 0.9) 100%),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.8) 0%, transparent 20%, transparent 80%, rgba(255, 255, 255, 0.8) 100%);
  pointer-events: none;
}

/* ========== 标题区域样式 ========== */

/* 标题区域容器 */
.section-header {
  position: relative;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-bottom: 24px;
  font-family: 'JetBrains Mono', 'SF Mono', monospace;
  padding: 0 40px;
}

/* 标题两侧的装饰线 */
.section-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, #E5E7EB, transparent);
  max-width: 300px;
}

/* 标题文本 */
.section-title {
  font-size: 0.8rem;
  font-weight: 500;
  color: #9CA3AF;
  letter-spacing: 3px;
  text-transform: uppercase;
}

/* ========== 卡片容器样式 ========== */

/* 卡片容器 */
/* 使用相对定位，为绝对定位的卡片提供参考系 */
.cards-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 0 40px;
  transition: min-height 700ms cubic-bezier(0.23, 1, 0.32, 1);
  /* min-height 由 JS 动态计算，根据卡片数量自适应 */
}

/* ========== 项目卡片样式 ========== */

/* 项目卡片 */
.project-card {
  position: absolute;
  width: 280px;
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 0;
  padding: 14px;
  cursor: pointer;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease, border-color 0.3s ease, transform 700ms cubic-bezier(0.23, 1, 0.32, 1), opacity 700ms cubic-bezier(0.23, 1, 0.32, 1);
}

/* 卡片悬停效果 */
.project-card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border-color: rgba(0, 0, 0, 0.4);
  z-index: 1000 !important;
}

/* 悬停时的卡片层级 */
.project-card.hovering {
  z-index: 1000 !important;
}

/* ========== 卡片头部样式 ========== */

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #F3F4F6;
  font-family: 'JetBrains Mono', 'SF Mono', monospace;
  font-size: 0.7rem;
}

/* 卡片 ID 文本 */
.card-id {
  color: #6B7280;
  letter-spacing: 0.5px;
  font-weight: 500;
}

/* 功能状态图标组 */
.card-status-icons {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 状态图标 */
.status-icon {
  font-size: 0.75rem;
  transition: all 0.2s ease;
  cursor: default;
}

/* 可用状态图标 */
.status-icon.available {
  opacity: 1;
}

/* 不同功能的颜色 */
.status-icon:nth-child(1).available { color: #3B82F6; } /* 图谱构建 - 蓝色 */
.status-icon:nth-child(2).available { color: #F59E0B; } /* 环境搭建 - 橙色 */
.status-icon:nth-child(3).available { color: #10B981; } /* 分析报告 - 绿色 */

/* 不可用状态图标 */
.status-icon.unavailable {
  color: #D1D5DB;
  opacity: 0.5;
}

/* 轮数进度显示 */
.card-progress {
  display: flex;
  align-items: center;
  gap: 6px;
  letter-spacing: 0.5px;
  font-weight: 600;
  font-size: 0.65rem;
}

/* 状态点 */
.status-dot {
  font-size: 0.5rem;
}

/* 进度状态颜色 */
.card-progress.completed { color: #10B981; }    /* 已完成 - 绿色 */
.card-progress.in-progress { color: #F59E0B; }  /* 进行中 - 橙色 */
.card-progress.not-started { color: #9CA3AF; }  /* 未开始 - 灰色 */
.card-status.pending { color: #9CA3AF; }

/* ========== 文件列表区域样式 ========== */

/* 文件列表区域容器 */
.card-files-wrapper {
  position: relative;
  width: 100%;
  min-height: 48px;
  max-height: 110px;
  margin-bottom: 12px;
  padding: 8px 10px;
  background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%);
  border-radius: 4px;
  border: 1px solid #e8eaed;
  overflow: hidden;
}

/* 文件列表 */
.files-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* 更多文件提示 */
.files-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3px 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem;
  color: #6B7280;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 3px;
  letter-spacing: 0.3px;
}

/* 文件项 */
.file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 6px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 3px;
  transition: all 0.2s ease;
}

/* 文件项悬停效果 */
.file-item:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateX(2px);
  border-color: #e5e7eb;
}

/* 简约文件标签样式 */
.file-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 16px;
  padding: 0 4px;
  border-radius: 2px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.55rem;
  font-weight: 600;
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: 0.2px;
  flex-shrink: 0;
  min-width: 28px;
}

/* 低饱和度配色方案 - Morandi色系 */
.file-tag.pdf { background: #f2e6e6; color: #a65a5a; }
.file-tag.doc { background: #e6eff5; color: #5a7ea6; }
.file-tag.xls { background: #e6f2e8; color: #5aa668; }
.file-tag.ppt { background: #f5efe6; color: #a6815a; }
.file-tag.txt { background: #f0f0f0; color: #757575; }
.file-tag.code { background: #eae6f2; color: #815aa6; }
.file-tag.img { background: #e6f2f2; color: #5aa6a6; }
.file-tag.zip { background: #f2f0e6; color: #a69b5a; }
.file-tag.other { background: #f3f4f6; color: #6b7280; }

/* 文件名文本 */
.file-name {
  font-family: 'Inter', sans-serif;
  font-size: 0.7rem;
  color: #4b5563;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.1px;
}

/* 无文件时的占位 */
.files-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 48px;
  color: #9CA3AF;
}

/* 空文件图标 */
.empty-file-icon {
  font-size: 1rem;
  opacity: 0.5;
}

/* 空文件文本 */
.empty-file-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  letter-spacing: 0.5px;
}

/* 悬停时文件区域效果 */
.project-card:hover .card-files-wrapper {
  border-color: #d1d5db;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
}

/* ========== 角落装饰样式 ========== */

/* 角落装饰 - 取景框风格 */
.corner-mark.top-left-only {
  position: absolute;
  top: 6px;
  left: 6px;
  width: 8px;
  height: 8px;
  border-top: 1.5px solid rgba(0, 0, 0, 0.4);
  border-left: 1.5px solid rgba(0, 0, 0, 0.4);
  pointer-events: none;
  z-index: 10;
}

/* ========== 卡片标题和描述样式 ========== */

/* 卡片标题 */
.card-title {
  font-family: 'Inter', -apple-system, sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 6px 0;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s ease;
}

/* 卡片标题悬停效果 */
.project-card:hover .card-title {
  color: #2563EB;
}

/* 卡片描述 */
.card-desc {
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  color: #6B7280;
  margin: 0 0 16px 0;
  line-height: 1.5;
  height: 34px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* ========== 卡片底部样式 ========== */

/* 卡片底部 */
.card-footer {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #F3F4F6;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  color: #9CA3AF;
  font-weight: 500;
}

/* 日期时间组合 */
.card-datetime {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 底部轮数进度显示 */
.card-footer .card-progress {
  display: flex;
  align-items: center;
  gap: 6px;
  letter-spacing: 0.5px;
  font-weight: 600;
  font-size: 0.65rem;
}

.card-footer .status-dot {
  font-size: 0.5rem;
}

/* 进度状态颜色 - 底部 */
.card-footer .card-progress.completed { color: #10B981; }
.card-footer .card-progress.in-progress { color: #F59E0B; }
.card-footer .card-progress.not-started { color: #9CA3AF; }

/* 底部装饰线 */
.card-bottom-line {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  width: 0;
  background-color: #000;
  transition: width 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  z-index: 20;
}

/* 底部装饰线悬停展开效果 */
.project-card:hover .card-bottom-line {
  width: 100%;
}

/* ========== 空状态和加载状态样式 ========== */

/* 空状态和加载状态 */
.empty-state, .loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 48px;
  color: #9CA3AF;
}

/* 空状态图标 */
.empty-icon {
  font-size: 2rem;
  opacity: 0.5;
}

/* 加载旋转动画 */
.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #E5E7EB;
  border-top-color: #6B7280;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* 旋转动画关键帧 */
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ========== 响应式设计 ========== */

/* 中等屏幕适配 */
@media (max-width: 1200px) {
  .project-card {
    width: 240px;
  }
}

/* 小屏幕适配 */
@media (max-width: 768px) {
  .cards-container {
    padding: 0 20px;
  }
  .project-card {
    width: 200px;
  }
}

/* ========== 历史回放详情弹窗样式 ========== */

/* 弹窗遮罩层 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

/* 弹窗内容 */
.modal-content {
  background: #FFFFFF;
  width: 560px;
  max-width: 90vw;
  max-height: 85vh;
  overflow-y: auto;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* 弹窗动画过渡 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* 弹窗内容进入动画 */
.modal-enter-active .modal-content {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 弹窗内容离开动画 */
.modal-leave-active .modal-content {
  transition: all 0.2s ease-in;
}

/* 弹窗内容进入初始状态 */
.modal-enter-from .modal-content {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}

/* 弹窗内容离开最终状态 */
.modal-leave-to .modal-content {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}

/* ========== 弹窗头部样式 ========== */

/* 弹窗头部 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 32px;
  border-bottom: 1px solid #F3F4F6;
  background: #FFFFFF;
}

/* 头部信息区域 */
.modal-title-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 弹窗 ID */
.modal-id {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  letter-spacing: 0.5px;
}

/* 弹窗进度 */
.modal-progress {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  background: #F9FAFB;
}

/* 进度状态颜色 */
.modal-progress.completed { color: #10B981; background: rgba(16, 185, 129, 0.1); }
.modal-progress.in-progress { color: #F59E0B; background: rgba(245, 158, 11, 0.1); }
.modal-progress.not-started { color: #9CA3AF; background: #F3F4F6; }

/* 弹窗创建时间 */
.modal-create-time {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  color: #9CA3AF;
  letter-spacing: 0.3px;
}

/* 弹窗关闭按钮 */
.modal-close {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  font-size: 1.5rem;
  color: #9CA3AF;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  border-radius: 6px;
}

/* 关闭按钮悬停效果 */
.modal-close:hover {
  background: #F3F4F6;
  color: #111827;
}

/* ========== 弹窗内容样式 ========== */

/* 弹窗主体内容 */
.modal-body {
  padding: 24px 32px;
}

/* 弹窗部分 */
.modal-section {
  margin-bottom: 24px;
}

/* 最后一个部分 */
.modal-section:last-child {
  margin-bottom: 0;
}

/* 弹窗标签 */
.modal-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 10px;
  font-weight: 500;
}

/* 弹窗需求文本 */
.modal-requirement {
  font-size: 0.95rem;
  color: #374151;
  line-height: 1.6;
  padding: 16px;
  background: #F9FAFB;
  border: 1px solid #F3F4F6;
  border-radius: 8px;
}

/* 弹窗文件列表 */
.modal-files {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 200px;
  overflow-y: auto;
  padding-right: 4px;
}

/* 自定义滚动条样式 */
.modal-files::-webkit-scrollbar {
  width: 4px;
}

.modal-files::-webkit-scrollbar-track {
  background: #F3F4F6;
  border-radius: 2px;
}

.modal-files::-webkit-scrollbar-thumb {
  background: #D1D5DB;
  border-radius: 2px;
}

.modal-files::-webkit-scrollbar-thumb:hover {
  background: #9CA3AF;
}

/* 弹窗文件项 */
.modal-file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  transition: all 0.2s ease;
}

/* 文件项悬停效果 */
.modal-file-item:hover {
  border-color: #D1D5DB;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

/* 弹窗文件名 */
.modal-file-name {
  font-size: 0.85rem;
  color: #4B5563;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 弹窗空状态 */
.modal-empty {
  font-size: 0.85rem;
  color: #9CA3AF;
  padding: 16px;
  background: #F9FAFB;
  border: 1px dashed #E5E7EB;
  border-radius: 6px;
  text-align: center;
}

/* ========== 推演回放分割线样式 ========== */

/* 推演回放分割线 */
.modal-divider {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 32px 0;
  background: #FFFFFF;
}

/* 分割线 */
.divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, #E5E7EB, transparent);
}

/* 分割线文本 */
.divider-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  color: #9CA3AF;
  letter-spacing: 2px;
  text-transform: uppercase;
  white-space: nowrap;
}

/* ========== 导航按钮样式 ========== */

/* 导航按钮容器 */
.modal-actions {
  display: flex;
  gap: 16px;
  padding: 20px 32px;
  background: #FFFFFF;
}

/* 导航按钮 */
.modal-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  background: #FFFFFF;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

/* 按钮悬停效果 */
.modal-btn:hover:not(:disabled) {
  border-color: #000000;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* 按钮禁用状态 */
.modal-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #F9FAFB;
}

/* 按钮步骤标签 */
.btn-step {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem;
  font-weight: 500;
  color: #9CA3AF;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

/* 按钮图标 */
.btn-icon {
  font-size: 1.4rem;
  line-height: 1;
  transition: color 0.2s ease;
}

/* 按钮文本 */
.btn-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: #4B5563;
}

/* 不同按钮的图标颜色 */
.modal-btn.btn-project .btn-icon { color: #3B82F6; }
.modal-btn.btn-simulation .btn-icon { color: #F59E0B; }
.modal-btn.btn-report .btn-icon { color: #10B981; }

/* 按钮文本悬停效果 */
.modal-btn:hover:not(:disabled) .btn-text {
  color: #111827;
}

/* ========== 不可回放提示样式 ========== */

/* 不可回放提示容器 */
.modal-playback-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 32px 20px;
  background: #FFFFFF;
}

/* 提示文本 */
.hint-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  color: #9CA3AF;
  letter-spacing: 0.3px;
  text-align: center;
  line-height: 1.5;
}
</style>
