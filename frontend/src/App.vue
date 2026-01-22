<!--
  Vue 应用根组件
  本文件是整个 Vue 应用的根组件（Root Component），是所有其他组件的父组件。
  在 Vue 应用中，App.vue 是组件树的根节点，所有页面组件都通过它渲染。
  
  主要职责：
  - 提供应用的整体布局结构
  - 渲染路由视图（router-view）
  - 定义全局样式和主题
  - 配置全局字体和排版
  
  Vue Router 工作原理：
  - router-view 是 Vue Router 提供的内置组件
  - 它会根据当前 URL 路径自动渲染对应的路由组件
  - 当路由变化时，router-view 会自动切换显示的组件
  - 支持嵌套路由，实现多层级的页面结构
  
  组件结构：
  - template: 模板部分，定义组件的 HTML 结构
  - script: 脚本部分，定义组件的逻辑和数据
  - style: 样式部分，定义组件的 CSS 样式
  
  全局样式作用：
  - 样式重置：消除浏览器默认样式的差异
  - 字体配置：设置全局字体和字体平滑
  - 滚动条样式：自定义滚动条外观
  - 按钮样式：统一按钮的字体
  
  注意事项：
  - App.vue 的样式会应用到整个应用
  - 避免在 App.vue 中编写过多的业务逻辑
  - 全局样式应该保持简洁，避免影响子组件
  - 使用 scoped 样式可以限制样式作用范围（但 App.vue 通常不需要）
-->
<template>
  <!-- 
    router-view 组件
    Vue Router 提供的内置组件，用于渲染当前路由对应的组件。
    
    工作原理：
    1. 监听 URL 变化
    2. 根据 URL 路径匹配路由配置
    3. 渲染匹配到的路由组件
    4. 当路由变化时，自动切换显示的组件
    
    支持的功能：
    - 路由过渡动画：使用 <transition> 包裹实现页面切换动画
    - 嵌套路由：支持多层级路由结构
    - 路由守卫：支持导航守卫和权限控制
    - 路由参数：自动将路由参数传递给组件
    
    示例：
    URL: /simulation/123
    路由配置: path: '/simulation/:simulationId'
    渲染组件: SimulationView
    组件接收: props.simulationId = '123'
  -->
  <router-view />
</template>

<script setup>
// 使用 Vue 3 的 Composition API 和 setup 语法
// setup 是 Vue 3 推荐的组件编写方式，提供了更好的类型推断和代码组织
// 
// setup 语法糖：
// - <script setup> 是 Vue 3.2+ 提供的语法糖
// - 自动将顶层变量暴露给模板使用
// - 不需要 return 语句，代码更简洁
// - 提供更好的 TypeScript 支持
// 
// 在这个组件中，我们不需要编写任何逻辑
// 因为 App.vue 只是一个容器组件，负责渲染 router-view
// 所有的业务逻辑都在具体的页面组件中实现
// 
// 使用 Vue Router 来管理页面
// Vue Router 是 Vue.js 官方的路由管理器，用于构建单页应用（SPA）
// 它提供了：
// - 声明式路由配置
// - 嵌套路由
// - 路由参数和查询
// - 导航守卫
// - 过渡动画
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 
  应用根元素样式
  #app 是 main.js 中挂载应用的 DOM 元素
  这里定义了全局的字体、颜色和背景
*/
#app {
  font-family: 'JetBrains Mono', 'Space Grotesk', 'Noto Sans SC', monospace;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #000000;
  background-color: #ffffff;
}

/* 
  滚动条样式
  使用 WebKit 滚动条伪元素自定义滚动条外观
  这些样式适用于 Chrome、Safari、Edge 等基于 WebKit 的浏览器
  
  滚动条结构：
  - ::-webkit-scrollbar: 滚动条整体
  - ::-webkit-scrollbar-track: 滚动条轨道（背景）
  - ::-webkit-scrollbar-thumb: 滚动条滑块（可拖动部分）
  - ::-webkit-scrollbar-thumb:hover: 滚动条滑块悬停状态
*/
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #000000;
}

::-webkit-scrollbar-thumb:hover {
  background: #333333;
}

/* 
  全局按钮样式
  统一所有按钮的字体，继承父元素的字体设置
  这样可以确保按钮文本与应用整体风格一致
*/
button {
  font-family: inherit;
}
</style>
