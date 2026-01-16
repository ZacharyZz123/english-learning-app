<template>
  <div class="wrongbook-view">
    <header class="wrongbook-header">
      <h1>📝 错题本</h1>
      <p class="subtitle">共 {{ wrongQuestions.length }} 道错题</p>
    </header>

    <!-- 空状态 -->
    <div v-if="wrongQuestions.length === 0" class="empty-state">
      <div class="empty-icon">🎉</div>
      <h2>太棒了！</h2>
      <p>你还没有错题记录</p>
      <router-link to="/topics" class="start-btn">去练习</router-link>
    </div>

    <!-- 错题列表 -->
    <div v-else class="wrong-list">
      <div class="actions-bar">
        <button class="redo-all-btn" @click="redoAll">
          🔄 重做全部错题
        </button>
        <button class="clear-btn" @click="clearAll">
          🗑️ 清空
        </button>
      </div>

      <div 
        v-for="(question, index) in wrongQuestions" 
        :key="question.id || index"
        class="wrong-card"
      >
        <div class="card-header">
          <span class="category-tag">{{ getCategoryName(question.category) }}</span>
          <span class="time">{{ formatTime(question.timestamp) }}</span>
        </div>
        
        <div class="question-text">{{ question.question }}</div>
        
        <div class="answers-section">
          <div class="your-answer wrong">
            <span class="label">你的答案：</span>
            <span class="value">{{ question.options[question.userAnswer] }}</span>
          </div>
          <div class="correct-answer">
            <span class="label">正确答案：</span>
            <span class="value">{{ question.options[question.answer] }}</span>
          </div>
        </div>

        <div v-if="question.explanation" class="explanation-section">
          <button 
            class="toggle-explanation" 
            @click="toggleExplanation(question.id)"
          >
            {{ expandedIds.includes(question.id) ? '收起解析 ▲' : '查看解析 ▼' }}
          </button>
          
          <div v-if="expandedIds.includes(question.id)" class="explanation-content">
            <h4>{{ question.explanation.title }}</h4>
            <p>{{ question.explanation.content }}</p>
            <pre>{{ question.explanation.detail }}</pre>
          </div>
        </div>

        <div class="card-actions">
          <button class="action-btn" @click="removeQuestion(question.id)">
            移除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizStore } from '../stores/quiz'
import learningData from '../data/learning_data.json'

const router = useRouter()
const quizStore = useQuizStore()

const expandedIds = ref([])

const wrongQuestions = computed(() => quizStore.getWrongQuestions)

const getCategoryName = (categoryId) => {
  if (categoryId === 'comprehensive') return '综合练习'
  const category = learningData.categories.find(c => c.id === categoryId)
  return category ? category.name : '练习'
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const toggleExplanation = (id) => {
  const index = expandedIds.value.indexOf(id)
  if (index > -1) {
    expandedIds.value.splice(index, 1)
  } else {
    expandedIds.value.push(id)
  }
}

const removeQuestion = (id) => {
  quizStore.removeFromWrongBook(id)
}

const clearAll = () => {
  if (confirm('确定要清空所有错题吗？')) {
    quizStore.clearWrongBook()
  }
}

const redoAll = () => {
  router.push({
    name: 'quiz',
    params: { category: 'wrongbook' },
    query: { redo: 'true' }
  })
}
</script>

<style scoped>
.wrongbook-view {
  min-height: 100vh;
  padding: 20px;
  padding-bottom: 100px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}

.wrongbook-header {
  text-align: center;
  margin-bottom: 25px;
  padding: 15px 0;
}

.wrongbook-header h1 {
  color: #fff;
  font-size: 1.6rem;
  margin-bottom: 5px;
}

.subtitle {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 15px;
}

.empty-state h2 {
  color: #fff;
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.empty-state p {
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 25px;
}

.start-btn {
  display: inline-block;
  padding: 12px 30px;
  background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
  color: #fff;
  text-decoration: none;
  border-radius: 25px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(76, 175, 80, 0.4);
}

/* 操作栏 */
.actions-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.redo-all-btn, .clear-btn {
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.redo-all-btn {
  background: linear-gradient(135deg, #2196F3 0%, #03A9F4 100%);
  color: #fff;
}

.clear-btn {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 错题卡片 */
.wrong-list {
  max-width: 600px;
  margin: 0 auto;
}

.wrong-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.category-tag {
  background: linear-gradient(135deg, #FF5252 0%, #FF7043 100%);
  color: #fff;
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 0.75rem;
  font-weight: 500;
}

.time {
  color: #999;
  font-size: 0.8rem;
}

.question-text {
  color: #333;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.answers-section {
  margin-bottom: 12px;
}

.your-answer, .correct-answer {
  display: flex;
  margin-bottom: 8px;
}

.label {
  color: #666;
  font-size: 0.85rem;
  min-width: 70px;
}

.your-answer.wrong .value {
  color: #FF5252;
  font-weight: 500;
  text-decoration: line-through;
}

.correct-answer .value {
  color: #4CAF50;
  font-weight: 600;
}

.explanation-section {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #ddd;
}

.toggle-explanation {
  width: 100%;
  padding: 10px;
  background: #f5f5f5;
  border: none;
  border-radius: 8px;
  color: #666;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-explanation:hover {
  background: #eee;
}

.explanation-content {
  margin-top: 12px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
}

.explanation-content h4 {
  color: #2196F3;
  font-size: 0.9rem;
  margin-bottom: 8px;
}

.explanation-content p {
  color: #333;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.explanation-content pre {
  color: #666;
  font-size: 0.8rem;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: inherit;
  line-height: 1.6;
  margin: 0;
  background: #fff;
  padding: 10px;
  border-radius: 6px;
}

.card-actions {
  margin-top: 12px;
  text-align: right;
}

.action-btn {
  padding: 6px 15px;
  background: none;
  border: 1px solid #ddd;
  border-radius: 6px;
  color: #666;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #f5f5f5;
  border-color: #ccc;
}
</style>
