import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Process from '../views/MainView.vue'
import SimulationView from '../views/SimulationView.vue'
import SimulationRunView from '../views/SimulationRunView.vue'
import ReportView from '../views/ReportView.vue'
import InteractionView from '../views/InteractionView.vue'

/**
 * Vue Router 路由配置文件
 * 
 * 本文件定义了应用的所有路由规则，实现了单页应用（SPA）的页面导航功能。
 * Vue Router 是 Vue.js 官方的路由管理器，用于构建单页应用。
 * 
 * 核心概念：
 * - 路由（Route）：定义 URL 路径与组件的映射关系
 * - 路由器（Router）：管理路由的实例，负责监听 URL 变化并渲染对应组件
 * - 路由参数（Route Params）：URL 中的动态参数，如 :projectId、:simulationId
 * - 路由模式（History Mode）：使用 HTML5 History API 实现无刷新的 URL 变化
 * 
 * 路由配置结构：
 * - path: URL 路径，支持动态参数（如 :projectId）
 * - name: 路由名称，用于编程式导航（router.push({ name: 'Home' })）
 * - component: 对应的 Vue 组件
 * - props: 是否将路由参数作为 props 传递给组件
 * 
 * 应用路由流程：
 * 1. 首页（/）：显示项目列表和历史记录
 * 2. 处理页面（/process/:projectId）：上传文档、生成本体、构建图谱
 * 3. 模拟配置页面（/simulation/:simulationId）：配置模拟参数、准备环境
 * 4. 模拟运行页面（/simulation/:simulationId/start）：启动和监控模拟运行
 * 5. 报告页面（/report/:reportId）：查看生成的报告
 * 6. 交互页面（/interaction/:reportId）：与 Report Agent 对话
 * 
 * 技术特点：
 * - 使用 HTML5 History 模式，URL 更加美观（不需要 # 符号）
 * - 支持动态路由参数，实现资源级别的导航
 * - 使用 props 传递路由参数，组件解耦更清晰
 * - 命名路由，便于编程式导航和代码维护
 * 
 * 注意事项：
 * - 需要服务器配置支持 History 模式，否则刷新页面会 404
 * - 动态参数（:projectId）会作为 props 传递给组件
 * - 路由守卫（Navigation Guards）可用于权限控制和页面跳转拦截
 * - 路由懒加载（Lazy Loading）可优化首屏加载性能
 */

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/process/:projectId',
    name: 'Process',
    component: Process,
    props: true
  },
  {
    path: '/simulation/:simulationId',
    name: 'Simulation',
    component: SimulationView,
    props: true
  },
  {
    path: '/simulation/:simulationId/start',
    name: 'SimulationRun',
    component: SimulationRunView,
    props: true
  },
  {
    path: '/report/:reportId',
    name: 'Report',
    component: ReportView,
    props: true
  },
  {
    path: '/interaction/:reportId',
    name: 'Interaction',
    component: InteractionView,
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router