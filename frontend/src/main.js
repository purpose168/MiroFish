/**
 * Vue 应用入口文件
 * 
 * 本文件是整个 Vue 应用的入口点，负责创建和初始化 Vue 应用实例。
 * 在 Vue 3 中，main.js 是应用启动的第一步，所有的全局配置和插件注册都在这里完成。
 * 
 * 主要职责：
 * - 创建 Vue 应用实例
 * - 注册全局插件（如 Vue Router、Pinia、Element Plus 等）
 * - 配置全局属性和方法
 * - 将应用挂载到 DOM 元素上
 * 
 * Vue 应用生命周期：
 * 1. 导入必要的模块和组件
 * 2. 创建 Vue 应用实例（createApp）
 * 3. 注册插件和全局配置（app.use）
 * 4. 挂载应用到 DOM（app.mount）
 * 5. 应用开始运行，渲染组件树
 * 
 * 技术说明：
 * - createApp(): Vue 3 提供的 API，用于创建应用实例
 * - app.use(): 注册插件的方法，插件可以是路由、状态管理、UI 库等
 * - app.mount(): 将应用挂载到 DOM 元素，开始渲染
 * 
 * 常见的全局配置：
 * - 路由：Vue Router，用于页面导航
 * - 状态管理：Pinia 或 Vuex，用于全局状态管理
 * - UI 框架：Element Plus、Ant Design Vue 等
 * - HTTP 客户端：Axios，用于发送 HTTP 请求
 * - 全局组件：注册全局可用的组件
 * - 全局指令：注册自定义指令（如 v-focus、v-loading）
 * - 全局属性：通过 app.config.globalProperties 添加全局属性
 * 
 * 注意事项：
 * - main.js 应该保持简洁，只负责应用初始化
 * - 具体的业务逻辑应该在组件中实现
 * - 插件的注册顺序可能影响功能，需要注意依赖关系
 * - 挂载点（#app）必须在 HTML 中存在
 * 
 * 与 Vue 2 的区别：
 * - Vue 2 使用 new Vue() 创建实例
 * - Vue 3 使用 createApp() 创建实例，支持多实例
 * - Vue 3 的插件系统更加灵活和模块化
 */

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)

app.mount('#app')