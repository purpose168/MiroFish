<template>
  <!-- 图谱面板容器 -->
  <div class="graph-panel">
    <!-- 面板头部 -->
    <div class="panel-header">
      <!-- 面板标题 -->
      <span class="panel-title">图谱关系可视化</span>
      <!-- 顶部工具栏 (内部右上角) -->
      <div class="header-tools">
        <!-- 刷新按钮 -->
        <button class="tool-btn" @click="$emit('refresh')" :disabled="loading" title="刷新图谱">
          <!-- 刷新图标 -->
          <span class="icon-refresh" :class="{ 'spinning': loading }">↻</span>
          <span class="btn-text">刷新</span>
        </button>
        <!-- 最大化/还原按钮 -->
        <button class="tool-btn" @click="$emit('toggle-maximize')" title="最大化/还原">
          <!-- 最大化图标 -->
          <span class="icon-maximize">⛶</span>
        </button>
      </div>
    </div>
    
    <!-- 图谱容器 -->
    <div class="graph-container" ref="graphContainer">
      <!-- 图谱可视化 -->
      <div v-if="graphData" class="graph-view">
        <!-- SVG 图谱 -->
        <svg ref="graphSvg" class="graph-svg"></svg>
        
        <!-- 构建中/模拟中提示 -->
        <div v-if="currentPhase === 1 || isSimulating" class="graph-building-hint">
          <!-- 记忆图标包装器 -->
          <div class="memory-icon-wrapper">
            <!-- 记忆图标 SVG -->
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="memory-icon">
              <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-4.04z" />
              <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-4.04z" />
            </svg>
          </div>
          <!-- 提示文本 -->
          {{ isSimulating ? 'GraphRAG长短期记忆实时更新中' : '实时更新中...' }}
        </div>
        
        <!-- 模拟结束后的提示 -->
        <div v-if="showSimulationFinishedHint" class="graph-building-hint finished-hint">
          <!-- 提示图标包装器 -->
          <div class="hint-icon-wrapper">
            <!-- 提示图标 SVG -->
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="hint-icon">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </div>
          <!-- 提示文本 -->
          <span class="hint-text">还有少量内容处理中，建议稍后手动刷新图谱</span>
          <!-- 关闭提示按钮 -->
          <button class="hint-close-btn" @click="dismissFinishedHint" title="关闭提示">
            <!-- 关闭图标 SVG -->
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <!-- 节点/边详情面板 -->
        <div v-if="selectedItem" class="detail-panel">
          <!-- 详情面板头部 -->
          <div class="detail-panel-header">
            <!-- 详情标题 -->
            <span class="detail-title">{{ selectedItem.type === 'node' ? '节点详情' : '关系' }}</span>
            <!-- 实体类型徽章 -->
            <span v-if="selectedItem.type === 'node'" class="detail-type-badge" :style="{ background: selectedItem.color, color: '#fff' }">
              {{ selectedItem.entityType }}
            </span>
            <!-- 关闭按钮 -->
            <button class="detail-close" @click="closeDetailPanel">×</button>
          </div>
          
          <!-- 节点详情 -->
          <div v-if="selectedItem.type === 'node'" class="detail-content">
            <!-- 名称行 -->
            <div class="detail-row">
              <span class="detail-label">名称:</span>
              <span class="detail-value">{{ selectedItem.data.name }}</span>
            </div>
            <!-- UUID 行 -->
            <div class="detail-row">
              <span class="detail-label">UUID:</span>
              <span class="detail-value uuid-text">{{ selectedItem.data.uuid }}</span>
            </div>
            <!-- 创建时间行 -->
            <div class="detail-row" v-if="selectedItem.data.created_at">
              <span class="detail-label">创建时间:</span>
              <span class="detail-value">{{ formatDateTime(selectedItem.data.created_at) }}</span>
            </div>
            
            <!-- 属性部分 -->
            <div class="detail-section" v-if="selectedItem.data.attributes && Object.keys(selectedItem.data.attributes).length > 0">
              <!-- 部分标题 -->
              <div class="section-title">属性:</div>
              <!-- 属性列表 -->
              <div class="properties-list">
                <!-- 循环渲染属性项 -->
                <div v-for="(value, key) in selectedItem.data.attributes" :key="key" class="property-item">
                  <span class="property-key">{{ key }}:</span>
                  <span class="property-value">{{ value || '无' }}</span>
                </div>
              </div>
            </div>
            
            <!-- 摘要部分 -->
            <div class="detail-section" v-if="selectedItem.data.summary">
              <!-- 部分标题 -->
              <div class="section-title">摘要:</div>
              <!-- 摘要文本 -->
              <div class="summary-text">{{ selectedItem.data.summary }}</div>
            </div>
            
            <!-- 标签部分 -->
            <div class="detail-section" v-if="selectedItem.data.labels && selectedItem.data.labels.length > 0">
              <!-- 部分标题 -->
              <div class="section-title">标签:</div>
              <!-- 标签列表 -->
              <div class="labels-list">
                <!-- 循环渲染标签 -->
                <span v-for="label in selectedItem.data.labels" :key="label" class="label-tag">
                  {{ label }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- 边详情 -->
          <div v-else class="detail-content">
            <!-- 自环组详情 -->
            <template v-if="selectedItem.data.isSelfLoopGroup">
              <!-- 自环关系头部 -->
              <div class="edge-relation-header self-loop-header">
                {{ selectedItem.data.source_name }} - 自关系
                <!-- 自环数量 -->
                <span class="self-loop-count">{{ selectedItem.data.selfLoopCount }} 项</span>
              </div>
              
              <!-- 自环列表 -->
              <div class="self-loop-list">
                <!-- 循环渲染自环项 -->
                <div 
                  v-for="(loop, idx) in selectedItem.data.selfLoopEdges" 
                  :key="loop.uuid || idx" 
                  class="self-loop-item"
                  :class="{ expanded: expandedSelfLoops.has(loop.uuid || idx) }"
                >
                  <!-- 自环项头部 -->
                  <div 
                    class="self-loop-item-header"
                    @click="toggleSelfLoop(loop.uuid || idx)"
                  >
                    <!-- 自环索引 -->
                    <span class="self-loop-index">#{{ idx + 1 }}</span>
                    <!-- 自环名称 -->
                    <span class="self-loop-name">{{ loop.name || loop.fact_type || '相关' }}</span>
                    <!-- 展开/折叠切换按钮 -->
                    <span class="self-loop-toggle">{{ expandedSelfLoops.has(loop.uuid || idx) ? '−' : '+' }}</span>
                  </div>
                  
                  <!-- 自环项内容 -->
                  <div class="self-loop-item-content" v-show="expandedSelfLoops.has(loop.uuid || idx)">
                    <!-- UUID 行 -->
                    <div class="detail-row" v-if="loop.uuid">
                      <span class="detail-label">UUID:</span>
                      <span class="detail-value uuid-text">{{ loop.uuid }}</span>
                    </div>
                    <!-- 事实行 -->
                    <div class="detail-row" v-if="loop.fact">
                      <span class="detail-label">事实:</span>
                      <span class="detail-value fact-text">{{ loop.fact }}</span>
                    </div>
                    <!-- 类型行 -->
                    <div class="detail-row" v-if="loop.fact_type">
                      <span class="detail-label">类型:</span>
                      <span class="detail-value">{{ loop.fact_type }}</span>
                    </div>
                    <!-- 创建时间行 -->
                    <div class="detail-row" v-if="loop.created_at">
                      <span class="detail-label">创建时间:</span>
                      <span class="detail-value">{{ formatDateTime(loop.created_at) }}</span>
                    </div>
                    <!-- 剧集部分 -->
                    <div v-if="loop.episodes && loop.episodes.length > 0" class="self-loop-episodes">
                      <span class="detail-label">剧集:</span>
                      <!-- 剧集列表（紧凑模式） -->
                      <div class="episodes-list compact">
                        <!-- 循环渲染剧集标签 -->
                        <span v-for="ep in loop.episodes" :key="ep" class="episode-tag small">{{ ep }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            
            <!-- 普通边详情 -->
            <template v-else>
              <!-- 边关系头部 -->
              <div class="edge-relation-header">
                {{ selectedItem.data.source_name }} → {{ selectedItem.data.name || '相关于' }} → {{ selectedItem.data.target_name }}
              </div>
              
              <!-- UUID 行 -->
              <div class="detail-row">
                <span class="detail-label">UUID:</span>
                <span class="detail-value uuid-text">{{ selectedItem.data.uuid }}</span>
              </div>
              <!-- 标签行 -->
              <div class="detail-row">
                <span class="detail-label">标签:</span>
                <span class="detail-value">{{ selectedItem.data.name || '相关于' }}</span>
              </div>
              <!-- 类型行 -->
              <div class="detail-row">
                <span class="detail-label">类型:</span>
                <span class="detail-value">{{ selectedItem.data.fact_type || '未知' }}</span>
              </div>
              <!-- 事实行 -->
              <div class="detail-row" v-if="selectedItem.data.fact">
                <span class="detail-label">事实:</span>
                <span class="detail-value fact-text">{{ selectedItem.data.fact }}</span>
              </div>
              
              <!-- 剧集部分 -->
              <div class="detail-section" v-if="selectedItem.data.episodes && selectedItem.data.episodes.length > 0">
                <!-- 部分标题 -->
                <div class="section-title">剧集:</div>
                <!-- 剧集列表 -->
                <div class="episodes-list">
                  <!-- 循环渲染剧集标签 -->
                  <span v-for="ep in selectedItem.data.episodes" :key="ep" class="episode-tag">
                    {{ ep }}
                  </span>
                </div>
              </div>
              
              <!-- 创建时间行 -->
              <div class="detail-row" v-if="selectedItem.data.created_at">
                <span class="detail-label">创建时间:</span>
                <span class="detail-value">{{ formatDateTime(selectedItem.data.created_at) }}</span>
              </div>
              <!-- 有效时间行 -->
              <div class="detail-row" v-if="selectedItem.data.valid_at">
                <span class="detail-label">有效起始时间:</span>
                <span class="detail-value">{{ formatDateTime(selectedItem.data.valid_at) }}</span>
              </div>
            </template>
          </div>
        </div>
      </div>
      
      <!-- 加载状态 -->
      <div v-else-if="loading" class="graph-state">
        <!-- 加载动画 -->
        <div class="loading-spinner"></div>
        <p>图谱数据加载中...</p>
      </div>
      
      <!-- 等待/空状态 -->
      <div v-else class="graph-state">
        <!-- 空状态图标 -->
        <div class="empty-icon">❖</div>
        <p class="empty-text">等待本体生成...</p>
      </div>
    </div>

    <!-- 底部图例 (左下角) -->
    <div v-if="graphData && entityTypes.length" class="graph-legend">
      <!-- 图例标题 -->
      <span class="legend-title">实体类型</span>
      <!-- 图例项列表 -->
      <div class="legend-items">
        <!-- 循环渲染图例项 -->
        <div class="legend-item" v-for="type in entityTypes" :key="type.name">
          <!-- 图例点 -->
          <span class="legend-dot" :style="{ background: type.color }"></span>
          <!-- 图例标签 -->
          <span class="legend-label">{{ type.name }}</span>
        </div>
      </div>
    </div>
    
    <!-- 显示边标签开关 -->
    <div v-if="graphData" class="edge-labels-toggle">
      <!-- 切换开关 -->
      <label class="toggle-switch">
        <input type="checkbox" v-model="showEdgeLabels" />
        <span class="slider"></span>
      </label>
      <!-- 切换标签 -->
      <span class="toggle-label">显示边标签</span>
    </div>
  </div>
</template>

<script setup>
// 导入 Vue 3 Composition API 核心函数
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
// 导入 D3.js 数据可视化库
import * as d3 from 'd3'

// 定义组件属性
const props = defineProps({
  graphData: Object, // 图谱数据
  loading: Boolean, // 加载状态
  currentPhase: Number, // 当前阶段
  isSimulating: Boolean // 是否正在模拟
})

// 定义组件事件
const emit = defineEmits(['refresh', 'toggle-maximize'])

// DOM 引用
const graphContainer = ref(null) // 图谱容器引用
const graphSvg = ref(null) // SVG 元素引用

// 状态管理
const selectedItem = ref(null) // 选中的项目（节点或边）
const showEdgeLabels = ref(true) // 是否显示边标签（默认显示）
const expandedSelfLoops = ref(new Set()) // 展开的自环项集合
const showSimulationFinishedHint = ref(false) // 是否显示模拟结束后的提示
const wasSimulating = ref(false) // 追踪之前是否在模拟中

// 关闭模拟结束提示
const dismissFinishedHint = () => {
  showSimulationFinishedHint.value = false
}

// 监听 isSimulating 变化，检测模拟结束
watch(() => props.isSimulating, (newValue, oldValue) => {
  if (wasSimulating.value && !newValue) {
    // 从模拟中变为非模拟状态，显示结束提示
    showSimulationFinishedHint.value = true
  }
  wasSimulating.value = newValue
}, { immediate: true })

// 切换自环项展开/折叠状态
const toggleSelfLoop = (id) => {
  const newSet = new Set(expandedSelfLoops.value)
  if (newSet.has(id)) {
    newSet.delete(id) // 如果已展开，则折叠
  } else {
    newSet.add(id) // 如果未展开，则展开
  }
  expandedSelfLoops.value = newSet
}

// 计算实体类型用于图例
const entityTypes = computed(() => {
  if (!props.graphData?.nodes) return []
  const typeMap = {}
  // 美观的颜色调色板
  const colors = ['#FF6B35', '#004E89', '#7B2D8E', '#1A936F', '#C5283D', '#E9724C', '#3498db', '#9b59b6', '#27ae60', '#f39c12']
  
  // 遍历所有节点，统计每种实体类型的数量
  props.graphData.nodes.forEach(node => {
    const type = node.labels?.find(l => l !== 'Entity') || '实体'
    if (!typeMap[type]) {
      typeMap[type] = { name: type, count: 0, color: colors[Object.keys(typeMap).length % colors.length] }
    }
    typeMap[type].count++
  })
  return Object.values(typeMap)
})

// 格式化时间
const formatDateTime = (dateStr) => {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true 
    })
  } catch {
    return dateStr
  }
}

// 关闭详情面板
const closeDetailPanel = () => {
  selectedItem.value = null
  expandedSelfLoops.value = new Set() // 重置展开状态
}

// D3 仿真相关变量
let currentSimulation = null // 当前仿真实例
let linkLabelsRef = null // 边标签引用
let linkLabelBgRef = null // 边标签背景引用

// 渲染图谱函数
const renderGraph = () => {
  // 如果 SVG 或图谱数据不存在，则不渲染
  if (!graphSvg.value || !props.graphData) return
  
  // 停止之前的仿真
  if (currentSimulation) {
    currentSimulation.stop()
  }
  
  // 获取容器尺寸
  const container = graphContainer.value
  const width = container.clientWidth
  const height = container.clientHeight
  
  // 设置 SVG 尺寸
  const svg = d3.select(graphSvg.value)
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    
  // 清空 SVG 内容
  svg.selectAll('*').remove()
  
  // 获取节点和边数据
  const nodesData = props.graphData.nodes || []
  const edgesData = props.graphData.edges || []
  
  // 如果没有节点，则不渲染
  if (nodesData.length === 0) return

  // 准备数据
  const nodeMap = {}
  // 创建节点映射表（UUID -> 节点对象）
  nodesData.forEach(n => nodeMap[n.uuid] = n)
  
  // 转换节点数据格式
  const nodes = nodesData.map(n => ({
    id: n.uuid,
    name: n.name || '未命名',
    type: n.labels?.find(l => l !== 'Entity') || '实体',
    rawData: n
  }))
  
  // 创建节点 ID 集合
  const nodeIds = new Set(nodes.map(n => n.id))
  
  // 处理边数据，计算同一对节点间的边数量和索引
  const edgePairCount = {} // 边对计数
  const selfLoopEdges = {} // 按节点分组的自环边
  // 过滤出有效的边（源节点和目标节点都存在）
  const tempEdges = edgesData
    .filter(e => nodeIds.has(e.source_node_uuid) && nodeIds.has(e.target_node_uuid))
  
  // 统计每对节点之间的边数量，收集自环边
  tempEdges.forEach(e => {
    if (e.source_node_uuid === e.target_node_uuid) {
      // 自环 - 收集到数组中
      if (!selfLoopEdges[e.source_node_uuid]) {
        selfLoopEdges[e.source_node_uuid] = []
      }
      selfLoopEdges[e.source_node_uuid].push({
        ...e,
        source_name: nodeMap[e.source_node_uuid]?.name,
        target_name: nodeMap[e.target_node_uuid]?.name
      })
    } else {
      // 普通边 - 统计边对数量
      const pairKey = [e.source_node_uuid, e.target_node_uuid].sort().join('_')
      edgePairCount[pairKey] = (edgePairCount[pairKey] || 0) + 1
    }
  })
  
  // 记录当前处理到每对节点的第几条边
  const edgePairIndex = {}
  const processedSelfLoopNodes = new Set() // 已处理的自环节点
  
  const edges = []
  
  // 处理每条边
  tempEdges.forEach(e => {
    const isSelfLoop = e.source_node_uuid === e.target_node_uuid
    
    if (isSelfLoop) {
      // 自环边 - 每个节点只添加一条合并的自环
      if (processedSelfLoopNodes.has(e.source_node_uuid)) {
        return // 已处理过，跳过
      }
      processedSelfLoopNodes.add(e.source_node_uuid)
      
      const allSelfLoops = selfLoopEdges[e.source_node_uuid]
      const nodeName = nodeMap[e.source_node_uuid]?.name || '未知'
      
      edges.push({
        source: e.source_node_uuid,
        target: e.target_node_uuid,
        type: 'SELF_LOOP',
        name: `自关系 (${allSelfLoops.length})`,
        curvature: 0,
        isSelfLoop: true,
        rawData: {
          isSelfLoopGroup: true,
          source_name: nodeName,
          target_name: nodeName,
          selfLoopCount: allSelfLoops.length,
          selfLoopEdges: allSelfLoops // 存储所有自环边的详细信息
        }
      })
      return
    }
    
    // 普通边处理
    const pairKey = [e.source_node_uuid, e.target_node_uuid].sort().join('_')
    const totalCount = edgePairCount[pairKey]
    const currentIndex = edgePairIndex[pairKey] || 0
    edgePairIndex[pairKey] = currentIndex + 1
    
    // 判断边的方向是否与标准化方向一致（源UUID < 目标UUID）
    const isReversed = e.source_node_uuid > e.target_node_uuid
    
    // 计算曲率：多条边时分散开，单条边为直线
    let curvature = 0
    if (totalCount > 1) {
      // 均匀分布曲率，确保明显区分
      // 曲率范围根据边数量增加，边越多曲率范围越大
      const curvatureRange = Math.min(1.2, 0.6 + totalCount * 0.15)
      curvature = ((currentIndex / (totalCount - 1)) - 0.5) * curvatureRange * 2
      
      // 如果边的方向与标准化方向相反，翻转曲率
      // 这样确保所有边在同一参考系下分布，不会因方向不同而重叠
      if (isReversed) {
        curvature = -curvature
      }
    }
    
    edges.push({
      source: e.source_node_uuid,
      target: e.target_node_uuid,
      type: e.fact_type || e.name || '相关',
      name: e.name || e.fact_type || '相关',
      curvature,
      isSelfLoop: false,
      pairIndex: currentIndex,
      pairTotal: totalCount,
      rawData: {
        ...e,
        source_name: nodeMap[e.source_node_uuid]?.name,
        target_name: nodeMap[e.target_node_uuid]?.name
      }
    })
  })
      
  // 颜色映射
  const colorMap = {}
  entityTypes.value.forEach(t => colorMap[t.name] = t.color)
  const getColor = (type) => colorMap[type] || '#999'

  // 创建力导向仿真 - 根据边数量动态调整节点间距
  // 
  // 力导向图（Force-Directed Graph）是一种基于物理模拟的图布局算法
  // 它将节点视为带电粒子，边视为弹簧，通过模拟物理力来计算节点的位置
  // 
  // 主要的力包括：
  // 1. 斥力（Charge Force）：所有节点之间相互排斥，防止节点重叠
  // 2. 连接力（Link Force）：连接的节点之间有吸引力，保持边长
  // 3. 中心力（Center Force）：将节点拉向画布中心
  // 4. 碰撞力（Collision Force）：防止节点重叠
  // 5. X/Y 向心力（X/Y Position Forces）：将节点拉向中心的 X/Y 坐标
  const simulation = d3.forceSimulation(nodes)
    // 连接力：连接的节点之间有吸引力
    // distance 函数根据边的数量动态调整节点间距
    // 基础距离 150px，每多一条边增加 50px
    // 这样可以避免多条边重叠，使图谱更清晰
    .force('link', d3.forceLink(edges).id(d => d.id).distance(d => {
      // 根据这对节点之间的边数量动态调整距离
      // 基础距离 150，每多一条边增加 40
      const baseDistance = 150
      const edgeCount = d.pairTotal || 1
      return baseDistance + (edgeCount - 1) * 50
    }))
    // 斥力：所有节点之间相互排斥
    // strength(-400) 表示斥力强度为 -400（负值表示斥力）
    // 斥力越大，节点之间的距离越远
    .force('charge', d3.forceManyBody().strength(-400)) // 斥力
    // 中心力：将节点拉向画布中心
    // (width / 2, height / 2) 是画布的中心坐标
    .force('center', d3.forceCenter(width / 2, height / 2)) // 中心力
    // 碰撞力：防止节点重叠
    // 50 是节点的碰撞半径，节点之间保持至少 50px 的距离
    .force('collide', d3.forceCollide(50)) // 碰撞检测
    // 添加向中心的引力，让独立的节点群聚集到中心区域
    // forceX 和 forceY 是额外的位置力，将节点拉向指定的 X 和 Y 坐标
    // strength(0.04) 表示力的强度，值越大，拉力越强
    .force('x', d3.forceX(width / 2).strength(0.04))
    .force('y', d3.forceY(height / 2).strength(0.04))
  
  currentSimulation = simulation

  // 创建主组
  // 
  // D3 的 SVG 组（Group）是一个容器元素，可以将多个 SVG 元素组合在一起
  // 通过对组应用变换（如缩放、平移），可以同时变换组内的所有元素
  // 这样可以实现图谱的整体缩放和平移功能
  const g = svg.append('g')
  
  // 缩放功能
  // 
  // d3.zoom() 创建一个缩放行为，可以监听鼠标滚轮和拖拽事件
  // extent([[0, 0], [width, height]]) 定义了缩放的范围
  // scaleExtent([0.1, 4]) 定义了缩放的比例范围（0.1 倍到 4 倍）
  // on('zoom', ...) 定义了缩放事件的处理函数，更新组的变换
  // 
  // event.transform 包含缩放和平移的信息：
  // - event.transform.k: 缩放比例
  // - event.transform.x: X 轴平移量
  // - event.transform.y: Y 轴平移量
  svg.call(d3.zoom().extent([[0, 0], [width, height]]).scaleExtent([0.1, 4]).on('zoom', (event) => {
    g.attr('transform', event.transform)
  }))

  // 边组 - 使用 path 支持曲线
  const linkGroup = g.append('g').attr('class', 'links')
  
  // 计算曲线路径的函数
  // 
  // 这个函数使用 SVG 路径命令来绘制边：
  // - M (Move to): 移动画笔到指定点
  // - L (Line to): 画直线到指定点
  // - Q (Quadratic Bézier curve to): 画二次贝塞尔曲线到指定点
  // - A (Elliptical arc): 画椭圆弧
  // 
  // 贝塞尔曲线（Bézier Curve）是一种参数曲线，广泛用于计算机图形学
  // 二次贝塞尔曲线由起点、控制点和终点三个点定义
  // 曲线上的点 B(t) = (1-t)²P0 + 2(1-t)tP1 + t²P2，其中 t ∈ [0, 1]
  // - P0 是起点，P1 是控制点，P2 是终点
  // - t=0 时，B(0)=P0；t=1 时，B(1)=P2
  // - 控制点 P1 决定了曲线的弯曲方向和程度
  const getLinkPath = (d) => {
    const sx = d.source.x, sy = d.source.y
    const tx = d.target.x, ty = d.target.y
    
    // 检测自环
    if (d.isSelfLoop) {
      // 自环：绘制一个圆弧从节点出发再返回
      const loopRadius = 30
      // 从节点右侧出发，绕一圈回来
      const x1 = sx + 8  // 起点偏移
      const y1 = sy - 4
      const x2 = sx + 8  // 终点偏移
      const y2 = sy + 4
      // 使用圆弧绘制自环（sweep-flag=1 顺时针）
      // A rx ry x-axis-rotation large-arc-flag sweep-flag x y
      // - rx, ry: 椭圆的 X 和 Y 半径
      // - x-axis-rotation: 椭圆的旋转角度
      // - large-arc-flag: 是否是大弧（0 或 1）
      // - sweep-flag: 绘制方向（0 逆时针，1 顺时针）
      // - x, y: 终点坐标
      return `M${x1},${y1} A${loopRadius},${loopRadius} 0 1,1 ${x2},${y2}`
    }
    
    if (d.curvature === 0) {
      // 直线：使用 L 命令画直线
      return `M${sx},${sy} L${tx},${ty}`
    }
    
    // 计算曲线控制点 - 根据边数量和距离动态调整
    const dx = tx - sx, dy = ty - sy
    const dist = Math.sqrt(dx * dx + dy * dy)
    // 垂直于连线方向的偏移，根据距离比例计算，保证曲线明显可见
    // 边越多，偏移量占距离的比例越大
    const pairTotal = d.pairTotal || 1
    const offsetRatio = 0.25 + pairTotal * 0.05 // 基础25%，每多一条边增加5%
    const baseOffset = Math.max(35, dist * offsetRatio)
    // 计算控制点的偏移量
    // 使用向量垂直方向：如果连线向量是 (dx, dy)，则垂直向量是 (-dy, dx)
    // 将垂直向量归一化并乘以偏移量，得到控制点的偏移坐标
    const offsetX = -dy / dist * d.curvature * baseOffset
    const offsetY = dx / dist * d.curvature * baseOffset
    // 控制点位于连线中点加上偏移量
    const cx = (sx + tx) / 2 + offsetX
    const cy = (sy + ty) / 2 + offsetY
    
    // 使用二次贝塞尔曲线：Q cx cy tx ty
    // cx, cy 是控制点，tx, ty 是终点
    return `M${sx},${sy} Q${cx},${cy} ${tx},${ty}`
  }
  
  // 计算曲线中点的函数（用于标签定位）
  // 
  // 这个函数计算边的中点位置，用于放置边标签
  // 对于直线，中点就是起点和终点的平均值
  // 对于贝塞尔曲线，需要使用贝塞尔曲线公式计算中点
  const getLinkMidpoint = (d) => {
    const sx = d.source.x, sy = d.source.y
    const tx = d.target.x, ty = d.target.y
    
    // 检测自环
    if (d.isSelfLoop) {
      // 自环标签位置：节点右侧
      return { x: sx + 70, y: sy }
    }
    
    if (d.curvature === 0) {
      // 直线的中点：起点和终点的平均值
      return { x: (sx + tx) / 2, y: (sy + ty) / 2 }
    }
    
    // 二次贝塞尔曲线的中点 t=0.5
    // 使用贝塞尔曲线公式计算中点位置
    const dx = tx - sx, dy = ty - sy
    const dist = Math.sqrt(dx * dx + dy * dy)
    const pairTotal = d.pairTotal || 1
    const offsetRatio = 0.25 + pairTotal * 0.05
    const baseOffset = Math.max(35, dist * offsetRatio)
    const offsetX = -dy / dist * d.curvature * baseOffset
    const offsetY = dx / dist * d.curvature * baseOffset
    const cx = (sx + tx) / 2 + offsetX
    const cy = (sy + ty) / 2 + offsetY
    
    // 二次贝塞尔曲线公式 B(t) = (1-t)²P0 + 2(1-t)tP1 + t²P2, t=0.5
    // 当 t=0.5 时：
    // B(0.5) = 0.25 * P0 + 0.5 * P1 + 0.25 * P2
    // 这就是曲线的中点位置
    const midX = 0.25 * sx + 0.5 * cx + 0.25 * tx
    const midY = 0.25 * sy + 0.5 * cy + 0.25 * ty
    
    return { x: midX, y: midY }
  }
  
  // 创建边路径
  const link = linkGroup.selectAll('path')
    .data(edges)
    .enter().append('path')
    .attr('stroke', '#C0C0C0')
    .attr('stroke-width', 1.5)
    .attr('fill', 'none')
    .style('cursor', 'pointer')
    .on('click', (event, d) => {
      event.stopPropagation()
      // 重置之前选中边的样式
      linkGroup.selectAll('path').attr('stroke', '#C0C0C0').attr('stroke-width', 1.5)
      linkLabelBg.attr('fill', 'rgba(255,255,255,0.95)')
      linkLabels.attr('fill', '#666')
      // 高亮当前选中的边
      d3.select(event.target).attr('stroke', '#3498db').attr('stroke-width', 3)
      
      selectedItem.value = {
        type: 'edge',
        data: d.rawData
      }
    })

  // 边标签背景（白色背景使文字更清晰）
  const linkLabelBg = linkGroup.selectAll('rect')
    .data(edges)
    .enter().append('rect')
    .attr('fill', 'rgba(255,255,255,0.95)')
    .attr('rx', 3)
    .attr('ry', 3)
    .style('cursor', 'pointer')
    .style('pointer-events', 'all')
    .style('display', showEdgeLabels.value ? 'block' : 'none')
    .on('click', (event, d) => {
      event.stopPropagation()
      linkGroup.selectAll('path').attr('stroke', '#C0C0C0').attr('stroke-width', 1.5)
      linkLabelBg.attr('fill', 'rgba(255,255,255,0.95)')
      linkLabels.attr('fill', '#666')
      // 高亮对应的边
      link.filter(l => l === d).attr('stroke', '#3498db').attr('stroke-width', 3)
      d3.select(event.target).attr('fill', 'rgba(52, 152, 219, 0.1)')
      
      selectedItem.value = {
        type: 'edge',
        data: d.rawData
      }
    })

  // 边标签
  const linkLabels = linkGroup.selectAll('text')
    .data(edges)
    .enter().append('text')
    .text(d => d.name)
    .attr('font-size', '9px')
    .attr('fill', '#666')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .style('cursor', 'pointer')
    .style('pointer-events', 'all')
    .style('font-family', 'system-ui, sans-serif')
    .style('display', showEdgeLabels.value ? 'block' : 'none')
    .on('click', (event, d) => {
      event.stopPropagation()
      linkGroup.selectAll('path').attr('stroke', '#C0C0C0').attr('stroke-width', 1.5)
      linkLabelBg.attr('fill', 'rgba(255,255,255,0.95)')
      linkLabels.attr('fill', '#666')
      // 高亮对应的边
      link.filter(l => l === d).attr('stroke', '#3498db').attr('stroke-width', 3)
      d3.select(event.target).attr('fill', '#3498db')
      
      selectedItem.value = {
        type: 'edge',
        data: d.rawData
      }
    })
  
  // 保存引用供外部控制显隐
  linkLabelsRef = linkLabels
  linkLabelBgRef = linkLabelBg

  // 节点组
  const nodeGroup = g.append('g').attr('class', 'nodes')
  
  // 节点圆形
  const node = nodeGroup.selectAll('circle')
    .data(nodes)
    .enter().append('circle')
    .attr('r', 10)
    .attr('fill', d => getColor(d.type))
    .attr('stroke', '#fff')
    .attr('stroke-width', 2.5)
    .style('cursor', 'pointer')
    .call(d3.drag()
      .on('start', (event, d) => {
        // 只记录位置，不重启仿真（区分点击和拖拽）
        d.fx = d.x
        d.fy = d.y
        d._dragStartX = event.x
        d._dragStartY = event.y
        d._isDragging = false
      })
      .on('drag', (event, d) => {
        // 检测是否真正开始拖拽（移动超过阈值）
        const dx = event.x - d._dragStartX
        const dy = event.y - d._dragStartY
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (!d._isDragging && distance > 3) {
          // 首次检测到真正拖拽，才重启仿真
          d._isDragging = true
          simulation.alphaTarget(0.3).restart()
        }
        
        if (d._isDragging) {
          d.fx = event.x
          d.fy = event.y
        }
      })
      .on('end', (event, d) => {
        // 只有真正拖拽过才让仿真逐渐停止
        if (d._isDragging) {
          simulation.alphaTarget(0)
        }
        d.fx = null
        d.fy = null
        d._isDragging = false
      })
    )
    .on('click', (event, d) => {
      event.stopPropagation()
      // 重置所有节点样式
      node.attr('stroke', '#fff').attr('stroke-width', 2.5)
      linkGroup.selectAll('path').attr('stroke', '#C0C0C0').attr('stroke-width', 1.5)
      // 高亮选中节点
      d3.select(event.target).attr('stroke', '#E91E63').attr('stroke-width', 4)
      // 高亮与此节点相连的边
      link.filter(l => l.source.id === d.id || l.target.id === d.id)
        .attr('stroke', '#E91E63')
        .attr('stroke-width', 2.5)
      
      selectedItem.value = {
        type: 'node',
        data: d.rawData,
        entityType: d.type,
        color: getColor(d.type)
      }
    })
    .on('mouseenter', (event, d) => {
      if (!selectedItem.value || selectedItem.value.data?.uuid !== d.rawData.uuid) {
        d3.select(event.target).attr('stroke', '#333').attr('stroke-width', 3)
      }
    })
    .on('mouseleave', (event, d) => {
      if (!selectedItem.value || selectedItem.value.data?.uuid !== d.rawData.uuid) {
        d3.select(event.target).attr('stroke', '#fff').attr('stroke-width', 2.5)
      }
    })

  // 节点标签
  const nodeLabels = nodeGroup.selectAll('text')
    .data(nodes)
    .enter().append('text')
    .text(d => d.name.length > 8 ? d.name.substring(0, 8) + '…' : d.name)
    .attr('font-size', '11px')
    .attr('fill', '#333')
    .attr('font-weight', '500')
    .attr('dx', 14)
    .attr('dy', 4)
    .style('pointer-events', 'none')
    .style('font-family', 'system-ui, sans-serif')

  // 仿真 tick 事件 - 每帧更新位置
  // 
  // D3 力导向仿真的 tick 事件在每一帧仿真迭代时触发
  // 在这个事件处理函数中，我们更新所有 SVG 元素的位置
  // 这样可以实现平滑的动画效果
  // 
  // 仿真的 alpha 值表示仿真的"热度"：
  // - alpha 从 1.0 开始，逐渐衰减到 0
  // - alpha 越高，节点移动越快
  // - 当 alpha 降到阈值以下时，仿真自动停止
  simulation.on('tick', () => {
    // 更新曲线路径
    // 使用 getLinkPath 函数计算每条边的路径
    link.attr('d', d => getLinkPath(d))
    
    // 更新边标签位置（无旋转，水平显示更清晰）
    // 使用 getLinkMidpoint 函数计算每条边的中点位置
    // 将标签放置在边的中点位置
    linkLabels.each(function(d) {
      const mid = getLinkMidpoint(d)
      d3.select(this)
        .attr('x', mid.x)
        .attr('y', mid.y)
        .attr('transform', '') // 移除旋转，保持水平
    })
    
    // 更新边标签背景
    // 背景矩形需要根据文本的大小和位置进行调整
    // 使用 getBBox() 获取文本的边界框
    linkLabelBg.each(function(d, i) {
      const mid = getLinkMidpoint(d)
      const textEl = linkLabels.nodes()[i]
      const bbox = textEl.getBBox()
      // 背景矩形的位置和大小：
      // - x: 中点 x 坐标减去文本宽度的一半，再减去 4px 的内边距
      // - y: 中点 y 坐标减去文本高度的一半，再减去 2px 的内边距
      // - width: 文本宽度加上 8px 的内边距
      // - height: 文本高度加上 4px 的内边距
      d3.select(this)
        .attr('x', mid.x - bbox.width / 2 - 4)
        .attr('y', mid.y - bbox.height / 2 - 2)
        .attr('width', bbox.width + 8)
        .attr('height', bbox.height + 4)
        .attr('transform', '') // 移除旋转
    })

    // 更新节点位置
    // 节点的位置由仿真的力计算得出
    node
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)

    // 更新节点标签位置
    // 节点标签跟随节点移动
    nodeLabels
      .attr('x', d => d.x)
      .attr('y', d => d.y)
  })
  
  // 点击空白处关闭详情面板
  svg.on('click', () => {
    selectedItem.value = null
    node.attr('stroke', '#fff').attr('stroke-width', 2.5)
    linkGroup.selectAll('path').attr('stroke', '#C0C0C0').attr('stroke-width', 1.5)
    linkLabelBg.attr('fill', 'rgba(255,255,255,0.95)')
    linkLabels.attr('fill', '#666')
  })
}

// 监听图谱数据变化，重新渲染图谱
// 
// Vue 的 watch API 用于监听响应式数据的变化
// 当 props.graphData 发生变化时，重新渲染图谱
// { deep: true } 选项表示深度监听，可以检测对象内部属性的变化
watch(() => props.graphData, () => {
  nextTick(renderGraph)
}, { deep: true })

// 监听边标签显示开关
// 
// 当 showEdgeLabels 的值变化时，更新边标签的显示状态
// 使用 D3 的 style() 方法动态修改 CSS display 属性
watch(showEdgeLabels, (newVal) => {
  if (linkLabelsRef) {
    linkLabelsRef.style('display', newVal ? 'block' : 'none')
  }
  if (linkLabelBgRef) {
    linkLabelBgRef.style('display', newVal ? 'block' : 'none')
  }
})

// 处理窗口大小变化
// 
// 当浏览器窗口大小改变时，需要重新渲染图谱
// 因为 SVG 的尺寸依赖于容器的大小
// 使用 nextTick 确保 DOM 更新完成后再渲染
const handleResize = () => {
  nextTick(renderGraph)
}

// 组件挂载时添加窗口大小变化监听
// 
// onMounted 是 Vue 3 的生命周期钩子
// 在组件挂载到 DOM 后调用
// 在这里添加事件监听器，确保组件已经准备好
onMounted(() => {
  window.addEventListener('resize', handleResize)
})

// 组件卸载时移除监听并停止仿真
// 
// onUnmounted 是 Vue 3 的生命周期钩子
// 在组件从 DOM 卸载前调用
// 在这里清理资源，防止内存泄漏：
// 1. 移除事件监听器
// 2. 停止 D3 仿真
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (currentSimulation) {
    currentSimulation.stop()
  }
})
</script>

<style scoped>
/* 图谱面板容器样式 */
.graph-panel {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #FAFAFA; /* 背景色为浅灰色 */
  background-image: radial-gradient(#D0D0D0 1.5px, transparent 1.5px); /* 点状背景图案 */
  background-size: 24px 24px; /* 背景图案大小 */
  overflow: hidden; /* 隐藏溢出内容 */
}

/* 面板头部样式 */
.panel-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 16px 20px;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(255,255,255,0)); /* 渐变背景 */
  pointer-events: none; /* 允许点击穿透 */
}

/* 面板标题样式 */
.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  pointer-events: auto; /* 恢复点击事件 */
}

/* 头部工具栏样式 */
.header-tools {
  pointer-events: auto; /* 恢复点击事件 */
  display: flex;
  gap: 10px;
  align-items: center;
}

/* 工具按钮样式 */
.tool-btn {
  height: 32px;
  padding: 0 12px;
  border: 1px solid #E0E0E0;
  background: #FFF;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  font-size: 13px;
}

/* 工具按钮悬停样式 */
.tool-btn:hover {
  background: #F5F5F5;
  color: #000;
  border-color: #CCC;
}

/* 按钮文本样式 */
.tool-btn .btn-text {
  font-size: 12px;
}

/* 刷新图标旋转动画 */
.icon-refresh.spinning {
  animation: spin 1s linear infinite;
}

/* 旋转动画关键帧 */
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

/* 图谱容器样式 */
.graph-container {
  width: 100%;
  height: 100%;
}

/* 图谱视图和 SVG 样式 */
.graph-view, .graph-svg {
  width: 100%;
  height: 100%;
  display: block;
}

/* 图谱状态样式 */
.graph-state {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #999;
}

/* 空状态图标样式 */
.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.2;
}

/* 实体类型图例 - 左下角 */
.graph-legend {
  position: absolute;
  bottom: 24px;
  left: 24px;
  background: rgba(255,255,255,0.95);
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #EAEAEA;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  z-index: 10;
}

/* 图例标题样式 */
.legend-title {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: #E91E63;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 图例项列表样式 */
.legend-items {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
  max-width: 320px;
}

/* 图例项样式 */
.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #555;
}

/* 图例点样式 */
.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* 图例标签样式 */
.legend-label {
  white-space: nowrap;
}

/* 边标签开关 - 右上角 */
.edge-labels-toggle {
  position: absolute;
  top: 60px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: #FFF;
  padding: 8px 14px;
  border-radius: 20px;
  border: 1px solid #E0E0E0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  z-index: 10;
}

/* 切换开关样式 */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
}

/* 切换开关输入框样式 */
.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

/* 滑块样式 */
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #E0E0E0;
  border-radius: 22px;
  transition: 0.3s;
}

/* 滑块圆点样式 */
.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  border-radius: 50%;
  transition: 0.3s;
}

/* 选中状态的滑块样式 */
input:checked + .slider {
  background-color: #7B2D8E;
}

/* 选中状态的滑块圆点样式 */
input:checked + .slider:before {
  transform: translateX(18px);
}

/* 切换标签样式 */
.toggle-label {
  font-size: 12px;
  color: #666;
}

/* 详情面板 - 右侧 */
.detail-panel {
  position: absolute;
  top: 60px;
  right: 20px;
  width: 320px;
  max-height: calc(100% - 100px);
  background: #FFF;
  border: 1px solid #EAEAEA;
  border-radius: 10px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  overflow: hidden;
  font-family: 'Noto Sans SC', system-ui, sans-serif;
  font-size: 13px;
  z-index: 20;
  display: flex;
  flex-direction: column;
}

/* 详情面板头部样式 */
.detail-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: #FAFAFA;
  border-bottom: 1px solid #EEE;
  flex-shrink: 0;
}

/* 详情标题样式 */
.detail-title {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

/* 详情类型徽章样式 */
.detail-type-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  margin-left: auto;
  margin-right: 12px;
}

/* 详情关闭按钮样式 */
.detail-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #999;
  line-height: 1;
  padding: 0;
  transition: color 0.2s;
}

/* 详情关闭按钮悬停样式 */
.detail-close:hover {
  color: #333;
}

/* 详情内容样式 */
.detail-content {
  padding: 16px;
  overflow-y: auto;
  flex: 1;
}

/* 详情行样式 */
.detail-row {
  margin-bottom: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

/* 详情标签样式 */
.detail-label {
  color: #888;
  font-size: 12px;
  font-weight: 500;
  min-width: 80px;
}

/* 详情值样式 */
.detail-value {
  color: #333;
  flex: 1;
  word-break: break-word;
}

/* UUID 文本样式 */
.detail-value.uuid-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #666;
}

/* 事实文本样式 */
.detail-value.fact-text {
  line-height: 1.5;
  color: #444;
}

/* 详情部分样式 */
.detail-section {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid #F0F0F0;
}

/* 部分标题样式 */
.section-title {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  margin-bottom: 10px;
}

/* 属性列表样式 */
.properties-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 属性项样式 */
.property-item {
  display: flex;
  gap: 8px;
}

/* 属性键样式 */
.property-key {
  color: #888;
  font-weight: 500;
  min-width: 90px;
}

/* 属性值样式 */
.property-value {
  color: #333;
  flex: 1;
}

/* 摘要文本样式 */
.summary-text {
  line-height: 1.6;
  color: #444;
  font-size: 12px;
}

/* 标签列表样式 */
.labels-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* 标签样式 */
.label-tag {
  display: inline-block;
  padding: 4px 12px;
  background: #F5F5F5;
  border: 1px solid #E0E0E0;
  border-radius: 16px;
  font-size: 11px;
  color: #555;
}

/* 剧集列表样式 */
.episodes-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* 剧集标签样式 */
.episode-tag {
  display: inline-block;
  padding: 6px 10px;
  background: #F8F8F8;
  border: 1px solid #E8E8E8;
  border-radius: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: #666;
  word-break: break-all;
}

/* 边关系头部样式 */
.edge-relation-header {
  background: #F8F8F8;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 13px;
  font-weight: 500;
  color: #333;
  line-height: 1.5;
  word-break: break-word;
}

/* 构建提示样式 */
.graph-building-hint {
  position: absolute;
  bottom: 160px; /* 从 80px 向上移动 */
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(8px);
  color: #fff;
  padding: 10px 20px;
  border-radius: 30px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-weight: 500;
  letter-spacing: 0.5px;
  z-index: 100;
}

/* 记忆图标包装器样式 */
.memory-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  animation: breathe 2s ease-in-out infinite;
}

/* 记忆图标样式 */
.memory-icon {
  width: 18px;
  height: 18px;
  color: #4CAF50;
}

/* 呼吸动画关键帧 */
@keyframes breathe {
  0%, 100% { opacity: 0.7; transform: scale(1); filter: drop-shadow(0 0 2px rgba(76, 175, 80, 0.3)); }
  50% { opacity: 1; transform: scale(1.15); filter: drop-shadow(0 0 8px rgba(76, 175, 80, 0.6)); }
}

/* 模拟结束后的提示样式 */
.graph-building-hint.finished-hint {
  background: rgba(0, 0, 0, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* 提示图标包装器样式 */
.finished-hint .hint-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 提示图标样式 */
.finished-hint .hint-icon {
  width: 18px;
  height: 18px;
  color: #FFF;
}

/* 提示文本样式 */
.finished-hint .hint-text {
  flex: 1;
  white-space: nowrap;
}

/* 提示关闭按钮样式 */
.hint-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: #FFF;
  transition: all 0.2s;
  margin-left: 8px;
  flex-shrink: 0;
}

/* 提示关闭按钮悬停样式 */
.hint-close-btn:hover {
  background: rgba(255, 255, 255, 0.35);
  transform: scale(1.1);
}

/* 加载动画样式 */
.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #E0E0E0;
  border-top-color: #7B2D8E;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

/* 自环样式 */
.self-loop-header {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #E8F5E9 0%, #F1F8E9 100%);
  border: 1px solid #C8E6C9;
}

/* 自环数量样式 */
.self-loop-count {
  margin-left: auto;
  font-size: 11px;
  color: #666;
  background: rgba(255,255,255,0.8);
  padding: 2px 8px;
  border-radius: 10px;
}

/* 自环列表样式 */
.self-loop-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 自环项样式 */
.self-loop-item {
  background: #FAFAFA;
  border: 1px solid #EAEAEA;
  border-radius: 8px;
}

/* 自环项头部样式 */
.self-loop-item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #F5F5F5;
  cursor: pointer;
  transition: background 0.2s;
}

/* 自环项头部悬停样式 */
.self-loop-item-header:hover {
  background: #EEEEEE;
}

/* 展开状态的自环项样式 */
.self-loop-item.expanded .self-loop-item-header {
  background: #E8E8E8;
}

/* 自环索引样式 */
.self-loop-index {
  font-size: 10px;
  font-weight: 600;
  color: #888;
  background: #E0E0E0;
  padding: 2px 6px;
  border-radius: 4px;
}

/* 自环名称样式 */
.self-loop-name {
  font-size: 12px;
  font-weight: 500;
  color: #333;
  flex: 1;
}

/* 自环切换按钮样式 */
.self-loop-toggle {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #888;
  background: #E0E0E0;
  border-radius: 4px;
  transition: all 0.2s;
}

/* 展开状态的自环切换按钮样式 */
.self-loop-item.expanded .self-loop-toggle {
  background: #D0D0D0;
  color: #666;
}

/* 自环项内容样式 */
.self-loop-item-content {
  padding: 12px;
  border-top: 1px solid #EAEAEA;
}

/* 自环项内容中的详情行样式 */
.self-loop-item-content .detail-row {
  margin-bottom: 8px;
}
</style>
