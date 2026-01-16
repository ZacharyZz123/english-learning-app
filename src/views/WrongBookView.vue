<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizStore } from '../stores/quiz'

const router = useRouter()
const store = useQuizStore()

const selectedCategory = ref('all')
const showClearConfirm = ref(false)

const wrongQuestions = computed(() => store.getWrongQuestions)

const filteredQuestions = computed(() => {
  if (selectedCategory.value === 'all') {
    return wrongQuestions.value
  }
  return wrongQuestions.value.filter(q => q.category === selectedCategory.value)
})

const categories = computed(() => {
  const cats = new Set(wrongQuestions.value.map(q => q.category))
  return [
    { id: 'all', name: '全部' },
    ...Array.from(cats).map(id => ({
      id,
      name: getCategoryName(id)
    }))
  ]
})

const getCategoryName = (id) => {
  const names = {
    vocabulary: '词汇翻译',
    grammar: '语法填空',
    plurals: '名词复数',
    thirdPerson: '动词三单',
    pronouns: '人称代词',
    translation: '句子翻译',
    mixed: '综合练习'
  }
  return names[id] || id
}

const removeQuestion = (index) => {
  // 找到在原始数组中的索引
  const question = filteredQuestions.value[index]
  const originalIndex = wrongQuestions.value.findIndex(
    q => q.question === question.question && q.answer === question.answer
  )
  if (originalIndex !== -1) {
    store.removeFromWrongBook(originalIndex)
  }
}

const clearAll = () => {
  store.clearWrongBook()
  showClearConfirm.value = false
}

const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const practiceWrong = () => {
  // 使用错题进行练习
  if (filteredQuestions.value.length === 0) return
  router.push('/quiz/mixed')
}
</script>

<template>
  <div class="wrongbook-page">
    <header class="page-header">
      <h1 class="page-title">📝 错题本</h1>
      <p class="page-subtitle">共 {{ wrongQuestions.length }} 道错题</p>
    </header>
    
    <!-- 空状态 -->
    <div v-if="wrongQuestions.length === 0" class="empty-state">
      <div class="empty-icon">🎉</div>
      <h2 class="empty-title">暂无错题</h2>
      <p class="empty-desc">继续保持，争取不出错！</p>
      <button class="btn btn-primary" @click="router.push('/topics')">
        开始练习
      </button>
    </div>
    
    <template v-else>
      <!-- 筛选和操作 -->
      <div class="actions-bar">
        <div class="filter-tabs">
          <button
            v-for="cat in categories"
            :key="cat.id"
            class="filter-tab"
            :class="{ active: selectedCategory === cat.id }"
            @click="selectedCategory = cat.id"
          >
            {{ cat.name }}
          </button>
        </div>
        
        <button 
          class="clear-btn"
          @click="showClearConfirm = true"
        >
          🗑️ 清空
        </button>
      </div>
      
      <!-- 错题列表 -->
      <div class="questions-list">
        <div
          v-for="(question, index) in filteredQuestions"
          :key="index"
          class="question-card"
        >
          <div class="question-header">
            <span class="category-tag">{{ getCategoryName(question.category) }}</span>
            <span class="time-tag">{{ formatDate(question.timestamp) }}</span>
          </div>
          
          <div class="question-content">
            <p class="question-text">{{ question.question }}</p>
          </div>
          
          <div class="answer-section">
            <div class="correct-answer">
              <span class="answer-label">正确答案：</span>
              <span class="answer-text">{{ question.answer }}</span>
            </div>
          </div>
          
          <button 
            class="remove-btn"
            @click="removeQuestion(index)"
            title="移除此题"
          >
            ✕
          </button>
        </div>
      </div>
    </template>
    
    <!-- 清空确认弹窗 -->
    <div v-if="showClearConfirm" class="modal-overlay" @click="showClearConfirm = false">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">确认清空</h3>
        <p class="modal-desc">确定要清空所有错题吗？此操作无法撤销。</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showClearConfirm = false">
            取消
          </button>
          <button class="btn btn-danger" @click="clearAll">
            确认清空
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wrongbook-page {
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

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.empty-desc {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-tab {
  padding: 0.5rem 1rem;
  background: white;
  border: 2px solid var(--border);
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.filter-tab:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.filter-tab.active {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}

.clear-btn {
  padding: 0.5rem 1rem;
  background: white;
  border: 2px solid var(--danger);
  color: var(--danger);
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.clear-btn:hover {
  background: var(--danger);
  color: white;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.question-card {
  position: relative;
  background: white;
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  box-shadow: var(--shadow-md);
  border-left: 4px solid var(--warning);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.category-tag {
  background: var(--primary-bg);
  color: var(--primary-dark);
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-full);
  font-size: 0.7rem;
  font-weight: 700;
}

.time-tag {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.question-content {
  margin-bottom: 0.75rem;
}

.question-text {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.5;
}

.answer-section {
  padding-top: 0.75rem;
  border-top: 1px solid var(--border);
}

.correct-answer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.answer-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.answer-text {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--primary);
}

.remove-btn {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 1.75rem;
  height: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border: none;
  border-radius: var(--radius-full);
  color: var(--text-muted);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.remove-btn:hover {
  background: var(--danger);
  color: white;
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
