<template>
  <div class="quiz-view">
    <!-- 顶部导航栏 -->
    <header class="quiz-header">
      <button class="back-btn" @click="goBack">← 返回</button>
      <h1>{{ categoryName }}</h1>
      <div class="score-display">
        <span class="correct">✓{{ correctCount }}</span>
        <span class="wrong">✗{{ wrongCount }}</span>
      </div>
    </header>

    <!-- 进度条 -->
    <div class="progress-section">
      <div class="progress-info">
        <span>{{ currentIndex + 1 }} / {{ totalQuestions }}</span>
        <span>{{ progressPercent }}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
      </div>
    </div>

    <!-- 题目卡片 -->
    <div class="question-card" v-if="currentQuestion">
      <div class="question-meta">
        <span class="question-type">{{ categoryName }}</span>
        <span class="question-num">第 {{ currentIndex + 1 }} 题</span>
      </div>
      
      <h2 class="question-text">{{ currentQuestion.question }}</h2>
      
      <!-- 音标提示 -->
      <div v-if="currentQuestion.phonetic" class="phonetic-hint">
        💡 音标：{{ currentQuestion.phonetic }}
      </div>

      <!-- 选项列表 -->
      <div class="options-list">
        <button 
          v-for="(option, index) in currentQuestion.options" 
          :key="index"
          class="option-btn"
          :class="{
            'selected': selectedAnswer === index,
            'correct': showResult && index === currentQuestion.answer,
            'wrong': showResult && selectedAnswer === index && index !== currentQuestion.answer,
            'disabled': showResult
          }"
          @click="selectAnswer(index)"
          :disabled="showResult"
        >
          <span class="option-letter">{{ optionLetters[index] }}</span>
          <span class="option-text">{{ option }}</span>
        </button>
      </div>
    </div>

    <!-- 答题详解弹窗 -->
    <div v-if="showExplanation" class="explanation-overlay" @click.self="nextQuestion">
      <div class="explanation-modal" :class="{ 'is-correct': isCorrect, 'is-wrong': !isCorrect }">
        <div class="explanation-header">
          <span class="result-icon">{{ isCorrect ? '✓' : '✗' }}</span>
          <h2>{{ isCorrect ? '回答正确' : '回答错误' }}</h2>
        </div>
        
        <div class="explanation-content">
          <div class="correct-answer">
            <span class="label">正确答案：</span>
            <span class="answer">{{ currentQuestion.options[currentQuestion.answer] }}</span>
          </div>
          
          <div class="explanation-box" v-if="currentQuestion.explanation">
            <h3>{{ currentQuestion.explanation.title }}</h3>
            <p class="main-content">{{ currentQuestion.explanation.content }}</p>
            <div class="detail-content">
              <pre>{{ currentQuestion.explanation.detail }}</pre>
            </div>
          </div>
        </div>

        <div class="explanation-footer">
          <p class="hint">点击屏幕或按空格继续</p>
          <button class="continue-btn" @click="nextQuestion">
            {{ isLastQuestion ? '查看结果' : '下一题' }} →
          </button>
        </div>
      </div>
    </div>

    <!-- 结果页面 -->
    <div v-if="showResult && quizCompleted" class="result-overlay">
      <div class="result-modal">
        <div class="result-icon">🎉</div>
        <h2>练习完成！</h2>
        
        <div class="result-stats">
          <div class="stat-item">
            <span class="stat-value">{{ totalQuestions }}</span>
            <span class="stat-label">总题数</span>
          </div>
          <div class="stat-item correct">
            <span class="stat-value">{{ correctCount }}</span>
            <span class="stat-label">正确</span>
          </div>
          <div class="stat-item wrong">
            <span class="stat-value">{{ wrongCount }}</span>
            <span class="stat-label">错误</span>
          </div>
        </div>
        
        <div class="accuracy-display">
          <div class="accuracy-circle" :style="{ '--accuracy': accuracy }">
            <span class="accuracy-value">{{ accuracy }}%</span>
            <span class="accuracy-label">正确率</span>
          </div>
        </div>

        <div class="result-actions">
          <button class="action-btn primary" @click="restartQuiz">再练一次</button>
          <button class="action-btn secondary" @click="goToWrongBook" v-if="wrongCount > 0">
            查看错题
          </button>
          <button class="action-btn" @click="goBack">返回首页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuizStore } from '../stores/quiz'
import learningData from '../data/learning_data.json'
import { generateQuestions } from '../utils/questionGenerator'

const router = useRouter()
const route = useRoute()
const quizStore = useQuizStore()

const optionLetters = ['A', 'B', 'C', 'D']

// 状态
const questions = ref([])
const currentIndex = ref(0)
const selectedAnswer = ref(null)
const showResult = ref(false)
const showExplanation = ref(false)
const isCorrect = ref(false)
const correctCount = ref(0)
const wrongCount = ref(0)
const quizCompleted = ref(false)
const wrongAnswers = ref([])

// 获取分类名称
const categoryName = computed(() => {
  const category = route.params.category
  if (category === 'comprehensive') return '综合练习'
  const found = learningData.categories.find(c => c.id === category)
  return found ? found.name : '练习'
})

// 当前题目
const currentQuestion = computed(() => {
  return questions.value[currentIndex.value]
})

// 总题数
const totalQuestions = computed(() => {
  return questions.value.length
})

// 进度百分比
const progressPercent = computed(() => {
  if (totalQuestions.value === 0) return 0
  return Math.round((currentIndex.value + 1) / totalQuestions.value * 100)
})

// 是否最后一题
const isLastQuestion = computed(() => {
  return currentIndex.value >= totalQuestions.value - 1
})

// 正确率
const accuracy = computed(() => {
  const total = correctCount.value + wrongCount.value
  if (total === 0) return 0
  return Math.round((correctCount.value / total) * 100)
})

// 初始化
onMounted(() => {
  loadQuestions()
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

// 监听路由变化，重新加载题目
watch(
  () => route.params.category,
  (newCategory, oldCategory) => {
    if (newCategory && newCategory !== oldCategory) {
      loadQuestions()
    }
  }
)

// 加载题目
const loadQuestions = () => {
  const category = route.params.category
  const difficulty = route.query.difficulty || 'easy'
  const count = parseInt(route.query.count) || 50
  
  // 使用题目生成器动态生成题目
  questions.value = generateQuestions(category, count)
  
  // 重置状态
  currentIndex.value = 0
  selectedAnswer.value = null
  showResult.value = false
  showExplanation.value = false
  correctCount.value = 0
  wrongCount.value = 0
  quizCompleted.value = false
  wrongAnswers.value = []
}

// 随机打乱数组
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

// 选择答案
const selectAnswer = (index) => {
  if (showResult.value) return
  
  selectedAnswer.value = index
  showResult.value = true
  isCorrect.value = index === currentQuestion.value.answer
  
  if (isCorrect.value) {
    correctCount.value++
  } else {
    wrongCount.value++
    // 记录错题
    wrongAnswers.value.push({
      ...currentQuestion.value,
      userAnswer: index,
      category: route.params.category
    })
  }
  
  // 显示详解
  showExplanation.value = true
}

// 下一题
const nextQuestion = () => {
  showExplanation.value = false
  
  if (isLastQuestion.value) {
    // 完成练习
    quizCompleted.value = true
    // 保存错题到store
    if (wrongAnswers.value.length > 0) {
      quizStore.addWrongAnswers(wrongAnswers.value)
    }
    // 保存统计
    quizStore.addQuizRecord({
      category: route.params.category,
      total: totalQuestions.value,
      correct: correctCount.value,
      wrong: wrongCount.value,
      timestamp: Date.now()
    })
  } else {
    currentIndex.value++
    selectedAnswer.value = null
    showResult.value = false
  }
}

// 键盘事件处理
const handleKeyDown = (e) => {
  if (e.code === 'Space' && showExplanation.value) {
    e.preventDefault()
    nextQuestion()
  }
}

// 返回
const goBack = () => {
  router.push('/topics')
}

// 重新开始
const restartQuiz = () => {
  loadQuestions()
}

// 查看错题
const goToWrongBook = () => {
  router.push('/wrongbook')
}
</script>

<style scoped>
.quiz-view {
  min-height: 100vh;
  padding: 15px;
  padding-bottom: 100px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}

/* 顶部导航 */
.quiz-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  margin-bottom: 15px;
}

.back-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.quiz-header h1 {
  color: #fff;
  font-size: 1.2rem;
  font-weight: 600;
}

.score-display {
  display: flex;
  gap: 10px;
}

.score-display .correct {
  color: #4CAF50;
  font-weight: 600;
}

.score-display .wrong {
  color: #FF5252;
  font-weight: 600;
}

/* 进度条 */
.progress-section {
  margin-bottom: 20px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin-bottom: 8px;
}

.progress-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50 0%, #8BC34A 100%);
  border-radius: 10px;
  transition: width 0.3s ease;
}

/* 题目卡片 */
.question-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 25px 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.question-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.question-type {
  background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
  color: #fff;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.question-num {
  color: #666;
  font-size: 0.85rem;
}

.question-text {
  color: #2c3e50;
  font-size: 1.2rem;
  line-height: 1.6;
  margin-bottom: 15px;
}

.phonetic-hint {
  background: #FFF9C4;
  padding: 10px 15px;
  border-radius: 10px;
  color: #795548;
  font-size: 0.9rem;
  margin-bottom: 20px;
}

/* 选项列表 */
.options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-btn {
  display: flex;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.option-btn:hover:not(.disabled) {
  background: #e9ecef;
  transform: translateX(5px);
}

.option-btn.selected:not(.correct):not(.wrong) {
  border-color: #2196F3;
  background: #E3F2FD;
}

.option-btn.correct {
  border-color: #4CAF50;
  background: #E8F5E9;
}

.option-btn.wrong {
  border-color: #FF5252;
  background: #FFEBEE;
}

.option-btn.disabled {
  cursor: default;
}

.option-letter {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #4CAF50;
  color: #fff;
  border-radius: 50%;
  font-weight: 600;
  margin-right: 12px;
  flex-shrink: 0;
}

.option-btn.correct .option-letter {
  background: #4CAF50;
}

.option-btn.wrong .option-letter {
  background: #FF5252;
}

.option-text {
  color: #333;
  font-size: 1rem;
  line-height: 1.4;
}

/* 答题详解弹窗 */
.explanation-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.explanation-modal {
  background: linear-gradient(135deg, #1e3a5f 0%, #16213e 100%);
  border-radius: 20px;
  padding: 25px;
  width: 100%;
  max-width: 400px;
  animation: slideUp 0.3s ease;
  border: 2px solid;
}

.explanation-modal.is-correct {
  border-color: #4CAF50;
}

.explanation-modal.is-wrong {
  border-color: #FF5252;
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(30px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

.explanation-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.result-icon {
  font-size: 2rem;
}

.is-correct .result-icon {
  color: #4CAF50;
}

.is-wrong .result-icon {
  color: #FF5252;
}

.explanation-header h2 {
  font-size: 1.3rem;
}

.is-correct .explanation-header h2 {
  color: #4CAF50;
}

.is-wrong .explanation-header h2 {
  color: #FF5252;
}

.explanation-content {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 20px;
}

.correct-answer {
  margin-bottom: 15px;
  color: #fff;
}

.correct-answer .label {
  color: rgba(255, 255, 255, 0.7);
}

.correct-answer .answer {
  font-weight: 600;
  color: #4CAF50;
  font-size: 1.1rem;
}

.explanation-box h3 {
  color: #81D4FA;
  font-size: 0.95rem;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.explanation-box .main-content {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
  margin-bottom: 10px;
}

.explanation-box .detail-content {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 12px;
}

.explanation-box pre {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.85rem;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: inherit;
  line-height: 1.6;
  margin: 0;
}

.explanation-footer {
  text-align: center;
}

.explanation-footer .hint {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
  margin-bottom: 12px;
}

.continue-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.continue-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(76, 175, 80, 0.4);
}

/* 结果页面 */
.result-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.result-modal {
  text-align: center;
  width: 100%;
  max-width: 400px;
}

.result-modal .result-icon {
  font-size: 4rem;
  margin-bottom: 15px;
}

.result-modal h2 {
  color: #fff;
  font-size: 1.8rem;
  margin-bottom: 25px;
}

.result-stats {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 30px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
}

.stat-item.correct .stat-value {
  color: #4CAF50;
}

.stat-item.wrong .stat-value {
  color: #FF5252;
}

.stat-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

.accuracy-display {
  margin-bottom: 30px;
}

.accuracy-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: conic-gradient(
    #4CAF50 calc(var(--accuracy) * 1%), 
    rgba(255, 255, 255, 0.1) 0
  );
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  position: relative;
}

.accuracy-circle::before {
  content: '';
  position: absolute;
  width: 90px;
  height: 90px;
  background: #16213e;
  border-radius: 50%;
}

.accuracy-value {
  position: relative;
  font-size: 1.8rem;
  font-weight: 700;
  color: #4CAF50;
}

.accuracy-label {
  position: relative;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
}

.result-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-btn {
  padding: 14px;
  border-radius: 12px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.action-btn.primary {
  background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
  color: #fff;
  font-weight: 600;
}

.action-btn.secondary {
  background: rgba(255, 152, 0, 0.2);
  color: #FF9800;
  border: 1px solid #FF9800;
}

.action-btn:not(.primary):not(.secondary) {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.action-btn:hover {
  transform: translateY(-2px);
}
</style>
