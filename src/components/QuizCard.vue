<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  question: {
    type: Object,
    required: true
  },
  questionIndex: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['answer'])

const selectedAnswer = ref(null)
const showResult = ref(false)
const inputAnswer = ref('')

const isCorrect = computed(() => {
  if (props.question.type === 'input') {
    return inputAnswer.value.trim().toLowerCase() === props.question.answer.toLowerCase()
  }
  return selectedAnswer.value === props.question.answer
})

const selectOption = (option) => {
  if (showResult.value) return
  selectedAnswer.value = option
  showResult.value = true
  
  setTimeout(() => {
    emit('answer', isCorrect.value, props.question)
    resetState()
  }, 1500)
}

const submitInput = () => {
  if (!inputAnswer.value.trim() || showResult.value) return
  showResult.value = true
  
  setTimeout(() => {
    emit('answer', isCorrect.value, props.question)
    resetState()
  }, 1500)
}

const resetState = () => {
  selectedAnswer.value = null
  showResult.value = false
  inputAnswer.value = ''
}

const getOptionClass = (option) => {
  if (!showResult.value) return ''
  if (option === props.question.answer) return 'correct'
  if (option === selectedAnswer.value) return 'incorrect'
  return ''
}
</script>

<template>
  <div class="quiz-card" :class="{ 'show-result': showResult }">
    <div class="question-header">
      <span class="question-type">{{ question.typeLabel }}</span>
      <span class="question-number">第 {{ questionIndex + 1 }} 题</span>
    </div>
    
    <div class="question-content">
      <p class="question-text">{{ question.question }}</p>
      <p v-if="question.hint" class="question-hint">💡 {{ question.hint }}</p>
    </div>
    
    <!-- 选择题 -->
    <div v-if="question.type === 'choice'" class="options-container">
      <button
        v-for="(option, index) in question.options"
        :key="index"
        class="option-btn"
        :class="getOptionClass(option)"
        @click="selectOption(option)"
        :disabled="showResult"
      >
        <span class="option-letter">{{ ['A', 'B', 'C', 'D'][index] }}</span>
        <span class="option-text">{{ option }}</span>
        <span v-if="showResult && option === question.answer" class="option-icon">✓</span>
        <span v-if="showResult && option === selectedAnswer && option !== question.answer" class="option-icon">✗</span>
      </button>
    </div>
    
    <!-- 填空题 -->
    <div v-else class="input-container">
      <input
        v-model="inputAnswer"
        type="text"
        class="answer-input"
        :class="{ 
          'correct': showResult && isCorrect, 
          'incorrect': showResult && !isCorrect 
        }"
        placeholder="输入你的答案..."
        @keyup.enter="submitInput"
        :disabled="showResult"
      />
      <button 
        class="submit-btn btn btn-primary"
        @click="submitInput"
        :disabled="!inputAnswer.trim() || showResult"
      >
        确认
      </button>
      <p v-if="showResult && !isCorrect" class="correct-answer">
        正确答案：<strong>{{ question.answer }}</strong>
      </p>
    </div>
    
    <!-- 结果反馈 -->
    <div v-if="showResult" class="result-feedback" :class="{ correct: isCorrect, incorrect: !isCorrect }">
      <span class="result-icon">{{ isCorrect ? '🎉' : '😅' }}</span>
      <span class="result-text">{{ isCorrect ? '回答正确！' : '答错了，继续加油！' }}</span>
    </div>
  </div>
</template>

<style scoped>
.quiz-card {
  background: white;
  border-radius: var(--radius-xl);
  padding: 1.5rem;
  box-shadow: var(--shadow-lg);
  animation: fadeIn 0.3s ease-out;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.question-type {
  background: var(--primary-bg);
  color: var(--primary-dark);
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 700;
}

.question-number {
  color: var(--text-muted);
  font-size: 0.875rem;
  font-weight: 600;
}

.question-content {
  margin-bottom: 1.5rem;
}

.question-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.5;
}

.question-hint {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  background: var(--bg-tertiary);
  padding: 0.75rem;
  border-radius: var(--radius-md);
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.option-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 1rem;
  background: var(--bg-secondary);
  border: 2px solid transparent;
  border-radius: var(--radius-lg);
  font-size: 1rem;
  font-family: inherit;
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
}

.option-btn:hover:not(:disabled) {
  border-color: var(--primary);
  background: var(--primary-bg);
}

.option-btn:disabled {
  cursor: default;
}

.option-btn.correct {
  border-color: var(--success);
  background: #dcfce7;
  animation: pulse 0.3s ease-out;
}

.option-btn.incorrect {
  border-color: var(--danger);
  background: #fee2e2;
  animation: shake 0.3s ease-out;
}

.option-letter {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: var(--primary);
  color: white;
  border-radius: var(--radius-full);
  font-weight: 700;
  font-size: 0.875rem;
}

.option-text {
  flex: 1;
  font-weight: 500;
}

.option-icon {
  font-size: 1.25rem;
  font-weight: 700;
}

.option-btn.correct .option-icon {
  color: var(--success);
}

.option-btn.incorrect .option-icon {
  color: var(--danger);
}

.input-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.answer-input {
  width: 100%;
  padding: 1rem;
  font-size: 1.125rem;
  font-family: inherit;
  border: 2px solid var(--border);
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
}

.answer-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
}

.answer-input.correct {
  border-color: var(--success);
  background: #dcfce7;
}

.answer-input.incorrect {
  border-color: var(--danger);
  background: #fee2e2;
}

.submit-btn {
  align-self: flex-end;
}

.correct-answer {
  font-size: 0.95rem;
  color: var(--text-secondary);
  padding: 0.75rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.correct-answer strong {
  color: var(--primary);
}

.result-feedback {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: var(--radius-lg);
  animation: fadeIn 0.3s ease-out;
}

.result-feedback.correct {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
}

.result-feedback.incorrect {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
}

.result-icon {
  font-size: 1.5rem;
}

.result-text {
  font-weight: 700;
  font-size: 1rem;
}

.result-feedback.correct .result-text {
  color: #16a34a;
}

.result-feedback.incorrect .result-text {
  color: #dc2626;
}
</style>
