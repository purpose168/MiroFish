<template>
  <!-- 流程页面容器 -->
  <div class="process-page">
    <!-- 顶部导航栏 -->
    <nav class="navbar">
      <!-- 品牌标识，点击返回首页 -->
      <div class="nav-brand" @click="goHome">MIROFISH</div>
      
      <!-- 中间步骤指示器 -->
      <div class="nav-center">
        <!-- 步骤徽章 -->
        <div class="step-badge">STEP 01</div>
        <!-- 步骤名称 -->
        <div class="step-name">图谱构建</div>
      </div>

      <!-- 导航状态显示 -->
      <div class="nav-status">
        <!-- 状态指示点，根据状态改变样式 -->
        <span class="status-dot" :class="statusClass"></span>
        <!-- 状态文本 -->
        <span class="status-text">{{ statusText }}</span>
      </div>
    </nav>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 左侧面板：实时图谱展示 -->
      <div class="left-panel" :class="{ 'full-screen': isFullScreen }">
        <!-- 面板头部 -->
        <div class="panel-header">
          <!-- 头部左侧：标题 -->
          <div class="header-left">
            <!-- 装饰符号 -->
            <span class="header-deco">◆</span>
            <!-- 面板标题 -->
            <span class="header-title">实时知识图谱</span>
          </div>
          <!-- 头部右侧：统计信息和操作按钮 -->
          <div class="header-right">
            <!-- 如果有图谱数据，显示统计信息 -->
            <template v-if="graphData">
              <!-- 节点数量 -->
              <span class="stat-item">{{ graphData.node_count || graphData.nodes?.length || 0 }} 节点</span>
              <!-- 分隔符 -->
              <span class="stat-divider">|</span>
              <!-- 关系数量 -->
              <span class="stat-item">{{ graphData.edge_count || graphData.edges?.length || 0 }} 关系</span>
              <!-- 分隔符 -->
              <span class="stat-divider">|</span>
            </template>
            <!-- 操作按钮组 -->
            <div class="action-buttons">
                <!-- 刷新图谱按钮 -->
                <button class="action-btn" @click="refreshGraph" :disabled="graphLoading" title="刷新图谱">
                  <!-- 刷新图标，加载时旋转 -->
                  <span class="icon-refresh" :class="{ 'spinning': graphLoading }">↻</span>
                </button>
                <!-- 全屏切换按钮 -->
                <button class="action-btn" @click="toggleFullScreen" :title="isFullScreen ? '退出全屏' : '全屏显示'">
                  <!-- 全屏图标 -->
                  <span class="icon-fullscreen">{{ isFullScreen ? '↙' : '↗' }}</span>
                </button>
            </div>
          </div>
        </div>
        
        <!-- 图谱容器 -->
        <div class="graph-container" ref="graphContainer">
          <!-- 图谱可视化区域（只要有数据就显示） -->
          <div v-if="graphData" class="graph-view">
            <!-- SVG 元素用于 D3.js 绘制图谱 -->
            <svg ref="graphSvg" class="graph-svg"></svg>
            <!-- 构建中提示 -->
            <div v-if="currentPhase === 1" class="graph-building-hint">
              <!-- 脉冲动画点 -->
              <span class="building-dot"></span>
              实时更新中...
            </div>
            
            <!-- 节点/边详情面板 -->
            <div v-if="selectedItem" class="detail-panel">
              <!-- 详情面板头部 -->
              <div class="detail-panel-header">
                <!-- 详情标题：节点详情或关系详情 -->
                <span class="detail-title">{{ selectedItem.type === 'node' ? '节点详情' : '关系详情' }}</span>
                <!-- 如果是节点，显示实体类型标签 -->
                <span v-if="selectedItem.type === 'node'" class="detail-badge" :style="{ background: selectedItem.color }">
                  {{ selectedItem.entityType }}
                </span>
                <!-- 关闭按钮 -->
                <button class="detail-close" @click="closeDetailPanel">×</button>
              </div>
              
              <!-- 节点详情内容 -->
              <div v-if="selectedItem.type === 'node'" class="detail-content">
                <!-- 节点名称 -->
                <div class="detail-row">
                  <span class="detail-label">名称：</span>
                  <span class="detail-value highlight">{{ selectedItem.data.name }}</span>
                </div>
                <!-- 节点 UUID -->
                <div class="detail-row">
                  <span class="detail-label">UUID：</span>
                  <span class="detail-value uuid">{{ selectedItem.data.uuid }}</span>
                </div>
                <!-- 创建时间 -->
                <div class="detail-row" v-if="selectedItem.data.created_at">
                  <span class="detail-label">创建时间：</span>
                  <span class="detail-value">{{ formatDate(selectedItem.data.created_at) }}</span>
                </div>
                
                <!-- 属性/特性 -->
                <div class="detail-section" v-if="selectedItem.data.attributes && Object.keys(selectedItem.data.attributes).length > 0">
                  <span class="detail-label">属性：</span>
                  <!-- 属性列表 -->
                  <div class="properties-list">
                    <div v-for="(value, key) in selectedItem.data.attributes" :key="key" class="property-item">
                      <!-- 属性键 -->
                      <span class="property-key">{{ key }}：</span>
                      <!-- 属性值 -->
                      <span class="property-value">{{ value }}</span>
                    </div>
                  </div>
                </div>
                
                <!-- 摘要 -->
                <div class="detail-section" v-if="selectedItem.data.summary">
                  <span class="detail-label">摘要：</span>
                  <p class="detail-summary">{{ selectedItem.data.summary }}</p>
                </div>
                
                <!-- 标签 -->
                <div class="detail-row" v-if="selectedItem.data.labels?.length">
                  <span class="detail-label">标签：</span>
                  <div class="detail-labels">
                    <span v-for="label in selectedItem.data.labels" :key="label" class="label-tag">{{ label }}</span>
                  </div>
                </div>
              </div>
              
              <!-- 边详情内容 -->
              <div v-else class="detail-content">
                <!-- 关系展示：源节点 → 关系类型 → 目标节点 -->
                <div class="edge-relation">
                  <!-- 源节点名称 -->
                  <span class="edge-source">{{ selectedItem.data.source_name || selectedItem.data.source_node_name }}</span>
                  <!-- 箭头 -->
                  <span class="edge-arrow">→</span>
                  <!-- 关系类型 -->
                  <span class="edge-type">{{ selectedItem.data.name || selectedItem.data.fact_type || 'RELATED_TO' }}</span>
                  <!-- 箭头 -->
                  <span class="edge-arrow">→</span>
                  <!-- 目标节点名称 -->
                  <span class="edge-target">{{ selectedItem.data.target_name || selectedItem.data.target_node_name }}</span>
                </div>
                
                <!-- 关系副标题 -->
                <div class="detail-subtitle">关系</div>
                
                <!-- 关系 UUID -->
                <div class="detail-row">
                  <span class="detail-label">UUID：</span>
                  <span class="detail-value uuid">{{ selectedItem.data.uuid }}</span>
                </div>
                <!-- 关系标签 -->
                <div class="detail-row">
                  <span class="detail-label">标签：</span>
                  <span class="detail-value">{{ selectedItem.data.name || selectedItem.data.fact_type || 'RELATED_TO' }}</span>
                </div>
                <!-- 关系类型 -->
                <div class="detail-row" v-if="selectedItem.data.fact_type">
                  <span class="detail-label">类型：</span>
                  <span class="detail-value">{{ selectedItem.data.fact_type }}</span>
                </div>
                
                <!-- 事实 -->
                <div class="detail-section" v-if="selectedItem.data.fact">
                  <span class="detail-label">事实：</span>
                  <p class="detail-summary">{{ selectedItem.data.fact }}</p>
                </div>
                
                <!-- 剧集/事件 -->
                <div class="detail-section" v-if="selectedItem.data.episodes?.length">
                  <span class="detail-label">剧集：</span>
                  <div class="episodes-list">
                    <span v-for="ep in selectedItem.data.episodes" :key="ep" class="episode-tag">{{ ep }}</span>
                  </div>
                </div>
                
                <!-- 创建时间 -->
                <div class="detail-row" v-if="selectedItem.data.created_at">
                  <span class="detail-label">创建时间：</span>
                  <span class="detail-value">{{ formatDate(selectedItem.data.created_at) }}</span>
                </div>
                <!-- 有效开始时间 -->
                <div class="detail-row" v-if="selectedItem.data.valid_at">
                  <span class="detail-label">有效开始时间：</span>
                  <span class="detail-value">{{ formatDate(selectedItem.data.valid_at) }}</span>
                </div>
                <!-- 无效时间 -->
                <div class="detail-row" v-if="selectedItem.data.invalid_at">
                  <span class="detail-label">无效时间：</span>
                  <span class="detail-value">{{ formatDate(selectedItem.data.invalid_at) }}</span>
                </div>
                <!-- 过期时间 -->
                <div class="detail-row" v-if="selectedItem.data.expired_at">
                  <span class="detail-label">过期时间：</span>
                  <span class="detail-value">{{ formatDate(selectedItem.data.expired_at) }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 加载状态 -->
          <div v-else-if="graphLoading" class="graph-loading">
            <!-- 加载动画 -->
            <div class="loading-animation">
              <div class="loading-ring"></div>
              <div class="loading-ring"></div>
              <div class="loading-ring"></div>
            </div>
            <!-- 加载文本 -->
            <p class="loading-text">图谱数据加载中...</p>
          </div>
          
          <!-- 等待构建状态 -->
          <div v-else-if="currentPhase < 1" class="graph-waiting">
            <!-- 等待图标 -->
            <div class="waiting-icon">
              <svg viewBox="0 0 100 100" class="network-icon">
                <circle cx="50" cy="20" r="8" fill="none" stroke="#000" stroke-width="1.5"/>
                <circle cx="20" cy="60" r="8" fill="none" stroke="#000" stroke-width="1.5"/>
                <circle cx="80" cy="60" r="8" fill="none" stroke="#000" stroke-width="1.5"/>
                <circle cx="50" cy="80" r="8" fill="none" stroke="#000" stroke-width="1.5"/>
                <line x1="50" y1="28" x2="25" y2="54" stroke="#000" stroke-width="1"/>
                <line x1="50" y1="28" x2="75" y2="54" stroke="#000" stroke-width="1"/>
                <line x1="28" y1="60" x2="72" y2="60" stroke="#000" stroke-width="1" stroke-dasharray="4"/>
                <line x1="50" y1="72" x2="26" y2="66" stroke="#000" stroke-width="1"/>
                <line x1="50" y1="72" x2="74" y2="66" stroke="#000" stroke-width="1"/>
              </svg>
            </div>
            <!-- 等待文本 -->
            <p class="waiting-text">等待本体生成</p>
            <!-- 等待提示 -->
            <p class="waiting-hint">生成完成后将自动开始构建图谱</p>
          </div>
          
          <!-- 构建中但还没有数据 -->
          <div v-else-if="currentPhase === 1 && !graphData" class="graph-waiting">
            <!-- 加载动画 -->
            <div class="loading-animation">
              <div class="loading-ring"></div>
              <div class="loading-ring"></div>
              <div class="loading-ring"></div>
            </div>
            <!-- 等待文本 -->
            <p class="waiting-text">图谱构建中</p>
            <!-- 等待提示 -->
            <p class="waiting-hint">数据即将显示...</p>
          </div>
          
          <!-- 错误状态 -->
          <div v-else-if="error" class="graph-error">
            <!-- 错误图标 -->
            <span class="error-icon">⚠</span>
            <!-- 错误信息 -->
            <p>{{ error }}</p>
          </div>
        </div>
        
        <!-- 图谱图例 -->
        <div v-if="graphData" class="graph-legend">
          <!-- 图例项 -->
          <div class="legend-item" v-for="type in entityTypes" :key="type.name">
            <!-- 图例点 -->
            <span class="legend-dot" :style="{ background: type.color }"></span>
            <!-- 图例标签 -->
            <span class="legend-label">{{ type.name }}</span>
            <!-- 图例数量 -->
            <span class="legend-count">{{ type.count }}</span>
          </div>
        </div>
      </div>

      <!-- 右侧面板：构建流程详情 -->
      <div class="right-panel" :class="{ 'hidden': isFullScreen }">
        <!-- 面板头部（深色主题） -->
        <div class="panel-header dark-header">
          <!-- 面板图标 -->
          <span class="header-icon">▣</span>
          <!-- 面板标题 -->
          <span class="header-title">构建流程</span>
        </div>

        <!-- 流程内容 -->
        <div class="process-content">
          <!-- 阶段1：本体生成 -->
          <div class="process-phase" :class="{ 'active': currentPhase === 0, 'completed': currentPhase > 0 }">
            <!-- 阶段头部 -->
            <div class="phase-header">
              <!-- 阶段编号 -->
              <span class="phase-num">01</span>
              <!-- 阶段信息 -->
              <div class="phase-info">
                <!-- 阶段标题 -->
                <div class="phase-title">本体生成</div>
                <!-- API 端点 -->
                <div class="phase-api">/api/graph/ontology/generate</div>
              </div>
              <!-- 阶段状态 -->
              <span class="phase-status" :class="getPhaseStatusClass(0)">
                {{ getPhaseStatusText(0) }}
              </span>
            </div>
            
            <!-- 阶段详情 -->
            <div class="phase-detail">
              <!-- 接口说明 -->
              <div class="detail-section">
                <div class="detail-label">接口说明</div>
                <div class="detail-content">
                  上传文档后，LLM分析文档内容，自动生成适合舆论模拟的本体结构（实体类型 + 关系类型）
                </div>
              </div>
              
              <!-- 本体生成进度 -->
              <div class="detail-section" v-if="ontologyProgress && currentPhase === 0">
                <div class="detail-label">生成进度</div>
                <div class="ontology-progress">
                  <!-- 进度旋转器 -->
                  <div class="progress-spinner"></div>
                  <!-- 进度文本 -->
                  <span class="progress-text">{{ ontologyProgress.message }}</span>
                </div>
              </div>
              
              <!-- 已生成的本体信息 -->
              <div class="detail-section" v-if="projectData?.ontology">
                <div class="detail-label">生成的实体类型 ({{ projectData.ontology.entity_types?.length || 0 }})</div>
                <!-- 实体标签列表 -->
                <div class="entity-tags">
                  <span 
                    v-for="entity in projectData.ontology.entity_types" 
                    :key="entity.name"
                    class="entity-tag"
                  >
                    {{ entity.name }}
                  </span>
                </div>
              </div>
              
              <!-- 生成的关系类型 -->
              <div class="detail-section" v-if="projectData?.ontology">
                <div class="detail-label">生成的关系类型 ({{ projectData.ontology.relation_types?.length || 0 }})</div>
                <!-- 关系列表 -->
                <div class="relation-list">
                  <div 
                    v-for="(rel, idx) in projectData.ontology.relation_types?.slice(0, 5) || []" 
                    :key="idx"
                    class="relation-item"
                  >
                    <!-- 源类型 -->
                    <span class="rel-source">{{ rel.source_type }}</span>
                    <!-- 箭头 -->
                    <span class="rel-arrow">→</span>
                    <!-- 关系名称 -->
                    <span class="rel-name">{{ rel.name }}</span>
                    <!-- 箭头 -->
                    <span class="rel-arrow">→</span>
                    <!-- 目标类型 -->
                    <span class="rel-target">{{ rel.target_type }}</span>
                  </div>
                  <!-- 更多关系提示 -->
                  <div v-if="(projectData.ontology.relation_types?.length || 0) > 5" class="relation-more">
                    +{{ projectData.ontology.relation_types.length - 5 }} 更多关系...
                  </div>
                </div>
              </div>
              
              <!-- 等待状态 -->
              <div class="detail-section waiting-state" v-if="!projectData?.ontology && currentPhase === 0 && !ontologyProgress">
                <div class="waiting-hint">等待本体生成...</div>
              </div>
            </div>
          </div>

          <!-- 阶段2：图谱构建 -->
          <div class="process-phase" :class="{ 'active': currentPhase === 1, 'completed': currentPhase > 1 }">
            <!-- 阶段头部 -->
            <div class="phase-header">
              <!-- 阶段编号 -->
              <span class="phase-num">02</span>
              <!-- 阶段信息 -->
              <div class="phase-info">
                <!-- 阶段标题 -->
                <div class="phase-title">图谱构建</div>
                <!-- API 端点 -->
                <div class="phase-api">/api/graph/build</div>
              </div>
              <!-- 阶段状态 -->
              <span class="phase-status" :class="getPhaseStatusClass(1)">
                {{ getPhaseStatusText(1) }}
              </span>
            </div>
            
            <!-- 阶段详情 -->
            <div class="phase-detail">
              <!-- 接口说明 -->
              <div class="detail-section">
                <div class="detail-label">接口说明</div>
                <div class="detail-content">
                  基于生成的本体，将文档分块后调用 Zep API 构建知识图谱，提取实体和关系
                </div>
              </div>
              
              <!-- 等待本体完成 -->
              <div class="detail-section waiting-state" v-if="currentPhase < 1">
                <div class="waiting-hint">等待本体生成完成...</div>
              </div>
              
              <!-- 构建进度 -->
              <div class="detail-section" v-if="buildProgress && currentPhase >= 1">
                <div class="detail-label">构建进度</div>
                <!-- 进度条 -->
                <div class="progress-bar">
                  <!-- 进度填充 -->
                  <div class="progress-fill" :style="{ width: buildProgress.progress + '%' }"></div>
                </div>
                <!-- 进度信息 -->
                <div class="progress-info">
                  <!-- 进度消息 -->
                  <span class="progress-message">{{ buildProgress.message }}</span>
                  <!-- 进度百分比 -->
                  <span class="progress-percent">{{ buildProgress.progress }}%</span>
                </div>
              </div>
              
              <!-- 构建结果 -->
              <div class="detail-section" v-if="graphData">
                <div class="detail-label">构建结果</div>
                <!-- 结果统计 -->
                <div class="build-result">
                  <!-- 实体节点数 -->
                  <div class="result-item">
                    <span class="result-value">{{ graphData.node_count }}</span>
                    <span class="result-label">实体节点</span>
                  </div>
                  <!-- 关系边数 -->
                  <div class="result-item">
                    <span class="result-value">{{ graphData.edge_count }}</span>
                    <span class="result-label">关系边</span>
                  </div>
                  <!-- 实体类型数 -->
                  <div class="result-item">
                    <span class="result-value">{{ entityTypes.length }}</span>
                    <span class="result-label">实体类型</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 阶段3：完成 -->
          <div class="process-phase" :class="{ 'active': currentPhase === 2, 'completed': currentPhase > 2 }">
            <!-- 阶段头部 -->
            <div class="phase-header">
              <!-- 阶段编号 -->
              <span class="phase-num">03</span>
              <!-- 阶段信息 -->
              <div class="phase-info">
                <!-- 阶段标题 -->
                <div class="phase-title">构建完成</div>
                <!-- 说明 -->
                <div class="phase-api">准备进入下一步骤</div>
              </div>
              <!-- 阶段状态 -->
              <span class="phase-status" :class="getPhaseStatusClass(2)">
                {{ getPhaseStatusText(2) }}
              </span>
            </div>
          </div>

          <!-- 下一步按钮 -->
          <div class="next-step-section" v-if="currentPhase >= 2">
            <button class="next-step-btn" @click="goToNextStep" :disabled="currentPhase < 2">
              进入环境搭建
              <!-- 按钮箭头 -->
              <span class="btn-arrow">→</span>
            </button>
          </div>
        </div>

        <!-- 项目信息面板 -->
        <div class="project-panel">
          <!-- 项目头部 -->
          <div class="project-header">
            <!-- 项目图标 -->
            <span class="project-icon">◇</span>
            <!-- 项目标题 -->
            <span class="project-title">项目信息</span>
          </div>
          <!-- 项目详情 -->
          <div class="project-details" v-if="projectData">
            <!-- 项目名称 -->
            <div class="project-item">
              <span class="item-label">项目名称</span>
              <span class="item-value">{{ projectData.name }}</span>
            </div>
            <!-- 项目 ID -->
            <div class="project-item">
              <span class="item-label">项目ID</span>
              <span class="item-value code">{{ projectData.project_id }}</span>
            </div>
            <!-- 图谱 ID -->
            <div class="project-item" v-if="projectData.graph_id">
              <span class="item-label">图谱ID</span>
              <span class="item-value code">{{ projectData.graph_id }}</span>
            </div>
            <!-- 模拟需求 -->
            <div class="project-item">
              <span class="item-label">模拟需求</span>
              <span class="item-value">{{ projectData.simulation_requirement || '-' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 导入 Vue 3 Composition API 核心函数
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
// 导入 Vue Router 路由相关函数
import { useRoute, useRouter } from 'vue-router'
// 导入图谱相关 API
import { generateOntology, getProject, buildGraph, getTaskStatus, getGraphData } from '../api/graph'
// 导入待上传数据管理
import { getPendingUpload, clearPendingUpload } from '../store/pendingUpload'
// 导入 D3.js 数据可视化库
import * as d3 from 'd3'

// 获取路由实例
const route = useRoute()
// 获取路由器实例
const router = useRouter()

// 当前项目ID（可能从'new'变为实际ID）
const currentProjectId = ref(route.params.projectId)

// 状态变量
const loading = ref(true) // 页面加载状态
const graphLoading = ref(false) // 图谱加载状态
const error = ref('') // 错误信息
const projectData = ref(null) // 项目数据
const graphData = ref(null) // 图谱数据
const buildProgress = ref(null) // 构建进度
const ontologyProgress = ref(null) // 本体生成进度
const currentPhase = ref(-1) // 当前阶段：-1: 上传中, 0: 本体生成中, 1: 图谱构建, 2: 完成
const selectedItem = ref(null) // 选中的节点或边
const isFullScreen = ref(false) // 是否全屏显示

// DOM 引用
const graphContainer = ref(null) // 图谱容器 DOM 元素
const graphSvg = ref(null) // 图谱 SVG DOM 元素

// 轮询定时器
let pollTimer = null // 任务状态轮询定时器

// 计算属性：状态样式类
const statusClass = computed(() => {
  if (error.value) return 'error' // 错误状态
  if (currentPhase.value >= 2) return 'completed' // 完成状态
  return 'processing' // 处理中状态
})

// 计算属性：状态文本
const statusText = computed(() => {
  if (error.value) return '构建失败' // 错误状态文本
  if (currentPhase.value >= 2) return '构建完成' // 完成状态文本
  if (currentPhase.value === 1) return '图谱构建中' // 图谱构建中
  if (currentPhase.value === 0) return '本体生成中' // 本体生成中
  return '初始化中' // 初始化中
})

// 计算属性：实体类型列表
const entityTypes = computed(() => {
  // 如果没有节点数据，返回空数组
  if (!graphData.value?.nodes) return []
  
  // 创建类型映射表
  const typeMap = {}
  // 定义颜色方案
  const colors = ['#FF6B35', '#004E89', '#7B2D8E', '#1A936F', '#C5283D', '#E9724C']
  
  // 遍历所有节点，统计每种类型的数量
  graphData.value.nodes.forEach(node => {
    // 获取节点类型（排除 'Entity' 和 'Node' 标签）
    const type = node.labels?.find(l => l !== 'Entity') || 'Entity'
    // 如果该类型还未记录，则初始化
    if (!typeMap[type]) {
      typeMap[type] = { 
        name: type, // 类型名称
        count: 0, // 节点数量
        color: colors[Object.keys(typeMap).length % colors.length] // 分配颜色
      }
    }
    // 增加该类型的节点计数
    typeMap[type].count++
  })
  
  // 返回类型数组
  return Object.values(typeMap)
})

// 方法：返回首页
const goHome = () => {
  router.push('/')
}

// 方法：进入下一步骤
const goToNextStep = () => {
  // TODO: 进入环境搭建步骤
  alert('环境搭建功能开发中...')
}

// 方法：切换全屏模式
const toggleFullScreen = () => {
  // 切换全屏状态
  isFullScreen.value = !isFullScreen.value
  // 等待过渡动画完成后重新渲染图谱
  setTimeout(() => {
    renderGraph()
  }, 350) 
}

// 方法：关闭详情面板
const closeDetailPanel = () => {
  selectedItem.value = null
}

// 方法：格式化日期
const formatDate = (dateStr) => {
  // 如果没有日期字符串，返回占位符
  if (!dateStr) return '-'
  try {
    // 创建日期对象
    const date = new Date(dateStr)
    // 格式化为中文日期字符串
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    // 格式化失败，返回原始字符串
    return dateStr
  }
}

// 方法：选中节点
const selectNode = (nodeData, color) => {
  // 设置选中的节点信息
  selectedItem.value = {
    type: 'node', // 类型为节点
    data: nodeData, // 节点原始数据
    color: color, // 节点颜色
    entityType: nodeData.labels?.find(l => l !== 'Entity' && l !== 'Node') || 'Entity' // 实体类型
  }
}

// 方法：选中边
const selectEdge = (edgeData) => {
  // 设置选中的边信息
  selectedItem.value = {
    type: 'edge', // 类型为边
    data: edgeData // 边的原始数据
  }
}

// 方法：获取阶段状态样式类
const getPhaseStatusClass = (phase) => {
  if (currentPhase.value > phase) return 'completed' // 已完成
  if (currentPhase.value === phase) return 'active' // 进行中
  return 'pending' // 等待中
}

// 方法：获取阶段状态文本
const getPhaseStatusText = (phase) => {
  if (currentPhase.value > phase) return '已完成' // 已完成
  if (currentPhase.value === phase) {
    // 如果是图谱构建阶段且有进度信息，显示进度百分比
    if (phase === 1 && buildProgress.value) {
      return `${buildProgress.value.progress}%`
    }
    return '进行中' // 进行中
  }
  return '等待中' // 等待中
}

// 方法：初始化项目 - 处理新建项目或加载已有项目
const initProject = async () => {
  // 获取路由参数中的项目 ID
  const paramProjectId = route.params.projectId
  
  if (paramProjectId === 'new') {
    // 新建项目：从 store 获取待上传的数据
    await handleNewProject()
  } else {
    // 加载已有项目
    currentProjectId.value = paramProjectId
    await loadProject()
  }
}

// 方法：处理新建项目 - 调用 ontology/generate API
const handleNewProject = async () => {
  // 获取待上传的数据
  const pending = getPendingUpload()
  
  // 检查是否有待上传的文件
  if (!pending.isPending || pending.files.length === 0) {
    error.value = '没有待上传的文件，请返回首页重新操作'
    loading.value = false
    return
  }
  
  try {
    // 开始加载
    loading.value = true
    // 设置当前阶段为本体生成
    currentPhase.value = 0
    // 设置本体生成进度
    ontologyProgress.value = { message: '正在上传文件并分析文档...' }
    
    // 构建 FormData 对象
    const formDataObj = new FormData()
    // 添加所有文件
    pending.files.forEach(file => {
      formDataObj.append('files', file)
    })
    // 添加模拟需求
    formDataObj.append('simulation_requirement', pending.simulationRequirement)
    
    // 调用本体生成 API
    const response = await generateOntology(formDataObj)
    
    if (response.success) {
      // 清除待上传数据
      clearPendingUpload()
      
      // 更新项目 ID 和数据
      currentProjectId.value = response.data.project_id
      projectData.value = response.data
      
      // 更新 URL（不刷新页面）
      router.replace({
        name: 'Process',
        params: { projectId: response.data.project_id }
      })
      
      // 清除本体生成进度
      ontologyProgress.value = null
      
      // 自动开始图谱构建
      await startBuildGraph()
    } else {
      // 本体生成失败
      error.value = response.error || '本体生成失败'
    }
  } catch (err) {
    // 捕获异常
    console.error('Handle new project error:', err)
    error.value = '项目初始化失败: ' + (err.message || '未知错误')
  } finally {
    // 结束加载
    loading.value = false
  }
}

// 方法：加载已有项目数据
const loadProject = async () => {
  try {
    // 开始加载
    loading.value = true
    // 调用获取项目 API
    const response = await getProject(currentProjectId.value)
    
    if (response.success) {
      // 保存项目数据
      projectData.value = response.data
      // 根据项目状态更新阶段
      updatePhaseByStatus(response.data.status)
      
      // 如果本体已生成但图谱未构建，自动开始图谱构建
      if (response.data.status === 'ontology_generated' && !response.data.graph_id) {
        await startBuildGraph()
      }
      
      // 如果图谱正在构建中，继续轮询任务状态
      if (response.data.status === 'graph_building' && response.data.graph_build_task_id) {
        currentPhase.value = 1
        startPollingTask(response.data.graph_build_task_id)
      }
      
      // 如果图谱已构建完成，加载图谱数据
      if (response.data.status === 'graph_completed' && response.data.graph_id) {
        currentPhase.value = 2
        await loadGraph(response.data.graph_id)
      }
    } else {
      // 加载项目失败
      error.value = response.error || '加载项目失败'
    }
  } catch (err) {
    // 捕获异常
    console.error('Load project error:', err)
    error.value = '加载项目失败: ' + (err.message || '未知错误')
  } finally {
    // 结束加载
    loading.value = false
  }
}

// 方法：根据项目状态更新阶段
const updatePhaseByStatus = (status) => {
  switch (status) {
    case 'created':
    case 'ontology_generated':
      // 项目已创建或本体已生成
      currentPhase.value = 0
      break
    case 'graph_building':
      // 图谱构建中
      currentPhase.value = 1
      break
    case 'graph_completed':
      // 图谱构建完成
      currentPhase.value = 2
      break
    case 'failed':
      // 处理失败
      error.value = projectData.value?.error || '处理失败'
      break
  }
}

// 方法：开始构建图谱
const startBuildGraph = async () => {
  try {
    // 设置当前阶段为图谱构建
    currentPhase.value = 1
    // 设置初始进度
    buildProgress.value = {
      progress: 0,
      message: '正在启动图谱构建...'
    }
    
    // 调用图谱构建 API
    const response = await buildGraph({ project_id: currentProjectId.value })
    
    if (response.success) {
      // 更新进度消息
      buildProgress.value.message = '图谱构建任务已启动...'
      
      // 保存 task_id 用于轮询
      const taskId = response.data.task_id
      
      // 启动图谱数据轮询（独立于任务状态轮询）
      startGraphPolling()
      
      // 启动任务状态轮询
      startPollingTask(taskId)
    } else {
      // 启动图谱构建失败
      error.value = response.error || '启动图谱构建失败'
      buildProgress.value = null
    }
  } catch (err) {
    // 捕获异常
    console.error('Build graph error:', err)
    error.value = '启动图谱构建失败: ' + (err.message || '未知错误')
    buildProgress.value = null
  }
}

// 图谱数据轮询定时器
let graphPollTimer = null

// 方法：启动图谱数据轮询
const startGraphPolling = () => {
  // 立即获取一次图谱数据
  fetchGraphData()
  
  // 每 10 秒自动获取一次图谱数据
  graphPollTimer = setInterval(async () => {
    await fetchGraphData()
  }, 10000)
}

// 方法：手动刷新图谱
const refreshGraph = async () => {
  // 设置图谱加载状态
  graphLoading.value = true
  // 获取图谱数据
  await fetchGraphData()
  // 清除图谱加载状态
  graphLoading.value = false
}

// 方法：停止图谱数据轮询
const stopGraphPolling = () => {
  // 清除定时器
  if (graphPollTimer) {
    clearInterval(graphPollTimer)
    graphPollTimer = null
  }
}

// 方法：获取图谱数据
const fetchGraphData = async () => {
  try {
    // 先获取项目信息以获取 graph_id
    const projectResponse = await getProject(currentProjectId.value)
    
    if (projectResponse.success && projectResponse.data.graph_id) {
      // 获取图谱 ID
      const graphId = projectResponse.data.graph_id
      // 更新项目数据
      projectData.value = projectResponse.data
      
      // 获取图谱数据
      const graphResponse = await getGraphData(graphId)
      
      if (graphResponse.success && graphResponse.data) {
        // 获取新数据
        const newData = graphResponse.data
        // 计算新旧节点数量
        const newNodeCount = newData.node_count || newData.nodes?.length || 0
        const oldNodeCount = graphData.value?.node_count || graphData.value?.nodes?.length || 0
        
        // 输出日志
        console.log('Fetching graph data, nodes:', newNodeCount, 'edges:', newData.edge_count || newData.edges?.length || 0)
        
        // 数据有变化时更新渲染
        if (newNodeCount !== oldNodeCount || !graphData.value) {
          // 更新图谱数据
          graphData.value = newData
          // 等待 DOM 更新
          await nextTick()
          // 重新渲染图谱
          renderGraph()
        }
      }
    }
  } catch (err) {
    // 捕获异常，输出日志
    console.log('Graph data fetch:', err.message || 'not ready')
  }
}

// 方法：轮询任务状态
const startPollingTask = (taskId) => {
  // 立即执行一次查询
  pollTaskStatus(taskId)
  
  // 然后定时轮询（每 2 秒）
  pollTimer = setInterval(() => {
    pollTaskStatus(taskId)
  }, 2000)
}

// 方法：查询任务状态
const pollTaskStatus = async (taskId) => {
  try {
    // 调用获取任务状态 API
    const response = await getTaskStatus(taskId)
    
    if (response.success) {
      // 获取任务信息
      const task = response.data
      
      // 更新进度显示
      buildProgress.value = {
        progress: task.progress || 0,
        message: task.message || '处理中...'
      }
      
      // 输出日志
      console.log('Task status:', task.status, 'Progress:', task.progress)
      
      if (task.status === 'completed') {
        // 任务完成
        console.log('✅ 图谱构建完成，正在加载完整数据...')
        
        // 停止轮询
        stopPolling()
        stopGraphPolling()
        // 设置当前阶段为完成
        currentPhase.value = 2
        
        // 更新进度显示为完成状态
        buildProgress.value = {
          progress: 100,
          message: '构建完成，正在加载图谱...'
        }
        
        // 重新加载项目数据获取 graph_id
        const projectResponse = await getProject(currentProjectId.value)
        if (projectResponse.success) {
          // 更新项目数据
          projectData.value = projectResponse.data
          
          // 最终加载完整图谱数据
          if (projectResponse.data.graph_id) {
            console.log('📊 加载完整图谱:', projectResponse.data.graph_id)
            await loadGraph(projectResponse.data.graph_id)
            console.log('✅ 图谱加载完成')
          }
        }
        
        // 清除进度显示
        buildProgress.value = null
      } else if (task.status === 'failed') {
        // 任务失败
        stopPolling()
        stopGraphPolling()
        error.value = '图谱构建失败: ' + (task.error || '未知错误')
        buildProgress.value = null
      }
    }
  } catch (err) {
    // 捕获异常
    console.error('Poll task error:', err)
  }
}

// 方法：停止轮询
const stopPolling = () => {
  // 清除定时器
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

// 方法：加载图谱数据
const loadGraph = async (graphId) => {
  try {
    // 设置图谱加载状态
    graphLoading.value = true
    // 调用获取图谱数据 API
    const response = await getGraphData(graphId)
    
    if (response.success) {
      // 保存图谱数据
      graphData.value = response.data
      // 等待 DOM 更新
      await nextTick()
      // 渲染图谱
      renderGraph()
    }
  } catch (err) {
    // 捕获异常
    console.error('Load graph error:', err)
  } finally {
    // 清除图谱加载状态
    graphLoading.value = false
  }
}

// 方法：渲染图谱 (D3.js)
const renderGraph = () => {
  // 检查 SVG 元素和图谱数据是否存在
  if (!graphSvg.value || !graphData.value) {
    console.log('Cannot render: svg or data missing')
    return
  }
  
  // 获取图谱容器
  const container = graphContainer.value
  if (!container) {
    console.log('Cannot render: container missing')
    return
  }
  
  // 获取容器尺寸
  const rect = container.getBoundingClientRect()
  const width = rect.width || 800
  const height = (rect.height || 600) - 60
  
  // 检查尺寸是否有效
  if (width <= 0 || height <= 0) {
    console.log('Cannot render: invalid dimensions', width, height)
    return
  }
  
  // 输出渲染日志
  console.log('Rendering graph:', width, 'x', height)
  
  // 设置 SVG 属性
  const svg = d3.select(graphSvg.value)
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
  
  // 清除 SVG 中的所有元素
  svg.selectAll('*').remove()
  
  // 处理节点数据
  const nodesData = graphData.value.nodes || []
  const edgesData = graphData.value.edges || []
  
  // 如果没有节点，显示空状态
  if (nodesData.length === 0) {
    console.log('No nodes to render')
    // 显示等待图谱数据的文本
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height / 2)
      .attr('text-anchor', 'middle')
      .attr('fill', '#999')
      .text('等待图谱数据...')
    return
  }
  
  // 创建节点映射用于查找名称
  const nodeMap = {}
  nodesData.forEach(n => {
    nodeMap[n.uuid] = n
  })
  
  // 转换节点数据格式
  const nodes = nodesData.map(n => ({
    id: n.uuid,
    name: n.name || '未命名',
    type: n.labels?.find(l => l !== 'Entity' && l !== 'Node') || 'Entity',
    rawData: n // 保存原始数据
  }))
  
  // 创建节点 ID 集合用于过滤有效边
  const nodeIds = new Set(nodes.map(n => n.id))
  
  // 转换边数据格式
  const edges = edgesData
    .filter(e => nodeIds.has(e.source_node_uuid) && nodeIds.has(e.target_node_uuid))
    .map(e => ({
      source: e.source_node_uuid,
      target: e.target_node_uuid,
      type: e.fact_type || e.name || 'RELATED_TO',
      rawData: {
        ...e,
        source_name: nodeMap[e.source_node_uuid]?.name || '未知',
        target_name: nodeMap[e.target_node_uuid]?.name || '未知'
      }
    }))
  
  // 输出节点和边数量
  console.log('Nodes:', nodes.length, 'Edges:', edges.length)
  
  // 创建颜色映射
  const types = [...new Set(nodes.map(n => n.type))]
  const colorScale = d3.scaleOrdinal()
    .domain(types)
    .range(['#FF6B35', '#004E89', '#7B2D8E', '#1A936F', '#C5283D', '#E9724C', '#2D3436', '#6C5CE7'])
  
  // 创建力导向布局模拟
  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(edges).id(d => d.id).distance(100).strength(0.5)) // 连接力
    .force('charge', d3.forceManyBody().strength(-300)) // 电荷力（排斥）
    .force('center', d3.forceCenter(width / 2, height / 2)) // 中心力
    .force('collision', d3.forceCollide().radius(40)) // 碰撞力
    .force('x', d3.forceX(width / 2).strength(0.05)) // X 轴定位力
    .force('y', d3.forceY(height / 2).strength(0.05)) // Y 轴定位力
  
  // 添加缩放功能的容器
  const g = svg.append('g')
  
  // 添加缩放行为
  svg.call(d3.zoom()
    .extent([[0, 0], [width, height]])
    .scaleExtent([0.2, 4]) // 缩放范围
    .on('zoom', (event) => {
      // 应用缩放和平移变换
      g.attr('transform', event.transform)
    }))
  
  // 绘制边（包含可点击的透明宽线）
  const linkGroup = g.append('g')
    .attr('class', 'links')
    .selectAll('g')
    .data(edges)
    .enter()
    .append('g')
    .style('cursor', 'pointer')
    .on('click', (event, d) => {
      // 阻止事件冒泡
      event.stopPropagation()
      // 选中边
      selectEdge(d.rawData)
    })
  
  // 可见的细线
  const link = linkGroup.append('line')
    .attr('stroke', '#ccc')
    .attr('stroke-width', 1.5)
    .attr('stroke-opacity', 0.6)
  
  // 透明的宽线用于点击（增加点击区域）
  linkGroup.append('line')
    .attr('stroke', 'transparent')
    .attr('stroke-width', 10)
  
  // 绘制边标签
  const linkLabel = g.append('g')
    .attr('class', 'link-labels')
    .selectAll('text')
    .data(edges)
    .enter()
    .append('text')
    .attr('font-size', '9px')
    .attr('fill', '#999')
    .attr('text-anchor', 'middle')
    // 如果标签过长，截断并添加省略号
    .text(d => d.type.length > 15 ? d.type.substring(0, 12) + '...' : d.type)
  
  // 绘制节点
  const node = g.append('g')
    .attr('class', 'nodes')
    .selectAll('g')
    .data(nodes)
    .enter()
    .append('g')
    .style('cursor', 'pointer')
    .on('click', (event, d) => {
      // 阻止事件冒泡
      event.stopPropagation()
      // 选中节点
      selectNode(d.rawData, colorScale(d.type))
    })
    // 添加拖拽行为
    .call(d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended))
  
  // 绘制节点圆形
  node.append('circle')
    .attr('r', 10)
    .attr('fill', d => colorScale(d.type))
    .attr('stroke', '#fff')
    .attr('stroke-width', 2)
    .attr('class', 'node-circle')
  
  // 绘制节点文本标签
  node.append('text')
    .attr('dx', 14)
    .attr('dy', 4)
    // 如果节点名称过长，截断
    .text(d => d.name?.substring(0, 12) || '')
    .attr('font-size', '11px')
    .attr('fill', '#333')
    .attr('font-family', 'JetBrains Mono, monospace')
  
  // 点击空白处关闭详情面板
  svg.on('click', () => {
    closeDetailPanel()
  })
  
  // 模拟每一步更新节点和边的位置
  simulation.on('tick', () => {
    // 更新所有边的位置（包括可见线和透明点击区域）
    linkGroup.selectAll('line')
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)
    
    // 更新边标签位置（在边的中间）
    linkLabel
      .attr('x', d => (d.source.x + d.target.x) / 2)
      .attr('y', d => (d.source.y + d.target.y) / 2 - 5)
    
    // 更新节点位置
    node.attr('transform', d => `translate(${d.x},${d.y})`)
  })
  
  // 拖拽开始事件处理
  function dragstarted(event) {
    // 如果模拟未激活，重新激活
    if (!event.active) simulation.alphaTarget(0.3).restart()
    // 固定节点位置
    event.subject.fx = event.subject.x
    event.subject.fy = event.subject.y
  }
  
  // 拖拽中事件处理
  function dragged(event) {
    // 更新节点位置
    event.subject.fx = event.x
    event.subject.fy = event.y
  }
  
  // 拖拽结束事件处理
  function dragended(event) {
    // 如果模拟未激活，停止模拟
    if (!event.active) simulation.alphaTarget(0)
    // 释放节点位置
    event.subject.fx = null
    event.subject.fy = null
  }
}

// 监听图谱数据变化
watch(graphData, () => {
  if (graphData.value) {
    // 等待 DOM 更新后重新渲染图谱
    nextTick(() => renderGraph())
  }
})

// 生命周期钩子：组件挂载时
onMounted(() => {
  // 初始化项目
  initProject()
})

// 生命周期钩子：组件卸载时
onUnmounted(() => {
  // 停止所有轮询
  stopPolling()
  stopGraphPolling()
})
</script>

<style scoped>
/* CSS 变量定义 */
:root {
  --black: #000000; /* 黑色 */
  --white: #FFFFFF; /* 白色 */
  --orange: #FF6B35; /* 橙色 */
  --gray-light: #F5F5F5; /* 浅灰色 */
  --gray-border: #E0E0E0; /* 边框灰色 */
  --gray-text: #666666; /* 文本灰色 */
}

/* 流程页面容器 */
.process-page {
  min-height: 100vh; /* 最小高度为视口高度 */
  background: var(--white); /* 背景色为白色 */
  font-family: 'JetBrains Mono', 'Noto Sans SC', monospace; /* 字体设置 */
  overflow: hidden; /* 防止全屏时出现滚动条 */
}

/* 导航栏样式 */
.navbar {
  display: flex; /* 使用 Flex 布局 */
  align-items: center; /* 垂直居中对齐 */
  justify-content: space-between; /* 两端对齐 */
  padding: 0 24px; /* 内边距 */
  height: 56px; /* 高度 */
  background: #000; /* 背景色为黑色 */
  color: #fff; /* 文字颜色为白色 */
  z-index: 10; /* 层级 */
  position: relative; /* 相对定位 */
}

/* 品牌标识样式 */
.nav-brand {
  font-size: 1rem; /* 字体大小 */
  font-weight: 700; /* 字体粗细 */
  letter-spacing: 0.1em; /* 字间距 */
  cursor: pointer; /* 鼠标指针为手型 */
  transition: opacity 0.2s; /* 透明度过渡动画 */
}

.nav-brand:hover {
  opacity: 0.8; /* 悬停时透明度降低 */
}

/* 导航中心区域 */
.nav-center {
  display: flex; /* 使用 Flex 布局 */
  align-items: center; /* 垂直居中对齐 */
  gap: 12px; /* 元素间距 */
  position: absolute; /* 绝对定位 */
  left: 50%; /* 左侧偏移 50% */
  transform: translateX(-50%); /* 向左平移自身宽度的 50% 实现居中 */
}

/* 步骤徽章样式 */
.step-badge {
  background: #FF6B35; /* 背景色为橙色 */
  color: #fff; /* 文字颜色为白色 */
  padding: 2px 8px; /* 内边距 */
  font-size: 0.7rem; /* 字体大小 */
  font-weight: 600; /* 字体粗细 */
  letter-spacing: 0.05em; /* 字间距 */
  border-radius: 2px; /* 圆角 */
}

/* 步骤名称样式 */
.step-name {
  font-size: 0.85rem; /* 字体大小 */
  letter-spacing: 0.05em; /* 字间距 */
  color: #fff; /* 文字颜色为白色 */
}

/* 导航状态区域 */
.nav-status {
  display: flex; /* 使用 Flex 布局 */
  align-items: center; /* 垂直居中对齐 */
}

/* 状态指示点样式 */
.status-dot {
  width: 6px; /* 宽度 */
  height: 6px; /* 高度 */
  border-radius: 50%; /* 圆形 */
  background: #666; /* 背景色 */
  margin-right: 8px; /* 右边距 */
}

/* 处理中状态：橙色脉冲动画 */
.status-dot.processing {
  background: #FF6B35; /* 背景色为橙色 */
  animation: pulse 1.5s infinite; /* 脉冲动画 */
}

/* 完成状态：绿色 */
.status-dot.completed {
  background: #1A936F; /* 背景色为绿色 */
}

/* 错误状态：红色 */
.status-dot.error {
  background: #C5283D; /* 背景色为红色 */
}

/* 脉冲动画关键帧 */
@keyframes pulse {
  0%, 100% { opacity: 1; } /* 完全不透明 */
  50% { opacity: 0.5; } /* 半透明 */
}

/* 状态文本样式 */
.status-text {
  font-size: 0.75rem; /* 字体大小 */
  color: #999; /* 文字颜色 */
}

/* 主内容区域样式 */
.main-content {
  display: flex; /* 使用 Flex 布局 */
  height: calc(100vh - 56px); /* 高度为视口高度减去导航栏高度 */
  position: relative; /* 相对定位 */
}

/* 左侧面板样式 - 默认 50% 宽度 */
.left-panel {
  width: 50%; /* 宽度为 50% */
  flex: none; /* 不伸缩 */
  display: flex; /* 使用 Flex 布局 */
  flex-direction: column; /* 垂直排列 */
  border-right: 1px solid #E0E0E0; /* 右侧边框 */
  transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1); /* 宽度过渡动画 */
  background: #fff; /* 背景色为白色 */
  z-index: 5; /* 层级 */
}

/* 左侧面板全屏模式 */
.left-panel.full-screen {
  width: 100%; /* 宽度为 100% */
  border-right: none; /* 移除右侧边框 */
}

/* 面板头部样式 */
.panel-header {
  display: flex; /* 使用 Flex 布局 */
  align-items: center; /* 垂直居中对齐 */
  justify-content: space-between; /* 两端对齐 */
  padding: 12px 24px; /* 内边距 */
  border-bottom: 1px solid #E0E0E0; /* 底部边框 */
  background: #fff; /* 背景色为白色 */
  height: 50px; /* 高度 */
}

/* 头部左侧区域 */
.header-left {
  display: flex; /* 使用 Flex 布局 */
  align-items: center; /* 垂直居中对齐 */
  gap: 8px; /* 元素间距 */
}

/* 头部装饰符号 */
.header-deco {
  color: #FF6B35; /* 颜色为橙色 */
  font-size: 0.8rem; /* 字体大小 */
}

/* 头部标题 */
.header-title {
  font-size: 0.85rem; /* 字体大小 */
  font-weight: 600; /* 字体粗细 */
  letter-spacing: 0.05em; /* 字间距 */
}

/* 头部右侧区域 */
.header-right {
  display: flex; /* 使用 Flex 布局 */
  align-items: center; /* 垂直居中对齐 */
  gap: 16px; /* 元素间距 */
  font-size: 0.75rem; /* 字体大小 */
  color: #666; /* 文字颜色 */
}

/* 统计项样式 */
.stat-item {
  display: flex; /* 使用 Flex 布局 */
  align-items: center; /* 垂直居中对齐 */
  gap: 4px; /* 元素间距 */
}

/* 统计值样式 */
.stat-val {
  font-weight: 600; /* 字体粗细 */
  color: #333; /* 文字颜色 */
}

/* 统计分隔符 */
.stat-divider {
  color: #eee; /* 颜色为浅灰色 */
}

/* 操作按钮组 */
.action-buttons {
    display: flex; /* 使用 Flex 布局 */
    align-items: center; /* 垂直居中对齐 */
    gap: 8px; /* 元素间距 */
}

/* 操作按钮样式 */
.action-btn {
  display: flex; /* 使用 Flex 布局 */
  align-items: center; /* 垂直居中对齐 */
  justify-content: center; /* 水平居中对齐 */
  width: 24px; /* 宽度 */
  height: 24px; /* 高度 */
  background: transparent; /* 背景透明 */
  border: 1px solid transparent; /* 边框透明 */
  cursor: pointer; /* 鼠标指针为手型 */
  transition: all 0.2s; /* 所有属性过渡动画 */
  color: #666; /* 文字颜色 */
  border-radius: 2px; /* 圆角 */
}

.action-btn:hover:not(:disabled) {
  background: #F5F5F5; /* 悬停时背景色为浅灰色 */
  color: #000; /* 悬停时文字颜色为黑色 */
}

.action-btn:disabled {
  opacity: 0.3; /* 禁用时透明度降低 */
  cursor: not-allowed; /* 禁用时鼠标指针为禁止 */
}

/* 图标样式 */
.icon-refresh, .icon-fullscreen {
  font-size: 1rem; /* 字体大小 */
  line-height: 1; /* 行高 */
}

/* 旋转动画 */
.icon-refresh.spinning {
  animation: spin 1s linear infinite; /* 旋转动画 */
}

/* 旋转动画关键帧 */
@keyframes spin {
  to { transform: rotate(360deg); } /* 旋转 360 度 */
}

/* 图谱容器样式 */
.graph-container {
  flex: 1; /* 占据剩余空间 */
  position: relative; /* 相对定位 */
  overflow: hidden; /* 隐藏溢出内容 */
}

/* 图谱加载、等待、错误状态样式 */
.graph-loading,
.graph-waiting,
.graph-error {
  position: absolute; /* 绝对定位 */
  top: 50%; /* 顶部偏移 50% */
  left: 50%; /* 左侧偏移 50% */
  transform: translate(-50%, -50%); /* 向左上平移自身宽高的 50% 实现居中 */
  text-align: center; /* 文本居中对齐 */
}

/* 加载动画样式 */
.loading-animation {
  position: relative; /* 相对定位 */
  width: 80px; /* 宽度 */
  height: 80px; /* 高度 */
  margin: 0 auto 20px; /* 上下左右边距 */
}

/* 加载圆环样式 */
.loading-ring {
  position: absolute; /* 绝对定位 */
  border: 2px solid transparent; /* 边框透明 */
  border-radius: 50%; /* 圆形 */
  animation: ring-rotate 1.5s linear infinite; /* 旋转动画 */
}

/* 第一个圆环 */
.loading-ring:nth-child(1) {
  width: 80px; /* 宽度 */
  height: 80px; /* 高度 */
  border-top-color: #000; /* 顶部边框颜色为黑色 */
}

/* 第二个圆环 */
.loading-ring:nth-child(2) {
  width: 60px; /* 宽度 */
  height: 60px; /* 高度 */
  top: 10px; /* 顶部偏移 */
  left: 10px; /* 左侧偏移 */
  border-right-color: #FF6B35; /* 右侧边框颜色为橙色 */
  animation-delay: 0.2s; /* 动画延迟 */
}

/* 第三个圆环 */
.loading-ring:nth-child(3) {
  width: 40px; /* 宽度 */
  height: 40px; /* 高度 */
  top: 20px; /* 顶部偏移 */
  left: 20px; /* 左侧偏移 */
  border-bottom-color: #666; /* 底部边框颜色为灰色 */
  animation-delay: 0.4s; /* 动画延迟 */
}

/* 圆环旋转动画关键帧 */
@keyframes ring-rotate {
  to { transform: rotate(360deg); } /* 旋转 360 度 */
}

/* 加载文本和等待文本样式 */
.loading-text,
.waiting-text {
  font-size: 0.9rem; /* 字体大小 */
  color: #333; /* 文字颜色 */
  margin: 0 0 8px; /* 上下边距 */
}

/* 等待提示文本样式 */
.waiting-hint {
  font-size: 0.8rem; /* 字体大小 */
  color: #999; /* 文字颜色 */
  margin: 0; /* 无边距 */
}

/* 等待图标样式 */
.waiting-icon {
  margin-bottom: 20px; /* 下边距 */
}

/* 网络图标样式 */
.network-icon {
  width: 100px; /* 宽度 */
  height: 100px; /* 高度 */
  opacity: 0.6; /* 透明度 */
}

/* 图谱视图样式 */
.graph-view {
  width: 100%; /* 宽度为 100% */
  height: 100%; /* 高度为 100% */
  position: relative; /* 相对定位 */
}

/* 图谱 SVG 样式 */
.graph-svg {
  width: 100%; /* 宽度为 100% */
  height: 100%; /* 高度为 100% */
  display: block; /* 块级显示 */
}

/* 图谱构建提示样式 */
.graph-building-hint {
  position: absolute; /* 绝对定位 */
  bottom: 16px; /* 底部偏移 */
  left: 16px; /* 左侧偏移 */
  display: flex; /* 使用 Flex 布局 */
  align-items: center; /* 垂直居中对齐 */
  gap: 8px; /* 元素间距 */
  padding: 8px 16px; /* 内边距 */
  background: rgba(255, 107, 53, 0.1); /* 背景色为半透明橙色 */
  border: 1px solid #FF6B35; /* 边框为橙色 */
  font-size: 0.8rem; /* 字体大小 */
  color: #FF6B35; /* 文字颜色为橙色 */
}

/* 构建中脉冲点样式 */
.building-dot {
  width: 8px; /* 宽度 */
  height: 8px; /* 高度 */
  background: #FF6B35; /* 背景色为橙色 */
  border-radius: 50%; /* 圆形 */
  animation: pulse 1s infinite; /* 脉冲动画 */
}

/* 节点/边详情面板样式 */
.detail-panel {
  position: absolute; /* 绝对定位 */
  top: 16px; /* 顶部偏移 */
  right: 16px; /* 右侧偏移 */
  width: 320px; /* 宽度 */
  max-height: calc(100% - 32px); /* 最大高度 */
  background: #fff; /* 背景色为白色 */
  border: 1px solid #E0E0E0; /* 边框 */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); /* 阴影 */
  overflow: hidden; /* 隐藏溢出内容 */
  display: flex; /* 使用 Flex 布局 */
  flex-direction: column; /* 垂直排列 */
  z-index: 100; /* 层级 */
}

/* 详情面板头部样式 */
.detail-panel-header {
  display: flex; /* 使用 Flex 布局 */
  align-items: center; /* 垂直居中对齐 */
  gap: 10px; /* 元素间距 */
  padding: 12px 16px; /* 内边距 */
  background: #FAFAFA; /* 背景色为浅灰色 */
  border-bottom: 1px solid #E0E0E0; /* 底部边框 */
}

/* 详情标题样式 */
.detail-title {
  font-size: 0.9rem; /* 字体大小 */
  font-weight: 600; /* 字体粗细 */
  color: #333; /* 文字颜色 */
}

/* 详情标签样式 */
.detail-badge {
  padding: 2px 10px; /* 内边距 */
  font-size: 0.75rem; /* 字体大小 */
  color: #fff; /* 文字颜色为白色 */
  border-radius: 2px; /* 圆角 */
}

/* 详情关闭按钮样式 */
.detail-close {
  margin-left: auto; /* 左边距自动 */
  width: 24px; /* 宽度 */
  height: 24px; /* 高度 */
  display: flex; /* 使用 Flex 布局 */
  align-items: center; /* 垂直居中对齐 */
  justify-content: center; /* 水平居中对齐 */
  background: none; /* 背景无 */
  border: none; /* 边框无 */
  font-size: 1.2rem; /* 字体大小 */
  color: #999; /* 文字颜色 */
  cursor: pointer; /* 鼠标指针为手型 */
  transition: color 0.2s; /* 颜色过渡动画 */
}

.detail-close:hover {
  color: #333; /* 悬停时文字颜色为黑色 */
}

/* 详情内容样式 */
.detail-content {
  padding: 16px; /* 内边距 */
  overflow-y: auto; /* 垂直方向可滚动 */
  flex: 1; /* 占据剩余空间 */
}

/* 详情行样式 */
.detail-row {
  display: flex; /* 使用 Flex 布局 */
  align-items: flex-start; /* 顶部对齐 */
  margin-bottom: 12px; /* 下边距 */
}

/* 详情标签样式 */
.detail-label {
  font-size: 0.8rem; /* 字体大小 */
  color: #999; /* 文字颜色 */
  min-width: 70px; /* 最小宽度 */
  flex-shrink: 0; /* 不收缩 */
}

/* 详情值样式 */
.detail-value {
  font-size: 0.85rem; /* 字体大小 */
  color: #333; /* 文字颜色 */
  word-break: break-word; /* 单词换行 */
}

/* 详情值 UUID 样式 */
.detail-value.uuid {
  font-family: 'JetBrains Mono', monospace; /* 等宽字体 */
  font-size: 0.75rem; /* 字体大小 */
  color: #666; /* 文字颜色 */
}

/* 详情区块样式 */
.detail-section {
  margin-bottom: 12px; /* 下边距 */
}

/* 详情摘要样式 */
.detail-summary {
  margin: 8px 0 0 0; /* 上边距 */
  font-size: 0.85rem; /* 字体大小 */
  color: #333; /* 文字颜色 */
  line-height: 1.6; /* 行高 */
  padding: 10px; /* 内边距 */
  background: #F9F9F9; /* 背景色为浅灰色 */
  border-left: 3px solid #FF6B35; /* 左侧边框为橙色 */
}

/* 详情标签列表样式 */
.detail-labels {
  display: flex; /* 使用 Flex 布局 */
  flex-wrap: wrap; /* 允许换行 */
  gap: 6px; /* 元素间距 */
}

/* 标签样式 */
.label-tag {
  padding: 2px 8px; /* 内边距 */
  font-size: 0.75rem; /* 字体大小 */
  background: #F0F0F0; /* 背景色为浅灰色 */
  border: 1px solid #E0E0E0; /* 边框 */
  color: #666; /* 文字颜色 */
}

/* 边详情关系展示样式 */
.edge-relation {
  display: flex; /* 使用 Flex 布局 */
  align-items: center; /* 垂直居中对齐 */
  flex-wrap: wrap; /* 允许换行 */
  gap: 8px; /* 元素间距 */
  margin-bottom: 16px; /* 下边距 */
  padding: 12px; /* 内边距 */
  background: #F9F9F9; /* 背景色为浅灰色 */
  border: 1px solid #E0E0E0; /* 边框 */
}

/* 边源节点和目标节点样式 */
.edge-source,
.edge-target {
  font-size: 0.85rem; /* 字体大小 */
  font-weight: 500; /* 字体粗细 */
  color: #333; /* 文字颜色 */
}

/* 边箭头样式 */
.edge-arrow {
  color: #999; /* 颜色为灰色 */
}

/* 边类型样式 */
.edge-type {
  padding: 2px 8px; /* 内边距 */
  font-size: 0.75rem; /* 字体大小 */
  background: #FF6B35; /* 背景色为橙色 */
  color: #fff; /* 文字颜色为白色 */
}

/* 详情值高亮样式 */
.detail-value.highlight {
  font-weight: 600; /* 字体粗细 */
  color: #000; /* 文字颜色为黑色 */
}

/* 详情副标题样式 */
.detail-subtitle {
  font-size: 0.9rem; /* 字体大小 */
  font-weight: 600; /* 字体粗细 */
  color: #333; /* 文字颜色 */
  margin: 16px 0 12px 0; /* 上下边距 */
  padding-bottom: 8px; /* 下内边距 */
  border-bottom: 1px solid #E0E0E0; /* 底部边框 */
}

/* 属性列表样式 */
.properties-list {
  margin-top: 8px; /* 上边距 */
  padding: 10px; /* 内边距 */
  background: #F9F9F9; /* 背景色为浅灰色 */
  border: 1px solid #E0E0E0; /* 边框 */
}

/* 属性项样式 */
.property-item {
  display: flex; /* 使用 Flex 布局 */
  margin-bottom: 6px; /* 下边距 */
  font-size: 0.85rem; /* 字体大小 */
}

.property-item:last-child {
  margin-bottom: 0; /* 最后一项无下边距 */
}

/* 属性键样式 */
.property-key {
  color: #666; /* 文字颜色 */
  margin-right: 8px; /* 右边距 */
  font-family: 'JetBrains Mono', monospace; /* 等宽字体 */
}

/* 属性值样式 */
.property-value {
  color: #333; /* 文字颜色 */
  word-break: break-word; /* 单词换行 */
}

/* 剧集列表样式 */
.episodes-list {
  margin-top: 8px; /* 上边距 */
  display: flex; /* 使用 Flex 布局 */
  flex-direction: column; /* 垂直排列 */
  gap: 6px; /* 元素间距 */
}

/* 剧集标签样式 */
.episode-tag {
  display: block; /* 块级显示 */
  padding: 6px 10px; /* 内边距 */
  font-size: 0.75rem; /* 字体大小 */
  font-family: 'JetBrains Mono', monospace; /* 等宽字体 */
  background: #F0F0F0; /* 背景色为浅灰色 */
  border: 1px solid #E0E0E0; /* 边框 */
  color: #666; /* 文字颜色 */
  word-break: break-all; /* 允许在任何字符处换行 */
}

/* 错误图标样式 */
.error-icon {
  font-size: 2rem; /* 字体大小 */
  display: block; /* 块级显示 */
  margin-bottom: 10px; /* 下边距 */
}

/* 图谱图例样式 */
.graph-legend {
  display: flex; /* 使用 Flex 布局 */
  flex-wrap: wrap; /* 允许换行 */
  gap: 16px; /* 元素间距 */
  padding: 12px 24px; /* 内边距 */
  border-top: 1px solid #E0E0E0; /* 顶部边框 */
  background: #FAFAFA; /* 背景色为浅灰色 */
}

/* 图例项样式 */
.legend-item {
  display: flex; /* 使用 Flex 布局 */
  align-items: center; /* 垂直居中对齐 */
  gap: 6px; /* 元素间距 */
  font-size: 0.75rem; /* 字体大小 */
}

/* 图例点样式 */
.legend-dot {
  width: 10px; /* 宽度 */
  height: 10px; /* 高度 */
  border-radius: 50%; /* 圆形 */
}

/* 图例标签样式 */
.legend-label {
  color: #333; /* 文字颜色 */
}

/* 图例数量样式 */
.legend-count {
  color: #999; /* 文字颜色 */
}

/* 右侧面板样式 - 默认 50% 宽度 */
.right-panel {
  width: 50%; /* 宽度为 50% */
  flex: none; /* 不伸缩 */
  display: flex; /* 使用 Flex 布局 */
  flex-direction: column; /* 垂直排列 */
  background: #fff; /* 背景色为白色 */
  transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease, transform 0.3s ease; /* 过渡动画 */
  overflow: hidden; /* 隐藏溢出内容 */
  opacity: 1; /* 透明度 */
}

/* 右侧面板隐藏状态 */
.right-panel.hidden {
  width: 0; /* 宽度为 0 */
  opacity: 0; /* 透明度为 0 */
  transform: translateX(20px); /* 向右平移 */
  pointer-events: none; /* 禁止鼠标事件 */
}

/* 右侧面板深色头部 */
.right-panel .panel-header.dark-header {
  background: #000; /* 背景色为黑色 */
  color: #fff; /* 文字颜色为白色 */
  border-bottom: none; /* 移除底部边框 */
}

/* 右侧面板头部图标 */
.right-panel .header-icon {
  color: #FF6B35; /* 颜色为橙色 */
  margin-right: 8px; /* 右边距 */
}

/* 流程内容样式 */
.process-content {
  flex: 1; /* 占据剩余空间 */
  overflow-y: auto; /* 垂直方向可滚动 */
  padding: 24px; /* 内边距 */
}

/* 流程阶段样式 */
.process-phase {
  margin-bottom: 24px; /* 下边距 */
  border: 1px solid #E0E0E0; /* 边框 */
  opacity: 0.5; /* 透明度 */
  transition: all 0.3s; /* 所有属性过渡动画 */
}

/* 流程阶段激活或完成状态 */
.process-phase.active,
.process-phase.completed {
  opacity: 1; /* 透明度为 1 */
}

/* 流程阶段激活状态 */
.process-phase.active {
  border-color: #FF6B35; /* 边框颜色为橙色 */
}

/* 流程阶段完成状态 */
.process-phase.completed {
  border-color: #1A936F; /* 边框颜色为绿色 */
}

/* 阶段头部样式 */
.phase-header {
  display: flex; /* 使用 Flex 布局 */
  align-items: flex-start; /* 顶部对齐 */
  gap: 16px; /* 元素间距 */
  padding: 16px; /* 内边距 */
  background: #FAFAFA; /* 背景色为浅灰色 */
  border-bottom: 1px solid #E0E0E0; /* 底部边框 */
}

/* 激活阶段的头部背景 */
.process-phase.active .phase-header {
  background: #FFF5F2; /* 背景色为浅橙色 */
}

/* 完成阶段的头部背景 */
.process-phase.completed .phase-header {
  background: #F2FAF6; /* 背景色为浅绿色 */
}

/* 阶段编号样式 */
.phase-num {
  font-size: 1.5rem; /* 字体大小 */
  font-weight: 700; /* 字体粗细 */
  color: #ddd; /* 颜色为浅灰色 */
  line-height: 1; /* 行高 */
}

/* 激活阶段的编号颜色 */
.process-phase.active .phase-num {
  color: #FF6B35; /* 颜色为橙色 */
}

/* 完成阶段的编号颜色 */
.process-phase.completed .phase-num {
  color: #1A936F; /* 颜色为绿色 */
}

/* 阶段信息样式 */
.phase-info {
  flex: 1; /* 占据剩余空间 */
}

/* 阶段标题样式 */
.phase-title {
  font-size: 1rem; /* 字体大小 */
  font-weight: 600; /* 字体粗细 */
  margin-bottom: 4px; /* 下边距 */
}

/* 阶段 API 样式 */
.phase-api {
  font-size: 0.75rem; /* 字体大小 */
  color: #999; /* 文字颜色 */
  font-family: 'JetBrains Mono', monospace; /* 等宽字体 */
}

/* 阶段状态样式 */
.phase-status {
  font-size: 0.75rem; /* 字体大小 */
  padding: 4px 10px; /* 内边距 */
  background: #eee; /* 背景色为浅灰色 */
  color: #666; /* 文字颜色 */
}

/* 阶段状态激活 */
.phase-status.active {
  background: #FF6B35; /* 背景色为橙色 */
  color: #fff; /* 文字颜色为白色 */
}

/* 阶段状态完成 */
.phase-status.completed {
  background: #1A936F; /* 背景色为绿色 */
  color: #fff; /* 文字颜色为白色 */
}

/* 阶段详情样式 */
.phase-detail {
  padding: 16px; /* 内边距 */
}

/* 实体标签样式 */
.entity-tags {
  display: flex; /* 使用 Flex 布局 */
  flex-wrap: wrap; /* 允许换行 */
  gap: 8px; /* 元素间距 */
}

/* 实体标签样式 */
.entity-tag {
  font-size: 0.75rem; /* 字体大小 */
  padding: 4px 10px; /* 内边距 */
  background: #F5F5F5; /* 背景色为浅灰色 */
  border: 1px solid #E0E0E0; /* 边框 */
  color: #333; /* 文字颜色 */
}

/* 关系列表样式 */
.relation-list {
  font-size: 0.8rem; /* 字体大小 */
}

/* 关系项样式 */
.relation-item {
  display: flex; /* 使用 Flex 布局 */
  align-items: center; /* 垂直居中对齐 */
  gap: 8px; /* 元素间距 */
  padding: 6px 0; /* 上下内边距 */
  border-bottom: 1px dashed #eee; /* 底部边框为虚线 */
}

.relation-item:last-child {
  border-bottom: none; /* 最后一项无底部边框 */
}

/* 关系源和目标类型样式 */
.rel-source,
.rel-target {
  color: #333; /* 文字颜色 */
}

/* 关系箭头样式 */
.rel-arrow {
  color: #ccc; /* 颜色为浅灰色 */
}

/* 关系名称样式 */
.rel-name {
  color: #FF6B35; /* 颜色为橙色 */
  font-weight: 500; /* 字体粗细 */
}

/* 更多关系提示样式 */
.relation-more {
  padding-top: 8px; /* 上内边距 */
  color: #999; /* 文字颜色 */
  font-size: 0.75rem; /* 字体大小 */
}

/* 本体生成进度样式 */
.ontology-progress {
  display: flex; /* 使用 Flex 布局 */
  align-items: center; /* 垂直居中对齐 */
  gap: 12px; /* 元素间距 */
  padding: 12px; /* 内边距 */
  background: #FFF5F2; /* 背景色为浅橙色 */
  border: 1px solid #FFE0D6; /* 边框 */
}

/* 进度旋转器样式 */
.progress-spinner {
  width: 20px; /* 宽度 */
  height: 20px; /* 高度 */
  border: 2px solid #FFE0D6; /* 边框 */
  border-top-color: #FF6B35; /* 顶部边框颜色为橙色 */
  border-radius: 50%; /* 圆形 */
  animation: spin 1s linear infinite; /* 旋转动画 */
}

/* 进度文本样式 */
.progress-text {
  font-size: 0.85rem; /* 字体大小 */
  color: #333; /* 文字颜色 */
}

/* 等待状态样式 */
.waiting-state {
  padding: 16px; /* 内边距 */
  background: #F9F9F9; /* 背景色为浅灰色 */
  border: 1px dashed #E0E0E0; /* 边框为虚线 */
  text-align: center; /* 文本居中对齐 */
}

/* 等待提示样式 */
.waiting-hint {
  font-size: 0.85rem; /* 字体大小 */
  color: #999; /* 文字颜色 */
}

/* 进度条样式 */
.progress-bar {
  height: 6px; /* 高度 */
  background: #E0E0E0; /* 背景色 */
  margin-bottom: 8px; /* 下边距 */
  overflow: hidden; /* 隐藏溢出内容 */
}

/* 进度填充样式 */
.progress-fill {
  height: 100%; /* 高度为 100% */
  background: #FF6B35; /* 背景色为橙色 */
  transition: width 0.3s; /* 宽度过渡动画 */
}

/* 进度信息样式 */
.progress-info {
  display: flex; /* 使用 Flex 布局 */
  justify-content: space-between; /* 两端对齐 */
  font-size: 0.75rem; /* 字体大小 */
}

/* 进度消息样式 */
.progress-message {
  color: #666; /* 文字颜色 */
}

/* 进度百分比样式 */
.progress-percent {
  color: #FF6B35; /* 文字颜色为橙色 */
  font-weight: 600; /* 字体粗细 */
}

/* 构建结果样式 */
.build-result {
  display: flex; /* 使用 Flex 布局 */
  gap: 16px; /* 元素间距 */
}

/* 结果项样式 */
.result-item {
  flex: 1; /* 占据剩余空间 */
  text-align: center; /* 文本居中对齐 */
  padding: 12px; /* 内边距 */
  background: #F5F5F5; /* 背景色为浅灰色 */
}

/* 结果值样式 */
.result-value {
  display: block; /* 块级显示 */
  font-size: 1.5rem; /* 字体大小 */
  font-weight: 700; /* 字体粗细 */
  color: #000; /* 文字颜色为黑色 */
  margin-bottom: 4px; /* 下边距 */
}

/* 结果标签样式 */
.result-label {
  font-size: 0.7rem; /* 字体大小 */
  color: #999; /* 文字颜色 */
  text-transform: uppercase; /* 大写 */
  letter-spacing: 0.05em; /* 字间距 */
}

/* 下一步按钮区域样式 */
.next-step-section {
  margin-top: 24px; /* 上边距 */
  padding-top: 24px; /* 上内边距 */
  border-top: 1px solid #E0E0E0; /* 顶部边框 */
}

/* 下一步按钮样式 */
.next-step-btn {
  width: 100%; /* 宽度为 100% */
  display: flex; /* 使用 Flex 布局 */
  align-items: center; /* 垂直居中对齐 */
  justify-content: center; /* 水平居中对齐 */
  gap: 10px; /* 元素间距 */
  padding: 16px; /* 内边距 */
  background: #000; /* 背景色为黑色 */
  color: #fff; /* 文字颜色为白色 */
  border: none; /* 无边框 */
  font-size: 1rem; /* 字体大小 */
  font-weight: 500; /* 字体粗细 */
  letter-spacing: 0.05em; /* 字间距 */
  cursor: pointer; /* 鼠标指针为手型 */
  transition: all 0.2s; /* 所有属性过渡动画 */
}

.next-step-btn:hover:not(:disabled) {
  background: #FF6B35; /* 悬停时背景色为橙色 */
}

.next-step-btn:disabled {
  background: #ccc; /* 禁用时背景色为灰色 */
  cursor: not-allowed; /* 禁用时鼠标指针为禁止 */
}

/* 按钮箭头样式 */
.btn-arrow {
  font-size: 1.2rem; /* 字体大小 */
}

/* 项目信息面板样式 */
.project-panel {
  border-top: 1px solid #E0E0E0; /* 顶部边框 */
  background: #FAFAFA; /* 背景色为浅灰色 */
}

/* 项目头部样式 */
.project-header {
  display: flex; /* 使用 Flex 布局 */
  align-items: center; /* 垂直居中对齐 */
  gap: 10px; /* 元素间距 */
  padding: 12px 24px; /* 内边距 */
  border-bottom: 1px solid #E0E0E0; /* 底部边框 */
}

/* 项目图标样式 */
.project-icon {
  color: #FF6B35; /* 颜色为橙色 */
}

/* 项目标题样式 */
.project-title {
  font-size: 0.85rem; /* 字体大小 */
  font-weight: 600; /* 字体粗细 */
}

/* 项目详情样式 */
.project-details {
  padding: 16px 24px; /* 内边距 */
}

/* 项目项样式 */
.project-item {
  display: flex; /* 使用 Flex 布局 */
  justify-content: space-between; /* 两端对齐 */
  align-items: flex-start; /* 顶部对齐 */
  padding: 8px 0; /* 上下内边距 */
  border-bottom: 1px dashed #E0E0E0; /* 底部边框为虚线 */
  font-size: 0.8rem; /* 字体大小 */
}

.project-item:last-child {
  border-bottom: none; /* 最后一项无底部边框 */
}

/* 项目项标签样式 */
.item-label {
  color: #999; /* 文字颜色 */
  flex-shrink: 0; /* 不收缩 */
}

/* 项目项值样式 */
.item-value {
  color: #333; /* 文字颜色 */
  text-align: right; /* 右对齐 */
  max-width: 60%; /* 最大宽度 */
  word-break: break-all; /* 允许在任何字符处换行 */
}

/* 项目项值代码样式 */
.item-value.code {
  font-family: 'JetBrains Mono', monospace; /* 等宽字体 */
  font-size: 0.75rem; /* 字体大小 */
  color: #666; /* 文字颜色 */
}

/* 响应式设计：小屏幕适配 */
@media (max-width: 1024px) {
  /* 主内容区域 */
  .main-content {
    flex-direction: column; /* 垂直排列 */
  }
  
  /* 左侧面板 */
  .left-panel {
    width: 100% !important; /* 宽度为 100% */
    border-right: none; /* 移除右侧边框 */
    border-bottom: 1px solid #E0E0E0; /* 添加底部边框 */
    height: 50vh; /* 高度为视口高度的 50% */
  }
  
  /* 右侧面板 */
  .right-panel {
    width: 100% !important; /* 宽度为 100% */
    height: 50vh; /* 高度为视口高度的 50% */
    opacity: 1 !important; /* 透明度为 1 */
    transform: none !important; /* 无变换 */
  }
  
  /* 右侧面板隐藏状态 */
  .right-panel.hidden {
      display: none; /* 隐藏 */
  }
}
</style>