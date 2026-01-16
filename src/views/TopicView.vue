<script setup>
import { RouterLink } from 'vue-router'
import { useQuizStore } from '../stores/quiz'
import { computed } from 'vue'

const store = useQuizStore()

const topics = [
  {
    id: 'vocabulary',
    icon: '📖',
    title: '词汇翻译',
    desc: '中英互译练习',
    color: '#10b981'
  },
  {
    id: 'grammar',
    icon: '📝',
    title: '语法填空',
    desc: '一般现在时、现在进行时',
    color: '#6366f1'
  },
  {
    id: 'plurals',
    icon: '🔢',
    title: '名词复数',
    desc: '名词复数形式变化',
    color: '#f59e0b'
  },
  {
    id: 'thirdPerson',
    icon: '👤',
    title: '动词三单',
    desc: '第三人称单数变化',
    color: '#ec4899'
  },
  {
    id: 'pronouns',
    icon: '👥',
    title: '人称代词',
    desc: '主格/宾格代词用法',
    color: '#8b5cf6'
  },
  {
    id: 'mixed',
    icon: '🎯',
    title: '综合练习',
    desc: '混合题目挑战',
    color: '#ef4444'
  }
]

const getCategoryAccuracy = (categoryId) => {
  const stats = store.getCategoryStats[categoryId]
  if (!stats || (stats.correct + stats.wrong === 0)) return null
  return Math.round((stats.correct / (stats.correct + stats.wrong)) * 100)
}

const getCategoryTotal = (categoryId) => {
  const stats = store.getCategoryStats[categoryId]
  if (!stats) return 0
  return stats.correct + stats.wrong
}
</script>

<template>
  <div class="topics-page">
    <header class="page-header">
      <h1 class="page-title">📚 知识专项</h1>
      <p class="page-subtitle">选择一个知识点开始练习</p>
    </header>
    
    <div class="topics-grid">
      <RouterLink
        v-for="topic in topics"
        :key="topic.id"
        :to="`/quiz/${topic.id}`"
        class="topic-card"
        :style="{ '--topic-color': topic.color }"
      >
        <div class="topic-icon">{{ topic.icon }}</div>
        <div class="topic-content">
          <h3 class="topic-title">{{ topic.title }}</h3>
          <p class="topic-desc">{{ topic.desc }}</p>
          
          <div class="topic-stats" v-if="getCategoryTotal(topic.id) > 0">
            <span class="stat-badge">
              已练习 {{ getCategoryTotal(topic.id) }} 题
            </span>
            <span 
              class="accuracy-badge"
              :class="{
                'high': getCategoryAccuracy(topic.id) >= 80,
                'medium': getCategoryAccuracy(topic.id) >= 60 && getCategoryAccuracy(topic.id) < 80,
                'low': getCategoryAccuracy(topic.id) < 60
              }"
            >
              {{ getCategoryAccuracy(topic.id) }}% 正确率
            </span>
          </div>
        </div>
        
        <div class="topic-arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </div>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.topics-page {
  max-width: 600px;
  margin: 0 auto;
  animation: fadeIn 0.4s ease-out;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
}

.topics-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.topic-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: white;
  border-radius: var(--radius-xl);
  text-decoration: none;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-fast);
  border-left: 4px solid var(--topic-color);
}

.topic-card:hover {
  transform: translateX(8px);
  box-shadow: var(--shadow-lg);
}

.topic-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.topic-content {
  flex: 1;
  min-width: 0;
}

.topic-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.topic-desc {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.topic-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.stat-badge {
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border-radius: var(--radius-full);
  font-weight: 600;
}

.accuracy-badge {
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-full);
  font-weight: 700;
}

.accuracy-badge.high {
  background: #dcfce7;
  color: #16a34a;
}

.accuracy-badge.medium {
  background: #fef3c7;
  color: #d97706;
}

.accuracy-badge.low {
  background: #fee2e2;
  color: #dc2626;
}

.topic-arrow {
  color: var(--text-muted);
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.topic-card:hover .topic-arrow {
  color: var(--topic-color);
  transform: translateX(4px);
}
</style>
