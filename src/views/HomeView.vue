<template>
  <div class="home-view">
    <!-- 顶部装饰 -->
    <div class="decoration-circles">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>

    <!-- 主标题区域 -->
    <header class="home-header">
      <div class="logo">📚</div>
      <h1 class="title">英语学习助手</h1>
      <p class="subtitle">六年级上册 · 知识点练习</p>
    </header>

    <!-- 统计概览 -->
    <div class="stats-overview">
      <div class="stat-item">
        <span class="stat-value">{{ stats.totalQuestions }}</span>
        <span class="stat-label">累计答题</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-value">{{ stats.accuracy }}%</span>
        <span class="stat-label">正确率</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-value">{{ wrongCount }}</span>
        <span class="stat-label">待复习</span>
      </div>
    </div>

    <!-- 快捷入口 -->
    <div class="quick-actions">
      <router-link to="/topics" class="action-card primary">
        <span class="action-icon">📚</span>
        <div class="action-info">
          <h3>开始练习</h3>
          <p>选择知识专项进行练习</p>
        </div>
        <span class="arrow">→</span>
      </router-link>

      <router-link to="/wrongbook" class="action-card" v-if="wrongCount > 0">
        <span class="action-icon">📝</span>
        <div class="action-info">
          <h3>错题本</h3>
          <p>{{ wrongCount }} 道错题待复习</p>
        </div>
        <span class="arrow">→</span>
      </router-link>

      <router-link to="/stats" class="action-card">
        <span class="action-icon">📊</span>
        <div class="action-info">
          <h3>学习统计</h3>
          <p>查看学习进度和成绩</p>
        </div>
        <span class="arrow">→</span>
      </router-link>
    </div>

    <!-- 知识点预览 -->
    <div class="knowledge-preview">
      <h2 class="section-title">📖 知识点概览</h2>
      <div class="knowledge-grid">
        <div class="knowledge-item" v-for="item in knowledgeItems" :key="item.name">
          <span class="k-icon">{{ item.icon }}</span>
          <span class="k-name">{{ item.name }}</span>
        </div>
      </div>
    </div>

    <!-- 底部信息 -->
    <footer class="home-footer">
      <p>📱 数据本地存储，随时随地学习</p>
      <p class="version">v2.0.0</p>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useQuizStore } from '../stores/quiz'

const quizStore = useQuizStore()

const stats = computed(() => quizStore.getStats)
const wrongCount = computed(() => quizStore.getWrongQuestions.length)

const knowledgeItems = [
  { icon: '📖', name: '词汇翻译' },
  { icon: '📝', name: '冠词a/an' },
  { icon: '✏️', name: '动词三单' },
  { icon: '👤', name: '人称代词' },
  { icon: '📚', name: '名词复数' },
  { icon: '🧩', name: '句型结构' },
  { icon: '❓', name: '特殊疑问句' },
  { icon: '🎵', name: '音标练习' }
]
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  padding: 20px;
  padding-bottom: 100px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  position: relative;
  overflow: hidden;
}

/* 装饰圆圈 */
.decoration-circles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 300px;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
}

.circle-1 {
  width: 200px;
  height: 200px;
  background: #4CAF50;
  top: -50px;
  right: -30px;
}

.circle-2 {
  width: 150px;
  height: 150px;
  background: #2196F3;
  top: 100px;
  left: -40px;
}

.circle-3 {
  width: 100px;
  height: 100px;
  background: #FF9800;
  top: 50px;
  right: 40%;
}

/* 头部 */
.home-header {
  text-align: center;
  padding: 40px 0 30px;
  position: relative;
  z-index: 1;
}

.logo {
  font-size: 4rem;
  margin-bottom: 15px;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.title {
  font-size: 1.8rem;
  color: #fff;
  margin-bottom: 8px;
  font-weight: 700;
}

.subtitle {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.95rem;
}

/* 统计概览 */
.stats-overview {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  margin-bottom: 25px;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-value {
  display: block;
  font-size: 1.8rem;
  font-weight: 700;
  color: #4CAF50;
}

.stat-label {
  display: block;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  margin-top: 3px;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.15);
}

/* 快捷入口 */
.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 30px;
}

.action-card {
  display: flex;
  align-items: center;
  padding: 18px 15px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  text-decoration: none;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.action-card:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateX(5px);
}

.action-card.primary {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.3) 0%, rgba(139, 195, 74, 0.2) 100%);
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.action-icon {
  font-size: 2.2rem;
  margin-right: 15px;
}

.action-info {
  flex: 1;
}

.action-info h3 {
  color: #fff;
  font-size: 1.1rem;
  margin-bottom: 3px;
}

.action-info p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
}

.arrow {
  color: rgba(255, 255, 255, 0.4);
  font-size: 1.5rem;
  font-weight: 300;
}

/* 知识点预览 */
.knowledge-preview {
  margin-bottom: 30px;
}

.section-title {
  color: #fff;
  font-size: 1.1rem;
  margin-bottom: 15px;
}

.knowledge-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.knowledge-item {
  background: rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 15px 10px;
  text-align: center;
  transition: all 0.2s ease;
}

.knowledge-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.k-icon {
  display: block;
  font-size: 1.5rem;
  margin-bottom: 5px;
}

.k-name {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.7rem;
}

/* 底部 */
.home-footer {
  text-align: center;
  padding-top: 20px;
}

.home-footer p {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.8rem;
  margin-bottom: 5px;
}

.version {
  color: rgba(255, 255, 255, 0.3) !important;
  font-size: 0.75rem !important;
}

/* 响应式 */
@media (max-width: 380px) {
  .knowledge-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
