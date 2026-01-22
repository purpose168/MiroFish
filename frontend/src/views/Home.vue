<template>
  <!-- 主页容器 -->
  <div class="home-container">
    <!-- 顶部导航栏 -->
    <nav class="navbar">
      <!-- 品牌标识 -->
      <div class="nav-brand">MIROFISH</div>
      <!-- 导航链接 -->
      <div class="nav-links">
        <!-- GitHub 主页链接 -->
        <a href="https://github.com/666ghj/MiroFish" target="_blank" class="github-link">
          访问我们的Github主页 <span class="arrow">↗</span>
        </a>
      </div>
    </nav>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 上半部分：Hero 区域 -->
      <section class="hero-section">
        <!-- 左侧：标题和描述 -->
        <div class="hero-left">
          <!-- 标签行 -->
          <div class="tag-row">
            <!-- 橙色标签 -->
            <span class="orange-tag">简洁通用的群体智能引擎</span>
            <!-- 版本文本 -->
            <span class="version-text">/ v0.1-预览版</span>
          </div>
          
          <!-- 主标题 -->
          <h1 class="main-title">
            上传任意报告<br>
            <!-- 渐变文本 -->
            <span class="gradient-text">即刻推演未来</span>
          </h1>
          
          <!-- Hero 描述 -->
          <div class="hero-desc">
            <!-- 主要描述段落 -->
            <p>
              即使只有一段文字，<span class="highlight-bold">MiroFish</span> 也能基于其中的现实种子，全自动生成与之对应的至多<span class="highlight-orange">百万级Agent</span>构成的平行世界。通过上帝视角注入变量，在复杂的群体交互中寻找动态环境下的<span class="highlight-code">"局部最优解"</span>
            </p>
            <!-- 口号文本 -->
            <p class="slogan-text">
              让未来在 Agent 群中预演，让决策在百战后胜出<span class="blinking-cursor">_</span>
            </p>
          </div>
           
          <!-- 装饰方块 -->
          <div class="decoration-square"></div>
        </div>
        
        <!-- 右侧：Logo 和滚动按钮 -->
        <div class="hero-right">
          <!-- Logo 区域 -->
          <div class="logo-container">
            <!-- Hero Logo 图片 -->
            <img src="../assets/logo/MiroFish_logo_left.jpeg" alt="MiroFish Logo" class="hero-logo" />
          </div>
          
          <!-- 向下滚动按钮 -->
          <button class="scroll-down-btn" @click="scrollToBottom">
            ↓
          </button>
        </div>
      </section>

      <!-- 下半部分：双栏布局 -->
      <section class="dashboard-section">
        <!-- 左栏：状态与步骤 -->
        <div class="left-panel">
          <!-- 面板头部 -->
          <div class="panel-header">
            <!-- 状态点 -->
            <span class="status-dot">■</span> 系统状态
          </div>
          
          <!-- 章节标题 -->
          <h2 class="section-title">准备就绪</h2>
          <!-- 章节描述 -->
          <p class="section-desc">
            预测引擎待命中，可上传多份非结构化数据以初始化模拟序列
          </p>
          
          <!-- 数据指标卡片 -->
          <div class="metrics-row">
            <!-- 指标卡片 1 -->
            <div class="metric-card">
              <div class="metric-value">低成本</div>
              <div class="metric-label">常规模拟平均5$/次</div>
            </div>
            <!-- 指标卡片 2 -->
            <div class="metric-card">
              <div class="metric-value">高可用</div>
              <div class="metric-label">最多百万级Agent模拟</div>
            </div>
          </div>

          <!-- 项目模拟步骤介绍 (新增区域) -->
          <div class="steps-container">
            <!-- 步骤头部 -->
            <div class="steps-header">
               <!-- 菱形图标 -->
               <span class="diamond-icon">◇</span> 工作流序列
            </div>
            <!-- 工作流列表 -->
            <div class="workflow-list">
              <!-- 工作流项 01 -->
              <div class="workflow-item">
                <span class="step-num">01</span>
                <div class="step-info">
                  <div class="step-title">图谱构建</div>
                  <div class="step-desc">现实种子提取 & 个体与群体记忆注入 & GraphRAG构建</div>
                </div>
              </div>
              <!-- 工作流项 02 -->
              <div class="workflow-item">
                <span class="step-num">02</span>
                <div class="step-info">
                  <div class="step-title">环境搭建</div>
                  <div class="step-desc">实体关系抽取 & 人设生成 & 环境配置Agent注入仿真参数</div>
                </div>
              </div>
              <!-- 工作流项 03 -->
              <div class="workflow-item">
                <span class="step-num">03</span>
                <div class="step-info">
                  <div class="step-title">开始模拟</div>
                  <div class="step-desc">双平台并行模拟 & 自动解析预测需求 & 动态更新时序记忆</div>
                </div>
              </div>
              <!-- 工作流项 04 -->
              <div class="workflow-item">
                <span class="step-num">04</span>
                <div class="step-info">
                  <div class="step-title">报告生成</div>
                  <div class="step-desc">ReportAgent拥有丰富的工具集与模拟后环境进行深度交互</div>
                </div>
              </div>
              <!-- 工作流项 05 -->
              <div class="workflow-item">
                <span class="step-num">05</span>
                <div class="step-info">
                  <div class="step-title">深度互动</div>
                  <div class="step-desc">与模拟世界中的任意一位进行对话 & 与ReportAgent进行对话</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右栏：交互控制台 -->
        <div class="right-panel">
          <!-- 控制台盒子 -->
          <div class="console-box">
            <!-- 上传区域 -->
            <div class="console-section">
              <!-- 控制台头部 -->
              <div class="console-header">
                <!-- 控制台标签 -->
                <span class="console-label">01 / 现实种子</span>
                <!-- 控制元数据 -->
                <span class="console-meta">支持格式: PDF, MD, TXT</span>
              </div>
              
              <!-- 上传区域 -->
              <div 
                class="upload-zone"
                :class="{ 'drag-over': isDragOver, 'has-files': files.length > 0 }"
                @dragover.prevent="handleDragOver"
                @dragleave.prevent="handleDragLeave"
                @drop.prevent="handleDrop"
                @click="triggerFileInput"
              >
                <!-- 文件输入（隐藏） -->
                <input
                  ref="fileInput"
                  type="file"
                  multiple
                  accept=".pdf,.md,.txt"
                  @change="handleFileSelect"
                  style="display: none"
                  :disabled="loading"
                />
                
                <!-- 上传占位符（无文件时显示） -->
                <div v-if="files.length === 0" class="upload-placeholder">
                  <div class="upload-icon">↑</div>
                  <div class="upload-title">拖拽文件上传</div>
                  <div class="upload-hint">或点击浏览文件系统</div>
                </div>
                
                <!-- 文件列表（有文件时显示） -->
                <div v-else class="file-list">
                  <!-- 循环渲染文件项 -->
                  <div v-for="(file, index) in files" :key="index" class="file-item">
                    <span class="file-icon">📄</span>
                    <span class="file-name">{{ file.name }}</span>
                    <!-- 移除按钮 -->
                    <button @click.stop="removeFile(index)" class="remove-btn">×</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 分割线 -->
            <div class="console-divider">
              <span>输入参数</span>
            </div>

            <!-- 输入区域 -->
            <div class="console-section">
              <!-- 控制台头部 -->
              <div class="console-header">
                <!-- 控制台标签 -->
                <span class="console-label">>_ 02 / 模拟提示词</span>
              </div>
              <!-- 输入包装器 -->
              <div class="input-wrapper">
                <!-- 代码输入文本框 -->
                <textarea
                  v-model="formData.simulationRequirement"
                  class="code-input"
                  placeholder="// 用自然语言输入模拟或预测需求（例.武大若发布撤销肖某处分的公告，会引发什么舆情走向）"
                  rows="6"
                  :disabled="loading"
                ></textarea>
                <!-- 模型徽章 -->
                <div class="model-badge">引擎: MiroFish-V1.0</div>
              </div>
            </div>

            <!-- 启动按钮区域 -->
            <div class="console-section btn-section">
              <!-- 启动引擎按钮 -->
              <button 
                class="start-engine-btn"
                @click="startSimulation"
                :disabled="!canSubmit || loading"
              >
                <!-- 未加载时显示 -->
                <span v-if="!loading">启动引擎</span>
                <!-- 加载中时显示 -->
                <span v-else>初始化中...</span>
                <!-- 按钮箭头 -->
                <span class="btn-arrow">→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 历史项目数据库 -->
      <HistoryDatabase />
    </div>
  </div>
</template>

<script setup>
// 导入 Vue 3 Composition API 核心函数
import { ref, computed } from 'vue'
// 导入 Vue Router 路由相关函数
import { useRouter } from 'vue-router'
// 导入历史项目数据库组件
import HistoryDatabase from '../components/HistoryDatabase.vue'

// 获取路由器实例
const router = useRouter()

// 表单数据
const formData = ref({
  simulationRequirement: '' // 模拟需求描述
})

// 文件列表
const files = ref([])

// 状态
const loading = ref(false) // 加载状态
const error = ref('') // 错误信息
const isDragOver = ref(false) // 拖拽状态

// 文件输入引用
const fileInput = ref(null)

// 计算属性:是否可以提交
const canSubmit = computed(() => {
  // 当模拟需求不为空且文件列表不为空时，可以提交
  return formData.value.simulationRequirement.trim() !== '' && files.value.length > 0
})

// 触发文件选择
const triggerFileInput = () => {
  // 如果不在加载状态，则触发文件选择
  if (!loading.value) {
    fileInput.value?.click()
  }
}

// 处理文件选择
const handleFileSelect = (event) => {
  // 将选中的文件转换为数组
  const selectedFiles = Array.from(event.target.files)
  // 添加文件到文件列表
  addFiles(selectedFiles)
}

// 处理拖拽相关
const handleDragOver = (e) => {
  // 如果不在加载状态，设置拖拽状态为 true
  if (!loading.value) {
    isDragOver.value = true
  }
}

const handleDragLeave = (e) => {
  // 设置拖拽状态为 false
  isDragOver.value = false
}

const handleDrop = (e) => {
  // 设置拖拽状态为 false
  isDragOver.value = false
  // 如果在加载状态，则不处理
  if (loading.value) return
  
  // 将拖拽的文件转换为数组
  const droppedFiles = Array.from(e.dataTransfer.files)
  // 添加文件到文件列表
  addFiles(droppedFiles)
}

// 添加文件
const addFiles = (newFiles) => {
  // 过滤出有效的文件（只接受 pdf, md, txt 格式）
  const validFiles = newFiles.filter(file => {
    const ext = file.name.split('.').pop().toLowerCase()
    return ['pdf', 'md', 'txt'].includes(ext)
  })
  // 将有效文件添加到文件列表
  files.value.push(...validFiles)
}

// 移除文件
const removeFile = (index) => {
  // 从文件列表中移除指定索引的文件
  files.value.splice(index, 1)
}

// 滚动到底部
const scrollToBottom = () => {
  // 平滑滚动到页面底部
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: 'smooth'
  })
}

// 开始模拟 - 立即跳转，API调用在Process页面进行
const startSimulation = () => {
  // 如果不能提交或正在加载，则不处理
  if (!canSubmit.value || loading.value) return
  
  // 存储待上传的数据
  import('../store/pendingUpload.js').then(({ setPendingUpload }) => {
    // 调用 setPendingUpload 函数存储文件和模拟需求
    setPendingUpload(files.value, formData.value.simulationRequirement)
    
    // 立即跳转到Process页面（使用特殊标识表示新建项目）
    router.push({
      name: 'Process',
      params: { projectId: 'new' }
    })
  })
}
</script>

<style scoped>
/* 全局变量与重置 */
:root {
  --black: #000000; /* 黑色 */
  --white: #FFFFFF; /* 白色 */
  --orange: #FF4500; /* 橙色 */
  --gray-light: #F5F5F5; /* 浅灰色 */
  --gray-text: #666666; /* 灰色文本 */
  --border: #E5E5E5; /* 边框颜色 */
  /* 
    使用 Space Grotesk 作为主要标题字体，JetBrains Mono 作为代码/标签字体
    确保已在 index.html 引入这些 Google Fonts 
  */
  --font-mono: 'JetBrains Mono', monospace; /* 等宽字体 */
  --font-sans: 'Space Grotesk', 'Noto Sans SC', system-ui, sans-serif; /* 无衬线字体 */
  --font-cn: 'Noto Sans SC', system-ui, sans-serif; /* 中文字体 */
}

/* 主页容器样式 */
.home-container {
  min-height: 100vh; /* 最小高度为视口高度的 100% */
  background: var(--white); /* 背景色为白色 */
  font-family: var(--font-sans); /* 字体设置 */
  color: var(--black); /* 文字颜色为黑色 */
}

/* 顶部导航样式 */
.navbar {
  height: 60px; /* 高度为 60 像素 */
  background: var(--black); /* 背景色为黑色 */
  color: var(--white); /* 文字颜色为白色 */
  display: flex; /* 使用 Flex 布局 */
  justify-content: space-between; /* 两端对齐 */
  align-items: center; /* 垂直居中对齐 */
  padding: 0 40px; /* 内边距 */
}

/* 品牌标识样式 */
.nav-brand {
  font-family: var(--font-mono); /* 使用等宽字体 */
  font-weight: 800; /* 字体粗细 */
  letter-spacing: 1px; /* 字母间距 */
  font-size: 1.2rem; /* 字体大小 */
}

/* 导航链接样式 */
.nav-links {
  display: flex; /* 使用 Flex 布局 */
  align-items: center; /* 垂直居中对齐 */
}

/* GitHub 链接样式 */
.github-link {
  color: var(--white); /* 文字颜色为白色 */
  text-decoration: none; /* 无下划线 */
  font-family: var(--font-mono); /* 使用等宽字体 */
  font-size: 0.9rem; /* 字体大小 */
  font-weight: 500; /* 字体粗细 */
  display: flex; /* 使用 Flex 布局 */
  align-items: center; /* 垂直居中对齐 */
  gap: 8px; /* 子元素之间的间距 */
  transition: opacity 0.2s; /* 透明度过渡动画时间为 0.2 秒 */
}

/* GitHub 链接悬停样式 */
.github-link:hover {
  opacity: 0.8; /* 透明度为 0.8 */
}

/* 箭头样式 */
.arrow {
  font-family: sans-serif; /* 使用无衬线字体 */
}

/* 主要内容区样式 */
.main-content {
  max-width: 1400px; /* 最大宽度为 1400 像素 */
  margin: 0 auto; /* 水平居中 */
  padding: 60px 40px; /* 内边距 */
}

/* Hero 区域样式 */
.hero-section {
  display: flex; /* 使用 Flex 布局 */
  justify-content: space-between; /* 两端对齐 */
  margin-bottom: 80px; /* 下边距为 80 像素 */
  position: relative; /* 相对定位 */
}

/* Hero 左侧样式 */
.hero-left {
  flex: 1; /* 占据剩余空间 */
  padding-right: 60px; /* 右内边距为 60 像素 */
}

/* 标签行样式 */
.tag-row {
  display: flex; /* 使用 Flex 布局 */
  align-items: center; /* 垂直居中对齐 */
  gap: 15px; /* 子元素之间的间距 */
  margin-bottom: 25px; /* 下边距为 25 像素 */
  font-family: var(--font-mono); /* 使用等宽字体 */
  font-size: 0.8rem; /* 字体大小 */
}

/* 橙色标签样式 */
.orange-tag {
  background: var(--orange); /* 背景色为橙色 */
  color: var(--white); /* 文字颜色为白色 */
  padding: 4px 10px; /* 内边距 */
  font-weight: 700; /* 字体粗细 */
  letter-spacing: 1px; /* 字母间距 */
  font-size: 0.75rem; /* 字体大小 */
}

/* 版本文本样式 */
.version-text {
  color: #999; /* 文字颜色为灰色 */
  font-weight: 500; /* 字体粗细 */
  letter-spacing: 0.5px; /* 字母间距 */
}

/* 主标题样式 */
.main-title {
  font-size: 4.5rem; /* 字体大小 */
  line-height: 1.2; /* 行高 */
  font-weight: 500; /* 字体粗细 */
  margin: 0 0 40px 0; /* 外边距 */
  letter-spacing: -2px; /* 字母间距 */
  color: var(--black); /* 文字颜色为黑色 */
}

/* 渐变文本样式 */
.gradient-text {
  background: linear-gradient(90deg, #000000 0%, #444444 100%); /* 渐变背景 */
  -webkit-background-clip: text; /* 背景裁剪为文本 */
  -webkit-text-fill-color: transparent; /* 文字颜色透明 */
  display: inline-block; /* 显示为块级元素 */
}

/* Hero 描述样式 */
.hero-desc {
  font-size: 1.05rem; /* 字体大小 */
  line-height: 1.8; /* 行高 */
  color: var(--gray-text); /* 文字颜色为灰色 */
  max-width: 640px; /* 最大宽度为 640 像素 */
  margin-bottom: 50px; /* 下边距为 50 像素 */
  font-weight: 400; /* 字体粗细 */
  text-align: justify; /* 两端对齐 */
}

/* Hero 描述段落样式 */
.hero-desc p {
  margin-bottom: 1.5rem; /* 下边距为 1.5rem */
}

/* 高亮加粗样式 */
.highlight-bold {
  color: var(--black); /* 文字颜色为黑色 */
  font-weight: 700; /* 字体粗细 */
}

/* 高亮橙色样式 */
.highlight-orange {
  color: var(--orange); /* 文字颜色为橙色 */
  font-weight: 700; /* 字体粗细 */
  font-family: var(--font-mono); /* 使用等宽字体 */
}

/* 高亮代码样式 */
.highlight-code {
  background: rgba(0, 0, 0, 0.05); /* 背景色为半透明黑色 */
  padding: 2px 6px; /* 内边距 */
  border-radius: 2px; /* 圆角半径 */
  font-family: var(--font-mono); /* 使用等宽字体 */
  font-size: 0.9em; /* 字体大小 */
  color: var(--black); /* 文字颜色为黑色 */
  font-weight: 600; /* 字体粗细 */
}

/* 口号文本样式 */
.slogan-text {
  font-size: 1.2rem; /* 字体大小 */
  font-weight: 520; /* 字体粗细 */
  color: var(--black); /* 文字颜色为黑色 */
  letter-spacing: 1px; /* 字母间距 */
  border-left: 3px solid var(--orange); /* 左边框为橙色 */
  padding-left: 15px; /* 左内边距为 15 像素 */
  margin-top: 20px; /* 上边距为 20 像素 */
}

/* 闪烁光标样式 */
.blinking-cursor {
  color: var(--orange); /* 文字颜色为橙色 */
  animation: blink 1s step-end infinite; /* 闪烁动画 */
  font-weight: 700; /* 字体粗细 */
}

/* 闪烁动画关键帧 */
@keyframes blink {
  0%, 100% { opacity: 1; } /* 不透明度为 1 */
  50% { opacity: 0; } /* 不透明度为 0 */
}

/* 装饰方块样式 */
.decoration-square {
  width: 16px; /* 宽度为 16 像素 */
  height: 16px; /* 高度为 16 像素 */
  background: var(--orange); /* 背景色为橙色 */
}

/* Hero 右侧样式 */
.hero-right {
  flex: 0.8; /* 占据 0.8 份空间 */
  display: flex; /* 使用 Flex 布局 */
  flex-direction: column; /* 垂直方向排列子元素 */
  justify-content: space-between; /* 两端对齐 */
  align-items: flex-end; /* 右对齐 */
}

/* Logo 容器样式 */
.logo-container {
  width: 100%; /* 宽度为 100% */
  display: flex; /* 使用 Flex 布局 */
  justify-content: flex-end; /* 右对齐 */
  padding-right: 40px; /* 右内边距为 40 像素 */
}

/* Hero Logo 样式 */
.hero-logo {
  max-width: 500px; /* 最大宽度为 500 像素 */
  width: 100%; /* 宽度为 100% */
}

/* 向下滚动按钮样式 */
.scroll-down-btn {
  width: 40px; /* 宽度为 40 像素 */
  height: 40px; /* 高度为 40 像素 */
  border: 1px solid var(--border); /* 边框 */
  background: transparent; /* 背景透明 */
  display: flex; /* 使用 Flex 布局 */
  align-items: center; /* 垂直居中对齐 */
  justify-content: center; /* 水平居中对齐 */
  cursor: pointer; /* 鼠标悬停时显示手型光标 */
  color: var(--orange); /* 文字颜色为橙色 */
  font-size: 1.2rem; /* 字体大小 */
  transition: all 0.2s; /* 所有属性的过渡动画时间为 0.2 秒 */
}

/* 向下滚动按钮悬停样式 */
.scroll-down-btn:hover {
  border-color: var(--orange); /* 边框颜色为橙色 */
}

/* Dashboard 双栏布局样式 */
.dashboard-section {
  display: flex; /* 使用 Flex 布局 */
  gap: 60px; /* 子元素之间的间距 */
  border-top: 1px solid var(--border); /* 上边框 */
  padding-top: 60px; /* 上内边距为 60 像素 */
  align-items: flex-start; /* 顶部对齐 */
}

/* 左侧面板和右侧面板样式 */
.dashboard-section .left-panel,
.dashboard-section .right-panel {
  display: flex; /* 使用 Flex 布局 */
  flex-direction: column; /* 垂直方向排列子元素 */
}

/* 左侧面板样式 */
.left-panel {
  flex: 0.8; /* 占据 0.8 份空间 */
}

/* 面板头部样式 */
.panel-header {
  font-family: var(--font-mono); /* 使用等宽字体 */
  font-size: 0.8rem; /* 字体大小 */
  color: #999; /* 文字颜色为灰色 */
  display: flex; /* 使用 Flex 布局 */
  align-items: center; /* 垂直居中对齐 */
  gap: 8px; /* 子元素之间的间距 */
  margin-bottom: 20px; /* 下边距为 20 像素 */
}

/* 状态点样式 */
.status-dot {
  color: var(--orange); /* 文字颜色为橙色 */
  font-size: 0.8rem; /* 字体大小 */
}

/* 章节标题样式 */
.section-title {
  font-size: 2rem; /* 字体大小 */
  font-weight: 520; /* 字体粗细 */
  margin: 0 0 15px 0; /* 外边距 */
}

/* 章节描述样式 */
.section-desc {
  color: var(--gray-text); /* 文字颜色为灰色 */
  margin-bottom: 25px; /* 下边距为 25 像素 */
  line-height: 1.6; /* 行高 */
}

/* 指标行样式 */
.metrics-row {
  display: flex; /* 使用 Flex 布局 */
  gap: 20px; /* 子元素之间的间距 */
  margin-bottom: 15px; /* 下边距为 15 像素 */
}

/* 指标卡片样式 */
.metric-card {
  border: 1px solid var(--border); /* 边框 */
  padding: 20px 30px; /* 内边距 */
  min-width: 150px; /* 最小宽度为 150 像素 */
}

/* 指标值样式 */
.metric-value {
  font-family: var(--font-mono); /* 使用等宽字体 */
  font-size: 1.8rem; /* 字体大小 */
  font-weight: 520; /* 字体粗细 */
  margin-bottom: 5px; /* 下边距为 5 像素 */
}

/* 指标标签样式 */
.metric-label {
  font-size: 0.85rem; /* 字体大小 */
  color: #999; /* 文字颜色为灰色 */
}

/* 项目模拟步骤介绍样式 */
.steps-container {
  border: 1px solid var(--border); /* 边框 */
  padding: 30px; /* 内边距 */
  position: relative; /* 相对定位 */
}

/* 步骤头部样式 */
.steps-header {
  font-family: var(--font-mono); /* 使用等宽字体 */
  font-size: 0.8rem; /* 字体大小 */
  color: #999; /* 文字颜色为灰色 */
  margin-bottom: 25px; /* 下边距为 25 像素 */
  display: flex; /* 使用 Flex 布局 */
  align-items: center; /* 垂直居中对齐 */
  gap: 8px; /* 子元素之间的间距 */
}

/* 菱形图标样式 */
.diamond-icon {
  font-size: 1.2rem; /* 字体大小 */
  line-height: 1; /* 行高 */
}

/* 工作流列表样式 */
.workflow-list {
  display: flex; /* 使用 Flex 布局 */
  flex-direction: column; /* 垂直方向排列子元素 */
  gap: 20px; /* 子元素之间的间距 */
}

/* 工作流项样式 */
.workflow-item {
  display: flex; /* 使用 Flex 布局 */
  align-items: flex-start; /* 顶部对齐 */
  gap: 20px; /* 子元素之间的间距 */
}

/* 步骤编号样式 */
.step-num {
  font-family: var(--font-mono); /* 使用等宽字体 */
  font-weight: 700; /* 字体粗细 */
  color: var(--black); /* 文字颜色为黑色 */
  opacity: 0.3; /* 透明度为 0.3 */
}

/* 步骤信息样式 */
.step-info {
  flex: 1; /* 占据剩余空间 */
}

/* 步骤标题样式 */
.step-title {
  font-weight: 520; /* 字体粗细 */
  font-size: 1rem; /* 字体大小 */
  margin-bottom: 4px; /* 下边距为 4 像素 */
}

/* 步骤描述样式 */
.step-desc {
  font-size: 0.85rem; /* 字体大小 */
  color: var(--gray-text); /* 文字颜色为灰色 */
}

/* 右侧交互控制台样式 */
.right-panel {
  flex: 1.2; /* 占据 1.2 份空间 */
}

/* 控制台盒子样式 */
.console-box {
  border: 1px solid #CCC; /* 外部实线边框 */
  padding: 8px; /* 内边距形成双重边框感 */
}

/* 控制台区域样式 */
.console-section {
  padding: 20px; /* 内边距 */
}

/* 按钮区域样式 */
.console-section.btn-section {
  padding-top: 0; /* 上内边距为 0 */
}

/* 控制台头部样式 */
.console-header {
  display: flex; /* 使用 Flex 布局 */
  justify-content: space-between; /* 两端对齐 */
  margin-bottom: 15px; /* 下边距为 15 像素 */
  font-family: var(--font-mono); /* 使用等宽字体 */
  font-size: 0.75rem; /* 字体大小 */
  color: #666; /* 文字颜色为灰色 */
}

/* 上传区域样式 */
.upload-zone {
  border: 1px dashed #CCC; /* 虚线边框 */
  height: 200px; /* 高度为 200 像素 */
  display: flex; /* 使用 Flex 布局 */
  align-items: center; /* 垂直居中对齐 */
  justify-content: center; /* 水平居中对齐 */
  cursor: pointer; /* 鼠标悬停时显示手型光标 */
  transition: all 0.3s; /* 所有属性的过渡动画时间为 0.3 秒 */
  background: #FAFAFA; /* 背景色为浅灰色 */
}

/* 上传区域悬停样式 */
.upload-zone:hover {
  background: #F0F0F0; /* 背景色为浅灰色 */
  border-color: #999; /* 边框颜色为灰色 */
}

/* 上传占位符样式 */
.upload-placeholder {
  text-align: center; /* 文本居中对齐 */
}

/* 上传图标样式 */
.upload-icon {
  width: 40px; /* 宽度为 40 像素 */
  height: 40px; /* 高度为 40 像素 */
  border: 1px solid #DDD; /* 边框 */
  display: flex; /* 使用 Flex 布局 */
  align-items: center; /* 垂直居中对齐 */
  justify-content: center; /* 水平居中对齐 */
  margin: 0 auto 15px; /* 外边距 */
  color: #999; /* 文字颜色为灰色 */
}

/* 上传标题样式 */
.upload-title {
  font-weight: 500; /* 字体粗细 */
  font-size: 0.9rem; /* 字体大小 */
  margin-bottom: 5px; /* 下边距为 5 像素 */
}

/* 上传提示样式 */
.upload-hint {
  font-family: var(--font-mono); /* 使用等宽字体 */
  font-size: 0.75rem; /* 字体大小 */
  color: #999; /* 文字颜色为灰色 */
}

/* 文件列表样式 */
.file-list {
  width: 100%; /* 宽度为 100% */
  padding: 15px; /* 内边距 */
  display: flex; /* 使用 Flex 布局 */
  flex-direction: column; /* 垂直方向排列子元素 */
  gap: 10px; /* 子元素之间的间距 */
}

/* 文件项样式 */
.file-item {
  display: flex; /* 使用 Flex 布局 */
  align-items: center; /* 垂直居中对齐 */
  background: var(--white); /* 背景色为白色 */
  padding: 8px 12px; /* 内边距 */
  border: 1px solid #EEE; /* 边框 */
  font-family: var(--font-mono); /* 使用等宽字体 */
  font-size: 0.85rem; /* 字体大小 */
}

/* 文件名样式 */
.file-name {
  flex: 1; /* 占据剩余空间 */
  margin: 0 10px; /* 外边距 */
}

/* 移除按钮样式 */
.remove-btn {
  background: none; /* 背景透明 */
  border: none; /* 无边框 */
  cursor: pointer; /* 鼠标悬停时显示手型光标 */
  font-size: 1.2rem; /* 字体大小 */
  color: #999; /* 文字颜色为灰色 */
}

/* 控制台分割线样式 */
.console-divider {
  display: flex; /* 使用 Flex 布局 */
  align-items: center; /* 垂直居中对齐 */
  margin: 10px 0; /* 外边距 */
}

/* 控制台分割线前后样式 */
.console-divider::before,
.console-divider::after {
  content: ''; /* 内容为空 */
  flex: 1; /* 占据剩余空间 */
  height: 1px; /* 高度为 1 像素 */
  background: #EEE; /* 背景色为浅灰色 */
}

/* 控制台分割线文本样式 */
.console-divider span {
  padding: 0 15px; /* 内边距 */
  font-family: var(--font-mono); /* 使用等宽字体 */
  font-size: 0.7rem; /* 字体大小 */
  color: #BBB; /* 文字颜色为浅灰色 */
  letter-spacing: 1px; /* 字母间距 */
}

/* 输入包装器样式 */
.input-wrapper {
  position: relative; /* 相对定位 */
  border: 1px solid #DDD; /* 边框 */
  background: #FAFAFA; /* 背景色为浅灰色 */
}

/* 代码输入文本框样式 */
.code-input {
  width: 100%; /* 宽度为 100% */
  border: none; /* 无边框 */
  background: transparent; /* 背景透明 */
  padding: 20px; /* 内边距 */
  font-family: var(--font-mono); /* 使用等宽字体 */
  font-size: 0.9rem; /* 字体大小 */
  line-height: 1.6; /* 行高 */
  resize: vertical; /* 允许垂直方向调整大小 */
  outline: none; /* 无轮廓 */
  min-height: 150px; /* 最小高度为 150 像素 */
}

/* 模型徽章样式 */
.model-badge {
  position: absolute; /* 绝对定位 */
  bottom: 10px; /* 距离底部 10 像素 */
  right: 15px; /* 距离右侧 15 像素 */
  font-family: var(--font-mono); /* 使用等宽字体 */
  font-size: 0.7rem; /* 字体大小 */
  color: #AAA; /* 文字颜色为浅灰色 */
}

/* 启动引擎按钮样式 */
.start-engine-btn {
  width: 100%; /* 宽度为 100% */
  background: var(--black); /* 背景色为黑色 */
  color: var(--white); /* 文字颜色为白色 */
  border: none; /* 无边框 */
  padding: 20px; /* 内边距 */
  font-family: var(--font-mono); /* 使用等宽字体 */
  font-weight: 700; /* 字体粗细 */
  font-size: 1.1rem; /* 字体大小 */
  display: flex; /* 使用 Flex 布局 */
  justify-content: space-between; /* 两端对齐 */
  align-items: center; /* 垂直居中对齐 */
  cursor: pointer; /* 鼠标悬停时显示手型光标 */
  transition: all 0.3s ease; /* 所有属性的过渡动画时间为 0.3 秒 */
  letter-spacing: 1px; /* 字母间距 */
  position: relative; /* 相对定位 */
  overflow: hidden; /* 隐藏溢出内容 */
}

/* 可点击状态（非禁用）样式 */
.start-engine-btn:not(:disabled) {
  background: var(--black); /* 背景色为黑色 */
  border: 1px solid var(--black); /* 边框为黑色 */
  animation: pulse-border 2s infinite; /* 边框脉冲动画 */
}

/* 启动引擎按钮悬停样式 */
.start-engine-btn:hover:not(:disabled) {
  background: var(--orange); /* 背景色为橙色 */
  border-color: var(--orange); /* 边框颜色为橙色 */
  transform: translateY(-2px); /* 向上平移 2 像素 */
}

/* 启动引擎按钮激活样式 */
.start-engine-btn:active:not(:disabled) {
  transform: translateY(0); /* 恢复原位 */
}

/* 启动引擎按钮禁用样式 */
.start-engine-btn:disabled {
  background: #E5E5E5; /* 背景色为浅灰色 */
  color: #999; /* 文字颜色为灰色 */
  cursor: not-allowed; /* 鼠标悬停时显示禁止光标 */
  transform: none; /* 无变换 */
  border: 1px solid #E5E5E5; /* 边框为浅灰色 */
}

/* 引导动画：微妙的边框脉冲 */
@keyframes pulse-border {
  0% { box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.2); } /* 阴影初始状态 */
  70% { box-shadow: 0 0 0 6px rgba(0, 0, 0, 0); } /* 阴影扩散状态 */
  100% { box-shadow: 0 0 0 0 rgba(0, 0, 0, 0); } /* 阴影消失状态 */
}

/* 响应式适配 */
@media (max-width: 1024px) {
  /* Dashboard 区域样式 */
  .dashboard-section {
    flex-direction: column; /* 垂直方向排列子元素 */
  }
  
  /* Hero 区域样式 */
  .hero-section {
    flex-direction: column; /* 垂直方向排列子元素 */
  }
  
  /* Hero 左侧样式 */
  .hero-left {
    padding-right: 0; /* 右内边距为 0 */
    margin-bottom: 40px; /* 下边距为 40 像素 */
  }
  
  /* Hero Logo 样式 */
  .hero-logo {
    max-width: 200px; /* 最大宽度为 200 像素 */
    margin-bottom: 20px; /* 下边距为 20 像素 */
  }
}
</style>
