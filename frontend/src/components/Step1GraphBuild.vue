<template>
  <!-- 工作台主面板：展示知识图谱构建的三个步骤流程 -->
  <div class="workbench-panel">
    <!-- 滚动容器：包含所有步骤卡片 -->
    <div class="scroll-container">
      <!-- 步骤 01：本体生成 -->
      <!-- 使用动态类名绑定：active 表示当前正在进行的步骤，completed 表示已完成的步骤 -->
      <div class="step-card" :class="{ 'active': currentPhase === 0, 'completed': currentPhase > 0 }">
        <!-- 卡片头部：显示步骤编号、标题和状态 -->
        <div class="card-header">
          <div class="step-info">
            <span class="step-num">01</span>
            <span class="step-title">本体生成</span>
          </div>
          <div class="step-status">
            <!-- 根据当前阶段显示不同的状态徽章 -->
            <span v-if="currentPhase > 0" class="badge success">已完成</span>
            <span v-else-if="currentPhase === 0" class="badge processing">生成中</span>
            <span v-else class="badge pending">等待</span>
          </div>
        </div>
        
        <!-- 卡片内容：包含 API 说明、描述、进度和生成的实体/关系标签 -->
        <div class="card-content">
          <!-- API 端点说明：使用等宽字体显示 -->
          <p class="api-note">POST /api/graph/ontology/generate</p>
          <!-- 步骤描述：解释本体生成的作用 -->
          <p class="description">
            LLM分析文档内容与模拟需求，提取出现实种子，自动生成合适的本体结构
          </p>

          <!-- 加载进度显示：仅在当前阶段为 0 且有进度信息时显示 -->
          <div v-if="currentPhase === 0 && ontologyProgress" class="progress-section">
            <!-- 小型旋转加载动画 -->
            <div class="spinner-sm"></div>
            <!-- 进度消息：显示当前正在执行的操作 -->
            <span>{{ ontologyProgress.message || '正在分析文档...' }}</span>
          </div>

          <!-- 本体详情覆盖层：点击实体或关系标签后显示详细信息 -->
          <div v-if="selectedOntologyItem" class="ontology-detail-overlay">
            <!-- 详情头部：显示类型、名称和关闭按钮 -->
            <div class="detail-header">
               <div class="detail-title-group">
                  <!-- 类型徽章：实体或关系 -->
                  <span class="detail-type-badge">{{ selectedOntologyItem.itemType === 'entity' ? '实体' : '关系' }}</span>
                  <!-- 本体项名称 -->
                  <span class="detail-name">{{ selectedOntologyItem.name }}</span>
               </div>
               <!-- 关闭按钮：点击关闭详情覆盖层 -->
               <button class="close-btn" @click="selectedOntologyItem = null">×</button>
            </div>
            <!-- 详情主体：包含描述、属性、示例和连接信息 -->
            <div class="detail-body">
               <!-- 本体项描述 -->
               <div class="detail-desc">{{ selectedOntologyItem.description }}</div>
               
               <!-- 属性列表：仅当有属性时显示 -->
               <div class="detail-section" v-if="selectedOntologyItem.attributes?.length">
                  <span class="section-label">属性</span>
                  <div class="attr-list">
                     <!-- 遍历显示每个属性 -->
                     <div v-for="attr in selectedOntologyItem.attributes" :key="attr.name" class="attr-item">
                        <!-- 属性名称 -->
                        <span class="attr-name">{{ attr.name }}</span>
                        <!-- 属性类型 -->
                        <span class="attr-type">({{ attr.type }})</span>
                        <!-- 属性描述 -->
                        <span class="attr-desc">{{ attr.description }}</span>
                     </div>
                  </div>
               </div>

               <!-- 示例列表：仅当有示例时显示（主要用于实体类型） -->
               <div class="detail-section" v-if="selectedOntologyItem.examples?.length">
                  <span class="section-label">示例</span>
                  <div class="example-list">
                     <!-- 遍历显示每个示例标签 -->
                     <span v-for="ex in selectedOntologyItem.examples" :key="ex" class="example-tag">{{ ex }}</span>
                  </div>
               </div>

               <!-- 连接列表：仅当有源-目标对时显示（主要用于关系类型） -->
               <div class="detail-section" v-if="selectedOntologyItem.source_targets?.length">
                  <span class="section-label">连接</span>
                  <div class="conn-list">
                     <!-- 遍历显示每个连接 -->
                     <div v-for="(conn, idx) in selectedOntologyItem.source_targets" :key="idx" class="conn-item">
                        <!-- 源节点 -->
                        <span class="conn-node">{{ conn.source }}</span>
                        <!-- 箭头 -->
                        <span class="conn-arrow">→</span>
                        <!-- 目标节点 -->
                        <span class="conn-node">{{ conn.target }}</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          <!-- 生成的实体类型标签容器 -->
          <!-- 使用 dimmed 类在显示详情时降低透明度 -->
          <div v-if="projectData?.ontology?.entity_types" class="tags-container" :class="{ 'dimmed': selectedOntologyItem }">
            <span class="tag-label">生成的实体类型</span>
            <div class="tags-list">
              <!-- 遍历显示每个实体类型标签 -->
              <span 
                v-for="entity in projectData.ontology.entity_types" 
                :key="entity.name" 
                class="entity-tag clickable"
                @click="selectOntologyItem(entity, 'entity')"
              >
                {{ entity.name }}
              </span>
            </div>
          </div>

          <!-- 生成的关系类型标签容器 -->
          <div v-if="projectData?.ontology?.edge_types" class="tags-container" :class="{ 'dimmed': selectedOntologyItem }">
            <span class="tag-label">生成的关系类型</span>
            <div class="tags-list">
              <!-- 遍历显示每个关系类型标签 -->
              <span 
                v-for="rel in projectData.ontology.edge_types" 
                :key="rel.name" 
                class="entity-tag clickable"
                @click="selectOntologyItem(rel, 'relation')"
              >
                {{ rel.name }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 步骤 02：GraphRAG 构建 -->
      <div class="step-card" :class="{ 'active': currentPhase === 1, 'completed': currentPhase > 1 }">
        <div class="card-header">
          <div class="step-info">
            <span class="step-num">02</span>
            <span class="step-title">GraphRAG构建</span>
          </div>
          <div class="step-status">
            <!-- 显示构建进度百分比 -->
            <span v-if="currentPhase > 1" class="badge success">已完成</span>
            <span v-else-if="currentPhase === 1" class="badge processing">{{ buildProgress?.progress || 0 }}%</span>
            <span v-else class="badge pending">等待</span>
          </div>
        </div>

        <div class="card-content">
          <p class="api-note">POST /api/graph/build</p>
          <p class="description">
            基于生成的本体，将文档自动分块后调用 Zep 构建知识图谱，提取实体和关系，并形成时序记忆与社区摘要
          </p>
          
          <!-- 统计卡片网格：显示图谱的关键指标 -->
          <div class="stats-grid">
            <!-- 实体节点数量 -->
            <div class="stat-card">
              <span class="stat-value">{{ graphStats.nodes }}</span>
              <span class="stat-label">实体节点</span>
            </div>
            <!-- 关系边数量 -->
            <div class="stat-card">
              <span class="stat-value">{{ graphStats.edges }}</span>
              <span class="stat-label">关系边</span>
            </div>
            <!-- Schema 类型数量 -->
            <div class="stat-card">
              <span class="stat-value">{{ graphStats.types }}</span>
              <span class="stat-label">Schema类型</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 步骤 03：构建完成 -->
      <div class="step-card" :class="{ 'active': currentPhase === 2, 'completed': currentPhase >= 2 }">
        <div class="card-header">
          <div class="step-info">
            <span class="step-num">03</span>
            <span class="step-title">构建完成</span>
          </div>
          <div class="step-status">
            <span v-if="currentPhase >= 2" class="badge accent">进行中</span>
          </div>
        </div>
        
        <div class="card-content">
          <p class="api-note">POST /api/simulation/create</p>
          <p class="description">图谱构建已完成，请进入下一步进行模拟环境搭建</p>
          <!-- 操作按钮：点击进入环境搭建 -->
          <button 
            class="action-btn" 
            :disabled="currentPhase < 2 || creatingSimulation"
            @click="handleEnterEnvSetup"
          >
            <!-- 创建中显示加载动画 -->
            <span v-if="creatingSimulation" class="spinner-sm"></span>
            {{ creatingSimulation ? '创建中...' : '进入环境搭建 ➝' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 底部系统日志面板 -->
    <div class="system-logs">
      <!-- 日志头部：显示标题和项目 ID -->
      <div class="log-header">
        <span class="log-title">系统面板</span>
        <span class="log-id">{{ projectData?.project_id || '无项目' }}</span>
      </div>
      <!-- 日志内容区域：显示系统运行日志 -->
      <div class="log-content" ref="logContent">
        <!-- 遍历显示每条日志 -->
        <div class="log-line" v-for="(log, idx) in systemLogs" :key="idx">
          <!-- 日志时间戳 -->
          <span class="log-time">{{ log.time }}</span>
          <!-- 日志消息 -->
          <span class="log-msg">{{ log.msg }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 导入 Vue 3 的响应式 API：computed、ref、watch、nextTick
import { computed, ref, watch, nextTick } from 'vue'
// 导入 Vue Router 用于页面导航
import { useRouter } from 'vue-router'
// 导入模拟相关的 API 函数
import { createSimulation } from '../api/simulation'

// 获取路由实例，用于页面跳转
const router = useRouter()

// 定义组件的 props：接收父组件传递的数据
const props = defineProps({
  currentPhase: { type: Number, default: 0 },      // 当前阶段：0=本体生成，1=GraphRAG构建，2=构建完成
  projectData: Object,                             // 项目数据对象，包含项目 ID、图谱 ID、本体信息等
  ontologyProgress: Object,                        // 本体生成进度信息
  buildProgress: Object,                           // GraphRAG 构建进度信息
  graphData: Object,                               // 图谱数据，包含节点和边的统计信息
  systemLogs: { type: Array, default: () => [] }  // 系统日志数组
})

// 定义组件的事件：向父组件发送事件
// 
// Vue 3 的 defineEmits API 用于声明组件可以触发的事件
// 父组件可以通过 v-on 或 @ 来监听这些事件
// 这里定义了 'next-step' 事件，用于通知父组件进入下一步
defineEmits(['next-step'])

// 响应式状态：当前选中的本体项（实体或关系），用于显示详情覆盖层
// 
// ref() 是 Vue 3 的响应式 API，用于创建响应式引用
// 当 selectedOntologyItem.value 的值变化时，Vue 会自动更新相关的 UI
// 这里用于控制详情覆盖层的显示和隐藏
const selectedOntologyItem = ref(null)
// 响应式状态：日志内容容器的引用，用于自动滚动
// 
// ref() 也可以用于获取 DOM 元素的引用
// 通过 ref="logContent" 在模板中绑定，然后在脚本中通过 logContent.value 访问
// 这里用于获取日志容器的 DOM 元素，实现自动滚动功能
const logContent = ref(null)
// 响应式状态：是否正在创建模拟，用于显示加载状态
// 
// 这个布尔值用于控制按钮的加载状态和禁用状态
// 当 creatingSimulation.value 为 true 时，显示加载动画并禁用按钮
const creatingSimulation = ref(false)

// 进入环境搭建 - 创建 simulation 并跳转到模拟页面
// 
// 这是一个异步函数，用于创建模拟环境并跳转到模拟页面
// 异步函数使用 async/await 语法，可以更优雅地处理异步操作
// 
// 主要步骤：
// 1. 验证必要的数据是否存在（项目 ID 和图谱 ID）
// 2. 调用 API 创建模拟环境
// 3. 如果创建成功，使用 Vue Router 跳转到模拟页面
// 4. 如果创建失败，显示错误信息
// 5. 无论成功或失败，都重置创建状态
const handleEnterEnvSetup = async () => {
  // 验证必要的数据是否存在
  // 使用可选链操作符 (?.) 安全地访问嵌套属性
  // 如果 projectData、project_id 或 graph_id 不存在，则返回 undefined
  if (!props.projectData?.project_id || !props.projectData?.graph_id) {
    console.error('缺少项目或图谱信息')
    return
  }
  
  // 设置创建状态为 true，显示加载动画
  // 这会触发 UI 更新，显示加载动画并禁用按钮
  creatingSimulation.value = true
  
  try {
    // 调用 API 创建模拟环境
    // await 关键字会暂停函数执行，直到 Promise 完成
    // createSimulation 函数返回一个 Promise，包含创建结果
    const res = await createSimulation({
      project_id: props.projectData.project_id,  // 项目 ID：用于标识项目
      graph_id: props.projectData.graph_id,      // 图谱 ID：用于标识知识图谱
      enable_twitter: true,                      // 启用 Twitter 数据源：从 Twitter 获取数据
      enable_reddit: true                        // 启用 Reddit 数据源：从 Reddit 获取数据
    })
    
    // 如果创建成功且有模拟 ID，则跳转到模拟页面
    // 使用可选链操作符 (?.) 安全地访问嵌套属性
    // res.success 表示 API 调用是否成功
    // res.data?.simulation_id 表示模拟 ID 是否存在
    if (res.success && res.data?.simulation_id) {
      // 使用 Vue Router 进行页面跳转
      // router.push() 方法会向历史记录添加一个新的条目
      // name: 'Simulation' 表示跳转到名为 'Simulation' 的路由
      // params: { simulationId: ... } 表示传递路由参数
      router.push({
        name: 'Simulation',
        params: { simulationId: res.data.simulation_id }
      })
    } else {
      // 创建失败，显示错误信息
      console.error('创建模拟失败:', res.error)
      // alert() 是浏览器的原生弹窗，用于显示错误信息
      // 在实际项目中，建议使用更友好的错误提示组件
      alert('创建模拟失败: ' + (res.error || '未知错误'))
    }
  } catch (err) {
    // 捕获异常并显示错误信息
    // catch 块用于捕获 try 块中抛出的异常
    // err 是异常对象，包含错误信息
    console.error('创建模拟异常:', err)
    alert('创建模拟异常: ' + err.message)
  } finally {
    // 无论成功或失败，都重置创建状态
    // finally 块会在 try/catch 块执行完毕后执行
    // 无论是否抛出异常，finally 块都会执行
    // 这里用于重置加载状态，恢复按钮的可用性
    creatingSimulation.value = false
  }
}

// 选择本体项并显示详情
// 
// 这个函数用于处理用户点击实体或关系标签的事件
// 当用户点击标签时，会显示一个详情覆盖层，展示该本体项的详细信息
// 
// 参数：
//   item: 本体项对象（实体或关系）
//         包含 name、description、attributes、examples、source_targets 等属性
//   type: 类型标识，'entity' 或 'relation'
//         用于区分是实体类型还是关系类型
const selectOntologyItem = (item, type) => {
  // 创建本体项的副本，添加 itemType 字段用于区分类型
  // 
  // 使用展开运算符 (...) 创建对象的浅拷贝
  // 这样可以避免直接修改原始对象，保持数据的不可变性
  // 添加 itemType 字段后，可以在详情覆盖层中显示正确的类型徽章
  selectedOntologyItem.value = { ...item, itemType: type }
}

// 计算属性：从图谱数据中提取统计信息
// 
// computed() 是 Vue 3 的响应式 API，用于创建计算属性
// 计算属性会自动缓存，只有依赖的响应式数据变化时才会重新计算
// 这样可以提高性能，避免不必要的重复计算
// 
// 计算属性返回一个对象，包含三个统计指标：
// - nodes: 实体节点数量
// - edges: 关系边数量
// - types: Schema 类型数量
const graphStats = computed(() => {
  // 获取节点数量：优先使用 node_count，其次使用 nodes 数组长度
  // 
  // 使用可选链操作符 (?.) 安全地访问嵌套属性
  // 使用逻辑或操作符 (||) 提供默认值
  // 这样可以避免在数据不存在时出现 undefined 或 null
  const nodes = props.graphData?.node_count || props.graphData?.nodes?.length || 0
  // 获取边数量：优先使用 edge_count，其次使用 edges 数组长度
  const edges = props.graphData?.edge_count || props.graphData?.edges?.length || 0
  // 获取 Schema 类型数量：使用本体中的实体类型数量
  // 
  // Schema（模式）是知识图谱的结构定义
  // 实体类型定义了图谱中可以存在的实体种类
  // 这里统计实体类型的数量，用于显示在统计卡片中
  const types = props.projectData?.ontology?.entity_types?.length || 0
  return { nodes, edges, types }
})

// 格式化日期时间为时间戳字符串
// 
// 这个函数用于将日期字符串格式化为时间戳格式
// 时间戳格式为 HH:MM:SS.mmm，其中：
// - HH: 小时（24 小时制）
// - MM: 分钟
// - SS: 秒
// - mmm: 毫秒（3 位数字）
// 
// 参数：
//   dateStr: 日期字符串，可以是 ISO 8601 格式或其他格式
// 返回：格式化的时间字符串，格式为 HH:MM:SS.mmm
//         如果 dateStr 为空或无效，则返回 '--:--:--'
const formatDate = (dateStr) => {
  // 检查日期字符串是否有效
  if (!dateStr) return '--:--:--'
  
  // 创建 Date 对象
  // Date 对象是 JavaScript 的内置对象，用于处理日期和时间
  // 可以接受多种格式的日期字符串
  const d = new Date(dateStr)
  
  // 返回 24 小时制的时间，包含毫秒
  // 
  // toLocaleTimeString() 方法将 Date 对象转换为本地时间字符串
  // 参数说明：
  // - 'en-US': 使用美国英语的格式
  // - { hour12: false }: 使用 24 小时制（false）或 12 小时制（true）
  // getMilliseconds() 方法返回毫秒部分（0-999）
  // 使用字符串拼接 (+) 将时间和毫秒连接起来
  return d.toLocaleTimeString('en-US', { hour12: false }) + '.' + d.getMilliseconds()
}

// 监听系统日志数组的变化，自动滚动到最新日志
// 
// watch() 是 Vue 3 的响应式 API，用于监听响应式数据的变化
// 当被监听的数据变化时，watch 的回调函数会被调用
// 
// 这里监听的是 props.systemLogs.length，即日志数组的长度
// 当有新日志添加到数组时，长度会变化，触发 watch 回调
// 
// 使用 watch 的好处：
// 1. 响应式：自动监听数据变化，无需手动触发
// 2. 解耦：将日志更新逻辑与日志添加逻辑分离
// 3. 性能：Vue 会优化 watch 的执行，避免不必要的重复调用
watch(() => props.systemLogs.length, () => {
  // 使用 nextTick 确保 DOM 更新后再滚动
  // 
  // nextTick() 是 Vue 3 的异步 API，用于在 DOM 更新后执行回调
  // Vue 的响应式更新是异步的，多个状态更新会被合并为一次 DOM 更新
  // nextTick() 会在 DOM 更新完成后执行，确保可以访问最新的 DOM
  // 
  // 这里使用 nextTick 的原因：
  // 1. 确保日志元素已经渲染到 DOM 中
  // 2. 确保 scrollHeight 属性已经更新（包含新日志的高度）
  // 3. 避免在 DOM 未更新时滚动，导致滚动位置不正确
  nextTick(() => {
    // 检查日志容器是否存在
    if (logContent.value) {
      // 将滚动条滚动到底部，显示最新的日志
      // 
      // scrollTop 属性表示滚动条的垂直位置
      // scrollHeight 属性表示元素的总高度（包括不可见部分）
      // 将 scrollTop 设置为 scrollHeight，可以滚动到最底部
      // 
      // 这样可以确保用户始终看到最新的日志消息
      // 这对于实时日志系统非常重要，提升用户体验
      logContent.value.scrollTop = logContent.value.scrollHeight
    }
  })
})
</script>

<style scoped>
/* 
 * 工作台主面板样式
 * 
 * 这是整个组件的根容器，包含所有步骤卡片和日志面板
 * 使用 scoped 属性确保样式只作用于当前组件，不会影响其他组件
 */
.workbench-panel {
  height: 100%;                    /* 占满父容器高度：确保组件填满可用空间 */
  background-color: #FAFAFA;       /* 浅灰色背景，减少视觉疲劳 */
  display: flex;                   /* 使用 Flexbox 布局：现代 CSS 布局方式，提供灵活的排列和对齐 */
  flex-direction: column;          /* 垂直方向排列子元素：从上到下排列 */
  position: relative;              /* 相对定位：为绝对定位的子元素提供定位参考 */
  overflow: hidden;               /* 隐藏溢出内容：防止出现滚动条，滚动由子容器处理 */
}

/* 
 * 滚动容器样式：包含所有步骤卡片
 * 
 * 这个容器负责处理垂直滚动，确保内容过多时可以滚动查看
 * 使用 flex: 1 占据剩余空间，使日志面板固定在底部
 */
.scroll-container {
  flex: 1;                         /* 占据剩余空间：flex: 1 表示占据父容器中所有可用的剩余空间 */
  overflow-y: auto;                /* 允许垂直滚动：当内容超过容器高度时显示垂直滚动条 */
  padding: 24px;                   /* 内边距：为内容提供呼吸空间 */
  display: flex;                   /* 使用 Flexbox 布局：子元素水平排列 */
  flex-direction: column;          /* 垂直方向排列卡片：从上到下排列 */
  gap: 20px;                       /* 卡片之间的间距：使用 gap 属性设置子元素之间的间距 */
}

/* 
 * 步骤卡片样式
 * 
 * 每个步骤卡片代表知识图谱构建的一个阶段
 * 使用卡片设计模式，提供清晰的视觉层次和分组
 */
.step-card {
  background: #FFF;                /* 白色背景：与浅灰色背景形成对比，突出显示 */
  border-radius: 8px;              /* 圆角边框：8px 的圆角使卡片边角圆润，更现代 */
  padding: 20px;                   /* 内边距：为内容提供呼吸空间 */
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);  /* 轻微阴影效果：创建层次感，使卡片浮起 */
  border: 1px solid #EAEAEA;      /* 浅灰色边框：定义卡片的边界 */
  transition: all 0.3s ease;      /* 所有属性变化的过渡动画：0.3 秒的缓动效果 */
  position: relative;              /* 相对定位：为详情覆盖层提供定位参考 */
}

/* 
 * 激活状态的卡片：当前正在进行的步骤
 * 
 * 激活状态的卡片使用橙色边框和阴影，突出显示当前步骤
 * 这有助于用户快速识别当前正在进行的操作
 */
.step-card.active {
  border-color: #FF5722;          /* 橙红色边框，突出显示：使用品牌色突出当前步骤 */
  box-shadow: 0 4px 12px rgba(255, 87, 34, 0.08);  /* 橙色阴影：增强浮起效果 */
}

/* 
 * 卡片头部样式
 * 
 * 卡片头部包含步骤编号、标题和状态徽章
 * 使用 Flexbox 布局实现两端对齐
 */
.card-header {
  display: flex;                   /* 使用 Flexbox 布局：子元素水平排列 */
  justify-content: space-between;  /* 两端对齐：左侧显示步骤信息，右侧显示状态 */
  align-items: center;            /* 垂直居中：子元素在垂直方向上居中对齐 */
  margin-bottom: 16px;             /* 底部间距：与卡片内容分隔 */
}

/* 
 * 步骤信息区域：编号和标题
 * 
 * 步骤信息区域显示步骤编号和标题
 * 使用 Flexbox 布局实现水平排列和垂直居中
 */
.step-info {
  display: flex;                   /* 使用 Flexbox 布局：子元素水平排列 */
  align-items: center;            /* 垂直居中：编号和标题在垂直方向上居中对齐 */
  gap: 12px;                       /* 编号和标题之间的间距：使用 gap 属性设置子元素之间的间距 */
}

/* 
 * 步骤编号样式
 * 
 * 步骤编号使用等宽字体，确保数字对齐
 * 未激活状态使用浅灰色，激活或完成状态使用黑色
 */
.step-num {
  font-family: 'JetBrains Mono', monospace;  /* 等宽字体：JetBrains Mono 是一款专为编程设计的等宽字体 */
  font-size: 20px;                 /* 字体大小：20px，较大字体突出显示 */
  font-weight: 700;                /* 字体粗细：700，粗体 */
  color: #E0E0E0;                  /* 浅灰色，未激活状态：降低视觉权重 */
}

/* 
 * 激活或完成状态的步骤编号
 * 
 * 当卡片处于激活或完成状态时，步骤编号使用黑色
 * 这样可以突出显示已完成或正在进行的步骤
 */
.step-card.active .step-num,
.step-card.completed .step-num {
  color: #000;                     /* 黑色，突出显示：提高对比度，增强可读性 */
}

/* 
 * 步骤标题样式
 * 
 * 步骤标题使用中等粗细和适当的字间距
 * 确保标题清晰易读
 */
.step-title {
  font-weight: 600;                /* 字体粗细：600，半粗体 */
  font-size: 14px;                 /* 字体大小：14px，适中的字体大小 */
  letter-spacing: 0.5px;           /* 字母间距：0.5px，增加字母之间的间距，使文字更易读 */
}

/* 
 * 状态徽章样式
 * 
 * 状态徽章显示步骤的当前状态（等待、处理中、已完成等）
 * 使用小字体和圆角设计，紧凑而清晰
 */
.badge {
  font-size: 10px;                 /* 小字体：10px，紧凑设计 */
  padding: 4px 8px;                /* 内边距：上下 4px，左右 8px */
  border-radius: 4px;              /* 圆角：4px，使徽章边角圆润 */
  font-weight: 600;                /* 字体粗细：600，半粗体 */
  text-transform: uppercase;       /* 大写字母：所有字母大写，统一风格 */
}

/* 
 * 成功状态徽章：绿色背景
 * 
 * 绿色表示步骤已完成，传达积极的视觉反馈
 */
.badge.success { background: #E8F5E9; color: #2E7D32; }
/* 
 * 处理中状态徽章：橙色背景
 * 
 * 橙色表示步骤正在进行中，吸引用户注意
 */
.badge.processing { background: #FF5722; color: #FFF; }
/* 
 * 强调状态徽章：橙色背景
 * 
 * 橙色用于强调特殊状态，如"进行中"
 */
.badge.accent { background: #FF5722; color: #FFF; }
/* 
 * 等待状态徽章：灰色背景
 * 
 * 灰色表示步骤尚未开始，降低视觉权重
 */
.badge.pending { background: #F5F5F5; color: #999; }

/* 
 * API 说明文字样式
 * 
 * API 说明显示当前步骤调用的 API 端点
 * 使用等宽字体确保代码对齐和可读性
 */
.api-note {
  font-family: 'JetBrains Mono', monospace;  /* 等宽字体：JetBrains Mono 是一款专为编程设计的等宽字体 */
  font-size: 10px;                 /* 小字体：10px，紧凑设计 */
  color: #999;                     /* 浅灰色 */
  margin-bottom: 8px;              /* 底部间距 */
}

/* 
 * 描述文字样式
 * 
 * 描述文字用于显示步骤的详细说明
 * 使用较小的字体和适当的行高，确保文字清晰易读
 */
.description {
  font-size: 12px;                 /* 字体大小：12px，适中的字体大小 */
  color: #666;                     /* 深灰色：降低视觉权重，不干扰主要内容 */
  line-height: 1.5;                /* 行高：1.5 倍行高，提高可读性 */
  margin-bottom: 16px;             /* 底部间距：与下方内容分隔 */
}

/* 
 * 步骤 01 的标签容器样式
 * 
 * 标签容器用于显示生成的实体类型和关系类型
 * 当用户点击某个标签时，会显示详情覆盖层
 * 此时标签容器会降低透明度，突出显示详情
 */
.tags-container {
  margin-top: 12px;                /* 顶部间距：与上方内容分隔 */
  transition: opacity 0.3s;       /* 透明度过渡动画：0.3 秒的缓动效果 */
}

/* 
 * 降低透明度的标签容器：显示详情时
 * 
 * 当详情覆盖层显示时，标签容器会降低透明度
 * 这样可以突出显示详情内容，避免视觉干扰
 * 同时禁用鼠标事件，防止用户在详情显示时点击标签
 */
.tags-container.dimmed {
    opacity: 0.3;                  /* 降低透明度：0.3 表示 30% 不透明度 */
    pointer-events: none;          /* 禁用鼠标事件：使标签不可点击 */
}

/* 
 * 标签标题样式
 * 
 * 标签标题用于标识标签的类型（实体类型或关系类型）
 * 使用小字体和浅灰色，降低视觉权重
 */
.tag-label {
  display: block;                  /* 块级元素：独占一行 */
  font-size: 10px;                 /* 小字体：10px，紧凑设计 */
  color: #AAA;                     /* 浅灰色：降低视觉权重 */
  margin-bottom: 8px;              /* 底部间距：与标签列表分隔 */
  font-weight: 600;                /* 字体粗细：600，半粗体 */
}

/* 
 * 标签列表样式
 * 
 * 标签列表使用 Flexbox 布局，支持自动换行
 * 这样可以确保标签在不同屏幕尺寸下都能良好显示
 */
.tags-list {
  display: flex;                   /* 使用 Flexbox 布局：子元素水平排列 */
  flex-wrap: wrap;                 /* 允许换行：当标签超出容器宽度时自动换行 */
  gap: 8px;                        /* 标签之间的间距：8px，适中的间距 */
}

/* 
 * 实体/关系标签样式
 * 
 * 标签使用浅灰色背景和边框，简洁而清晰
 * 使用等宽字体确保代码对齐和可读性
 * 添加过渡动画，提供平滑的悬停效果
 */
.entity-tag {
  background: #F5F5F5;             /* 浅灰色背景：与白色背景形成对比 */
  border: 1px solid #EEE;          /* 浅灰色边框：定义标签的边界 */
  padding: 4px 10px;               /* 内边距：上下 4px，左右 10px */
  border-radius: 4px;              /* 圆角：4px，使标签边角圆润 */
  font-size: 11px;                 /* 字体大小：11px，紧凑设计 */
  color: #333;                     /* 深灰色文字：确保文字清晰可读 */
  font-family: 'JetBrains Mono', monospace;  /* 等宽字体：JetBrains Mono 是一款专为编程设计的等宽字体 */
  transition: all 0.2s;            /* 所有属性变化的过渡动画：0.2 秒的缓动效果 */
}

/* 
 * 可点击的标签样式
 * 
 * 可点击的标签使用手型光标，提示用户可以点击
 * 点击后会显示详情覆盖层
 */
.entity-tag.clickable {
    cursor: pointer;               /* 鼠标指针为手型：提示用户可以点击 */
}

/* 
 * 可点击标签的悬停效果
 * 
 * 当用户悬停在可点击标签上时，背景和边框颜色变深
 * 提供视觉反馈，增强交互体验
 */
.entity-tag.clickable:hover {
    background: #E0E0E0;           /* 深灰色背景：增强视觉反馈 */
    border-color: #CCC;            /* 深灰色边框：与背景颜色协调 */
}

/* 
 * 本体详情覆盖层样式
 * 
 * 详情覆盖层是一个绝对定位的覆盖层，显示在卡片内容之上
 * 使用半透明背景和模糊效果，创建层次感
 * 添加淡入动画，提供平滑的过渡效果
 */
.ontology-detail-overlay {
    position: absolute;            /* 绝对定位：相对于最近的定位祖先元素（.step-card） */
    top: 60px;                     /* 距离顶部 60px：在头部下方显示 */
    left: 20px;                    /* 距离左侧 20px：与卡片边距一致 */
    right: 20px;                   /* 距离右侧 20px：与卡片边距一致 */
    bottom: 20px;                  /* 距离底部 20px：与卡片边距一致 */
    background: rgba(255, 255, 255, 0.98);  /* 半透明白色背景：0.98 表示 98% 不透明度 */
    backdrop-filter: blur(4px);    /* 背景模糊效果：4px 模糊半径，创建毛玻璃效果 */
    z-index: 10;                   /* 层级：10，确保在其他内容之上 */
    border: 1px solid #EAEAEA;     /* 浅灰色边框：定义覆盖层的边界 */
    box-shadow: 0 4px 20px rgba(0,0,0,0.05);  /* 阴影效果：创建层次感，使覆盖层浮起 */
    border-radius: 6px;             /* 圆角：6px，使覆盖层边角圆润 */
    display: flex;                 /* 使用 Flexbox 布局：子元素垂直排列 */
    flex-direction: column;        /* 垂直方向排列：从上到下排列 */
    overflow: hidden;              /* 隐藏溢出内容：防止内容溢出覆盖层 */
    animation: fadeIn 0.2s ease-out;  /* 淡入动画：0.2 秒的缓出效果 */
}

/* 
 * 淡入动画定义
 * 
 * 淡入动画使覆盖层从透明渐变为不透明
 * 同时添加轻微的位移效果，增强动画的流畅性
 */
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

/* 
 * 详情头部样式
 * 
 * 详情头部包含类型徽章、名称和关闭按钮
 * 使用浅灰色背景和底部边框，与主体内容分隔
 */
.detail-header {
    display: flex;                 /* 使用 Flexbox 布局：子元素水平排列 */
    justify-content: space-between;  /* 两端对齐：左侧显示标题组，右侧显示关闭按钮 */
    align-items: center;            /* 垂直居中：子元素在垂直方向上居中对齐 */
    padding: 12px 16px;            /* 内边距：上下 12px，左右 16px */
    border-bottom: 1px solid #EAEAEA;  /* 底部边框：与主体内容分隔 */
    background: #FAFAFA;           /* 浅灰色背景：与主体内容形成对比 */
}

/* 
 * 详情标题组样式
 * 
 * 详情标题组包含类型徽章和名称
 * 使用 Flexbox 布局实现水平排列和垂直居中
 */
.detail-title-group {
    display: flex;                 /* 使用 Flexbox 布局：子元素水平排列 */
    align-items: center;            /* 垂直居中：类型徽章和名称在垂直方向上居中对齐 */
    gap: 8px;                       /* 类型徽章和名称之间的间距：8px，适中的间距 */
}

/* 
 * 详情类型徽章样式
 * 
 * 类型徽章显示实体或关系的类型
 * 使用黑色背景和白色文字，简洁而醒目
 */
.detail-type-badge {
    font-size: 9px;                 /* 极小字体：9px，紧凑设计 */
    font-weight: 700;               /* 字体粗细：700，粗体 */
    color: #FFF;                    /* 白色文字：与黑色背景形成对比 */
    background: #000;               /* 黑色背景：醒目且简洁 */
    padding: 2px 6px;               /* 内边距：上下 2px，左右 6px */
    border-radius: 2px;             /* 小圆角：2px，使徽章边角圆润 */
    text-transform: uppercase;     /* 大写字母：所有字母大写，统一风格 */
}

/* 
 * 详情名称样式
 * 
 * 详情名称显示实体或关系的名称
 * 使用等宽字体确保代码对齐和可读性
 */
.detail-name {
    font-size: 14px;                /* 字体大小：14px，适中的字体大小 */
    font-weight: 700;               /* 字体粗细：700，粗体 */
    font-family: 'JetBrains Mono', monospace;  /* 等宽字体：JetBrains Mono 是一款专为编程设计的等宽字体 */
}

/* 
 * 关闭按钮样式
 * 
 * 关闭按钮用于关闭详情覆盖层
 * 使用无背景和无边框设计，简洁而现代
 */
.close-btn {
    background: none;               /* 无背景：透明背景 */
    border: none;                   /* 无边框：无边框设计 */
    font-size: 18px;                /* 字体大小：18px，较大的字体确保易于点击 */
    color: #999;                    /* 浅灰色：降低视觉权重 */
    cursor: pointer;                /* 鼠标指针为手型：提示用户可以点击 */
    line-height: 1;                 /* 行高：1，确保按钮高度与字体大小一致 */
}

/* 
 * 关闭按钮的悬停效果
 * 
 * 当用户悬停在关闭按钮上时，颜色变深
 * 提供视觉反馈，增强交互体验
 */
.close-btn:hover {
    color: #333;                    /* 深灰色：增强视觉反馈 */
}

/* 
 * 详情主体样式
 * 
 * 详情主体包含描述、属性、示例和连接等信息
 * 使用 flex: 1 占据剩余空间，允许垂直滚动
 */
.detail-body {
    flex: 1;                        /* 占据剩余空间：flex: 1 表示占据父容器中所有可用的剩余空间 */
    overflow-y: auto;               /* 允许垂直滚动：当内容超过容器高度时显示垂直滚动条 */
    padding: 16px;                  /* 内边距：为内容提供呼吸空间 */
}

/* 
 * 详情描述样式
 * 
 * 详情描述显示实体或关系的详细说明
 * 使用虚线边框与下方内容分隔
 */
.detail-desc {
    font-size: 12px;                /* 字体大小：12px，适中的字体大小 */
    color: #444;                    /* 深灰色：确保文字清晰可读 */
    line-height: 1.5;               /* 行高：1.5 倍行高，提高可读性 */
    margin-bottom: 16px;            /* 底部间距：与下方内容分隔 */
    padding-bottom: 12px;           /* 底部内边距：为虚线边框提供空间 */
    border-bottom: 1px dashed #EAEAEA;  /* 虚线边框：与下方内容分隔 */
}

/* 
 * 详情区块样式
 * 
 * 详情区块用于分组显示相关信息（属性、示例、连接等）
 * 使用底部间距分隔不同的区块
 */
.detail-section {
    margin-bottom: 16px;            /* 底部间距：与其他区块分隔 */
}

/* 
 * 区块标签样式
 * 
 * 区块标签用于标识区块的类型（属性、示例、连接等）
 * 使用小字体和浅灰色，降低视觉权重
 */
.section-label {
    display: block;                 /* 块级元素：独占一行 */
    font-size: 10px;                /* 小字体：10px，紧凑设计 */
    font-weight: 600;               /* 字体粗细：600，半粗体 */
    color: #AAA;                    /* 浅灰色：降低视觉权重 */
    margin-bottom: 8px;             /* 底部间距：与列表分隔 */
}

/* 
 * 属性列表和连接列表样式
 * 
 * 属性列表和连接列表使用 Flexbox 布局，垂直排列
 * 使用 gap 属性设置项目之间的间距
 */
.attr-list, .conn-list {
    display: flex;                 /* 使用 Flexbox 布局：子元素垂直排列 */
    flex-direction: column;        /* 垂直方向排列：从上到下排列 */
    gap: 6px;                       /* 项目之间的间距：6px，适中的间距 */
}

/* 
 * 属性项样式
 * 
 * 属性项显示属性的名称、类型和描述
 * 使用浅灰色背景和圆角设计，简洁而清晰
 */
.attr-item {
    font-size: 11px;                /* 字体大小：11px，紧凑设计 */
    display: flex;                 /* 使用 Flexbox 布局：子元素水平排列 */
    flex-wrap: wrap;               /* 允许换行：当内容超出容器宽度时自动换行 */
    gap: 6px;                       /* 元素之间的间距：6px，适中的间距 */
    align-items: baseline;         /* 基线对齐：子元素在基线上对齐 */
    padding: 4px;                   /* 内边距：为内容提供呼吸空间 */
    background: #F9F9F9;           /* 浅灰色背景：与白色背景形成对比 */
    border-radius: 4px;             /* 圆角：4px，使属性项边角圆润 */
}

/* 
 * 属性名称样式
 * 
 * 属性名称使用等宽字体和粗体，突出显示
 */
.attr-name {
    font-family: 'JetBrains Mono', monospace;  /* 等宽字体：JetBrains Mono 是一款专为编程设计的等宽字体 */
    font-weight: 600;               /* 字体粗细：600，半粗体 */
    color: #000;                    /* 黑色：突出显示 */
}

/* 
 * 属性类型样式
 * 
 * 属性类型显示属性的数据类型
 * 使用小字体和浅灰色，降低视觉权重
 */
.attr-type {
    color: #999;                    /* 浅灰色：降低视觉权重 */
    font-size: 10px;                /* 小字体：10px，紧凑设计 */
}

/* 
 * 属性描述样式
 * 
 * 属性描述显示属性的详细说明
 * 使用 flex: 1 占据剩余空间，确保描述可以换行显示
 */
.attr-desc {
    color: #555;                    /* 深灰色：确保文字清晰可读 */
    flex: 1;                        /* 占据剩余空间：flex: 1 表示占据父容器中所有可用的剩余空间 */
    min-width: 150px;              /* 最小宽度：150px，确保描述有足够的空间显示 */
}

/* 
 * 示例列表样式
 * 
 * 示例列表使用 Flexbox 布局，支持自动换行
 * 这样可以确保示例标签在不同屏幕尺寸下都能良好显示
 */
.example-list {
    display: flex;                 /* 使用 Flexbox 布局：子元素水平排列 */
    flex-wrap: wrap;               /* 允许换行：当标签超出容器宽度时自动换行 */
    gap: 6px;                       /* 标签之间的间距：6px，适中的间距 */
}

/* 
 * 示例标签样式
 * 
 * 示例标签使用白色背景和圆角设计，简洁而清晰
 */
.example-tag {
    font-size: 11px;                /* 字体大小：11px，紧凑设计 */
    background: #FFF;               /* 白色背景：简洁而清晰 */
    border: 1px solid #E0E0E0;      /* 浅灰色边框：定义标签的边界 */
    padding: 3px 8px;               /* 内边距：上下 3px，左右 8px */
    border-radius: 12px;            /* 圆角：12px，使标签边角圆润 */
    color: #555;                    /* 深灰色：确保文字清晰可读 */
}

/* 
 * 连接项样式
 * 
 * 连接项显示关系的源节点和目标节点
 * 使用浅灰色背景和圆角设计，简洁而清晰
 */
.conn-item {
    display: flex;                 /* 使用 Flexbox 布局：子元素水平排列 */
    align-items: center;            /* 垂直居中：子元素在垂直方向上居中对齐 */
    gap: 8px;                       /* 元素之间的间距：8px，适中的间距 */
    font-size: 11px;                /* 字体大小：11px，紧凑设计 */
    padding: 6px;                   /* 内边距：为内容提供呼吸空间 */
    background: #F5F5F5;           /* 浅灰色背景：与白色背景形成对比 */
    border-radius: 4px;             /* 圆角：4px，使连接项边角圆润 */
    font-family: 'JetBrains Mono', monospace;  /* 等宽字体：JetBrains Mono 是一款专为编程设计的等宽字体 */
}

/* 
 * 连接节点样式
 * 
 * 连接节点显示关系的源节点或目标节点名称
 * 使用粗体突出显示
 */
.conn-node {
    font-weight: 600;               /* 字体粗细：600，半粗体 */
    color: #333;                    /* 深灰色：确保文字清晰可读 */
}

/* 
 * 连接箭头样式
 * 
 * 连接箭头显示关系的方向（从源节点到目标节点）
 * 使用浅灰色，降低视觉权重
 */
.conn-arrow {
    color: #BBB;                    /* 浅灰色：降低视觉权重 */
}

/* 
 * 步骤 02 的统计卡片网格样式
 * 
 * 统计卡片网格使用 CSS Grid 布局，显示三个统计指标
 * 使用浅灰色背景和圆角设计，简洁而清晰
 */
.stats-grid {
  display: grid;                   /* 使用 Grid 布局：现代 CSS 布局方式，提供二维布局能力 */
  grid-template-columns: 1fr 1fr 1fr;  /* 三列等宽：1fr 表示 1 份可用空间，三列各占 1/3 */
  gap: 12px;                       /* 卡片之间的间距：12px，适中的间距 */
  background: #F9F9F9;             /* 浅灰色背景：与白色背景形成对比 */
  padding: 16px;                   /* 内边距：为内容提供呼吸空间 */
  border-radius: 6px;               /* 圆角：6px，使网格边角圆润 */
}

/* 
 * 统计卡片样式
 * 
 * 统计卡片显示单个统计指标（节点数、边数、类型数）
 * 使用文本居中布局，简洁而清晰
 */
.stat-card {
  text-align: center;               /* 文本居中：使数值和标签居中对齐 */
}

/* 
 * 统计数值样式
 * 
 * 统计数值显示统计指标的具体数值
 * 使用大字体和粗体，突出显示
 */
.stat-value {
  display: block;                  /* 块级元素：独占一行 */
  font-size: 20px;                 /* 字体大小：20px，较大字体突出显示 */
  font-weight: 700;                /* 字体粗细：700，粗体 */
  color: #000;                     /* 黑色：突出显示 */
  font-family: 'JetBrains Mono', monospace;  /* 等宽字体：JetBrains Mono 是一款专为编程设计的等宽字体 */
}

/* 
 * 统计标签样式
 * 
 * 统计标签显示统计指标的名称（节点、边、类型）
 * 使用小字体和浅灰色，降低视觉权重
 */
.stat-label {
  font-size: 9px;                  /* 小字体：9px，紧凑设计 */
  color: #999;                     /* 浅灰色：降低视觉权重 */
  text-transform: uppercase;      /* 大写字母：所有字母大写，统一风格 */
  margin-top: 4px;                 /* 顶部间距：与数值分隔 */
  display: block;                  /* 块级元素：独占一行 */
}

/* 
 * 步骤 03 的操作按钮样式
 * 
 * 操作按钮用于触发进入环境搭建的操作
 * 使用黑色背景和白色文字，简洁而醒目
 */
.action-btn {
  width: 100%;                     /* 占满容器宽度：确保按钮填满父容器 */
  background: #000;                /* 黑色背景：醒目且简洁 */
  color: #FFF;                     /* 白色文字：与黑色背景形成对比 */
  border: none;                    /* 无边框：无边框设计 */
  padding: 14px;                    /* 内边距：为内容提供呼吸空间 */
  border-radius: 4px;              /* 圆角：4px，使按钮边角圆润 */
  font-size: 12px;                 /* 字体大小：12px，适中的字体大小 */
  font-weight: 600;                /* 字体粗细：600，半粗体 */
  cursor: pointer;                /* 鼠标指针为手型：提示用户可以点击 */
  transition: opacity 0.2s;        /* 透明度过渡动画：0.2 秒的缓动效果 */
}

/* 
 * 操作按钮的悬停效果（非禁用状态）
 * 
 * 当用户悬停在非禁用按钮上时，降低透明度
 * 提供视觉反馈，增强交互体验
 */
.action-btn:hover:not(:disabled) {
  opacity: 0.8;                    /* 降低透明度：0.8 表示 80% 不透明度 */
}

/* 
 * 禁用状态的操作按钮
 * 
 * 禁用状态的按钮使用灰色背景和禁止符号
 * 提示用户当前不可点击
 */
.action-btn:disabled {
  background: #CCC;                /* 灰色背景：降低视觉权重 */
  cursor: not-allowed;             /* 鼠标指针为禁止符号：提示用户不可点击 */
}

/* 
 * 进度区域样式
 * 
 * 进度区域显示当前步骤的进度信息
 * 使用 Flexbox 布局实现水平排列和垂直居中
 */
.progress-section {
  display: flex;                   /* 使用 Flexbox 布局：子元素水平排列 */
  align-items: center;            /* 垂直居中：子元素在垂直方向上居中对齐 */
  gap: 10px;                       /* 元素之间的间距：10px，适中的间距 */
  font-size: 12px;                 /* 字体大小：12px，适中的字体大小 */
  color: #FF5722;                  /* 橙红色：与品牌色一致 */
  margin-bottom: 12px;            /* 底部间距：与下方内容分隔 */
}

/* 
 * 小型旋转加载动画样式
 * 
 * 小型旋转加载动画用于显示加载状态
 * 使用 CSS 动画实现旋转效果
 */
.spinner-sm {
  width: 14px;                     /* 宽度：14px，小型设计 */
  height: 14px;                    /* 高度：14px，小型设计 */
  border: 2px solid #FFCCBC;      /* 浅橙色边框：2px 边框宽度 */
  border-top-color: #FF5722;       /* 顶部边框为橙色：创建旋转效果 */
  border-radius: 50%;              /* 圆形：使加载动画为圆形 */
  animation: spin 1s linear infinite;  /* 旋转动画：1 秒线性无限循环 */
}

/* 
 * 旋转动画定义
 * 
 * 旋转动画使加载动画从 0 度旋转到 360 度
 * 创建持续旋转的效果
 */
@keyframes spin { to { transform: rotate(360deg); } }

/* 
 * 系统日志面板样式
 * 
 * 系统日志面板显示系统运行日志
 * 使用黑色背景和等宽字体，模拟终端风格
 */
.system-logs {
  background: #000;                /* 黑色背景：模拟终端风格 */
  color: #DDD;                     /* 浅灰色文字：与黑色背景形成对比 */
  padding: 16px;                   /* 内边距：为内容提供呼吸空间 */
  font-family: 'JetBrains Mono', monospace;  /* 等宽字体：JetBrains Mono 是一款专为编程设计的等宽字体 */
  border-top: 1px solid #222;      /* 顶部边框：与上方内容分隔 */
  flex-shrink: 0;                  /* 不收缩：防止日志面板被压缩 */
}

/* 
 * 日志头部样式
 * 
 * 日志头部包含日志标题和日志数量
 * 使用 Flexbox 布局实现两端对齐
 */
.log-header {
  display: flex;                   /* 使用 Flexbox 布局：子元素水平排列 */
  justify-content: space-between;  /* 两端对齐：左侧显示标题，右侧显示数量 */
  border-bottom: 1px solid #333;  /* 底部边框：与日志内容分隔 */
  padding-bottom: 8px;             /* 底部内边距：为边框提供空间 */
  margin-bottom: 8px;              /* 底部间距：与日志内容分隔 */
  font-size: 10px;                 /* 小字体：10px，紧凑设计 */
  color: #888;                     /* 浅灰色：降低视觉权重 */
}

/* 
 * 日志内容区域样式
 * 
 * 日志内容区域显示日志行
 * 使用 Flexbox 布局实现垂直排列
 * 支持垂直滚动，固定高度
 */
.log-content {
  display: flex;                   /* 使用 Flexbox 布局：子元素垂直排列 */
  flex-direction: column;        /* 垂直方向排列：从上到下排列 */
  gap: 4px;                        /* 日志行之间的间距：4px，紧凑设计 */
  height: 80px;                    /* 固定高度：约显示 4 行 */
  overflow-y: auto;               /* 允许垂直滚动：当日志超过容器高度时显示垂直滚动条 */
  padding-right: 4px;              /* 右侧内边距：为滚动条提供空间 */
}

/* 
 * 自定义滚动条样式
 * 
 * 自定义滚动条样式，使滚动条更小更美观
 * 使用 WebKit 滚动条伪元素
 */
.log-content::-webkit-scrollbar {
  width: 4px;                      /* 滚动条宽度：4px，小型设计 */
}

/* 
 * 滚动条滑块样式
 * 
 * 滚动条滑块使用深灰色和圆角设计
 * 与黑色背景协调
 */
.log-content::-webkit-scrollbar-thumb {
  background: #333;                /* 深灰色：与黑色背景协调 */
  border-radius: 2px;             /* 圆角：2px，使滑块边角圆润 */
}

/* 
 * 日志行样式
 * 
 * 日志行显示时间戳和日志消息
 * 使用 Flexbox 布局实现水平排列
 */
.log-line {
  font-size: 11px;                 /* 字体大小：11px，紧凑设计 */
  display: flex;                   /* 使用 Flexbox 布局：子元素水平排列 */
  gap: 12px;                       /* 时间和消息之间的间距：12px，适中的间距 */
  line-height: 1.5;                /* 行高：1.5 倍行高，提高可读性 */
}

/* 
 * 日志时间样式
 * 
 * 日志时间显示日志的时间戳
 * 使用最小宽度确保时间戳对齐
 */
.log-time {
  color: #666;                     /* 深灰色：降低视觉权重 */
  min-width: 75px;                /* 最小宽度：75px，确保时间戳对齐 */
}

/* 
 * 日志消息样式
 * 
 * 日志消息显示日志的具体内容
 * 使用浅灰色，确保文字清晰可读
 * 支持在任意字符处换行
 */
.log-msg {
  color: #CCC;                     /* 浅灰色：与黑色背景形成对比 */
  word-break: break-all;          /* 允许在任意字符处换行：防止长单词溢出 */
}
</style>
