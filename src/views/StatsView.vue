<script setup>
import { computed, ref } from 'vue'
import { useQuizStore } from '../stores/quiz'

const store = useQuizStore()
const showResetConfirm = ref(false)

const stats = computed(() => store.getStats)
const categoryStats = computed(() => store.getCategoryStats)
const wrongCount = computed(() => store.getWrongQuestions.length)

const categories = [
  { id: 'vocabulary', icon: '📖', name: '词汇翻译' },
  { id: 'grammar', icon: '📝', name: '语法填空' },
  { id: 'plurals', icon: '🔢', name: '名词复数' },
  { id: 'thirdPerson', icon: '👤', name: '动词三单' },
  { id: 'pronouns', icon: '👥', name: '人称代词' },
  { id: 'mixed', icon: '🎯', name: '综合练习' }
]

const getCategoryData = (categoryId) => {
  const data = categoryStats.value[categoryId]
  if (!data) {
    return { total: 0, correct: 0, wrong: 0, accuracy: 0, level: '未开始' }
  }
  const total = data.correct + data.wrong
  const accuracy = total > 0 ? Math.round((data.correct / total) * 100) : 0
  let level = '未开始'
  let levelColor = 'gray'
  
  if (total > 0) {
    if (accuracy >= 90) {
      level = '精通'
      levelColor = 'green'
    } else if (accuracy >= 70) {
      level = '熟练'
      levelColor = 'blue'
    } else if (accuracy >= 50) {
      level = '学习中'
      levelColor = 'yellow'
    } else {
      level = '需加强'
      levelColor = 'red'
    }
  }
  
  return { total, correct: data.correct, wrong: data.wrong, accuracy, level, levelColor }
}

const resetStats = () => {
  store.resetStats()
  showResetConfirm.value = false
}
</script>

<template>
  <div class="stats-page">
    <header class="page-header">
      <h1 class="page-title">📊 学习统计</h1>
      <p class="page-subtitle">查看你的学习进度</p>
    </header>
    
    <!-- 总体统计 -->
    <section class="overview-section">
      <div class="overview-card">
        <div class="overview-item">
          <div class="overview-icon">📚</div>
          <div class="overview-value">{{ stats.totalCorrect + stats.totalWrong }}</div>
          <div class="overview-label">总答题数</div>
        </div>
        
        <div class="overview-item">
          <div class="overview-icon">✅</div>
          <div class="overview-value correct">{{ stats.totalCorrect }}</div>
          <div class="overview-label">答对</div>
        </div>
        
        <div class="overview-item">
          <div class="overview-icon">❌</div>
          <div class="overview-value wrong">{{ stats.totalWrong }}</div>
          <div class="overview-label">答错</div>
        </div>
        
        <div class="overview-item">
          <div class="overview-icon">🎯</div>
          <div class="overview-value highlight">{{ stats.accuracy }}%</div>
          <div class="overview-label">正确率</div>
        </div>
      </div>
    </section>
    
    <!-- 分类统计 -->
    <section class="category-section">
      <h2 class="section-title">各知识点掌握度</h2>
      
      <div class="category-list">
        <div
          v-for="category in categories"
          :key="category.id"
          class="category-card"
        >
          <div class="category-header">
            <span class="category-icon">{{ category.icon }}</span>
            <span class="category-name">{{ category.name }}</span>
            <span 
              class="category-level"
              :class="getCategoryData(category.id).levelColor"
            >
              {{ getCategoryData(category.id).level }}
            </span>
          </div>
          
          <div class="category-stats">
            <div class="mini-stat">
              <span class="mini-value">{{ getCategoryData(category.id).total }}</span>
              <span class="mini-label">题目</span>
            </div>
            <div class="mini-stat">
              <span class="mini-value correct">{{ getCategoryData(category.id).correct }}</span>
              <span class="mini-label">正确</span>
            </div>
            <div class="mini-stat">
              <span class="mini-value">{{ getCategoryData(category.id).accuracy }}%</span>
              <span class="mini-label">准确率</span>
            </div>
          </div>
          
          <div class="progress-bar">
            <div 
              class="progress-fill"
              :class="getCategoryData(category.id).levelColor"
              :style="{ width: `${getCategoryData(category.id).accuracy}%` }"
            ></div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- 错题本统计 -->
    <section class="wrong-section">
      <div class="wrong-card">
        <div class="wrong-icon">📝</div>
        <div class="wrong-info">
          <h3>错题本</h3>
          <p>待复习 <strong>{{ wrongCount }}</strong> 道错题</p>
        </div>
        <RouterLink to="/wrongbook" class="btn btn-secondary btn-sm">
          查看
        </RouterLink>
      </div>
    </section>
    
    <!-- 重置按钮 -->
    <section class="reset-section">
      <button class="reset-btn" @click="showResetConfirm = true">
        🔄 重置所有统计数据
      </button>
    </section>
    
    <!-- 重置确认弹窗 -->
    <div v-if="showResetConfirm" class="modal-overlay" @click="showResetConfirm = false">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">确认重置</h3>
        <p class="modal-desc">确定要重置所有统计数据吗？此操作无法撤销。</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showResetConfirm = false">
            取消
          </button>
          <button class="btn btn-danger" @click="resetStats">
            确认重置
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-page {
  max-width: 600px;
  margin: 0 auto;
  animation: fadeIn 0.4s ease-out;
}

.page-header {
  text-align: center;
  margin-bottom: 1.5rem;
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

.overview-section {
  margin-bottom: 2rem;
}

.overview-card {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  background: white;
  border-radius: var(--radius-xl);
  padding: 1.5rem 1rem;
  box-shadow: var(--shadow-lg);
}

.overview-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.overview-icon {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.overview-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
}

.overview-value.correct {
  color: var(--success);
}

.overview-value.wrong {
  color: var(--danger);
}

.overview-value.highlight {
  color: var(--primary);
}

.overview-label {
  font-size: 0.7rem;
  color: var(--text-muted);
  font-weight: 600;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.category-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 1rem;
  box-shadow: var(--shadow-md);
}

.category-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.category-icon {
  font-size: 1.25rem;
}

.category-name {
  flex: 1;
  font-weight: 700;
  color: var(--text-primary);
}

.category-level {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-full);
}

.category-level.gray {
  background: var(--bg-tertiary);
  color: var(--text-muted);
}

.category-level.green {
  background: #dcfce7;
  color: #16a34a;
}

.category-level.blue {
  background: #dbeafe;
  color: #2563eb;
}

.category-level.yellow {
  background: #fef3c7;
  color: #d97706;
}

.category-level.red {
  background: #fee2e2;
  color: #dc2626;
}

.category-stats {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 0.75rem;
}

.mini-stat {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.mini-value {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.mini-value.correct {
  color: var(--success);
}

.mini-label {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.progress-bar {
  height: 0.5rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width var(--transition-normal);
}

.progress-fill.gray {
  background: var(--text-muted);
}

.progress-fill.green {
  background: linear-gradient(90deg, #22c55e, #16a34a);
}

.progress-fill.blue {
  background: linear-gradient(90deg, #3b82f6, #2563eb);
}

.progress-fill.yellow {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}

.progress-fill.red {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.wrong-section {
  margin-bottom: 2rem;
}

.wrong-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  border-radius: var(--radius-lg);
  padding: 1rem;
  box-shadow: var(--shadow-md);
}

.wrong-icon {
  font-size: 2rem;
}

.wrong-info {
  flex: 1;
}

.wrong-info h3 {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.wrong-info p {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.wrong-info strong {
  color: var(--warning);
}

.reset-section {
  text-align: center;
  padding-bottom: 2rem;
}

.reset-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 0.875rem;
  font-family: inherit;
  cursor: pointer;
  padding: 0.5rem 1rem;
  transition: color var(--transition-fast);
}

.reset-btn:hover {
  color: var(--danger);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  animation: fadeIn 0.2s ease-out;
}

.modal-content {
  background: white;
  border-radius: var(--radius-xl);
  padding: 2rem;
  max-width: 350px;
  width: 90%;
  text-align: center;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.modal-desc {
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}
</style>
