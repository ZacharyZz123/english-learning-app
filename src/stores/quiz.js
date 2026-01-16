import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 从 localStorage 读取数据
const loadFromStorage = (key, defaultValue) => {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : defaultValue
  } catch {
    return defaultValue
  }
}

// 保存到 localStorage
const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.warn('Failed to save to localStorage:', e)
  }
}

export const useQuizStore = defineStore('quiz', () => {
  // 状态
  const totalCorrect = ref(loadFromStorage('totalCorrect', 0))
  const totalWrong = ref(loadFromStorage('totalWrong', 0))
  const wrongQuestions = ref(loadFromStorage('wrongQuestions', []))
  const categoryStats = ref(loadFromStorage('categoryStats', {}))
  const quizRecords = ref(loadFromStorage('quizRecords', []))
  
  // 计算属性
  const getStats = computed(() => ({
    totalCorrect: totalCorrect.value,
    totalWrong: totalWrong.value,
    totalQuestions: totalCorrect.value + totalWrong.value,
    accuracy: totalCorrect.value + totalWrong.value > 0 
      ? Math.round((totalCorrect.value / (totalCorrect.value + totalWrong.value)) * 100)
      : 0
  }))
  
  const getWrongQuestions = computed(() => wrongQuestions.value)
  
  const getCategoryStats = computed(() => categoryStats.value)
  
  const getQuizRecords = computed(() => quizRecords.value)
  
  // 添加错题
  const addWrongAnswers = (questions) => {
    questions.forEach(question => {
      // 检查是否已存在相同题目
      const exists = wrongQuestions.value.find(
        q => q.id === question.id || 
            (q.question === question.question && q.answer === question.answer)
      )
      
      if (!exists) {
        wrongQuestions.value.push({
          ...question,
          timestamp: Date.now()
        })
      }
    })
    
    saveToStorage('wrongQuestions', wrongQuestions.value)
  }
  
  // 添加练习记录
  const addQuizRecord = (record) => {
    // 更新总计数
    totalCorrect.value += record.correct
    totalWrong.value += record.wrong
    
    // 更新分类统计
    const category = record.category
    if (!categoryStats.value[category]) {
      categoryStats.value[category] = { correct: 0, wrong: 0, total: 0 }
    }
    categoryStats.value[category].correct += record.correct
    categoryStats.value[category].wrong += record.wrong
    categoryStats.value[category].total += record.total
    
    // 添加记录
    quizRecords.value.unshift({
      ...record,
      id: Date.now()
    })
    
    // 只保留最近50条记录
    if (quizRecords.value.length > 50) {
      quizRecords.value = quizRecords.value.slice(0, 50)
    }
    
    // 保存到本地存储
    saveToStorage('totalCorrect', totalCorrect.value)
    saveToStorage('totalWrong', totalWrong.value)
    saveToStorage('categoryStats', categoryStats.value)
    saveToStorage('quizRecords', quizRecords.value)
  }
  
  // 从错题本移除
  const removeFromWrongBook = (questionId) => {
    const index = wrongQuestions.value.findIndex(q => q.id === questionId)
    if (index > -1) {
      wrongQuestions.value.splice(index, 1)
      saveToStorage('wrongQuestions', wrongQuestions.value)
    }
  }
  
  // 清空错题本
  const clearWrongBook = () => {
    wrongQuestions.value = []
    saveToStorage('wrongQuestions', [])
  }
  
  // 重置统计
  const resetStats = () => {
    totalCorrect.value = 0
    totalWrong.value = 0
    categoryStats.value = {}
    quizRecords.value = []
    saveToStorage('totalCorrect', 0)
    saveToStorage('totalWrong', 0)
    saveToStorage('categoryStats', {})
    saveToStorage('quizRecords', [])
  }
  
  // 工具函数：洗牌算法
  const shuffleArray = (array) => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }
  
  return {
    // 状态
    totalCorrect,
    totalWrong,
    wrongQuestions,
    categoryStats,
    quizRecords,
    // 计算属性
    getStats,
    getWrongQuestions,
    getCategoryStats,
    getQuizRecords,
    // 方法
    addWrongAnswers,
    addQuizRecord,
    removeFromWrongBook,
    clearWrongBook,
    resetStats,
    shuffleArray
  }
})
