<template>
  <div class="simulation-panel">
    <!-- 顶部控制栏 -->
    <div class="control-bar">
      <div class="status-group">
        <!-- Twitter 平台进度 -->
        <div class="platform-status twitter" :class="{ active: runStatus.twitter_running, completed: runStatus.twitter_completed }">
          <div class="platform-header">
            <svg class="platform-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            <span class="platform-name">信息广场</span>
            <span v-if="runStatus.twitter_completed" class="status-badge">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </span>
          </div>
          <div class="platform-stats">
            <span class="stat">
              <span class="stat-label">轮次</span>
              <span class="stat-value mono">{{ runStatus.twitter_current_round || 0 }}<span class="stat-total">/{{ runStatus.total_rounds || maxRounds || '-' }}</span></span>
            </span>
            <span class="stat">
              <span class="stat-label">已用时间</span>
              <span class="stat-value mono">{{ twitterElapsedTime }}</span>
            </span>
            <span class="stat">
              <span class="stat-label">动作数</span>
              <span class="stat-value mono">{{ runStatus.twitter_actions_count || 0 }}</span>
            </span>
          </div>
          <!-- 可用动作提示 -->
          <div class="actions-tooltip">
            <div class="tooltip-title">可用动作</div>
            <div class="tooltip-actions">
              <span class="tooltip-action">发布</span>
              <span class="tooltip-action">点赞</span>
              <span class="tooltip-action">转发</span>
              <span class="tooltip-action">引用</span>
              <span class="tooltip-action">关注</span>
              <span class="tooltip-action">静默</span>
            </div>
          </div>
        </div>
        
        <!-- Reddit 平台进度 -->
        <div class="platform-status reddit" :class="{ active: runStatus.reddit_running, completed: runStatus.reddit_completed }">
          <div class="platform-header">
            <svg class="platform-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
            <span class="platform-name">话题社区</span>
            <span v-if="runStatus.reddit_completed" class="status-badge">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </span>
          </div>
          <div class="platform-stats">
            <span class="stat">
              <span class="stat-label">轮次</span>
              <span class="stat-value mono">{{ runStatus.reddit_current_round || 0 }}<span class="stat-total">/{{ runStatus.total_rounds || maxRounds || '-' }}</span></span>
            </span>
            <span class="stat">
              <span class="stat-label">已用时间</span>
              <span class="stat-value mono">{{ redditElapsedTime }}</span>
            </span>
            <span class="stat">
              <span class="stat-label">动作数</span>
              <span class="stat-value mono">{{ runStatus.reddit_actions_count || 0 }}</span>
            </span>
          </div>
          <!-- 可用动作提示 -->
          <div class="actions-tooltip">
            <div class="tooltip-title">可用动作</div>
            <div class="tooltip-actions">
              <span class="tooltip-action">发布</span>
              <span class="tooltip-action">评论</span>
              <span class="tooltip-action">点赞</span>
              <span class="tooltip-action">踩</span>
              <span class="tooltip-action">搜索</span>
              <span class="tooltip-action">趋势</span>
              <span class="tooltip-action">关注</span>
              <span class="tooltip-action">屏蔽</span>
              <span class="tooltip-action">刷新</span>
              <span class="tooltip-action">静默</span>
            </div>
          </div>
        </div>
      </div>

      <div class="action-controls">
        <button 
          class="action-btn primary"
          :disabled="phase !== 2 || isGeneratingReport"
          @click="handleNextStep"
        >
          <span v-if="isGeneratingReport" class="loading-spinner-small"></span>
          {{ isGeneratingReport ? '启动中...' : '开始生成结果报告' }} 
          <span v-if="!isGeneratingReport" class="arrow-icon">→</span>
        </button>
      </div>
    </div>

    <!-- 主内容区域：双时间轴 -->
    <div class="main-content-area" ref="scrollContainer">
      <!-- 时间轴头部 -->
      <div class="timeline-header" v-if="allActions.length > 0">
        <div class="timeline-stats">
          <span class="total-count">总事件数：<span class="mono">{{ allActions.length }}</span></span>
          <span class="platform-breakdown">
            <span class="breakdown-item twitter">
              <svg class="mini-icon" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
              <span class="mono">{{ twitterActionsCount }}</span>
            </span>
            <span class="breakdown-divider">/</span>
            <span class="breakdown-item reddit">
              <svg class="mini-icon" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              <span class="mono">{{ redditActionsCount }}</span>
            </span>
          </span>
        </div>
      </div>
      
      <!-- 时间轴信息流 -->
      <div class="timeline-feed">
        <div class="timeline-axis"></div>
        
        <TransitionGroup name="timeline-item">
          <div 
            v-for="action in chronologicalActions" 
            :key="action._uniqueId || action.id || `${action.timestamp}-${action.agent_id}`" 
            class="timeline-item"
            :class="action.platform"
          >
            <div class="timeline-marker">
              <div class="marker-dot"></div>
            </div>
            
            <div class="timeline-card">
              <div class="card-header">
                <div class="agent-info">
                  <div class="avatar-placeholder">{{ (action.agent_name || 'A')[0] }}</div>
                  <span class="agent-name">{{ action.agent_name }}</span>
                </div>
                
                <div class="header-meta">
                  <div class="platform-indicator">
                    <svg v-if="action.platform === 'twitter'" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                    <svg v-else viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                  </div>
                  <div class="action-badge" :class="getActionTypeClass(action.action_type)">
                    {{ getActionTypeLabel(action.action_type) }}
                  </div>
                </div>
              </div>
              
              <div class="card-body">
                <!-- CREATE_POST: 发布帖子 -->
                <div v-if="action.action_type === 'CREATE_POST' && action.action_args?.content" class="content-text main-text">
                  {{ action.action_args.content }}
                </div>

                <!-- QUOTE_POST: 引用帖子 -->
                <template v-if="action.action_type === 'QUOTE_POST'">
                  <div v-if="action.action_args?.quote_content" class="content-text">
                    {{ action.action_args.quote_content }}
                  </div>
                  <div v-if="action.action_args?.original_content" class="quoted-block">
                    <div class="quote-header">
                      <svg class="icon-small" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                      <span class="quote-label">@{{ action.action_args.original_author_name || 'User' }}</span>
                    </div>
                    <div class="quote-text">
                      {{ truncateContent(action.action_args.original_content, 150) }}
                    </div>
                  </div>
                </template>

                <!-- REPOST: 转发帖子 -->
                <template v-if="action.action_type === 'REPOST'">
                  <div class="repost-info">
                    <svg class="icon-small" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
                    <span class="repost-label">转发了 @{{ action.action_args?.original_author_name || 'User' }} 的帖子</span>
                  </div>
                  <div v-if="action.action_args?.original_content" class="repost-content">
                    {{ truncateContent(action.action_args.original_content, 200) }}
                  </div>
                </template>

                <!-- LIKE_POST: 点赞帖子 -->
                <template v-if="action.action_type === 'LIKE_POST'">
                  <div class="like-info">
                    <svg class="icon-small filled" viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                    <span class="like-label">点赞了 @{{ action.action_args?.post_author_name || 'User' }} 的帖子</span>
                  </div>
                  <div v-if="action.action_args?.post_content" class="liked-content">
                    "{{ truncateContent(action.action_args.post_content, 120) }}"
                  </div>
                </template>

                <!-- CREATE_COMMENT: 发表评论 -->
                <template v-if="action.action_type === 'CREATE_COMMENT'">
                  <div v-if="action.action_args?.content" class="content-text">
                    {{ action.action_args.content }}
                  </div>
                  <div v-if="action.action_args?.post_id" class="comment-context">
                    <svg class="icon-small" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                    <span>回复帖子 #{{ action.action_args.post_id }}</span>
                  </div>
                </template>

                <!-- SEARCH_POSTS: 搜索帖子 -->
                <template v-if="action.action_type === 'SEARCH_POSTS'">
                  <div class="search-info">
                    <svg class="icon-small" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <span class="search-label">搜索查询：</span>
                    <span class="search-query">"{{ action.action_args?.query || '' }}"</span>
                  </div>
                </template>

                <!-- FOLLOW: 关注用户 -->
                <template v-if="action.action_type === 'FOLLOW'">
                  <div class="follow-info">
                    <svg class="icon-small" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                    <span class="follow-label">关注了 @{{ action.action_args?.target_user || action.action_args?.user_id || 'User' }}</span>
                  </div>
                </template>

                <!-- UPVOTE / DOWNVOTE -->
                <template v-if="action.action_type === 'UPVOTE_POST' || action.action_type === 'DOWNVOTE_POST'">
                  <div class="vote-info">
                    <svg v-if="action.action_type === 'UPVOTE_POST'" class="icon-small" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"></polyline></svg>
                    <svg v-else class="icon-small" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    <span class="vote-label">{{ action.action_type === 'UPVOTE_POST' ? '点赞了' : '踩了' }}帖子</span>
                  </div>
                  <div v-if="action.action_args?.post_content" class="voted-content">
                    "{{ truncateContent(action.action_args.post_content, 120) }}"
                  </div>
                </template>

                <!-- DO_NOTHING: 无操作（静默） -->
                <template v-if="action.action_type === 'DO_NOTHING'">
                  <div class="idle-info">
                    <svg class="icon-small" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <span class="idle-label">跳过动作</span>
                  </div>
                </template>

                <!-- 通用回退：未知类型或有 content 但未被上述处理 -->
                <div v-if="!['CREATE_POST', 'QUOTE_POST', 'REPOST', 'LIKE_POST', 'CREATE_COMMENT', 'SEARCH_POSTS', 'FOLLOW', 'UPVOTE_POST', 'DOWNVOTE_POST', 'DO_NOTHING'].includes(action.action_type) && action.action_args?.content" class="content-text">
                  {{ action.action_args.content }}
                </div>
              </div>

              <div class="card-footer">
                <span class="time-tag">R{{ action.round_num }} • {{ formatActionTime(action.timestamp) }}</span>
                <!-- 平台标签已移除，因为现在在头部显示 -->
              </div>
            </div>
          </div>
        </TransitionGroup>

        <div v-if="allActions.length === 0" class="waiting-state">
          <div class="pulse-ring"></div>
          <span>等待 Agent 动作...</span>
        </div>
      </div>
    </div>

    <!-- 底部信息 / 日志 -->
    <div class="system-logs">
      <div class="log-header">
        <span class="log-title">模拟监控</span>
        <span class="log-id">{{ simulationId || '无模拟' }}</span>
      </div>
      <div class="log-content" ref="logContent">
        <div class="log-line" v-for="(log, idx) in systemLogs" :key="idx">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-msg">{{ log.msg }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 导入 Vue 3 的响应式 API：ref、computed、watch、onMounted、onUnmounted、nextTick
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
// 导入 Vue Router 的 useRouter
import { useRouter } from 'vue-router'
// 导入模拟相关的 API 函数
import { 
  startSimulation,           // 启动模拟
  stopSimulation,            // 停止模拟
  getRunStatus,             // 获取运行状态
  getRunStatusDetail        // 获取运行状态详情
} from '../api/simulation'
// 导入报告生成的 API 函数
import { generateReport } from '../api/report'

// 定义组件的 props：接收父组件传递的数据
const props = defineProps({
  simulationId: String,       // 模拟 ID，从父组件传入
  maxRounds: Number,          // 最大轮数，从 Step2 传入
  minutesPerRound: {           // 每轮模拟的分钟数
    type: Number,
    default: 30               // 默认每轮 30 分钟
  },
  projectData: Object,        // 项目数据对象
  graphData: Object,         // 图谱数据对象
  systemLogs: Array           // 系统日志数组
})

// 定义组件的事件：向父组件发送事件
const emit = defineEmits(['go-back', 'next-step', 'add-log', 'update-status'])

// 获取路由实例
const router = useRouter()

// 状态定义
const isGeneratingReport = ref(false)  // 是否正在生成报告
const phase = ref(0)                  // 当前阶段：0=未开始, 1=运行中, 2=已完成
const isStarting = ref(false)         // 是否正在启动
const isStopping = ref(false)         // 是否正在停止
const startError = ref(null)           // 启动错误信息
const runStatus = ref({})             // 运行状态对象
const allActions = ref([])             // 所有动作（增量累积）
const actionIds = ref(new Set())      // 用于去重的动作 ID 集合
const scrollContainer = ref(null)      // 滚动容器引用

// 计算属性
// 按时间顺序显示动作（最新的在最后面，即底部）
const chronologicalActions = computed(() => {
  return allActions.value
})

// Twitter 平台动作计数
const twitterActionsCount = computed(() => {
  return allActions.value.filter(a => a.platform === 'twitter').length
})

// Reddit 平台动作计数
const redditActionsCount = computed(() => {
  return allActions.value.filter(a => a.platform === 'reddit').length
})

// 格式化模拟流逝时间（根据轮次和每轮分钟数计算）
// 参数：
//   currentRound: 当前轮次
// 返回：格式化的时间字符串（例如："2h 30m"）
const formatElapsedTime = (currentRound) => {
  if (!currentRound || currentRound <= 0) return '0h 0m'
  const totalMinutes = currentRound * props.minutesPerRound
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours}h ${minutes}m`
}

// Twitter 平台的模拟流逝时间
const twitterElapsedTime = computed(() => {
  return formatElapsedTime(runStatus.value.twitter_current_round || 0)
})

// Reddit 平台的模拟流逝时间
const redditElapsedTime = computed(() => {
  return formatElapsedTime(runStatus.value.reddit_current_round || 0)
})

// 方法
// 添加日志
const addLog = (msg) => {
  emit('add-log', msg)
}

// 重置所有状态（用于重新启动模拟）
const resetAllState = () => {
  phase.value = 0
  runStatus.value = {}
  allActions.value = []
  actionIds.value = new Set()
  prevTwitterRound.value = 0
  prevRedditRound.value = 0
  startError.value = null
  isStarting.value = false
  isStopping.value = false
  stopPolling()  // 停止之前可能存在的轮询
}

// 启动模拟
const doStartSimulation = async () => {
  if (!props.simulationId) {
    addLog('错误：缺少 simulationId')
    return
  }
  
  // 先重置所有状态，确保不会受到上一次模拟的影响
  resetAllState()
  
  isStarting.value = true
  startError.value = null
  addLog('正在启动双平台并行模拟...')
  emit('update-status', 'processing')
  
  try {
    const params = {
      simulation_id: props.simulationId,
      platform: 'parallel',           // 并行模式
      force: true,                   // 强制重新开始
      enable_graph_memory_update: true  // 开启动态图谱更新
    }
    
    if (props.maxRounds) {
      params.max_rounds = props.maxRounds
      addLog(`设置最大模拟轮数：${props.maxRounds}`)
    }
    
    addLog('已开启动态图谱更新模式')
    
    const res = await startSimulation(params)
    
    if (res.success && res.data) {
      if (res.data.force_restarted) {
        addLog('✓ 已清理旧的模拟日志，重新开始模拟')
      }
      addLog('✓ 模拟引擎启动成功')
      addLog(`  ├─ 进程 ID：${res.data.process_pid || '-'}`)
      
      phase.value = 1
      runStatus.value = res.data
      
      startStatusPolling()
      startDetailPolling()
    } else {
      startError.value = res.error || '启动失败'
      addLog(`✗ 启动失败：${res.error || '未知错误'}`)
      emit('update-status', 'error')
    }
  } catch (err) {
    startError.value = err.message
    addLog(`✗ 启动异常: ${err.message}`)
    emit('update-status', 'error')
  } finally {
    isStarting.value = false
  }
}

// 停止模拟
const handleStopSimulation = async () => {
  if (!props.simulationId) return
  
  isStopping.value = true
  addLog('正在停止模拟...')
  
  try {
    const res = await stopSimulation({ simulation_id: props.simulationId })
    
    if (res.success) {
      addLog('✓ 模拟已停止')
      phase.value = 2
      stopPolling()
      emit('update-status', 'completed')
    } else {
      addLog(`停止失败: ${res.error || '未知错误'}`)
    }
  } catch (err) {
    addLog(`停止异常: ${err.message}`)
  } finally {
    isStopping.value = false
  }
}

// 轮询状态
let statusTimer = null  // 状态轮询定时器
let detailTimer = null  // 详情轮询定时器

// 启动状态轮询（每 2 秒）
const startStatusPolling = () => {
  statusTimer = setInterval(fetchRunStatus, 2000)
}

// 启动详情轮询（每 3 秒）
const startDetailPolling = () => {
  detailTimer = setInterval(fetchRunStatusDetail, 3000)
}

// 停止所有轮询
const stopPolling = () => {
  if (statusTimer) {
    clearInterval(statusTimer)
    statusTimer = null
  }
  if (detailTimer) {
    clearInterval(detailTimer)
    detailTimer = null
  }
}

// 追踪各平台的上一次轮次，用于检测变化并输出日志
const prevTwitterRound = ref(0)
const prevRedditRound = ref(0)

// 获取运行状态
const fetchRunStatus = async () => {
  if (!props.simulationId) return
  
  try {
    const res = await getRunStatus(props.simulationId)
    
    if (res.success && res.data) {
      const data = res.data
      
      runStatus.value = data
      
      // 分别检测各平台的轮次变化并输出日志
      if (data.twitter_current_round > prevTwitterRound.value) {
        addLog(`[广场] R${data.twitter_current_round}/${data.total_rounds} | T:${data.twitter_simulated_hours || 0}h | A:${data.twitter_actions_count}`)
        prevTwitterRound.value = data.twitter_current_round
      }
      
      if (data.reddit_current_round > prevRedditRound.value) {
        addLog(`[社区] R${data.reddit_current_round}/${data.total_rounds} | T:${data.reddit_simulated_hours || 0}h | A:${data.reddit_actions_count}`)
        prevRedditRound.value = data.reddit_current_round
      }
      
      // 检测模拟是否已完成（通过 runner_status 或平台完成状态判断）
      const isCompleted = data.runner_status === 'completed' || data.runner_status === 'stopped'
      
      // 额外检查：如果后端还没来得及更新 runner_status，但平台已经报告完成
      // 通过检测 twitter_completed 和 reddit_completed 状态判断
      const platformsCompleted = checkPlatformsCompleted(data)
      
      if (isCompleted || platformsCompleted) {
        if (platformsCompleted && !isCompleted) {
          addLog('✓ 检测到所有平台模拟已结束')
        }
        addLog('✓ 模拟已完成')
        phase.value = 2
        stopPolling()
        emit('update-status', 'completed')
      }
    }
  } catch (err) {
    console.warn('获取运行状态失败:', err)
  }
}

// 检查所有启用的平台是否已完成
// 参数：
//   data: 运行状态数据
// 返回：布尔值，表示所有启用的平台是否都已完成
const checkPlatformsCompleted = (data) => {
  // 如果没有任何平台数据，返回 false
  if (!data) return false
  
  // 检查各平台的完成状态
  const twitterCompleted = data.twitter_completed === true
  const redditCompleted = data.reddit_completed === true
  
  // 如果至少有一个平台完成了，检查是否所有启用的平台都完成了
  // 通过 actions_count 判断平台是否被启用（如果 count > 0 或 running 曾为 true）
  const twitterEnabled = (data.twitter_actions_count > 0) || data.twitter_running || twitterCompleted
  const redditEnabled = (data.reddit_actions_count > 0) || data.reddit_running || redditCompleted
  
  // 如果没有任何平台被启用，返回 false
  if (!twitterEnabled && !redditEnabled) return false
  
  // 检查所有启用的平台是否都已完成
  if (twitterEnabled && !twitterCompleted) return false
  if (redditEnabled && !redditCompleted) return false
  
  return true
}

// 获取运行状态详情（包含所有动作）
const fetchRunStatusDetail = async () => {
  if (!props.simulationId) return
  
  try {
    const res = await getRunStatusDetail(props.simulationId)
    
    if (res.success && res.data) {
      // 使用 all_actions 获取完整的动作列表
      const serverActions = res.data.all_actions || []
      
      // 增量添加新动作（去重）
      let newActionsAdded = 0
      serverActions.forEach(action => {
        // 生成唯一ID
        const actionId = action.id || `${action.timestamp}-${action.platform}-${action.agent_id}-${action.action_type}`
        
        if (!actionIds.value.has(actionId)) {
          actionIds.value.add(actionId)
          allActions.value.push({
            ...action,
            _uniqueId: actionId
          })
          newActionsAdded++
        }
      })
      
      // 不自动滚动，让用户自由查看时间轴
      // 新动作会在底部追加
    }
  } catch (err) {
    console.warn('获取详细状态失败:', err)
  }
}

// 辅助函数
// 获取动作类型的标签
// 参数：
//   type: 动作类型
// 返回：动作类型的标签字符串
const getActionTypeLabel = (type) => {
  const labels = {
    'CREATE_POST': '发布',
    'REPOST': '转发',
    'LIKE_POST': '点赞',
    'CREATE_COMMENT': '评论',
    'LIKE_COMMENT': '点赞',
    'DO_NOTHING': '静默',
    'FOLLOW': '关注',
    'SEARCH_POSTS': '搜索',
    'QUOTE_POST': '引用',
    'UPVOTE_POST': '点赞',
    'DOWNVOTE_POST': '踩'
  }
  return labels[type] || type || '未知'
}

// 获取动作类型的样式类
// 参数：
//   type: 动作类型
// 返回：动作类型的样式类字符串
const getActionTypeClass = (type) => {
  const classes = {
    'CREATE_POST': 'badge-post',
    'REPOST': 'badge-action',
    'LIKE_POST': 'badge-action',
    'CREATE_COMMENT': 'badge-comment',
    'LIKE_COMMENT': 'badge-action',
    'QUOTE_POST': 'badge-post',
    'FOLLOW': 'badge-meta',
    'SEARCH_POSTS': 'badge-meta',
    'UPVOTE_POST': 'badge-action',
    'DOWNVOTE_POST': 'badge-action',
    'DO_NOTHING': 'badge-idle'
  }
  return classes[type] || 'badge-default'
}

// 截断内容（超过最大长度时添加省略号）
// 参数：
//   content: 要截断的内容
//   maxLength: 最大长度，默认 100
// 返回：截断后的内容
const truncateContent = (content, maxLength = 100) => {
  if (!content) return ''
  if (content.length > maxLength) return content.substring(0, maxLength) + '...'
  return content
}

// 格式化动作时间
// 参数：
//   timestamp: 时间戳
// 返回：格式化的时间字符串（例如："14:30:25"）
const formatActionTime = (timestamp) => {
  if (!timestamp) return ''
  try {
    return new Date(timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch {
    return ''
  }
}

// 处理下一步：生成报告
const handleNextStep = async () => {
  if (!props.simulationId) {
    addLog('错误：缺少 simulationId')
    return
  }
  
  if (isGeneratingReport.value) {
    addLog('报告生成请求已发送，请稍候...')
    return
  }
  
  isGeneratingReport.value = true
  addLog('正在启动报告生成...')
  
  try {
    const res = await generateReport({
      simulation_id: props.simulationId,
      force_regenerate: true
    })
    
    if (res.success && res.data) {
      const reportId = res.data.report_id
      addLog(`✓ 报告生成任务已启动：${reportId}`)
      
      // 跳转到报告页面
      router.push({ name: 'Report', params: { reportId } })
    } else {
      addLog(`✗ 启动报告生成失败：${res.error || '未知错误'}`)
      isGeneratingReport.value = false
    }
  } catch (err) {
    addLog(`✗ 启动报告生成异常：${err.message}`)
    isGeneratingReport.value = false
  }
}

// 滚动日志到底部
const logContent = ref(null)
watch(() => props.systemLogs?.length, () => {
  nextTick(() => {
    if (logContent.value) {
      logContent.value.scrollTop = logContent.value.scrollHeight
    }
  })
})

// 组件挂载时启动模拟
onMounted(() => {
  addLog('Step3 模拟运行初始化')
  if (props.simulationId) {
    doStartSimulation()
  }
})

// 组件卸载时停止轮询
onUnmounted(() => {
  stopPolling()
})
</script>

<style scoped>
/* 模拟面板样式 */
.simulation-panel {
  height: 100%;                      /* 高度占满父容器 */
  display: flex;                     /* 使用 Flexbox 布局 */
  flex-direction: column;            /* 垂直方向排列 */
  background: #FFF;                 /* 白色背景 */
  font-family: 'Space Grotesk', 'Noto Sans SC', system-ui, sans-serif;  /* 字体栈 */
  overflow: hidden;                  /* 隐藏溢出内容 */
}

/* --- 控制栏 --- */
.control-bar {
  background: #FFF;                 /* 白色背景 */
  padding: 12px 24px;               /* 内边距 */
  display: flex;                     /* 使用 Flexbox 布局 */
  justify-content: space-between;    /* 两端对齐 */
  align-items: center;              /* 垂直居中 */
  border-bottom: 1px solid #EAEAEA; /* 底部实线边框 */
  z-index: 10;                      /* 层级 */
  height: 64px;                     /* 高度 */
}

.status-group {
  display: flex;                     /* 使用 Flexbox 布局 */
  gap: 12px;                        /* 元素之间的间距 */
}

/* 平台状态卡片 */
.platform-status {
  display: flex;                     /* 使用 Flexbox 布局 */
  flex-direction: column;            /* 垂直方向排列 */
  gap: 4px;                         /* 元素之间的间距 */
  padding: 6px 12px;                /* 内边距 */
  border-radius: 4px;                /* 圆角 */
  background: #FAFAFA;               /* 浅灰色背景 */
  border: 1px solid #EAEAEA;        /* 浅灰色边框 */
  opacity: 0.7;                      /* 透明度 */
  transition: all 0.3s;              /* 过渡动画 */
  min-width: 140px;                  /* 最小宽度 */
  position: relative;                /* 相对定位 */
  cursor: pointer;                   /* 鼠标指针为手型 */
}

/* 激活状态的平台卡片 */
.platform-status.active {
  opacity: 1;                        /* 不透明 */
  border-color: #333;                /* 深灰色边框 */
  background: #FFF;                  /* 白色背景 */
}

/* 完成状态的平台卡片 */
.platform-status.completed {
  opacity: 1;                        /* 不透明 */
  border-color: #1A936F;            /* 绿色边框 */
  background: #F2FAF6;              /* 浅绿色背景 */
}

/* 可用动作提示框 */
.actions-tooltip {
  position: absolute;                /* 绝对定位 */
  top: 100%;                        /* 顶部对齐父元素底部 */
  left: 50%;                        /* 左侧居中 */
  transform: translateX(-50%);      /* 水平居中 */
  margin-top: 8px;                  /* 顶部间距 */
  padding: 10px 14px;               /* 内边距 */
  background: #000;                  /* 黑色背景 */
  color: #FFF;                      /* 白色文字 */
  border-radius: 4px;                /* 圆角 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);  /* 阴影效果 */
  opacity: 0;                        /* 透明 */
  visibility: hidden;                /* 隐藏 */
  transition: all 0.2s ease;       /* 过渡动画 */
  z-index: 100;                      /* 层级 */
  min-width: 180px;                  /* 最小宽度 */
  pointer-events: none;              /* 不响应鼠标事件 */
}

/* 提示框的三角形箭头 */
.actions-tooltip::before {
  content: '';                       /* 空内容 */
  position: absolute;                /* 绝对定位 */
  top: -6px;                        /* 顶部偏移 */
  left: 50%;                        /* 左侧居中 */
  transform: translateX(-50%);      /* 水平居中 */
  border-left: 6px solid transparent; /* 左边透明 */
  border-right: 6px solid transparent; /* 右边透明 */
  border-bottom: 6px solid #000;     /* 底部黑色 */
}

/* 悬停时显示提示框 */
.platform-status:hover .actions-tooltip {
  opacity: 1;                        /* 不透明 */
  visibility: visible;               /* 可见 */
}

.tooltip-title {
  font-size: 10px;                   /* 字体大小 */
  font-weight: 600;                 /* 字体粗细 */
  color: #999;                      /* 浅灰色 */
  text-transform: uppercase;          /* 大写 */
  letter-spacing: 0.08em;           /* 字间距 */
  margin-bottom: 8px;                /* 底部间距 */
}

.tooltip-actions {
  display: flex;                     /* 使用 Flexbox 布局 */
  flex-wrap: wrap;                   /* 自动换行 */
  gap: 6px;                         /* 元素之间的间距 */
}

.tooltip-action {
  font-size: 10px;                   /* 字体大小 */
  font-weight: 600;                 /* 字体粗细 */
  padding: 3px 8px;                 /* 内边距 */
  background: rgba(255, 255, 255, 0.15);  /* 半透明白色背景 */
  border-radius: 2px;                /* 圆角 */
  color: #FFF;                      /* 白色文字 */
  letter-spacing: 0.03em;           /* 字间距 */
}

.platform-header {
  display: flex;                     /* 使用 Flexbox 布局 */
  align-items: center;              /* 垂直居中 */
  gap: 8px;                         /* 元素之间的间距 */
  margin-bottom: 2px;               /* 底部间距 */
}

.platform-name {
  font-size: 11px;                   /* 字体大小 */
  font-weight: 700;                 /* 字体粗细 */
  color: #000;                      /* 黑色 */
  text-transform: uppercase;          /* 大写 */
  letter-spacing: 0.05em;           /* 字间距 */
}

.platform-status.twitter .platform-icon { color: #000; }  /* Twitter 平台图标颜色 */
.platform-status.reddit .platform-icon { color: #000; }   /* Reddit 平台图标颜色 */

.platform-stats {
  display: flex;                     /* 使用 Flexbox 布局 */
  gap: 10px;                        /* 元素之间的间距 */
}

.stat {
  display: flex;                     /* 使用 Flexbox 布局 */
  align-items: baseline;            /* 基线对齐 */
  gap: 3px;                         /* 元素之间的间距 */
}

.stat-label {
  font-size: 8px;                   /* 字体大小 */
  color: #999;                      /* 浅灰色 */
  font-weight: 600;                 /* 字体粗细 */
  text-transform: uppercase;          /* 大写 */
  letter-spacing: 0.05em;           /* 字间距 */
}

.stat-value {
  font-size: 11px;                   /* 字体大小 */
  font-weight: 600;                 /* 字体粗细 */
  color: #333;                      /* 深灰色 */
}

.stat-total, .stat-unit {
  font-size: 9px;                   /* 字体大小 */
  color: #999;                      /* 浅灰色 */
  font-weight: 400;                 /* 字体粗细 */
}

.status-badge {
  margin-left: auto;                 /* 左侧自动间距 */
  color: #1A936F;                  /* 绿色 */
  display: flex;                     /* 使用 Flexbox 布局 */
  align-items: center;              /* 垂直居中 */
}

/* 动作按钮 */
.action-btn {
  display: inline-flex;               /* 内联 Flexbox 布局 */
  align-items: center;              /* 垂直居中 */
  gap: 8px;                         /* 元素之间的间距 */
  padding: 10px 20px;               /* 内边距 */
  font-size: 13px;                   /* 字体大小 */
  font-weight: 600;                 /* 字体粗细 */
  border: none;                      /* 无边框 */
  border-radius: 4px;                /* 圆角 */
  cursor: pointer;                   /* 鼠标指针为手型 */
  transition: all 0.2s ease;       /* 过渡动画 */
  text-transform: uppercase;          /* 大写 */
  letter-spacing: 0.05em;           /* 字间距 */
}

.action-btn.primary {
  background: #000;                  /* 黑色背景 */
  color: #FFF;                      /* 白色文字 */
}

.action-btn.primary:hover:not(:disabled) {
  background: #333;                  /* 深灰色背景 */
}

.action-btn:disabled {
  opacity: 0.3;                      /* 透明度 */
  cursor: not-allowed;              /* 鼠标指针为禁止 */
}

/* --- 主内容区域 --- */
.main-content-area {
  flex: 1;                          /* 占据剩余空间 */
  overflow-y: auto;                  /* 垂直滚动 */
  position: relative;                /* 相对定位 */
  background: #FFF;                  /* 白色背景 */
}

/* 时间轴头部 */
.timeline-header {
  position: sticky;                  /* 粘性定位 */
  top: 0;                           /* 顶部对齐 */
  background: rgba(255, 255, 255, 0.9);  /* 半透明白色背景 */
  backdrop-filter: blur(8px);         /* 背景模糊 */
  padding: 12px 24px;               /* 内边距 */
  border-bottom: 1px solid #EAEAEA; /* 底部实线边框 */
  z-index: 5;                       /* 层级 */
  display: flex;                     /* 使用 Flexbox 布局 */
  justify-content: center;          /* 水平居中 */
}

.timeline-stats {
  display: flex;                     /* 使用 Flexbox 布局 */
  align-items: center;              /* 垂直居中 */
  gap: 16px;                        /* 元素之间的间距 */
  font-size: 11px;                   /* 字体大小 */
  color: #666;                      /* 深灰色 */
  background: #F5F5F5;             /* 浅灰色背景 */
  padding: 4px 12px;                /* 内边距 */
  border-radius: 20px;              /* 圆角 */
}

.total-count {
  font-weight: 600;                 /* 字体粗细 */
  color: #333;                      /* 深灰色 */
}

.platform-breakdown {
  display: flex;                     /* 使用 Flexbox 布局 */
  align-items: center;              /* 垂直居中 */
  gap: 8px;                         /* 元素之间的间距 */
}

.breakdown-item {
  display: flex;                     /* 使用 Flexbox 布局 */
  align-items: center;              /* 垂直居中 */
  gap: 4px;                         /* 元素之间的间距 */
}

.breakdown-divider { color: #DDD; }  /* 分隔符颜色 */
.breakdown-item.twitter { color: #000; }  /* Twitter 平台颜色 */
.breakdown-item.reddit { color: #000; }   /* Reddit 平台颜色 */

/* --- 时间轴信息流 --- */
.timeline-feed {
  padding: 24px 0;                 /* 上下内边距 */
  position: relative;                /* 相对定位 */
  min-height: 100%;                  /* 最小高度 */
  max-width: 900px;                 /* 最大宽度 */
  margin: 0 auto;                   /* 水平居中 */
}

.timeline-axis {
  position: absolute;                /* 绝对定位 */
  left: 50%;                        /* 左侧居中 */
  top: 0;                           /* 顶部对齐 */
  bottom: 0;                        /* 底部对齐 */
  width: 1px;                       /* 宽度 */
  background: #EAEAEA;              /* 浅灰色背景（更清晰的线条） */
  transform: translateX(-50%);      /* 水平居中 */
}

.timeline-item {
  display: flex;                     /* 使用 Flexbox 布局 */
  justify-content: center;          /* 水平居中 */
  margin-bottom: 32px;               /* 底部间距 */
  position: relative;                /* 相对定位 */
  width: 100%;                      /* 宽度占满 */
}

.timeline-marker {
  position: absolute;                /* 绝对定位 */
  left: 50%;                        /* 左侧居中 */
  top: 24px;                        /* 顶部偏移 */
  width: 10px;                      /* 宽度 */
  height: 10px;                     /* 高度 */
  background: #FFF;                  /* 白色背景 */
  border: 1px solid #CCC;           /* 浅灰色边框 */
  border-radius: 50%;                /* 圆形 */
  transform: translateX(-50%);      /* 水平居中 */
  z-index: 2;                       /* 层级 */
  display: flex;                     /* 使用 Flexbox 布局 */
  align-items: center;              /* 垂直居中 */
  justify-content: center;          /* 水平居中 */
}

.marker-dot {
  width: 4px;                       /* 宽度 */
  height: 4px;                      /* 高度 */
  background: #CCC;                  /* 浅灰色背景 */
  border-radius: 50%;                /* 圆形 */
}

/* Twitter 平台的时间轴标记 */
.timeline-item.twitter .marker-dot { background: #000; }  /* 黑色 */
.timeline-item.twitter .timeline-marker { border-color: #000; }  /* 黑色边框 */

/* Reddit 平台的时间轴标记 */
.timeline-item.reddit .marker-dot { background: #000; }   /* 黑色 */
.timeline-item.reddit .timeline-marker { border-color: #000; }   /* 黑色边框 */

/* 卡片布局 */
.timeline-card {
  width: calc(100% - 48px);         /* 宽度 */
  background: #FFF;                  /* 白色背景 */
  border-radius: 2px;                /* 圆角 */
  padding: 16px 20px;                /* 内边距 */
  border: 1px solid #EAEAEA;        /* 浅灰色边框 */
  box-shadow: 0 2px 10px rgba(0,0,0,0.02);  /* 阴影效果 */
  position: relative;                /* 相对定位 */
  transition: all 0.2s;              /* 过渡动画 */
}

.timeline-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);  /* 悬停时的阴影效果 */
  border-color: #DDD;                /* 悬停时的边框颜色 */
}

/* 左侧（Twitter） */
.timeline-item.twitter {
  justify-content: flex-start;        /* 左对齐 */
  padding-right: 50%;               /* 右侧内边距 */
}
.timeline-item.twitter .timeline-card {
  margin-left: auto;                /* 左侧自动间距 */
  margin-right: 32px;               /* 右侧间距（与时间轴的间距） */
}

/* 右侧（Reddit） */
.timeline-item.reddit {
  justify-content: flex-end;         /* 右对齐 */
  padding-left: 50%;                /* 左侧内边距 */
}
.timeline-item.reddit .timeline-card {
  margin-right: auto;               /* 右侧自动间距 */
  margin-left: 32px;                /* 左侧间距（与时间轴的间距） */
}

/* 卡片内容样式 */
.card-header {
  display: flex;                     /* 使用 Flexbox 布局 */
  justify-content: space-between;    /* 两端对齐 */
  align-items: flex-start;          /* 顶部对齐 */
  margin-bottom: 12px;              /* 底部间距 */
  padding-bottom: 12px;             /* 底部内边距 */
  border-bottom: 1px solid #F5F5F5; /* 底部实线边框 */
}

.agent-info {
  display: flex;                     /* 使用 Flexbox 布局 */
  align-items: center;              /* 垂直居中 */
  gap: 10px;                        /* 元素之间的间距 */
}

.avatar-placeholder {
  width: 24px;                      /* 宽度 */
  height: 24px;                     /* 高度 */
  background: #000;                  /* 黑色背景 */
  color: #FFF;                      /* 白色文字 */
  border-radius: 50%;                /* 圆形 */
  display: flex;                     /* 使用 Flexbox 布局 */
  align-items: center;              /* 垂直居中 */
  justify-content: center;          /* 水平居中 */
  font-size: 12px;                   /* 字体大小 */
  font-weight: 700;                 /* 字体粗细 */
  text-transform: uppercase;          /* 大写 */
}

.agent-name {
  font-size: 13px;                   /* 字体大小 */
  font-weight: 600;                 /* 字体粗细 */
  color: #000;                      /* 黑色 */
}

.header-meta {
  display: flex;                     /* 使用 Flexbox 布局 */
  align-items: center;              /* 垂直居中 */
  gap: 8px;                         /* 元素之间的间距 */
}

.platform-indicator {
  color: #999;                      /* 浅灰色 */
  display: flex;                     /* 使用 Flexbox 布局 */
  align-items: center;              /* 垂直居中 */
}

.action-badge {
  font-size: 9px;                    /* 字体大小 */
  padding: 2px 6px;                 /* 内边距 */
  border-radius: 2px;                /* 圆角 */
  font-weight: 600;                 /* 字体粗细 */
  text-transform: uppercase;          /* 大写 */
  letter-spacing: 0.05em;           /* 字间距 */
  border: 1px solid transparent;     /* 透明边框 */
}

/* 单色徽章样式 */
.badge-post { background: #F0F0F0; color: #333; border-color: #E0E0E0; }  /* 帖子徽章 */
.badge-comment { background: #F0F0F0; color: #666; border-color: #E0E0E0; }  /* 评论徽章 */
.badge-action { background: #FFF; color: #666; border: 1px solid #E0E0E0; }  /* 动作徽章 */
.badge-meta { background: #FAFAFA; color: #999; border: 1px dashed #DDD; }  /* 元数据徽章 */
.badge-idle { opacity: 0.5; }  /* 静默徽章 */

.content-text {
  font-size: 13px;                   /* 字体大小 */
  line-height: 1.6;                 /* 行高 */
  color: #333;                      /* 深灰色 */
  margin-bottom: 10px;              /* 底部间距 */
}

.content-text.main-text {
  font-size: 14px;                   /* 字体大小 */
  color: #000;                      /* 黑色 */
}

/* 信息块（引用、转发等） */
.quoted-block, .repost-content {
  background: #F9F9F9;             /* 浅灰色背景 */
  border: 1px solid #EEE;           /* 浅灰色边框 */
  padding: 10px 12px;               /* 内边距 */
  border-radius: 2px;                /* 圆角 */
  margin-top: 8px;                  /* 顶部间距 */
  font-size: 12px;                   /* 字体大小 */
  color: #555;                      /* 深灰色 */
}

.quote-header, .repost-info, .like-info, .search-info, .follow-info, .vote-info, .idle-info, .comment-context {
  display: flex;                     /* 使用 Flexbox 布局 */
  align-items: center;              /* 垂直居中 */
  gap: 6px;                         /* 元素之间的间距 */
  margin-bottom: 6px;                /* 底部间距 */
  font-size: 11px;                   /* 字体大小 */
  color: #666;                      /* 深灰色 */
}

.icon-small {
  color: #999;                      /* 浅灰色 */
}
.icon-small.filled {
  color: #999;                      /* 浅灰色（除非高亮，否则保持中性） */
}

.search-query {
  font-family: 'JetBrains Mono', monospace;  /* 等宽字体 */
  background: #F0F0F0;             /* 浅灰色背景 */
  padding: 0 4px;                   /* 内边距 */
  border-radius: 2px;                /* 圆角 */
}

.card-footer {
  margin-top: 12px;                 /* 顶部间距 */
  display: flex;                     /* 使用 Flexbox 布局 */
  justify-content: flex-end;         /* 右对齐 */
  font-size: 10px;                   /* 字体大小 */
  color: #BBB;                      /* 浅灰色 */
  font-family: 'JetBrains Mono', monospace;  /* 等宽字体 */
}

/* 等待状态 */
.waiting-state {
  position: absolute;                /* 绝对定位 */
  top: 50%;                         /* 垂直居中 */
  left: 50%;                        /* 水平居中 */
  transform: translate(-50%, -50%); /* 居中 */
  display: flex;                     /* 使用 Flexbox 布局 */
  flex-direction: column;          /* 垂直方向排列 */
  align-items: center;              /* 水平居中 */
  gap: 16px;                        /* 元素之间的间距 */
  color: #CCC;                      /* 浅灰色 */
  font-size: 12px;                   /* 字体大小 */
  text-transform: uppercase;          /* 大写 */
  letter-spacing: 0.1em;           /* 字间距 */
}

.pulse-ring {
  width: 32px;                      /* 宽度 */
  height: 32px;                     /* 高度 */
  border-radius: 50%;                /* 圆形 */
  border: 1px solid #EAEAEA;        /* 浅灰色边框 */
  animation: ripple 2s infinite;      /* 涟漪动画 */
}

/* 涟漪动画关键帧 */
@keyframes ripple {
  0% { transform: scale(0.8); opacity: 1; border-color: #CCC; }  /* 初始状态 */
  100% { transform: scale(2.5); opacity: 0; border-color: #EAEAEA; }  /* 最终状态 */
}

/* 动画 */
.timeline-item-enter-active,
.timeline-item-leave-active {
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);  /* 过渡动画 */
}

.timeline-item-enter-from {
  opacity: 0;                        /* 透明 */
  transform: translateY(20px);       /* 向下偏移 */
}

.timeline-item-leave-to {
  opacity: 0;                        /* 透明 */
}

/* 日志区域 */
.system-logs {
  background: #000;                  /* 黑色背景 */
  color: #DDD;                      /* 浅灰色文字 */
  padding: 16px;                    /* 内边距 */
  font-family: 'JetBrains Mono', monospace;  /* 等宽字体 */
  border-top: 1px solid #222;       /* 顶部实线边框 */
  flex-shrink: 0;                   /* 不收缩 */
}

.log-header {
  display: flex;                     /* 使用 Flexbox 布局 */
  justify-content: space-between;    /* 两端对齐 */
  border-bottom: 1px solid #333;    /* 底部实线边框 */
  padding-bottom: 8px;              /* 底部内边距 */
  margin-bottom: 8px;               /* 底部间距 */
  font-size: 10px;                   /* 字体大小 */
  color: #666;                      /* 深灰色 */
}

.log-content {
  display: flex;                     /* 使用 Flexbox 布局 */
  flex-direction: column;          /* 垂直方向排列 */
  gap: 4px;                         /* 元素之间的间距 */
  height: 100px;                    /* 高度 */
  overflow-y: auto;                  /* 垂直滚动 */
  padding-right: 4px;                /* 右侧内边距 */
}

/* 自定义滚动条样式 */
.log-content::-webkit-scrollbar { width: 4px; }  /* 滚动条宽度 */
.log-content::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }  /* 滚动条滑块 */

.log-line {
  font-size: 11px;                   /* 字体大小 */
  display: flex;                     /* 使用 Flexbox 布局 */
  gap: 12px;                        /* 元素之间的间距 */
  line-height: 1.5;                 /* 行高 */
}

.log-time { color: #555; min-width: 75px; }  /* 日志时间颜色和最小宽度 */
.log-msg { color: #BBB; word-break: break-all; }  /* 日志消息颜色和换行 */
.mono { font-family: 'JetBrains Mono', monospace; }  /* 等宽字体 */

/* 按钮的小型加载动画 */
.loading-spinner-small {
  display: inline-block;              /* 内联块 */
  width: 14px;                      /* 宽度 */
  height: 14px;                     /* 高度 */
  border: 2px solid rgba(255, 255, 255, 0.3);  /* 半透明白色边框 */
  border-top-color: #FFF;            /* 白色顶部边框 */
  border-radius: 50%;                /* 圆形 */
  animation: spin 0.8s linear infinite;  /* 旋转动画 */
  margin-right: 6px;                 /* 右侧间距 */
}

/* 旋转动画关键帧 */
@keyframes spin {
  from { transform: rotate(0deg); }  /* 初始角度 */
  to { transform: rotate(360deg); }  /* 最终角度 */
}
</style>