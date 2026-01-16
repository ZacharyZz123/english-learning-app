<script setup>
import { RouterLink } from 'vue-router'
import { useQuizStore } from '../stores/quiz'
import { computed } from 'vue'

const store = useQuizStore()

const stats = computed(() => store.getStats)
const accuracy = computed(() => {
  const total = stats.value.totalCorrect + stats.value.totalWrong
  if (total === 0) return 0
  return Math.round((stats.value.totalCorrect / total) * 100)
})

const features = [
  {
    icon: '📚',
    title: '答题练习',
    desc: '词汇、语法、句型专项练习',
    to: '/topics',
    color: '#10b981'
  },
  {
    icon: '📝',
    title: '错题本',
    desc: '查看和重做错题',
    to: '/wrongbook',
    color: '#f59e0b'
  },
  {
    icon: '📊',
    title: '学习统计',
    desc: '查看学习进度和成绩',
    to: '/stats',
    color: '#6366f1'
  }
]
</script>

<template>
  <div class="home">
    <!-- 头部欢迎区域 -->
    <header class="hero">
      <div class="hero-content">
        <div class="hero-icon">🎓</div>
        <h1 class="hero-title">学习小卫士</h1>
        <p class="hero-subtitle">六年级英语学习助手</p>
      </div>
      
      <!-- 统计卡片 -->
      <div class="stats-card">
        <div class="stat-item">
          <span class="stat-value">{{ stats.totalCorrect + stats.totalWrong }}</span>
          <span class="stat-label">总答题</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value text-success">{{ stats.totalCorrect }}</span>
          <span class="stat-label">答对</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value text-primary">{{ accuracy }}%</span>
          <span class="stat-label">正确率</span>
        </div>
      </div>
    </header>
    
    <!-- 功能入口 -->
    <section class="features">
      <h2 class="section-title">开始学习</h2>
      <div class="feature-grid">
        <RouterLink
          v-for="feature in features"
          :key="feature.to"
          :to="feature.to"
          class="feature-card"
          :style="{ '--accent-color': feature.color }"
        >
          <div class="feature-icon">{{ feature.icon }}</div>
          <div class="feature-info">
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-desc">{{ feature.desc }}</p>
          </div>
          <div class="feature-arrow">→</div>
        </RouterLink>
      </div>
    </section>
    
    <!-- 快速开始 -->
    <section class="quick-start">
      <RouterLink to="/topics" class="start-btn">
        <span class="start-icon">🚀</span>
        <span>立即开始练习</span>
      </RouterLink>
    </section>
  </div>
</template>

<style scoped>
.home {
  max-width: 600px;
  margin: 0 auto;
  animation: fadeIn 0.4s ease-out;
}

.hero {
  text-align: center;
  margin-bottom: 2rem;
}

.hero-content {
  padding: 2rem 1rem;
}

.hero-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: bounce 2s infinite;
}

.hero-title {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.stats-card {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: white;
  border-radius: var(--radius-xl);
  padding: 1.25rem;
  margin-top: 1.5rem;
  box-shadow: var(--shadow-lg);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
}

.stat-value.text-success {
  color: var(--success);
}

.stat-value.text-primary {
  color: var(--primary);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 600;
}

.stat-divider {
  width: 1px;
  height: 2.5rem;
  background: var(--border);
}

.features {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-secondary);
  margin-bottom: 1rem;
  padding-left: 0.5rem;
}

.feature-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.feature-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: white;
  border-radius: var(--radius-xl);
  text-decoration: none;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-fast);
  border-left: 4px solid var(--accent-color);
}

.feature-card:hover {
  transform: translateX(8px);
  box-shadow: var(--shadow-lg);
}

.feature-icon {
  font-size: 2.5rem;
}

.feature-info {
  flex: 1;
}

.feature-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.feature-desc {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.feature-arrow {
  font-size: 1.25rem;
  color: var(--text-muted);
  transition: transform var(--transition-fast);
}

.feature-card:hover .feature-arrow {
  transform: translateX(4px);
  color: var(--accent-color);
}

.quick-start {
  text-align: center;
  padding-bottom: 2rem;
}

.start-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: white;
  font-size: 1.125rem;
  font-weight: 700;
  text-decoration: none;
  border-radius: var(--radius-xl);
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
  transition: all var(--transition-fast);
}

.start-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(16, 185, 129, 0.5);
}

.start-icon {
  font-size: 1.5rem;
}
</style>
