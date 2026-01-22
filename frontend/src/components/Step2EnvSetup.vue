<template>
  <!-- 环境搭建主面板：展示模拟环境配置的五个步骤流程 -->
  <div class="env-setup-panel">
    <!-- 滚动容器：包含所有步骤卡片 -->
    <div class="scroll-container">
      <!-- 步骤 01：模拟实例初始化 -->
      <div class="step-card" :class="{ 'active': phase === 0, 'completed': phase > 0 }">
        <!-- 卡片头部：显示步骤编号、标题和状态 -->
        <div class="card-header">
          <div class="step-info">
            <span class="step-num">01</span>
            <span class="step-title">模拟实例初始化</span>
          </div>
          <div class="step-status">
            <!-- 根据当前阶段显示不同的状态徽章 -->
            <span v-if="phase > 0" class="badge success">已完成</span>
            <span v-else class="badge processing">初始化</span>
          </div>
        </div>
        
        <!-- 卡片内容：包含 API 说明、描述和信息卡片 -->
        <div class="card-content">
          <!-- API 端点说明：使用等宽字体显示 -->
          <p class="api-note">POST /api/simulation/create</p>
          <!-- 步骤描述：解释模拟实例初始化的作用 -->
          <p class="description">
            新建simulation实例，拉取模拟世界参数模版
          </p>

          <!-- 信息卡片：显示项目、图谱、模拟和任务 ID -->
          <div v-if="simulationId" class="info-card">
            <div class="info-row">
              <span class="info-label">项目 ID</span>
              <span class="info-value mono">{{ projectData?.project_id }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">图谱 ID</span>
              <span class="info-value mono">{{ projectData?.graph_id }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">模拟 ID</span>
              <span class="info-value mono">{{ simulationId }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">任务 ID</span>
              <span class="info-value mono">{{ taskId || '异步任务已完成' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 步骤 02：生成 Agent 人设 -->
      <div class="step-card" :class="{ 'active': phase === 1, 'completed': phase > 1 }">
        <div class="card-header">
          <div class="step-info">
            <span class="step-num">02</span>
            <span class="step-title">生成 Agent 人设</span>
          </div>
          <div class="step-status">
            <!-- 显示生成进度百分比 -->
            <span v-if="phase > 1" class="badge success">已完成</span>
            <span v-else-if="phase === 1" class="badge processing">{{ prepareProgress }}%</span>
            <span v-else class="badge pending">等待</span>
          </div>
        </div>

        <div class="card-content">
          <p class="api-note">POST /api/simulation/prepare</p>
          <p class="description">
            结合上下文，自动调用工具从知识图谱梳理实体与关系，初始化模拟个体，并基于现实种子赋予他们独特的行为与记忆
          </p>

          <!-- 人设统计卡片网格：显示 Agent 数量、预期总数和关联话题数 -->
          <div v-if="profiles.length > 0" class="stats-grid">
            <div class="stat-card">
              <span class="stat-value">{{ profiles.length }}</span>
              <span class="stat-label">当前Agent数</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">{{ expectedTotal || '-' }}</span>
              <span class="stat-label">预期Agent总数</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">{{ totalTopicsCount }}</span>
              <span class="stat-label">现实种子当前关联话题数</span>
            </div>
          </div>

          <!-- 人设列表预览：显示已生成的 Agent 人设卡片 -->
          <div v-if="profiles.length > 0" class="profiles-preview">
            <div class="preview-header">
              <span class="preview-title">已生成的 Agent 人设</span>
            </div>
            <div class="profiles-list">
              <!-- 遍历显示每个人设卡片 -->
              <div 
                v-for="(profile, idx) in profiles" 
                :key="idx" 
                class="profile-card"
                @click="selectProfile(profile)"
              >
                <!-- 人设头部：显示真实姓名和用户名 -->
                <div class="profile-header">
                  <span class="profile-realname">{{ profile.username || 'Unknown' }}</span>
                  <span class="profile-username">@{{ profile.name || `agent_${idx}` }}</span>
                </div>
                <!-- 人设元数据：显示职业 -->
                <div class="profile-meta">
                  <span class="profile-profession">{{ profile.profession || '未知职业' }}</span>
                </div>
                <!-- 人设简介 -->
                <p class="profile-bio">{{ profile.bio || '暂无简介' }}</p>
                <!-- 感兴趣的话题标签 -->
                <div v-if="profile.interested_topics?.length" class="profile-topics">
                  <span 
                    v-for="topic in profile.interested_topics.slice(0, 3)" 
                    :key="topic" 
                    class="topic-tag"
                  >{{ topic }}</span>
                  <!-- 显示更多话题数量 -->
                  <span v-if="profile.interested_topics.length > 3" class="topic-more">
                    +{{ profile.interested_topics.length - 3 }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 步骤 03：生成双平台模拟配置 -->
      <div class="step-card" :class="{ 'active': phase === 2, 'completed': phase > 2 }">
        <div class="card-header">
          <div class="step-info">
            <span class="step-num">03</span>
            <span class="step-title">生成双平台模拟配置</span>
          </div>
          <div class="step-status">
            <span v-if="phase > 2" class="badge success">已完成</span>
            <span v-else-if="phase === 2" class="badge processing">生成中</span>
            <span v-else class="badge pending">等待</span>
          </div>
        </div>

        <div class="card-content">
          <p class="api-note">POST /api/simulation/prepare</p>
          <p class="description">
            LLM 根据模拟需求与现实种子，智能设置世界时间流速、推荐算法、每个个体的活跃时间段、发言频率、事件触发等参数
          </p>
          
          <!-- 配置详情面板：显示时间、Agent、平台和 LLM 配置 -->
          <div v-if="simulationConfig" class="config-detail-panel">
            <!-- 时间配置区块 -->
            <div class="config-block">
              <div class="config-grid">
                <div class="config-item">
                  <span class="config-item-label">模拟时长</span>
                  <span class="config-item-value">{{ simulationConfig.time_config?.total_simulation_hours || '-' }} 小时</span>
                </div>
                <div class="config-item">
                  <span class="config-item-label">每轮时长</span>
                  <span class="config-item-value">{{ simulationConfig.time_config?.minutes_per_round || '-' }} 分钟</span>
                </div>
                <div class="config-item">
                  <span class="config-item-label">总轮次</span>
                  <span class="config-item-value">{{ Math.floor((simulationConfig.time_config?.total_simulation_hours * 60 / simulationConfig.time_config?.minutes_per_round)) || '-' }} 轮</span>
                </div>
                <div class="config-item">
                  <span class="config-item-label">每小时活跃</span>
                  <span class="config-item-value">{{ simulationConfig.time_config?.agents_per_hour_min }}-{{ simulationConfig.time_config?.agents_per_hour_max }}</span>
                </div>
              </div>
              <!-- 时间段配置：高峰、工作、早间、低谷时段 -->
              <div class="time-periods">
                <div class="period-item">
                  <span class="period-label">高峰时段</span>
                  <span class="period-hours">{{ simulationConfig.time_config?.peak_hours?.join(':00, ') }}:00</span>
                  <span class="period-multiplier">×{{ simulationConfig.time_config?.peak_activity_multiplier }}</span>
                </div>
                <div class="period-item">
                  <span class="period-label">工作时段</span>
                  <span class="period-hours">{{ simulationConfig.time_config?.work_hours?.[0] }}:00-{{ simulationConfig.time_config?.work_hours?.slice(-1)[0] }}:00</span>
                  <span class="period-multiplier">×{{ simulationConfig.time_config?.work_activity_multiplier }}</span>
                </div>
                <div class="period-item">
                  <span class="period-label">早间时段</span>
                  <span class="period-hours">{{ simulationConfig.time_config?.morning_hours?.[0] }}:00-{{ simulationConfig.time_config?.morning_hours?.slice(-1)[0] }}:00</span>
                  <span class="period-multiplier">×{{ simulationConfig.time_config?.morning_activity_multiplier }}</span>
                </div>
                <div class="period-item">
                  <span class="period-label">低谷时段</span>
                  <span class="period-hours">{{ simulationConfig.time_config?.off_peak_hours?.[0] }}:00-{{ simulationConfig.time_config?.off_peak_hours?.slice(-1)[0] }}:00</span>
                  <span class="period-multiplier">×{{ simulationConfig.time_config?.off_peak_activity_multiplier }}</span>
                </div>
              </div>
            </div>

            <!-- Agent 配置区块 -->
            <div class="config-block">
              <div class="config-block-header">
                <span class="config-block-title">Agent 配置</span>
                <span class="config-block-badge">{{ simulationConfig.agent_configs?.length || 0 }} 个</span>
              </div>
              <!-- Agent 卡片列表 -->
              <div class="agents-cards">
                <div 
                  v-for="agent in simulationConfig.agent_configs" 
                  :key="agent.agent_id" 
                  class="agent-card"
                >
                  <!-- 卡片头部：显示 Agent ID、名称、类型和立场 -->
                  <div class="agent-card-header">
                    <div class="agent-identity">
                      <span class="agent-id">Agent {{ agent.agent_id }}</span>
                      <span class="agent-name">{{ agent.entity_name }}</span>
                    </div>
                    <div class="agent-tags">
                      <span class="agent-type">{{ agent.entity_type }}</span>
                      <span class="agent-stance" :class="'stance-' + agent.stance">{{ agent.stance }}</span>
                    </div>
                  </div>
                  
                  <!-- 活跃时间轴：24 小时活跃度可视化 -->
                  <div class="agent-timeline">
                    <span class="timeline-label">活跃时段</span>
                    <div class="mini-timeline">
                      <!-- 遍历 24 小时，显示每个小时的活跃状态 -->
                      <div 
                        v-for="hour in 24" 
                        :key="hour - 1" 
                        class="timeline-hour"
                        :class="{ 'active': agent.active_hours?.includes(hour - 1) }"
                        :title="`${hour - 1}:00`"
                      ></div>
                    </div>
                    <!-- 时间轴刻度 -->
                    <div class="timeline-marks">
                      <span>0</span>
                      <span>6</span>
                      <span>12</span>
                      <span>18</span>
                      <span>24</span>
                    </div>
                  </div>

                  <!-- 行为参数：发帖频率、评论频率、响应延迟、活跃度、情感倾向、影响力 -->
                  <div class="agent-params">
                    <div class="param-group">
                      <div class="param-item">
                        <span class="param-label">发帖/时</span>
                        <span class="param-value">{{ agent.posts_per_hour }}</span>
                      </div>
                      <div class="param-item">
                        <span class="param-label">评论/时</span>
                        <span class="param-value">{{ agent.comments_per_hour }}</span>
                      </div>
                      <div class="param-item">
                        <span class="param-label">响应延迟</span>
                        <span class="param-value">{{ agent.response_delay_min }}-{{ agent.response_delay_max }}min</span>
                      </div>
                    </div>
                    <div class="param-group">
                      <div class="param-item">
                        <span class="param-label">活跃度</span>
                        <span class="param-value with-bar">
                          <!-- 活跃度进度条 -->
                          <span class="mini-bar" :style="{ width: (agent.activity_level * 100) + '%' }"></span>
                          {{ (agent.activity_level * 100).toFixed(0) }}%
                        </span>
                      </div>
                      <div class="param-item">
                        <span class="param-label">情感倾向</span>
                        <!-- 根据情感倾向值显示不同颜色 -->
                        <span class="param-value" :class="agent.sentiment_bias > 0 ? 'positive' : agent.sentiment_bias < 0 ? 'negative' : 'neutral'">
                          {{ agent.sentiment_bias > 0 ? '+' : '' }}{{ agent.sentiment_bias?.toFixed(1) }}
                        </span>
                      </div>
                      <div class="param-item">
                        <span class="param-label">影响力</span>
                        <span class="param-value highlight">{{ agent.influence_weight?.toFixed(1) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 平台配置区块：Twitter 和 Reddit 推荐算法配置 -->
            <div class="config-block">
              <div class="config-block-header">
                <span class="config-block-title">推荐算法配置</span>
              </div>
              <div class="platforms-grid">
                <!-- Twitter 平台配置 -->
                <div v-if="simulationConfig.twitter_config" class="platform-card">
                  <div class="platform-card-header">
                    <span class="platform-name">平台 1：广场 / 信息流</span>
                  </div>
                  <div class="platform-params">
                    <div class="param-row">
                      <span class="param-label">时效权重</span>
                      <span class="param-value">{{ simulationConfig.twitter_config.recency_weight }}</span>
                    </div>
                    <div class="param-row">
                      <span class="param-label">热度权重</span>
                      <span class="param-value">{{ simulationConfig.twitter_config.popularity_weight }}</span>
                    </div>
                    <div class="param-row">
                      <span class="param-label">相关性权重</span>
                      <span class="param-value">{{ simulationConfig.twitter_config.relevance_weight }}</span>
                    </div>
                    <div class="param-row">
                      <span class="param-label">病毒阈值</span>
                      <span class="param-value">{{ simulationConfig.twitter_config.viral_threshold }}</span>
                    </div>
                    <div class="param-row">
                      <span class="param-label">回音室强度</span>
                      <span class="param-value">{{ simulationConfig.twitter_config.echo_chamber_strength }}</span>
                    </div>
                  </div>
                </div>
                <!-- Reddit 平台配置 -->
                <div v-if="simulationConfig.reddit_config" class="platform-card">
                  <div class="platform-card-header">
                    <span class="platform-name">平台 2：话题 / 社区</span>
                  </div>
                  <div class="platform-params">
                    <div class="param-row">
                      <span class="param-label">时效权重</span>
                      <span class="param-value">{{ simulationConfig.reddit_config.recency_weight }}</span>
                    </div>
                    <div class="param-row">
                      <span class="param-label">热度权重</span>
                      <span class="param-value">{{ simulationConfig.reddit_config.popularity_weight }}</span>
                    </div>
                    <div class="param-row">
                      <span class="param-label">相关性权重</span>
                      <span class="param-value">{{ simulationConfig.reddit_config.relevance_weight }}</span>
                    </div>
                    <div class="param-row">
                      <span class="param-label">病毒阈值</span>
                      <span class="param-value">{{ simulationConfig.reddit_config.viral_threshold }}</span>
                    </div>
                    <div class="param-row">
                      <span class="param-label">回音室强度</span>
                      <span class="param-value">{{ simulationConfig.reddit_config.echo_chamber_strength }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- LLM 配置推理：显示 LLM 生成配置的推理过程 -->
            <div v-if="simulationConfig.generation_reasoning" class="config-block">
              <div class="config-block-header">
                <span class="config-block-title">LLM 配置推理</span>
              </div>
              <div class="reasoning-content">
                <!-- 显示前两条推理内容 -->
                <div 
                  v-for="(reason, idx) in simulationConfig.generation_reasoning.split('|').slice(0, 2)" 
                  :key="idx" 
                  class="reasoning-item"
                >
                  <p class="reasoning-text">{{ reason.trim() }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 步骤 04：初始激活编排 -->
      <div class="step-card" :class="{ 'active': phase === 3, 'completed': phase > 3 }">
        <div class="card-header">
          <div class="step-info">
            <span class="step-num">04</span>
            <span class="step-title">初始激活编排</span>
          </div>
          <div class="step-status">
            <span v-if="phase > 3" class="badge success">已完成</span>
            <span v-else-if="phase === 3" class="badge processing">编排中</span>
            <span v-else class="badge pending">等待</span>
          </div>
        </div>

        <div class="card-content">
          <p class="api-note">POST /api/simulation/prepare</p>
          <p class="description">
            基于叙事方向，自动生成初始激活事件与热点话题，引导模拟世界的初始状态
          </p>

          <!-- 编排内容：叙事方向、热点话题和初始帖子流 -->
          <div v-if="simulationConfig?.event_config" class="orchestration-content">
            <!-- 叙事方向框 -->
            <div class="narrative-box">
              <span class="box-label narrative-label">
                <!-- 导航图标 -->
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="special-icon">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="url(#paint0_linear)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M16.24 7.76L14.12 14.12L7.76 16.24L9.88 9.88L16.24 7.76Z" fill="url(#paint0_linear)" stroke="url(#paint0_linear)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <defs>
                    <linearGradient id="paint0_linear" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#FF5722"/>
                      <stop offset="1" stop-color="#FF9800"/>
                    </linearGradient>
                  </defs>
                </svg>
                叙事引导方向
              </span>
              <p class="narrative-text">{{ simulationConfig.event_config.narrative_direction }}</p>
            </div>

            <!-- 热点话题部分 -->
            <div class="topics-section">
              <span class="box-label">初始热点话题</span>
              <div class="hot-topics-grid">
                <span v-for="topic in simulationConfig.event_config.hot_topics" :key="topic" class="hot-topic-tag">
                  # {{ topic }}
                </span>
              </div>
            </div>

            <!-- 初始帖子流部分 -->
            <div class="initial-posts-section">
              <span class="box-label">初始激活序列 ({{ simulationConfig.event_config.initial_posts.length }})</span>
              <div class="posts-timeline">
                <!-- 遍历显示每条初始帖子 -->
                <div v-for="(post, idx) in simulationConfig.event_config.initial_posts" :key="idx" class="timeline-item">
                  <div class="timeline-marker"></div>
                  <div class="timeline-content">
                    <div class="post-header">
                      <span class="post-role">{{ post.poster_type }}</span>
                      <span class="post-agent-info">
                        <span class="post-id">Agent {{ post.poster_agent_id }}</span>
                        <span class="post-username">@{{ getAgentUsername(post.poster_agent_id) }}</span>
                      </span>
                    </div>
                    <p class="post-text">{{ post.content }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 05: 准备完成 -->
      <div class="step-card" :class="{ 'active': phase === 4 }">
        <div class="card-header">
          <div class="step-info">
            <span class="step-num">05</span>
            <span class="step-title">准备完成</span>
          </div>
          <div class="step-status">
            <span v-if="phase >= 4" class="badge processing">进行中</span>
            <span v-else class="badge pending">等待</span>
          </div>
        </div>

        <div class="card-content">
          <p class="api-note">POST /api/simulation/start</p>
          <p class="description">模拟环境已准备完成，可以开始运行模拟</p>
          
          <!-- 模拟轮数配置 - 只有在配置生成完成且轮数计算出来后才显示 -->
          <div v-if="simulationConfig && autoGeneratedRounds" class="rounds-config-section">
            <div class="rounds-header">
              <div class="header-left">
                <span class="section-title">模拟轮数设定</span>
                <span class="section-desc">MiroFish 自动规划推演现实 <span class="desc-highlight">{{ simulationConfig?.time_config?.total_simulation_hours || '-' }}</span> 小时，每轮代表现实 <span class="desc-highlight">{{ simulationConfig?.time_config?.minutes_per_round || '-' }}</span> 分钟时间流逝</span>
              </div>
              <label class="switch-control">
                <input type="checkbox" v-model="useCustomRounds">
                <span class="switch-track"></span>
                <span class="switch-label">自定义</span>
              </label>
            </div>
            
            <Transition name="fade" mode="out-in">
              <div v-if="useCustomRounds" class="rounds-content custom" key="custom">
                <div class="slider-display">
                  <div class="slider-main-value">
                    <span class="val-num">{{ customMaxRounds }}</span>
                    <span class="val-unit">轮</span>
                  </div>
                  <div class="slider-meta-info">
                    <span>若Agent规模为100：预计耗时约 {{ Math.round(customMaxRounds * 0.6) }} 分钟</span>
                  </div>
                </div>

                <div class="range-wrapper">
                  <input 
                    type="range" 
                    v-model.number="customMaxRounds" 
                    min="10" 
                    :max="autoGeneratedRounds"
                    step="5"
                    class="minimal-slider"
                    :style="{ '--percent': ((customMaxRounds - 10) / (autoGeneratedRounds - 10)) * 100 + '%' }"
                  />
                  <div class="range-marks">
                    <span>10</span>
                    <span 
                      class="mark-recommend" 
                      :class="{ active: customMaxRounds === 40 }"
                      @click="customMaxRounds = 40"
                      :style="{ position: 'absolute', left: `calc(${(40 - 10) / (autoGeneratedRounds - 10) * 100}% - 30px)` }"
                    >40 (推荐)</span>
                    <span>{{ autoGeneratedRounds }}</span>
                  </div>
                </div>
              </div>
              
              <div v-else class="rounds-content auto" key="auto">
                <div class="auto-info-card">
                  <div class="auto-value">
                    <span class="val-num">{{ autoGeneratedRounds }}</span>
                    <span class="val-unit">轮</span>
                  </div>
                  <div class="auto-content">
                    <div class="auto-meta-row">
                      <span class="duration-badge">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        若Agent规模为100：预计耗时 {{ Math.round(autoGeneratedRounds * 0.6) }} 分钟
                      </span>
                    </div>
                    <div class="auto-desc">
                      <p class="highlight-tip" @click="useCustomRounds = true">若首次运行，强烈建议切换至‘自定义模式’减少模拟轮数，以便快速预览效果并降低报错风险 ➝</p>
                    </div>
                  </div>
                </div>
              </div>
            </Transition>
          </div>

          <div class="action-group dual">
            <button 
              class="action-btn secondary"
              @click="$emit('go-back')"
            >
              ← 返回图谱构建
            </button>
            <button 
              class="action-btn primary"
              :disabled="phase < 4"
              @click="handleStartSimulation"
            >
              开始双世界并行模拟 ➝
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Profile Detail Modal -->
    <Transition name="modal">
      <div v-if="selectedProfile" class="profile-modal-overlay" @click.self="selectedProfile = null">
        <div class="profile-modal">
          <div class="modal-header">
          <div class="modal-header-info">
            <div class="modal-name-row">
              <span class="modal-realname">{{ selectedProfile.username }}</span>
              <span class="modal-username">@{{ selectedProfile.name }}</span>
            </div>
            <span class="modal-profession">{{ selectedProfile.profession }}</span>
          </div>
          <button class="close-btn" @click="selectedProfile = null">×</button>
        </div>
        
        <div class="modal-body">
          <!-- 基本信息 -->
          <div class="modal-info-grid">
            <div class="info-item">
              <span class="info-label">事件外显年龄</span>
              <span class="info-value">{{ selectedProfile.age || '-' }} 岁</span>
            </div>
            <div class="info-item">
              <span class="info-label">事件外显性别</span>
              <span class="info-value">{{ { male: '男', female: '女', other: '其他' }[selectedProfile.gender] || selectedProfile.gender }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">国家/地区</span>
              <span class="info-value">{{ selectedProfile.country || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">事件外显MBTI</span>
              <span class="info-value mbti">{{ selectedProfile.mbti || '-' }}</span>
            </div>
          </div>

          <!-- 简介 -->
          <div class="modal-section">
            <span class="section-label">人设简介</span>
            <p class="section-bio">{{ selectedProfile.bio || '暂无简介' }}</p>
          </div>

          <!-- 关注话题 -->
          <div class="modal-section" v-if="selectedProfile.interested_topics?.length">
            <span class="section-label">现实种子关联话题</span>
            <div class="topics-grid">
              <span 
                v-for="topic in selectedProfile.interested_topics" 
                :key="topic" 
                class="topic-item"
              >{{ topic }}</span>
            </div>
          </div>

          <!-- 详细人设 -->
          <div class="modal-section" v-if="selectedProfile.persona">
            <span class="section-label">详细人设背景</span>
            
            <!-- 人设维度概览 -->
            <div class="persona-dimensions">
              <div class="dimension-card">
                <span class="dim-title">事件全景经历</span>
                <span class="dim-desc">在此事件中的完整行为轨迹</span>
              </div>
              <div class="dimension-card">
                <span class="dim-title">行为模式侧写</span>
                <span class="dim-desc">经验总结与行事风格偏好</span>
              </div>
              <div class="dimension-card">
                <span class="dim-title">独特记忆印记</span>
                <span class="dim-desc">基于现实种子形成的记忆</span>
              </div>
              <div class="dimension-card">
                <span class="dim-title">社会关系网络</span>
                <span class="dim-desc">个体链接与交互图谱</span>
              </div>
            </div>

            <div class="persona-content">
              <p class="section-persona">{{ selectedProfile.persona }}</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </Transition>

    <!-- Bottom Info / Logs -->
    <div class="system-logs">
      <div class="log-header">
        <span class="log-title">系统面板</span>
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
// 导入模拟相关的 API 函数
import { 
  prepareSimulation,           // 准备模拟环境
  getPrepareStatus,           // 获取准备状态
  getSimulationProfilesRealtime,  // 实时获取模拟人设
  getSimulationConfig,         // 获取模拟配置
  getSimulationConfigRealtime  // 实时获取模拟配置
} from '../api/simulation'

// 定义组件的 props：接收父组件传递的数据
const props = defineProps({
  simulationId: String,       // 模拟 ID，从父组件传入
  projectData: Object,        // 项目数据对象
  graphData: Object,         // 图谱数据对象
  systemLogs: Array           // 系统日志数组
})

// 定义组件的事件：向父组件发送事件
const emit = defineEmits(['go-back', 'next-step', 'add-log', 'update-status'])

// 响应式状态定义
const phase = ref(0)              // 当前阶段：0=初始化, 1=生成人设, 2=生成配置, 3=完成
const taskId = ref(null)           // 任务 ID，用于轮询准备状态
const prepareProgress = ref(0)    // 准备进度百分比
const currentStage = ref('')       // 当前阶段名称
const progressMessage = ref('')    // 进度消息
const profiles = ref([])           // Agent 人设列表
const entityTypes = ref([])        // 实体类型列表
const expectedTotal = ref(null)    // 预期的 Agent 总数
const simulationConfig = ref(null)  // 模拟配置对象
const selectedProfile = ref(null)    // 当前选中的 Agent 人设，用于显示详情模态框
const showProfilesDetail = ref(true) // 是否显示人设详细信息

// 日志去重：记录上一次输出的关键信息，避免重复日志
let lastLoggedMessage = ''
let lastLoggedProfileCount = 0
let lastLoggedConfigStage = ''

// 模拟轮数配置
const useCustomRounds = ref(false)  // 是否使用自定义轮数，默认使用自动配置
const customMaxRounds = ref(40)    // 自定义轮数，默认推荐 40 轮

// 监听当前阶段变化，更新 phase 状态
// 参数：
//   newStage: 新的阶段名称
watch(currentStage, (newStage) => {
  if (newStage === '生成Agent人设' || newStage === 'generating_profiles') {
    phase.value = 1  // 进入人设生成阶段
  } else if (newStage === '生成模拟配置' || newStage === 'generating_config') {
    phase.value = 2  // 进入配置生成阶段
    // 进入配置生成阶段，开始轮询配置
    if (!configTimer) {
      addLog('开始生成双平台模拟配置...')
      startConfigPolling()
    }
  } else if (newStage === '准备模拟脚本' || newStage === 'copying_scripts') {
    phase.value = 2  // 仍属于配置阶段
  }
})

// 计算属性：从配置中计算自动生成的轮数（不使用硬编码默认值）
// 返回：自动计算的总轮数，配置未生成时返回 null
const autoGeneratedRounds = computed(() => {
  if (!simulationConfig.value?.time_config) {
    return null  // 配置未生成时返回 null
  }
  const totalHours = simulationConfig.value.time_config.total_simulation_hours
  const minutesPerRound = simulationConfig.value.time_config.minutes_per_round
  if (!totalHours || !minutesPerRound) {
    return null  // 配置数据不完整时返回 null
  }
  const calculatedRounds = Math.floor((totalHours * 60) / minutesPerRound)
  // 确保最大轮数不小于 40（推荐值），避免滑动条范围异常
  return Math.max(calculatedRounds, 40)
})

// 轮询定时器变量
let pollTimer = null       // 准备状态轮询定时器
let profilesTimer = null   // 人设数据轮询定时器
let configTimer = null      // 配置数据轮询定时器

// 计算属性：根据显示模式返回不同数量的人设
const displayProfiles = computed(() => {
  if (showProfilesDetail.value) {
    return profiles.value  // 显示所有人设
  }
  return profiles.value.slice(0, 6)  // 只显示前 6 个
})

// 根据 agent_id 获取对应的 username
// 参数：
//   agentId: Agent ID
// 返回：对应的用户名，找不到时返回默认格式
const getAgentUsername = (agentId) => {
  if (profiles.value && profiles.value.length > agentId && agentId >= 0) {
    const profile = profiles.value[agentId]
    return profile?.username || `agent_${agentId}`
  }
  return `agent_${agentId}`
}

// 计算属性：计算所有人设的关联话题总数
const totalTopicsCount = computed(() => {
  return profiles.value.reduce((sum, p) => {
    return sum + (p.interested_topics?.length || 0)
  }, 0)
})

// 方法：向父组件发送日志消息
// 参数：
//   msg: 日志消息
const addLog = (msg) => {
  emit('add-log', msg)
}

// 处理开始模拟按钮点击事件
const handleStartSimulation = () => {
  // 构建传递给父组件的参数
  const params = {}
  
  if (useCustomRounds.value) {
    // 用户自定义轮数，传递 max_rounds 参数
    params.maxRounds = customMaxRounds.value
    addLog(`开始模拟，自定义轮数: ${customMaxRounds.value} 轮`)
  } else {
    // 用户选择保持自动生成的轮数，不传递 max_rounds 参数
    addLog(`开始模拟，使用自动配置轮数: ${autoGeneratedRounds.value} 轮`)
  }
  
  emit('next-step', params)
}

// 截断简介文本，超过指定长度时添加省略号
// 参数：
//   bio: 原始简介文本
// 返回：截断后的文本
const truncateBio = (bio) => {
  if (bio.length > 80) {
    return bio.substring(0, 80) + '...'
  }
  return bio
}

// 选择人设并显示详情模态框
// 参数：
//   profile: 选中的 Agent 人设对象
const selectProfile = (profile) => {
  selectedProfile.value = profile
}

// 自动开始准备模拟环境
const startPrepareSimulation = async () => {
  if (!props.simulationId) {
    addLog('错误：缺少 simulationId')
    emit('update-status', 'error')
    return
  }
  
  // 标记第一步完成，开始第二步
  phase.value = 1
  addLog(`模拟实例已创建：${props.simulationId}`)
  addLog('正在准备模拟环境...')
  emit('update-status', 'processing')
  
  try {
    // 调用 API 准备模拟环境
    const res = await prepareSimulation({
      simulation_id: props.simulationId,
      use_llm_for_profiles: true,      // 使用 LLM 生成人设
      parallel_profile_count: 5         // 并行生成人设数量
    })
    
    if (res.success && res.data) {
      if (res.data.already_prepared) {
        // 检测到已有完成的准备工作，直接使用
        addLog('检测到已有完成的准备工作，直接使用')
        await loadPreparedData()
        return
      }
      
      // 保存任务 ID，用于后续轮询
      taskId.value = res.data.task_id
      addLog(`准备任务已启动`)
      addLog(`  └─ 任务 ID：${res.data.task_id}`)
      
      // 立即设置预期 Agent 总数（从 prepare 接口返回值获取）
      if (res.data.expected_entities_count) {
        expectedTotal.value = res.data.expected_entities_count
        addLog(`从 Zep 图谱读取到 ${res.data.expected_entities_count} 个实体`)
        if (res.data.entity_types && res.data.entity_types.length > 0) {
          addLog(`  └─ 实体类型：${res.data.entity_types.join(', ')}`)
        }
      }
      
      addLog('开始轮询准备进度...')
      // 开始轮询进度
      startPolling()
      // 开始实时获取 Profiles
      startProfilesPolling()
    } else {
      addLog(`准备失败：${res.error || '未知错误'}`)
      emit('update-status', 'error')
    }
  } catch (err) {
    addLog(`准备异常：${err.message}`)
    emit('update-status', 'error')
  }
}

// 开始轮询准备状态
const startPolling = () => {
  pollTimer = setInterval(pollPrepareStatus, 2000)  // 每 2 秒轮询一次
}

// 停止轮询准备状态
const stopPolling = () => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

// 开始轮询人设数据
const startProfilesPolling = () => {
  profilesTimer = setInterval(fetchProfilesRealtime, 3000)  // 每 3 秒轮询一次
}

// 停止轮询人设数据
const stopProfilesPolling = () => {
  if (profilesTimer) {
    clearInterval(profilesTimer)
    profilesTimer = null
  }
}

// 轮询准备状态
const pollPrepareStatus = async () => {
  if (!taskId.value && !props.simulationId) return
  
  try {
    // 调用 API 获取准备状态
    const res = await getPrepareStatus({
      task_id: taskId.value,
      simulation_id: props.simulationId
    })
    
    if (res.success && res.data) {
      const data = res.data
      
      // 更新进度
      prepareProgress.value = data.progress || 0
      progressMessage.value = data.message || ''
      
      // 解析阶段信息并输出详细日志
      if (data.progress_detail) {
        currentStage.value = data.progress_detail.current_stage_name || ''
        
        // 输出详细进度日志（避免重复）
        const detail = data.progress_detail
        const logKey = `${detail.current_stage}-${detail.current_item}-${detail.total_items}`
        if (logKey !== lastLoggedMessage && detail.item_description) {
          lastLoggedMessage = logKey
          const stageInfo = `[${detail.stage_index}/${detail.total_stages}]`
          if (detail.total_items > 0) {
            addLog(`${stageInfo} ${detail.current_stage_name}: ${detail.current_item}/${detail.total_items} - ${detail.item_description}`)
          } else {
            addLog(`${stageInfo} ${detail.current_stage_name}: ${detail.item_description}`)
          }
        }
      } else if (data.message) {
        // 从消息中提取阶段
        const match = data.message.match(/\[(\d+)\/(\d+)\]\s*([^:]+)/)
        if (match) {
          currentStage.value = match[3].trim()
        }
        // 输出消息日志（避免重复）
        if (data.message !== lastLoggedMessage) {
          lastLoggedMessage = data.message
          addLog(data.message)
        }
      }
      
      // 检查是否完成
      if (data.status === 'completed' || data.status === 'ready' || data.already_prepared) {
        addLog('✓ 准备工作已完成')
        stopPolling()
        stopProfilesPolling()
        await loadPreparedData()
      } else if (data.status === 'failed') {
        addLog(`✗ 准备失败: ${data.error || '未知错误'}`)
        stopPolling()
        stopProfilesPolling()
      }
    }
  } catch (err) {
    console.warn('轮询状态失败:', err)
  }
}

// 实时获取人设数据
const fetchProfilesRealtime = async () => {
  if (!props.simulationId) return
  
  try {
    // 调用 API 实时获取人设数据
    const res = await getSimulationProfilesRealtime(props.simulationId, 'reddit')
    
    if (res.success && res.data) {
      const prevCount = profiles.value.length
      profiles.value = res.data.profiles || []
      expectedTotal.value = res.data.total_expected
      
      // 提取实体类型
      const types = new Set()
      profiles.value.forEach(p => {
        if (p.entity_type) types.add(p.entity_type)
      })
      entityTypes.value = Array.from(types)
      
      // 输出 Profile 生成进度日志（仅当数量变化时）
      const currentCount = profiles.value.length
      if (currentCount > 0 && currentCount !== lastLoggedProfileCount) {
        lastLoggedProfileCount = currentCount
        const total = expectedTotal.value || '?'
        const latestProfile = profiles.value[currentCount - 1]
        const profileName = latestProfile?.name || latestProfile?.username || `Agent_${currentCount}`
        if (currentCount === 1) {
          addLog(`开始生成Agent人设...`)
        }
        addLog(`→ Agent人设 ${currentCount}/${total}: ${profileName} (${latestProfile?.profession || '未知职业'})`)
        
        // 如果全部生成完成
        if (expectedTotal.value && currentCount >= expectedTotal.value) {
          addLog(`✓ 全部 ${currentCount} 个Agent人设生成完成`)
        }
      }
    }
  } catch (err) {
    console.warn('获取 Profiles 失败:', err)
  }
}

// 开始轮询配置数据
const startConfigPolling = () => {
  configTimer = setInterval(fetchConfigRealtime, 2000)  // 每 2 秒轮询一次
}

// 停止轮询配置数据
const stopConfigPolling = () => {
  if (configTimer) {
    clearInterval(configTimer)
    configTimer = null
  }
}

// 实时获取配置数据
const fetchConfigRealtime = async () => {
  if (!props.simulationId) return
  
  try {
    // 调用 API 实时获取配置数据
    const res = await getSimulationConfigRealtime(props.simulationId)
    
    if (res.success && res.data) {
      const data = res.data
      
      // 输出配置生成阶段日志（避免重复）
      if (data.generation_stage && data.generation_stage !== lastLoggedConfigStage) {
        lastLoggedConfigStage = data.generation_stage
        if (data.generation_stage === 'generating_profiles') {
          addLog('正在生成Agent人设配置...')
        } else if (data.generation_stage === 'generating_config') {
          addLog('正在调用LLM生成模拟配置参数...')
        }
      }
      
      // 如果配置已生成
      if (data.config_generated && data.config) {
        simulationConfig.value = data.config
        addLog('✓ 模拟配置生成完成')
        
        // 显示详细配置摘要
        if (data.summary) {
          addLog(`  ├─ Agent数量: ${data.summary.total_agents}个`)
          addLog(`  ├─ 模拟时长: ${data.summary.simulation_hours}小时`)
          addLog(`  ├─ 初始帖子: ${data.summary.initial_posts_count}条`)
          addLog(`  ├─ 热点话题: ${data.summary.hot_topics_count}个`)
          addLog(`  └─ 平台配置: Twitter ${data.summary.has_twitter_config ? '✓' : '✗'}, Reddit ${data.summary.has_reddit_config ? '✓' : '✗'}`)
        }
        
        // 显示时间配置详情
        if (data.config.time_config) {
          const tc = data.config.time_config
          addLog(`时间配置: 每轮${tc.minutes_per_round}分钟, 共${Math.floor((tc.total_simulation_hours * 60) / tc.minutes_per_round)}轮`)
        }
        
        // 显示事件配置
        if (data.config.event_config?.narrative_direction) {
          const narrative = data.config.event_config.narrative_direction
          addLog(`叙事方向: ${narrative.length > 50 ? narrative.substring(0, 50) + '...' : narrative}`)
        }
        
        stopConfigPolling()
        phase.value = 4
        addLog('✓ 环境搭建完成，可以开始模拟')
        emit('update-status', 'completed')
      }
    }
  } catch (err) {
    console.warn('获取 Config 失败:', err)
  }
}

// 加载已准备的数据
const loadPreparedData = async () => {
  phase.value = 2
  addLog('正在加载已有配置数据...')

  // 最后获取一次 Profiles
  await fetchProfilesRealtime()
  addLog(`已加载 ${profiles.value.length} 个Agent人设`)

  // 获取配置（使用实时接口）
  try {
    const res = await getSimulationConfigRealtime(props.simulationId)
    if (res.success && res.data) {
      if (res.data.config_generated && res.data.config) {
        simulationConfig.value = res.data.config
        addLog('✓ 模拟配置加载成功')
        
        // 显示详细配置摘要
        if (res.data.summary) {
          addLog(`  ├─ Agent数量: ${res.data.summary.total_agents}个`)
          addLog(`  ├─ 模拟时长: ${res.data.summary.simulation_hours}小时`)
          addLog(`  └─ 初始帖子: ${res.data.summary.initial_posts_count}条`)
        }
        
        addLog('✓ 环境搭建完成，可以开始模拟')
        phase.value = 4
        emit('update-status', 'completed')
      } else {
        // 配置尚未生成，开始轮询
        addLog('配置生成中，开始轮询等待...')
        startConfigPolling()
      }
    }
  } catch (err) {
    addLog(`加载配置失败: ${err.message}`)
    emit('update-status', 'error')
  }
}

// 日志内容容器的引用，用于自动滚动
const logContent = ref(null)

// 监听系统日志数组的变化，自动滚动到最新日志
watch(() => props.systemLogs?.length, () => {
  nextTick(() => {
    if (logContent.value) {
      logContent.value.scrollTop = logContent.value.scrollHeight
    }
  })
})

// 组件挂载时的生命周期钩子
onMounted(() => {
  // 自动开始准备流程
  if (props.simulationId) {
    addLog('Step2 环境搭建初始化')
    startPrepareSimulation()
  }
})

// 组件卸载时的生命周期钩子
onUnmounted(() => {
  // 清理所有定时器
  stopPolling()
  stopProfilesPolling()
  stopConfigPolling()
})
</script>

<style scoped>
/* 环境搭建主面板样式 */
.env-setup-panel {
  height: 100%;                    /* 占满父容器高度 */
  display: flex;                   /* 使用 Flexbox 布局 */
  flex-direction: column;          /* 垂直方向排列子元素 */
  background: #FAFAFA;             /* 浅灰色背景 */
  font-family: 'Space Grotesk', 'Noto Sans SC', system-ui, sans-serif;  /* 字体栈 */
}

/* 滚动容器样式：包含所有步骤卡片 */
.scroll-container {
  flex: 1;                         /* 占据剩余空间 */
  overflow-y: auto;                /* 允许垂直滚动 */
  padding: 24px;                   /* 内边距 */
  display: flex;                   /* 使用 Flexbox 布局 */
  flex-direction: column;          /* 垂直方向排列卡片 */
  gap: 20px;                       /* 卡片之间的间距 */
}

/* 步骤卡片样式 */
.step-card {
  background: #FFF;                /* 白色背景 */
  border-radius: 8px;              /* 圆角边框 */
  padding: 20px;                   /* 内边距 */
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);  /* 轻微阴影效果 */
  border: 1px solid #EAEAEA;      /* 浅灰色边框 */
  transition: all 0.3s ease;      /* 所有属性变化的过渡动画 */
  position: relative;              /* 相对定位 */
}

/* 激活状态的卡片：当前正在进行的步骤 */
.step-card.active {
  border-color: #FF5722;          /* 橙红色边框，突出显示 */
  box-shadow: 0 4px 12px rgba(255, 87, 34, 0.08);  /* 橙色阴影 */
}

/* 卡片头部样式 */
.card-header {
  display: flex;                   /* 使用 Flexbox 布局 */
  justify-content: space-between;  /* 两端对齐 */
  align-items: center;            /* 垂直居中 */
  margin-bottom: 16px;             /* 底部间距 */
}

/* 步骤信息区域：编号和标题 */
.step-info {
  display: flex;                   /* 使用 Flexbox 布局 */
  align-items: center;            /* 垂直居中 */
  gap: 12px;                       /* 编号和标题之间的间距 */
}

/* 步骤编号样式 */
.step-num {
  font-family: 'JetBrains Mono', monospace;  /* 等宽字体 */
  font-size: 20px;                 /* 字体大小 */
  font-weight: 700;                /* 字体粗细 */
  color: #E0E0E0;                  /* 浅灰色，未激活状态 */
}

/* 激活或完成状态的步骤编号 */
.step-card.active .step-num,
.step-card.completed .step-num {
  color: #000;                     /* 黑色，突出显示 */
}

/* 步骤标题样式 */
.step-title {
  font-weight: 600;                /* 字体粗细 */
  font-size: 14px;                 /* 字体大小 */
  letter-spacing: 0.5px;           /* 字母间距 */
}

/* 状态徽章样式 */
.badge {
  font-size: 10px;                 /* 小字体 */
  padding: 4px 8px;                /* 内边距 */
  border-radius: 4px;              /* 圆角 */
  font-weight: 600;                /* 字体粗细 */
  text-transform: uppercase;       /* 大写字母 */
}

/* 成功状态徽章：绿色背景 */
.badge.success { background: #E8F5E9; color: #2E7D32; }
/* 处理中状态徽章：橙色背景 */
.badge.processing { background: #FF5722; color: #FFF; }
/* 等待状态徽章：灰色背景 */
.badge.pending { background: #F5F5F5; color: #999; }
/* 强调状态徽章：蓝色背景 */
.badge.accent { background: #E3F2FD; color: #1565C0; }

/* 卡片内容样式 */
.card-content {
  /* 无额外内边距 - 使用步骤卡片的内边距 */
}

/* API 说明文字样式 */
.api-note {
  font-family: 'JetBrains Mono', monospace;  /* 等宽字体 */
  font-size: 10px;                 /* 小字体 */
  color: #999;                     /* 浅灰色 */
  margin-bottom: 8px;              /* 底部间距 */
}

/* 描述文字样式 */
.description {
  font-size: 12px;                 /* 字体大小 */
  color: #666;                     /* 深灰色 */
  line-height: 1.5;                /* 行高 */
  margin-bottom: 16px;             /* 底部间距 */
}

/* 操作区域样式 */
.action-section {
  margin-top: 16px;                /* 顶部间距 */
}

/* 操作按钮样式 */
.action-btn {
  display: inline-flex;             /* 内联 Flexbox 布局 */
  align-items: center;            /* 垂直居中 */
  gap: 8px;                        /* 图标和文字之间的间距 */
  padding: 12px 24px;               /* 内边距 */
  font-size: 14px;                 /* 字体大小 */
  font-weight: 600;                /* 字体粗细 */
  border: none;                    /* 无边框 */
  border-radius: 6px;              /* 圆角 */
  cursor: pointer;                /* 鼠标指针为手型 */
  transition: all 0.2s ease;        /* 所有属性变化的过渡动画 */
}

/* 主要操作按钮：黑色背景 */
.action-btn.primary {
  background: #000;                /* 黑色背景 */
  color: #FFF;                     /* 白色文字 */
}

/* 主要按钮的悬停效果（非禁用状态） */
.action-btn.primary:hover:not(:disabled) {
  opacity: 0.8;                    /* 降低透明度 */
}

/* 次要操作按钮：浅灰色背景 */
.action-btn.secondary {
  background: #F5F5F5;             /* 浅灰色背景 */
  color: #333;                     /* 深灰色文字 */
}

/* 次要按钮的悬停效果（非禁用状态） */
.action-btn.secondary:hover:not(:disabled) {
  background: #E5E5E5;           /* 深灰色背景 */
}

/* 禁用状态的操作按钮 */
.action-btn:disabled {
  opacity: 0.5;                    /* 降低透明度 */
  cursor: not-allowed;             /* 鼠标指针为禁止符号 */
}

/* 操作按钮组样式 */
.action-group {
  display: flex;                   /* 使用 Flexbox 布局 */
  gap: 12px;                       /* 按钮之间的间距 */
  margin-top: 16px;                /* 顶部间距 */
}

/* 双按钮组：使用 Grid 布局 */
.action-group.dual {
  display: grid;                   /* 使用 Grid 布局 */
  grid-template-columns: 1fr 1fr;  /* 两列等宽 */
}

/* 双按钮组中的按钮占满宽度 */
.action-group.dual .action-btn {
  width: 100%;                     /* 占满容器宽度 */
}

/* 信息卡片样式 */
.info-card {
  background: #F5F5F5;             /* 浅灰色背景 */
  border-radius: 6px;               /* 圆角 */
  padding: 16px;                   /* 内边距 */
  margin-top: 16px;                /* 顶部间距 */
}

/* 信息行样式 */
.info-row {
  display: flex;                   /* 使用 Flexbox 布局 */
  justify-content: space-between;  /* 两端对齐 */
  align-items: center;            /* 垂直居中 */
  padding: 8px 0;                   /* 垂直内边距 */
  border-bottom: 1px dashed #E0E0E0;  /* 底部虚线边框 */
}

/* 最后一行不显示底部边框 */
.info-row:last-child {
  border-bottom: none;
}

/* 信息标签样式 */
.info-label {
  font-size: 12px;                 /* 字体大小 */
  color: #666;                     /* 深灰色 */
}

/* 信息值样式 */
.info-value {
  font-size: 13px;                 /* 字体大小 */
  font-weight: 500;                /* 字体粗细 */
}

/* 等宽字体的信息值 */
.info-value.mono {
  font-family: 'JetBrains Mono', monospace;  /* 等宽字体 */
  font-size: 12px;                 /* 字体大小 */
}

/* 统计卡片网格样式 */
.stats-grid {
  display: grid;                   /* 使用 Grid 布局 */
  grid-template-columns: 1fr 1fr 1fr;  /* 三列等宽 */
  gap: 12px;                       /* 卡片之间的间距 */
  background: #F9F9F9;             /* 浅灰色背景 */
  padding: 16px;                   /* 内边距 */
  border-radius: 6px;               /* 圆角 */
}

/* 统计卡片样式 */
.stat-card {
  text-align: center;               /* 文本居中 */
}

/* 统计数值样式 */
.stat-value {
  display: block;                  /* 块级元素 */
  font-size: 20px;                 /* 字体大小 */
  font-weight: 700;                /* 字体粗细 */
  color: #000;                     /* 黑色 */
  font-family: 'JetBrains Mono', monospace;  /* 等宽字体 */
}

/* 统计标签样式 */
.stat-label {
  font-size: 9px;                  /* 小字体 */
  color: #999;                     /* 浅灰色 */
  text-transform: uppercase;      /* 大写字母 */
  margin-top: 4px;                 /* 顶部间距 */
  display: block;                  /* 块级元素 */
}

/* 人设预览区域样式 */
.profiles-preview {
  margin-top: 20px;                /* 顶部间距 */
  border-top: 1px solid #E5E5E5;  /* 顶部实线边框 */
  padding-top: 16px;               /* 顶部内边距 */
}

/* 预览头部样式 */
.preview-header {
  display: flex;                   /* 使用 Flexbox 布局 */
  justify-content: space-between;  /* 两端对齐 */
  align-items: center;            /* 垂直居中 */
  margin-bottom: 12px;             /* 底部间距 */
}

/* 预览标题样式 */
.preview-title {
  font-size: 12px;                 /* 字体大小 */
  font-weight: 600;                /* 字体粗细 */
  color: #666;                     /* 深灰色 */
  text-transform: uppercase;       /* 大写字母 */
  letter-spacing: 0.5px;           /* 字母间距 */
}

/* 人设列表样式 */
.profiles-list {
  display: grid;                   /* 使用 Grid 布局 */
  grid-template-columns: repeat(2, 1fr);  /* 两列等宽 */
  gap: 12px;                       /* 卡片之间的间距 */
  max-height: 320px;               /* 最大高度 */
  overflow-y: auto;               /* 允许垂直滚动 */
  padding-right: 4px;              /* 右侧内边距 */
}

/* 自定义滚动条样式 */
.profiles-list::-webkit-scrollbar {
  width: 4px;                      /* 滚动条宽度 */
}

/* 滚动条滑块样式 */
.profiles-list::-webkit-scrollbar-thumb {
  background: #DDD;                /* 深灰色 */
  border-radius: 2px;             /* 圆角 */
}

/* 滚动条滑块的悬停效果 */
.profiles-list::-webkit-scrollbar-thumb:hover {
  background: #CCC;                /* 更深的灰色 */
}

/* 人设卡片样式 */
.profile-card {
  background: #FAFAFA;             /* 浅灰色背景 */
  border: 1px solid #E5E5E5;      /* 浅灰色边框 */
  border-radius: 6px;               /* 圆角 */
  padding: 14px;                   /* 内边距 */
  cursor: pointer;                /* 鼠标指针为手型 */
  transition: all 0.2s ease;        /* 所有属性变化的过渡动画 */
}

/* 人设卡片的悬停效果 */
.profile-card:hover {
  border-color: #999;                /* 深灰色边框 */
  background: #FFF;                /* 白色背景 */
}

/* 人设头部样式 */
.profile-header {
  display: flex;                   /* 使用 Flexbox 布局 */
  align-items: baseline;         /* 基线对齐 */
  gap: 8px;                        /* 元素之间的间距 */
  margin-bottom: 6px;              /* 底部间距 */
}

/* 真实姓名样式 */
.profile-realname {
  font-size: 14px;                 /* 字体大小 */
  font-weight: 700;                /* 字体粗细 */
  color: #000;                     /* 黑色 */
}

/* 用户名样式 */
.profile-username {
  font-family: 'JetBrains Mono', monospace;  /* 等宽字体 */
  font-size: 11px;                 /* 字体大小 */
  color: #999;                     /* 浅灰色 */
}

/* 人设元数据样式 */
.profile-meta {
  margin-bottom: 8px;              /* 底部间距 */
}

/* 职业标签样式 */
.profile-profession {
  font-size: 11px;                 /* 字体大小 */
  color: #666;                     /* 深灰色 */
  background: #F0F0F0;           /* 浅灰色背景 */
  padding: 2px 8px;               /* 内边距 */
  border-radius: 3px;              /* 圆角 */
}

/* 人设简介样式 */
.profile-bio {
  font-size: 12px;                 /* 字体大小 */
  color: #444;                     /* 深灰色 */
  line-height: 1.6;                /* 行高 */
  margin: 0 0 10px 0;             /* 外边距 */
  display: -webkit-box;             /* 使用 WebKit 盒模型 */
  -webkit-line-clamp: 3;           /* 限制显示 3 行 */
  -webkit-box-orient: vertical;    /* 垂直方向排列 */
  overflow: hidden;                /* 隐藏溢出内容 */
}

/* 话题标签容器样式 */
.profile-topics {
  display: flex;                   /* 使用 Flexbox 布局 */
  flex-wrap: wrap;               /* 允许换行 */
  gap: 6px;                        /* 标签之间的间距 */
}

/* 话题标签样式 */
.topic-tag {
  font-size: 10px;                 /* 小字体 */
  color: #1565C0;                  /* 蓝色 */
  background: #E3F2FD;             /* 浅蓝色背景 */
  padding: 2px 8px;               /* 内边距 */
  border-radius: 10px;              /* 圆角 */
}

/* 更多话题标签样式 */
.topic-more {
  font-size: 10px;                 /* 小字体 */
  color: #999;                     /* 浅灰色 */
  padding: 2px 6px;               /* 内边距 */
}

/* 配置预览区域样式 */
/* 配置详情面板样式 */
.config-detail-panel {
  margin-top: 16px;                /* 顶部间距 */
}

/* 配置区块样式 */
.config-block {
  margin-top: 16px;                /* 顶部间距 */
  border-top: 1px solid #E5E5E5;  /* 顶部实线边框 */
  padding-top: 12px;               /* 顶部内边距 */
}

/* 第一个配置区块不显示顶部边框和内边距 */
.config-block:first-child {
  margin-top: 0;                   /* 无顶部间距 */
  border-top: none;                /* 无顶部边框 */
  padding-top: 0;                  /* 无顶部内边距 */
}

/* 配置区块头部样式 */
.config-block-header {
  display: flex;                   /* 使用 Flexbox 布局 */
  justify-content: space-between;  /* 两端对齐 */
  align-items: center;            /* 垂直居中 */
  margin-bottom: 12px;             /* 底部间距 */
}

/* 配置区块标题样式 */
.config-block-title {
  font-size: 12px;                 /* 字体大小 */
  font-weight: 600;                /* 字体粗细 */
  color: #666;                     /* 深灰色 */
  text-transform: uppercase;       /* 大写字母 */
  letter-spacing: 0.5px;           /* 字母间距 */
}

/* 配置区块徽章样式 */
.config-block-badge {
  font-family: 'JetBrains Mono', monospace;  /* 等宽字体 */
  font-size: 11px;                 /* 字体大小 */
  background: #F1F5F9;             /* 浅蓝灰色背景 */
  color: #475569;                  /* 深灰色文字 */
  padding: 2px 8px;               /* 内边距 */
  border-radius: 10px;              /* 圆角 */
}

/* 配置网格样式 */
.config-grid {
  display: grid;                   /* 使用 Grid 布局 */
  grid-template-columns: repeat(4, 1fr);  /* 四列等宽 */
  gap: 12px;                       /* 卡片之间的间距 */
}

/* 配置项样式 */
.config-item {
  background: #F9F9F9;             /* 浅灰色背景 */
  padding: 12px 14px;               /* 内边距 */
  border-radius: 6px;               /* 圆角 */
  display: flex;                   /* 使用 Flexbox 布局 */
  flex-direction: column;          /* 垂直方向排列 */
  gap: 4px;                        /* 元素之间的间距 */
}

/* 配置项标签样式 */
.config-item-label {
  font-size: 11px;                 /* 字体大小 */
  color: #94A3B8;                  /* 浅蓝灰色 */
}

/* 配置项值样式 */
.config-item-value {
  font-family: 'JetBrains Mono', monospace;  /* 等宽字体 */
  font-size: 16px;                 /* 字体大小 */
  font-weight: 600;                /* 字体粗细 */
  color: #1E293B;                  /* 深蓝灰色 */
}

/* 时间段样式 */
.time-periods {
  margin-top: 12px;                /* 顶部间距 */
  display: flex;                   /* 使用 Flexbox 布局 */
  flex-direction: column;          /* 垂直方向排列 */
  gap: 8px;                        /* 时间段之间的间距 */
}

/* 时间段项样式 */
.period-item {
  display: flex;                   /* 使用 Flexbox 布局 */
  align-items: center;            /* 垂直居中 */
  gap: 12px;                       /* 元素之间的间距 */
  padding: 8px 12px;               /* 内边距 */
  background: #F9F9F9;             /* 浅灰色背景 */
  border-radius: 6px;               /* 圆角 */
}

/* 时间段标签样式 */
.period-label {
  font-size: 12px;                 /* 字体大小 */
  font-weight: 500;                /* 字体粗细 */
  color: #64748B;                  /* 深灰色 */
  min-width: 70px;                 /* 最小宽度 */
}

/* 时间段小时样式 */
.period-hours {
  font-family: 'JetBrains Mono', monospace;  /* 等宽字体 */
  font-size: 11px;                 /* 字体大小 */
  color: #475569;                  /* 深灰色 */
  flex: 1;                         /* 占据剩余空间 */
}

/* 时间段倍数样式 */
.period-multiplier {
  font-family: 'JetBrains Mono', monospace;  /* 等宽字体 */
  font-size: 11px;                 /* 字体大小 */
  font-weight: 600;                /* 字体粗细 */
  color: #6366F1;                  /* 紫色 */
  background: #EEF2FF;             /* 浅紫色背景 */
  padding: 2px 6px;               /* 内边距 */
  border-radius: 4px;              /* 圆角 */
}

/* Agent 卡片网格样式 */
.agents-cards {
  display: grid;                   /* 使用 Grid 布局 */
  grid-template-columns: repeat(2, 1fr);  /* 两列等宽 */
  gap: 12px;                       /* 卡片之间的间距 */
  max-height: 400px;               /* 最大高度 */
  overflow-y: auto;               /* 允许垂直滚动 */
  padding-right: 4px;              /* 右侧内边距 */
}

/* 自定义滚动条样式 */
.agents-cards::-webkit-scrollbar {
  width: 4px;                      /* 滚动条宽度 */
}

/* 滚动条滑块样式 */
.agents-cards::-webkit-scrollbar-thumb {
  background: #DDD;                /* 深灰色 */
  border-radius: 2px;             /* 圆角 */
}

/* 滚动条滑块的悬停效果 */
.agents-cards::-webkit-scrollbar-thumb:hover {
  background: #CCC;                /* 更深的灰色 */
}

/* Agent 卡片样式 */
.agent-card {
  background: #F9F9F9;             /* 浅灰色背景 */
  border: 1px solid #E5E5E5;      /* 浅灰色边框 */
  border-radius: 6px;               /* 圆角 */
  padding: 14px;                   /* 内边距 */
  transition: all 0.2s ease;        /* 所有属性变化的过渡动画 */
}

/* Agent 卡片的悬停效果 */
.agent-card:hover {
  border-color: #999;                /* 深灰色边框 */
  background: #FFF;                /* 白色背景 */
}

/* Agent 卡片头部样式 */
.agent-card-header {
  display: flex;                   /* 使用 Flexbox 布局 */
  justify-content: space-between;  /* 两端对齐 */
  align-items: flex-start;         /* 顶部对齐 */
  margin-bottom: 14px;             /* 底部间距 */
  padding-bottom: 12px;             /* 底部内边距 */
  border-bottom: 1px solid #F1F5F9;  /* 底部实线边框 */
}

/* Agent 身份信息样式 */
.agent-identity {
  display: flex;                   /* 使用 Flexbox 布局 */
  flex-direction: column;          /* 垂直方向排列 */
  gap: 2px;                        /* 元素之间的间距 */
}

/* Agent ID 样式 */
.agent-id {
  font-family: 'JetBrains Mono', monospace;  /* 等宽字体 */
  font-size: 10px;                 /* 字体大小 */
  color: #94A3B8;                  /* 浅蓝灰色 */
}

/* Agent 名称样式 */
.agent-name {
  font-size: 14px;                 /* 字体大小 */
  font-weight: 600;                /* 字体粗细 */
  color: #1E293B;                  /* 深蓝灰色 */
}

/* Agent 标签组样式 */
.agent-tags {
  display: flex;                   /* 使用 Flexbox 布局 */
  gap: 6px;                        /* 标签之间的间距 */
}

/* Agent 类型标签样式 */
.agent-type {
  font-size: 10px;                 /* 小字体 */
  color: #64748B;                  /* 深灰色 */
  background: #F1F5F9;             /* 浅蓝灰色背景 */
  padding: 2px 8px;               /* 内边距 */
  border-radius: 4px;              /* 圆角 */
}

/* Agent 立场标签样式 */
.agent-stance {
  font-size: 10px;                 /* 小字体 */
  font-weight: 500;                /* 字体粗细 */
  text-transform: uppercase;       /* 大写字母 */
  padding: 2px 8px;               /* 内边距 */
  border-radius: 4px;              /* 圆角 */
}

/* 中立立场样式 */
.stance-neutral {
  background: #F1F5F9;             /* 浅蓝灰色背景 */
  color: #64748B;                  /* 深灰色文字 */
}

/* 支持立场样式 */
.stance-supportive {
  background: #DCFCE7;             /* 浅绿色背景 */
  color: #16A34A;                  /* 深绿色文字 */
}

/* 反对立场样式 */
.stance-opposing {
  background: #FEE2E2;             /* 浅红色背景 */
  color: #DC2626;                  /* 深红色文字 */
}

/* 观察立场样式 */
.stance-observer {
  background: #FEF3C7;             /* 浅黄色背景 */
  color: #D97706;                  /* 深黄色文字 */
}

/* Agent 时间轴样式 */
.agent-timeline {
  margin-bottom: 14px;             /* 底部间距 */
}

/* 时间轴标签样式 */
.timeline-label {
  display: block;                  /* 块级元素 */
  font-size: 10px;                 /* 字体大小 */
  color: #94A3B8;                  /* 浅蓝灰色 */
  margin-bottom: 6px;              /* 底部间距 */
  text-transform: uppercase;       /* 大写字母 */
  letter-spacing: 0.05em;          /* 字母间距 */
}

/* 迷你时间轴样式 */
.mini-timeline {
  display: flex;                   /* 使用 Flexbox 布局 */
  gap: 2px;                        /* 小时之间的间距 */
  height: 16px;                    /* 高度 */
  background: #F8FAFC;             /* 浅蓝灰色背景 */
  border-radius: 4px;              /* 圆角 */
  padding: 3px;                    /* 内边距 */
}

/* 时间轴小时样式 */
.timeline-hour {
  flex: 1;                         /* 占据相等空间 */
  background: #E2E8F0;             /* 浅灰色 */
  border-radius: 2px;             /* 圆角 */
  transition: all 0.2s;            /* 过渡动画 */
}

/* 激活状态的小时样式 */
.timeline-hour.active {
  background: linear-gradient(180deg, #6366F1, #818CF8);  /* 紫色渐变 */
}

/* 时间轴刻度样式 */
.timeline-marks {
  display: flex;                   /* 使用 Flexbox 布局 */
  justify-content: space-between;  /* 两端对齐 */
  margin-top: 4px;                 /* 顶部间距 */
  font-family: 'JetBrains Mono', monospace;  /* 等宽字体 */
  font-size: 9px;                  /* 字体大小 */
  color: #94A3B8;                  /* 浅蓝灰色 */
}

/* Agent 参数样式 */
.agent-params {
  display: flex;                   /* 使用 Flexbox 布局 */
  flex-direction: column;          /* 垂直方向排列 */
  gap: 10px;                       /* 参数组之间的间距 */
}

/* 参数组样式 */
.param-group {
  display: grid;                   /* 使用 Grid 布局 */
  grid-template-columns: repeat(3, 1fr);  /* 三列等宽 */
  gap: 8px;                        /* 参数项之间的间距 */
}

/* 参数项样式 */
.param-item {
  display: flex;                   /* 使用 Flexbox 布局 */
  flex-direction: column;          /* 垂直方向排列 */
  gap: 2px;                        /* 标签和值之间的间距 */
}

/* 参数项标签样式 */
.param-item .param-label {
  font-size: 10px;                 /* 字体大小 */
  color: #94A3B8;                  /* 浅蓝灰色 */
}

/* 参数项值样式 */
.param-item .param-value {
  font-family: 'JetBrains Mono', monospace;  /* 等宽字体 */
  font-size: 12px;                 /* 字体大小 */
  font-weight: 600;                /* 字体粗细 */
  color: #475569;                  /* 深灰色 */
}

/* 带进度条的参数值样式 */
.param-value.with-bar {
  display: flex;                   /* 使用 Flexbox 布局 */
  align-items: center;            /* 垂直居中 */
  gap: 6px;                        /* 进度条和文字之间的间距 */
}

/* 迷你进度条样式 */
.mini-bar {
  height: 4px;                     /* 高度 */
  background: linear-gradient(90deg, #6366F1, #A855F7);  /* 紫色渐变 */
  border-radius: 2px;             /* 圆角 */
  min-width: 4px;                  /* 最小宽度 */
  max-width: 40px;                 /* 最大宽度 */
}

/* 正面情感值样式 */
.param-value.positive {
  color: #16A34A;                  /* 绿色 */
}

/* 负面情感值样式 */
.param-value.negative {
  color: #DC2626;                  /* 红色 */
}

/* 中性情感值样式 */
.param-value.neutral {
  color: #64748B;                  /* 深灰色 */
}

/* 高亮参数值样式 */
.param-value.highlight {
  color: #6366F1;                  /* 紫色 */
}

/* 平台网格样式 */
.platforms-grid {
  display: grid;                   /* 使用 Grid 布局 */
  grid-template-columns: repeat(2, 1fr);  /* 两列等宽 */
  gap: 12px;                       /* 卡片之间的间距 */
}

/* 平台卡片样式 */
.platform-card {
  background: #F9F9F9;             /* 浅灰色背景 */
  padding: 14px;                   /* 内边距 */
  border-radius: 6px;               /* 圆角 */
}

/* 平台卡片头部样式 */
.platform-card-header {
  margin-bottom: 10px;             /* 底部间距 */
  padding-bottom: 8px;             /* 底部内边距 */
  border-bottom: 1px solid #E5E5E5;  /* 底部实线边框 */
}

/* 平台名称样式 */
.platform-name {
  font-size: 13px;                 /* 字体大小 */
  font-weight: 600;                /* 字体粗细 */
  color: #333;                     /* 深灰色 */
}

/* 平台参数样式 */
.platform-params {
  display: flex;                   /* 使用 Flexbox 布局 */
  flex-direction: column;          /* 垂直方向排列 */
  gap: 8px;                        /* 参数行之间的间距 */
}

/* 参数行样式 */
.param-row {
  display: flex;                   /* 使用 Flexbox 布局 */
  justify-content: space-between;  /* 两端对齐 */
  align-items: center;            /* 垂直居中 */
}

/* 参数标签样式 */
.param-label {
  font-size: 12px;                 /* 字体大小 */
  color: #64748B;                  /* 深灰色 */
}

/* 参数值样式 */
.param-value {
  font-family: 'JetBrains Mono', monospace;  /* 等宽字体 */
  font-size: 12px;                 /* 字体大小 */
  font-weight: 600;                /* 字体粗细 */
  color: #1E293B;                  /* 深蓝灰色 */
}

/* 推理内容样式 */
.reasoning-content {
  display: flex;                   /* 使用 Flexbox 布局 */
  flex-direction: column;          /* 垂直方向排列 */
  gap: 10px;                       /* 推理项之间的间距 */
}

/* 推理项样式 */
.reasoning-item {
  padding: 12px 14px;               /* 内边距 */
  background: #F9F9F9;             /* 浅灰色背景 */
  border-radius: 6px;               /* 圆角 */
}

/* 推理文本样式 */
.reasoning-text {
  font-size: 13px;                 /* 字体大小 */
  color: #555;                     /* 深灰色 */
  line-height: 1.7;                /* 行高 */
  margin: 0;                       /* 无外边距 */
}

/* 人设详情模态框样式 */
/* 模态框遮罩层样式 */
.profile-modal-overlay {
  position: fixed;                 /* 固定定位 */
  top: 0;                          /* 顶部对齐 */
  left: 0;                         /* 左侧对齐 */
  right: 0;                        /* 右侧对齐 */
  bottom: 0;                       /* 底部对齐 */
  background: rgba(0, 0, 0, 0.6);  /* 半透明黑色背景 */
  display: flex;                   /* 使用 Flexbox 布局 */
  align-items: center;            /* 垂直居中 */
  justify-content: center;        /* 水平居中 */
  z-index: 1000;                   /* 层级最高 */
  backdrop-filter: blur(4px);      /* 背景模糊效果 */
}

/* 模态框主体样式 */
.profile-modal {
  background: #FFF;                /* 白色背景 */
  border-radius: 16px;              /* 圆角 */
  width: 90%;                      /* 宽度占父容器的 90% */
  max-width: 600px;                /* 最大宽度 */
  max-height: 85vh;                /* 最大高度 */
  overflow: hidden;                /* 隐藏溢出内容 */
  display: flex;                   /* 使用 Flexbox 布局 */
  flex-direction: column;          /* 垂直方向排列 */
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);  /* 阴影效果 */
}

/* 模态框头部样式 */
.modal-header {
  display: flex;                   /* 使用 Flexbox 布局 */
  justify-content: space-between;  /* 两端对齐 */
  align-items: flex-start;         /* 顶部对齐 */
  padding: 24px;                   /* 内边距 */
  background: #FFF;                /* 白色背景 */
  border-bottom: 1px solid #F0F0F0;  /* 底部实线边框 */
}

/* 模态框头部信息样式 */
.modal-header-info {
  flex: 1;                         /* 占据剩余空间 */
}

/* 模态框名称行样式 */
.modal-name-row {
  display: flex;                   /* 使用 Flexbox 布局 */
  align-items: baseline;         /* 基线对齐 */
  gap: 10px;                       /* 元素之间的间距 */
  margin-bottom: 8px;              /* 底部间距 */
}

/* 模态框真实姓名样式 */
.modal-realname {
  font-size: 20px;                 /* 字体大小 */
  font-weight: 700;                /* 字体粗细 */
  color: #000;                     /* 黑色 */
}

/* 模态框用户名样式 */
.modal-username {
  font-family: 'JetBrains Mono', monospace;  /* 等宽字体 */
  font-size: 13px;                 /* 字体大小 */
  color: #999;                     /* 浅灰色 */
}

/* 模态框职业样式 */
.modal-profession {
  font-size: 12px;                 /* 字体大小 */
  color: #666;                     /* 深灰色 */
  background: #F5F5F5;             /* 浅灰色背景 */
  padding: 4px 10px;               /* 内边距 */
  border-radius: 4px;              /* 圆角 */
  display: inline-block;            /* 内联块级元素 */
  font-weight: 500;                /* 字体粗细 */
}

/* 关闭按钮样式 */
.close-btn {
  width: 32px;                     /* 宽度 */
  height: 32px;                    /* 高度 */
  border: none;                    /* 无边框 */
  background: none;                /* 无背景 */
  color: #999;                     /* 浅灰色 */
  border-radius: 50%;              /* 圆形 */
  font-size: 24px;                 /* 字体大小 */
  cursor: pointer;                /* 鼠标指针为手型 */
  display: flex;                   /* 使用 Flexbox 布局 */
  align-items: center;            /* 垂直居中 */
  justify-content: center;        /* 水平居中 */
  line-height: 1;                  /* 行高 */
  transition: color 0.2s;          /* 颜色过渡动画 */
  padding: 0;                      /* 无内边距 */
}

/* 关闭按钮的悬停效果 */
.close-btn:hover {
  color: #333;                     /* 深灰色 */
}

/* 模态框主体内容样式 */
.modal-body {
  padding: 24px;                   /* 内边距 */
  overflow-y: auto;               /* 允许垂直滚动 */
  flex: 1;                         /* 占据剩余空间 */
}

/* 基本信息网格样式 */
.modal-info-grid {
  display: grid;                   /* 使用 Grid 布局 */
  grid-template-columns: repeat(2, 1fr);  /* 两列等宽 */
  gap: 24px 16px;                  /* 行间距 24px，列间距 16px */
  margin-bottom: 32px;             /* 底部间距 */
  padding: 0;                      /* 无内边距 */
  background: transparent;        /* 透明背景 */
  border-radius: 0;                /* 无圆角 */
}

/* 信息项样式 */
.info-item {
  display: flex;                   /* 使用 Flexbox 布局 */
  flex-direction: column;          /* 垂直方向排列 */
  gap: 4px;                        /* 标签和值之间的间距 */
}

/* 信息标签样式 */
.info-label {
  font-size: 11px;                 /* 字体大小 */
  color: #999;                     /* 浅灰色 */
  text-transform: uppercase;       /* 大写字母 */
  letter-spacing: 0.5px;           /* 字母间距 */
  font-weight: 600;                /* 字体粗细 */
}

/* 信息值样式 */
.info-value {
  font-size: 15px;                 /* 字体大小 */
  font-weight: 600;                /* 字体粗细 */
  color: #333;                     /* 深灰色 */
}

/* MBTI 类型值样式 */
.info-value.mbti {
  font-family: 'JetBrains Mono', monospace;  /* 等宽字体 */
  color: #FF5722;                  /* 橙红色 */
}

/* 模块区域样式 */
.modal-section {
  margin-bottom: 28px;             /* 底部间距 */
}

/* 区域标签样式 */
.section-label {
  display: block;                  /* 块级元素 */
  font-size: 11px;                 /* 字体大小 */
  font-weight: 600;                /* 字体粗细 */
  color: #999;                     /* 浅灰色 */
  text-transform: uppercase;       /* 大写字母 */
  letter-spacing: 0.5px;           /* 字母间距 */
  margin-bottom: 12px;             /* 底部间距 */
}

/* 区域简介样式 */
.section-bio {
  font-size: 14px;                 /* 字体大小 */
  color: #333;                     /* 深灰色 */
  line-height: 1.6;                /* 行高 */
  margin: 0;                       /* 无外边距 */
  padding: 16px;                   /* 内边距 */
  background: #F9F9F9;             /* 浅灰色背景 */
  border-radius: 6px;               /* 圆角 */
  border-left: 3px solid #E0E0E0;  /* 左侧实线边框 */
}

/* 话题网格样式 */
.topics-grid {
  display: flex;                   /* 使用 Flexbox 布局 */
  flex-wrap: wrap;               /* 允许换行 */
  gap: 8px;                        /* 话题之间的间距 */
}

/* 话题项样式 */
.topic-item {
  font-size: 11px;                 /* 字体大小 */
  color: #1565C0;                  /* 蓝色 */
  background: #E3F2FD;             /* 浅蓝色背景 */
  padding: 4px 10px;               /* 内边距 */
  border-radius: 12px;              /* 圆角 */
  transition: all 0.2s;            /* 过渡动画 */
  border: none;                    /* 无边框 */
}

/* 话题项的悬停效果 */
.topic-item:hover {
  background: #BBDEFB;             /* 更深的蓝色 */
  color: #0D47A1;                  /* 更深的蓝色文字 */
}

/* 详细人设样式 */
/* 人设维度网格样式 */
.persona-dimensions {
  display: grid;                   /* 使用 Grid 布局 */
  grid-template-columns: repeat(2, 1fr);  /* 两列等宽 */
  gap: 12px;                       /* 维度卡片之间的间距 */
  margin-bottom: 16px;             /* 底部间距 */
}

/* 维度卡片样式 */
.dimension-card {
  background: #F8F9FA;             /* 浅灰色背景 */
  padding: 12px;                   /* 内边距 */
  border-radius: 6px;               /* 圆角 */
  border-left: 3px solid #DDD;    /* 左侧实线边框 */
  transition: all 0.2s;            /* 过渡动画 */
}

/* 维度卡片的悬停效果 */
.dimension-card:hover {
  background: #F0F0F0;             /* 更深的灰色 */
  border-left-color: #999;         /* 更深的灰色边框 */
}

/* 维度标题样式 */
.dim-title {
  display: block;                  /* 块级元素 */
  font-size: 12px;                 /* 字体大小 */
  font-weight: 700;                /* 字体粗细 */
  color: #333;                     /* 深灰色 */
  margin-bottom: 4px;              /* 底部间距 */
}

/* 维度描述样式 */
.dim-desc {
  display: block;                  /* 块级元素 */
  font-size: 10px;                 /* 字体大小 */
  color: #888;                     /* 浅灰色 */
  line-height: 1.4;                /* 行高 */
}

/* 人设内容样式 */
.persona-content {
  max-height: none;                /* 无最大高度限制 */
  overflow: visible;               /* 显示溢出内容 */
  padding: 0;                      /* 无内边距 */
  background: transparent;        /* 透明背景 */
  border: none;                    /* 无边框 */
  border-radius: 0;                /* 无圆角 */
}

/* 自定义滚动条样式 */
.persona-content::-webkit-scrollbar {
  width: 4px;                      /* 滚动条宽度 */
}

/* 滚动条滑块样式 */
.persona-content::-webkit-scrollbar-thumb {
  background: #DDD;                /* 深灰色 */
  border-radius: 2px;             /* 圆角 */
}

/* 人设区域文本样式 */
.section-persona {
  font-size: 13px;                 /* 字体大小 */
  color: #555;                     /* 深灰色 */
  line-height: 1.8;                /* 行高 */
  margin: 0;                       /* 无外边距 */
  text-align: justify;            /* 两端对齐 */
}

/* 系统日志样式 */
.system-logs {
  background: #000;                /* 黑色背景 */
  color: #DDD;                     /* 浅灰色文字 */
  padding: 16px;                   /* 内边距 */
  font-family: 'JetBrains Mono', monospace;  /* 等宽字体 */
  border-top: 1px solid #222;     /* 顶部实线边框 */
  flex-shrink: 0;                  /* 不收缩 */
}

/* 日志头部样式 */
.log-header {
  display: flex;                   /* 使用 Flexbox 布局 */
  justify-content: space-between;  /* 两端对齐 */
  border-bottom: 1px solid #333;  /* 底部实线边框 */
  padding-bottom: 8px;             /* 底部内边距 */
  margin-bottom: 8px;              /* 底部间距 */
  font-size: 10px;                 /* 字体大小 */
  color: #888;                     /* 浅灰色 */
}

/* 日志内容样式 */
.log-content {
  display: flex;                   /* 使用 Flexbox 布局 */
  flex-direction: column;          /* 垂直方向排列 */
  gap: 4px;                        /* 日志行之间的间距 */
  height: 80px;                    /* 高度，约显示 4 行 */
  overflow-y: auto;               /* 允许垂直滚动 */
  padding-right: 4px;              /* 右侧内边距 */
}

/* 自定义滚动条样式 */
.log-content::-webkit-scrollbar {
  width: 4px;                      /* 滚动条宽度 */
}

/* 滚动条滑块样式 */
.log-content::-webkit-scrollbar-thumb {
  background: #333;                /* 深灰色 */
  border-radius: 2px;             /* 圆角 */
}

/* 日志行样式 */
.log-line {
  font-size: 11px;                 /* 字体大小 */
  display: flex;                   /* 使用 Flexbox 布局 */
  gap: 12px;                       /* 时间和消息之间的间距 */
  line-height: 1.5;                /* 行高 */
}

/* 日志时间样式 */
.log-time {
  color: #666;                     /* 深灰色 */
  min-width: 75px;                 /* 最小宽度 */
}

/* 日志消息样式 */
.log-msg {
  color: #CCC;                     /* 浅灰色 */
  word-break: break-all;           /* 允许在任意字符处换行 */
}

/* 小型加载动画样式 */
.spinner-sm {
  width: 16px;                     /* 宽度 */
  height: 16px;                    /* 高度 */
  border: 2px solid #E5E5E5;      /* 浅灰色边框 */
  border-top-color: #FF5722;      /* 橙红色顶部边框 */
  border-radius: 50%;              /* 圆形 */
  animation: spin 0.8s linear infinite;  /* 旋转动画 */
}

/* 旋转动画关键帧 */
@keyframes spin {
  to { transform: rotate(360deg); }  /* 旋转 360 度 */
}

/* 编排内容样式 */
.orchestration-content {
  display: flex;                   /* 使用 Flexbox 布局 */
  flex-direction: column;          /* 垂直方向排列 */
  gap: 20px;                       /* 元素之间的间距 */
  margin-top: 16px;               /* 顶部间距 */
}

/* 盒子标签样式 */
.box-label {
  display: block;                  /* 块级元素 */
  font-size: 12px;                 /* 字体大小 */
  font-weight: 600;                /* 字体粗细 */
  color: #666;                     /* 深灰色 */
  text-transform: uppercase;       /* 大写字母 */
  letter-spacing: 0.5px;           /* 字母间距 */
  margin-bottom: 12px;            /* 底部间距 */
}

/* 叙事框样式 */
.narrative-box {
  background: #FFFFFF;             /* 白色背景 */
  padding: 20px 24px;               /* 内边距 */
  border-radius: 12px;              /* 圆角 */
  border: 1px solid #EEF2F6;      /* 浅灰色边框 */
  box-shadow: 0 4px 24px rgba(0,0,0,0.03);  /* 轻微阴影 */
  transition: all 0.3s ease;      /* 过渡动画 */
}

/* 叙事框中的盒子标签样式 */
.narrative-box .box-label {
  display: flex;                   /* 使用 Flexbox 布局 */
  align-items: center;            /* 垂直居中 */
  gap: 8px;                        /* 图标和文字之间的间距 */
  color: #666;                     /* 深灰色 */
  font-size: 13px;                 /* 字体大小 */
  letter-spacing: 0.5px;           /* 字母间距 */
  margin-bottom: 12px;             /* 底部间距 */
  font-weight: 600;                /* 字体粗细 */
}

/* 特殊图标样式 */
.special-icon {
  filter: drop-shadow(0 2px 4px rgba(255, 87, 34, 0.2));  /* 阴影效果 */
  transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);  /* 过渡动画 */
}

/* 叙事框悬停时的图标旋转效果 */
.narrative-box:hover .special-icon {
  transform: rotate(180deg);        /* 旋转 180 度 */
}

/* 叙事文本样式 */
.narrative-text {
  font-family: 'Inter', 'Noto Sans SC', system-ui, sans-serif;  /* 字体栈 */
  font-size: 14px;                 /* 字体大小 */
  color: #334155;                  /* 深蓝灰色 */
  line-height: 1.8;                /* 行高 */
  margin: 0;                       /* 无外边距 */
  text-align: justify;            /* 两端对齐 */
  letter-spacing: 0.01em;          /* 字母间距 */
}

/* 话题区域样式 */
.topics-section {
  background: #FFF;                /* 白色背景 */
}

/* 热点话题网格样式 */
.hot-topics-grid {
  display: flex;                   /* 使用 Flexbox 布局 */
  flex-wrap: wrap;               /* 允许换行 */
  gap: 8px;                        /* 话题之间的间距 */
}

/* 热点话题标签样式 */
.hot-topic-tag {
  font-size: 12px;                 /* 字体大小 */
  color: rgba(255, 86, 34, 0.88);  /* 橙红色 */
  background: #FFF3E0;             /* 浅橙色背景 */
  padding: 4px 10px;               /* 内边距 */
  border-radius: 12px;              /* 圆角 */
  font-weight: 500;                /* 字体粗细 */
}

/* 更多话题标签样式 */
.hot-topic-more {
  font-size: 11px;                 /* 字体大小 */
  color: #999;                     /* 浅灰色 */
  padding: 4px 6px;               /* 内边距 */
}

/* 初始帖子区域样式 */
.initial-posts-section {
  border-top: 1px solid #EAEAEA;  /* 顶部实线边框 */
  padding-top: 16px;               /* 顶部内边距 */
}

/* 帖子时间轴样式 */
.posts-timeline {
  display: flex;                   /* 使用 Flexbox 布局 */
  flex-direction: column;          /* 垂直方向排列 */
  gap: 16px;                       /* 帖子之间的间距 */
  padding-left: 8px;               /* 左侧内边距 */
  border-left: 2px solid #F0F0F0;  /* 左侧实线边框 */
  margin-top: 12px;                /* 顶部间距 */
}

/* 时间轴项样式 */
.timeline-item {
  position: relative;              /* 相对定位 */
  padding-left: 20px;              /* 左侧内边距 */
}

/* 时间轴标记样式 */
.timeline-marker {
  position: absolute;              /* 绝对定位 */
  left: 0;                         /* 左侧对齐 */
  top: 14px;                       /* 顶部偏移 */
  width: 12px;                     /* 宽度 */
  height: 2px;                     /* 高度 */
  background: #DDD;                /* 深灰色 */
}

/* 时间轴内容样式 */
.timeline-content {
  background: #F9F9F9;             /* 浅灰色背景 */
  padding: 12px;                   /* 内边距 */
  border-radius: 6px;               /* 圆角 */
  border: 1px solid #EEE;          /* 浅灰色边框 */
}

/* 帖子头部样式 */
.post-header {
  display: flex;                   /* 使用 Flexbox 布局 */
  justify-content: space-between;  /* 两端对齐 */
  margin-bottom: 6px;              /* 底部间距 */
}

/* 帖子角色样式 */
.post-role {
  font-size: 11px;                 /* 字体大小 */
  font-weight: 700;                /* 字体粗细 */
  color: #333;                     /* 深灰色 */
  text-transform: uppercase;       /* 大写字母 */
}

/* 帖子 Agent 信息样式 */
.post-agent-info {
  display: flex;                   /* 使用 Flexbox 布局 */
  align-items: center;            /* 垂直居中 */
  gap: 6px;                        /* 元素之间的间距 */
}

/* 帖子 ID 和用户名样式 */
.post-id,
.post-username {
  font-family: 'JetBrains Mono', monospace;  /* 等宽字体 */
  font-size: 10px;                 /* 字体大小 */
  color: #666;                     /* 深灰色 */
  line-height: 1;                  /* 行高 */
  vertical-align: baseline;        /* 基线对齐 */
}

/* 帖子用户名样式 */
.post-username {
  margin-right: 6px;              /* 右侧间距 */
}

/* 帖子文本样式 */
.post-text {
  font-size: 12px;                 /* 字体大小 */
  color: #555;                     /* 深灰色 */
  line-height: 1.5;                /* 行高 */
  margin: 0;                       /* 无外边距 */
}

/* 模拟轮数配置样式 */
.rounds-config-section {
  margin: 24px 0;
  padding-top: 24px;
  border-top: 1px solid #EAEAEA;
}

.rounds-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1E293B;
}

.section-desc {
  font-size: 12px;
  color: #94A3B8;
}

.desc-highlight {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  color: #1E293B;
  background: #F1F5F9;
  padding: 1px 6px;
  border-radius: 4px;
  margin: 0 2px;
}

/* Switch Control */
.switch-control {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px 4px 4px;
  border-radius: 20px;
  transition: background 0.2s;
}

.switch-control:hover {
  background: #F8FAFC;
}

.switch-control input {
  display: none;
}

.switch-track {
  width: 36px;
  height: 20px;
  background: #E2E8F0;
  border-radius: 10px;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.switch-track::after {
  content: '';
  position: absolute;
  left: 2px;
  top: 2px;
  width: 16px;
  height: 16px;
  background: #FFF;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.switch-control input:checked + .switch-track {
  background: #000;
}

.switch-control input:checked + .switch-track::after {
  transform: translateX(16px);
}

.switch-label {
  font-size: 12px;
  font-weight: 500;
  color: #64748B;
}

.switch-control input:checked ~ .switch-label {
  color: #1E293B;
}

/* Slider Content */
.rounds-content {
  animation: fadeIn 0.3s ease;
}

.slider-display {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 16px;
}

.slider-main-value {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.val-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 24px;
  font-weight: 700;
  color: #000;
}

.val-unit {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.slider-meta-info {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #64748B;
  background: #F1F5F9;
  padding: 4px 8px;
  border-radius: 4px;
}

.range-wrapper {
  position: relative;
  padding: 0 2px;
}

.minimal-slider {
  -webkit-appearance: none;
  width: 100%;
  height: 4px;
  background: #E2E8F0;
  border-radius: 2px;
  outline: none;
  background-image: linear-gradient(#000, #000);
  background-size: var(--percent, 0%) 100%;
  background-repeat: no-repeat;
  cursor: pointer;
}

.minimal-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #FFF;
  border: 2px solid #000;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  transition: transform 0.1s;
  margin-top: -6px; /* Center thumb */
}

.minimal-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.minimal-slider::-webkit-slider-runnable-track {
  height: 4px;
  border-radius: 2px;
}

.range-marks {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: #94A3B8;
  position: relative;
}

/* 推荐刻度样式 */
.mark-recommend {
  cursor: pointer;                /* 鼠标指针为手型 */
  transition: color 0.2s;          /* 颜色过渡动画 */
  position: relative;              /* 相对定位 */
}

/* 推荐刻度的悬停效果 */
.mark-recommend:hover {
  color: #000;                     /* 黑色 */
}

/* 激活状态的推荐刻度样式 */
.mark-recommend.active {
  color: #000;                     /* 黑色 */
  font-weight: 600;                /* 字体粗细 */
}

/* 推荐刻度的伪元素样式（上方标记） */
.mark-recommend::after {
  content: '';                      /* 空内容 */
  position: absolute;              /* 绝对定位 */
  top: -12px;                      /* 顶部偏移 */
  left: 50%;                       /* 左侧居中 */
  transform: translateX(-50%);     /* 水平居中 */
  width: 1px;                      /* 宽度 */
  height: 4px;                     /* 高度 */
  background: #CBD5E1;             /* 浅灰色 */
}

/* 自动信息卡片样式 */
.auto-info-card {
  display: flex;                   /* 使用 Flexbox 布局 */
  align-items: center;            /* 垂直居中 */
  gap: 24px;                       /* 元素之间的间距 */
  background: #F8FAFC;             /* 浅蓝灰色背景 */
  padding: 16px 20px;               /* 内边距 */
  border-radius: 8px;               /* 圆角 */
}

/* 自动值样式 */
.auto-value {
  display: flex;                   /* 使用 Flexbox 布局 */
  flex-direction: row;             /* 水平方向排列 */
  align-items: baseline;         /* 基线对齐 */
  gap: 4px;                        /* 数值和单位之间的间距 */
  padding-right: 24px;              /* 右侧内边距 */
  border-right: 1px solid #E2E8F0;  /* 右侧实线边框 */
}

/* 自动内容样式 */
.auto-content {
  flex: 1;                         /* 占据剩余空间 */
  display: flex;                   /* 使用 Flexbox 布局 */
  flex-direction: column;          /* 垂直方向排列 */
  gap: 8px;                        /* 元素之间的间距 */
  justify-content: center;        /* 垂直居中 */
}

/* 自动元数据行样式 */
.auto-meta-row {
  display: flex;                   /* 使用 Flexbox 布局 */
  align-items: center;            /* 垂直居中 */
}

/* 时长徽章样式 */
.duration-badge {
  display: inline-flex;             /* 内联 Flexbox 布局 */
  align-items: center;            /* 垂直居中 */
  gap: 5px;                        /* 图标和文字之间的间距 */
  font-family: 'JetBrains Mono', monospace;  /* 等宽字体 */
  font-size: 11px;                 /* 字体大小 */
  font-weight: 500;                /* 字体粗细 */
  color: #64748B;                  /* 深灰色 */
  background: #FFFFFF;             /* 白色背景 */
  border: 1px solid #E2E8F0;      /* 浅灰色边框 */
  padding: 3px 8px;               /* 内边距 */
  border-radius: 6px;              /* 圆角 */
  box-shadow: 0 1px 2px rgba(0,0,0,0.02);  /* 轻微阴影 */
}

/* 自动描述样式 */
.auto-desc {
  display: flex;                   /* 使用 Flexbox 布局 */
  flex-direction: column;          /* 垂直方向排列 */
  gap: 2px;                        /* 元素之间的间距 */
}

/* 自动描述段落样式 */
.auto-desc p {
  margin: 0;                       /* 无外边距 */
  font-size: 13px;                 /* 字体大小 */
  color: #64748B;                  /* 深灰色 */
  line-height: 1.5;                /* 行高 */
}

/* 高亮提示样式 */
.highlight-tip {
  margin-top: 4px !important;      /* 顶部间距 */
  font-size: 12px !important;      /* 字体大小 */
  color: #000 !important;          /* 黑色 */
  font-weight: 500;                /* 字体粗细 */
  cursor: pointer;                /* 鼠标指针为手型 */
}

/* 高亮提示的悬停效果 */
.highlight-tip:hover {
  text-decoration: underline;      /* 下划线 */
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .profile-modal {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-leave-active .profile-modal {
  transition: all 0.3s ease-in;
}

.modal-enter-from .profile-modal,
.modal-leave-to .profile-modal {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}
</style>
