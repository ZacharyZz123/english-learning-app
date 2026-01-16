<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuizStore } from '../stores/quiz'
import QuizCard from '../components/QuizCard.vue'
import ProgressBar from '../components/ProgressBar.vue'

const route = useRoute()
const router = useRouter()
const store = useQuizStore()

const category = computed(() => route.params.category)
const questions = ref([])
const currentIndex = ref(0)
const correctCount = ref(0)
const wrongCount = ref(0)
const isFinished = ref(false)

const currentQuestion = computed(() => questions.value[currentIndex.value])

const categoryNames = {
  vocabulary: '词汇翻译',
  grammar: '语法填空',
  plurals: '名词复数',
  thirdPerson: '动词三单',
  pronouns: '人称代词',
  translation: '句子翻译',
  mixed: '综合练习'
}

const categoryName = computed(() => categoryNames[category.value] || '练习')

onMounted(() => {
  startQuiz()
})

const startQuiz = () => {
  questions.value = store.generateQuestions(category.value, 10)
  currentIndex.value = 0
  correctCount.value = 0
  wrongCount.value = 0
  isFinished.value = false
}

const handleAnswer = (isCorrect, question) => {
  store.recordAnswer(isCorrect, question, category.value)
  
  if (isCorrect) {
    correctCount.value++
  } else {
    wrongCount.value++
  }
  
  // 移动到下一题
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++
  } else {
    isFinished.value = true
  }
}

const accuracy = computed(() => {
  const total = correctCount.value + wrongCount.value
  if (total === 0) return 0
  return Math.round((correctCount.value / total) * 100)
})

const resultEmoji = computed(() => {
  if (accuracy.value >= 90) return '🏆'
  if (accuracy.value >= 70) return '🎉'
  if (accuracy.value >= 50) return '💪'
  return '📚'
})

const resultMessage = computed(() => {
  if (accuracy.value >= 90) return '太棒了！你是学霸！'
  if (accuracy.value >= 70) return '很不错！继续加油！'
  if (accuracy.value >= 50) return '还可以，再接再厉！'
  return '需要多加练习哦！'
})
</script>

<template>
  <div class="quiz-page">
    <!-- 进行中 -->
    <template v-if="!isFinished && questions.length > 0">
      <header class="quiz-header">
        <button class="back-btn" @click="router.push('/topics')">
          ← 返回
        </button>
        <h1 class="quiz-title">{{ categoryName }}</h1>
        <div class="score-display">
          <span class="correct">✓{{ correctCount }}</span>
          <span class="wrong">✗{{ wrongCount }}</span>
        </div>
      </header>
      
      <div class="progress-section">
        <ProgressBar :current="currentIndex + 1" :total="questions.length" />
      </div>
      
      <QuizCard
        :question="currentQuestion"
        :question-index="currentIndex"
        @answer="handleAnswer"
      />
    </template>
    
    <!-- 完成页面 -->
    <template v-else-if="isFinished">
      <div class="result-page">
        <div class="result-card">
          <div class="result-emoji">{{ resultEmoji }}</div>
          <h2 class="result-title">练习完成！</h2>
          <p class="result-message">{{ resultMessage }}</p>
          
          <div class="result-stats">
            <div class="result-stat">
              <span class="stat-number">{{ correctCount }}</span>
              <span class="stat-label">答对</span>
            </div>
            <div class="result-stat">
              <span class="stat-number">{{ wrongCount }}</span>
              <span class="stat-label">答错</span>
            </div>
            <div class="result-stat">
              <span class="stat-number highlight">{{ accuracy }}%</span>
              <span class="stat-label">正确率</span>
            </div>
          </div>
          
          <div class="result-actions">
            <button class="btn btn-primary btn-lg" @click="startQuiz">
              🔄 再练一次
            </button>
            <button class="btn btn-secondary" @click="router.push('/topics')">
              📚 选择其他
            </button>
            <button 
              v-if="wrongCount > 0" 
              class="btn btn-secondary" 
              @click="router.push('/wrongbook')"
            >
              📝 查看错题
            </button>
          </div>
        </div>
      </div>
    </template>
    
    <!-- 加载中 -->
    <template v-else>
      <div class="loading">
        <div class="loading-spinner">🔄</div>
        <p>加载题目中...</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.quiz-page {
  max-width: 600px;
  margin: 0 auto;
}

.quiz-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.back-btn {
  background: none;
  border: none;
  font-size: 1rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  font-family: inherit;
  font-weight: 600;
  transition: color var(--transition-fast);
}

.back-btn:hover {
  color: var(--primary);
}

.quiz-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.score-display {
  display: flex;
  gap: 0.75rem;
  font-weight: 700;
  font-size: 0.95rem;
}

.score-display .correct {
  color: var(--success);
}

.score-display .wrong {
  color: var(--danger);
}

.progress-section {
  margin-bottom: 1.5rem;
}

.result-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  animation: fadeIn 0.4s ease-out;
}

.result-card {
  background: white;
  border-radius: var(--radius-xl);
  padding: 2rem;
  text-align: center;
  box-shadow: var(--shadow-xl);
  max-width: 400px;
  width: 100%;
}

.result-emoji {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: bounce 1s ease-in-out infinite;
}

.result-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.result-message {
  font-size: 1rem;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.result-stats {
  display: flex;
  justify-content: space-around;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  margin-bottom: 1.5rem;
}

.result-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-number {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--text-primary);
}

.stat-number.highlight {
  color: var(--primary);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 600;
}

.result-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  gap: 1rem;
}

.loading-spinner {
  font-size: 3rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
