import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import learningData from '../data/learning_data.json'

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
  
  // 计算属性
  const getStats = computed(() => ({
    totalCorrect: totalCorrect.value,
    totalWrong: totalWrong.value,
    accuracy: totalCorrect.value + totalWrong.value > 0 
      ? Math.round((totalCorrect.value / (totalCorrect.value + totalWrong.value)) * 100)
      : 0
  }))
  
  const getWrongQuestions = computed(() => wrongQuestions.value)
  
  const getCategoryStats = computed(() => categoryStats.value)
  
  // 方法
  const recordAnswer = (isCorrect, question, category) => {
    if (isCorrect) {
      totalCorrect.value++
    } else {
      totalWrong.value++
      // 添加到错题本（避免重复）
      const exists = wrongQuestions.value.find(
        q => q.question === question.question && q.answer === question.answer
      )
      if (!exists) {
        wrongQuestions.value.push({
          ...question,
          category,
          timestamp: Date.now()
        })
      }
    }
    
    // 更新分类统计
    if (!categoryStats.value[category]) {
      categoryStats.value[category] = { correct: 0, wrong: 0 }
    }
    if (isCorrect) {
      categoryStats.value[category].correct++
    } else {
      categoryStats.value[category].wrong++
    }
    
    // 保存到本地存储
    saveToStorage('totalCorrect', totalCorrect.value)
    saveToStorage('totalWrong', totalWrong.value)
    saveToStorage('wrongQuestions', wrongQuestions.value)
    saveToStorage('categoryStats', categoryStats.value)
  }
  
  const removeFromWrongBook = (index) => {
    wrongQuestions.value.splice(index, 1)
    saveToStorage('wrongQuestions', wrongQuestions.value)
  }
  
  const clearWrongBook = () => {
    wrongQuestions.value = []
    saveToStorage('wrongQuestions', [])
  }
  
  const resetStats = () => {
    totalCorrect.value = 0
    totalWrong.value = 0
    categoryStats.value = {}
    saveToStorage('totalCorrect', 0)
    saveToStorage('totalWrong', 0)
    saveToStorage('categoryStats', {})
  }
  
  // 题目生成方法
  const generateQuestions = (category, count = 10) => {
    const questions = []
    
    switch (category) {
      case 'vocabulary':
        questions.push(...generateVocabularyQuestions(count))
        break
      case 'grammar':
        questions.push(...generateGrammarQuestions(count))
        break
      case 'translation':
        questions.push(...generateTranslationQuestions(count))
        break
      case 'plurals':
        questions.push(...generatePluralQuestions(count))
        break
      case 'pronouns':
        questions.push(...generatePronounQuestions(count))
        break
      case 'thirdPerson':
        questions.push(...generateThirdPersonQuestions(count))
        break
      default:
        questions.push(...generateMixedQuestions(count))
    }
    
    return shuffleArray(questions).slice(0, count)
  }
  
  // 词汇翻译题
  const generateVocabularyQuestions = (count) => {
    const questions = []
    const allVocab = []
    
    Object.values(learningData.vocabulary).forEach(unitVocab => {
      allVocab.push(...unitVocab)
    })
    
    const shuffled = shuffleArray([...allVocab])
    
    for (let i = 0; i < Math.min(count, shuffled.length); i++) {
      const word = shuffled[i]
      const isEnToCn = Math.random() > 0.5
      
      if (isEnToCn) {
        // 英译中
        const wrongOptions = shuffleArray(
          allVocab.filter(w => w.word !== word.word)
        ).slice(0, 3).map(w => w.chinese)
        
        questions.push({
          type: 'choice',
          typeLabel: '词汇翻译',
          question: `"${word.word}" 的中文意思是？`,
          hint: word.phonetic ? `音标：${word.phonetic}` : null,
          options: shuffleArray([word.chinese, ...wrongOptions]),
          answer: word.chinese
        })
      } else {
        // 中译英
        const wrongOptions = shuffleArray(
          allVocab.filter(w => w.word !== word.word)
        ).slice(0, 3).map(w => w.word)
        
        questions.push({
          type: 'choice',
          typeLabel: '词汇翻译',
          question: `"${word.chinese}" 用英语怎么说？`,
          options: shuffleArray([word.word, ...wrongOptions]),
          answer: word.word
        })
      }
    }
    
    return questions
  }
  
  // 语法题
  const generateGrammarQuestions = (count) => {
    const questions = []
    
    // 一般现在时 Yes/No 问题
    const presentSimpleQuestions = [
      { q: 'She ___ to school every day.', a: 'goes', wrong: ['go', 'going', 'went'] },
      { q: 'They ___ basketball on Sundays.', a: 'play', wrong: ['plays', 'playing', 'played'] },
      { q: 'He ___ like loud music.', a: "doesn't", wrong: ["don't", "isn't", "aren't"] },
      { q: '___ she walk to school?', a: 'Does', wrong: ['Do', 'Is', 'Are'] },
      { q: 'My father ___ breakfast at 7 o\'clock.', a: 'has', wrong: ['have', 'is having', 'having'] },
      { q: 'The sun ___ in the east.', a: 'rises', wrong: ['rise', 'rising', 'rose'] },
      { q: 'We ___ to music every evening.', a: 'listen', wrong: ['listens', 'listening', 'listened'] },
      { q: 'Tom ___ his homework after school.', a: 'does', wrong: ['do', 'doing', 'done'] }
    ]
    
    presentSimpleQuestions.forEach(item => {
      questions.push({
        type: 'choice',
        typeLabel: '语法填空',
        question: item.q,
        options: shuffleArray([item.a, ...item.wrong]),
        answer: item.a
      })
    })
    
    // 现在进行时
    const presentContinuousQuestions = [
      { q: 'Look! The children ___ in the park.', a: 'are playing', wrong: ['play', 'plays', 'played'] },
      { q: 'She ___ a book right now.', a: 'is reading', wrong: ['reads', 'read', 'reading'] },
      { q: 'We ___ dinner at the moment.', a: 'are having', wrong: ['have', 'has', 'having'] },
      { q: 'Listen! Someone ___ at the door.', a: 'is knocking', wrong: ['knocks', 'knock', 'knocked'] }
    ]
    
    presentContinuousQuestions.forEach(item => {
      questions.push({
        type: 'choice',
        typeLabel: '语法填空',
        question: item.q,
        options: shuffleArray([item.a, ...item.wrong]),
        answer: item.a
      })
    })
    
    return shuffleArray(questions).slice(0, count)
  }
  
  // 翻译题
  const generateTranslationQuestions = (count) => {
    const questions = []
    const allNotes = []
    
    Object.values(learningData.units).forEach(unit => {
      if (unit.notes) {
        allNotes.push(...unit.notes)
      }
    })
    
    const shuffled = shuffleArray([...allNotes])
    
    for (let i = 0; i < Math.min(count, shuffled.length); i++) {
      const note = shuffled[i]
      
      questions.push({
        type: 'input',
        typeLabel: '句子翻译',
        question: `请将下列句子翻译成中文：\n"${note.english}"`,
        hint: note.note ? note.note.substring(0, 50) + '...' : null,
        answer: note.chinese
      })
    }
    
    return questions
  }
  
  // 名词复数题
  const generatePluralQuestions = (count) => {
    const pluralRules = [
      { singular: 'tomato', plural: 'tomatoes' },
      { singular: 'potato', plural: 'potatoes' },
      { singular: 'knife', plural: 'knives' },
      { singular: 'leaf', plural: 'leaves' },
      { singular: 'child', plural: 'children' },
      { singular: 'goose', plural: 'geese' },
      { singular: 'tooth', plural: 'teeth' },
      { singular: 'foot', plural: 'feet' },
      { singular: 'sheep', plural: 'sheep' },
      { singular: 'fish', plural: 'fish' },
      { singular: 'strawberry', plural: 'strawberries' },
      { singular: 'baby', plural: 'babies' },
      { singular: 'city', plural: 'cities' },
      { singular: 'box', plural: 'boxes' },
      { singular: 'watch', plural: 'watches' },
      { singular: 'dish', plural: 'dishes' },
      { singular: 'bus', plural: 'buses' },
      { singular: 'glass', plural: 'glasses' }
    ]
    
    const questions = []
    const shuffled = shuffleArray([...pluralRules])
    
    for (let i = 0; i < Math.min(count, shuffled.length); i++) {
      const item = shuffled[i]
      
      questions.push({
        type: 'input',
        typeLabel: '名词复数',
        question: `请写出 "${item.singular}" 的复数形式`,
        answer: item.plural
      })
    }
    
    return questions
  }
  
  // 人称代词题
  const generatePronounQuestions = (count) => {
    const pronounQuestions = [
      { q: '___ am a student.', a: 'I', wrong: ['Me', 'My', 'Mine'] },
      { q: 'This is ___ book.', a: 'my', wrong: ['I', 'me', 'mine'] },
      { q: 'Give it to ___.', a: 'me', wrong: ['I', 'my', 'mine'] },
      { q: '___ is my best friend.', a: 'She', wrong: ['Her', 'Hers', 'She\'s'] },
      { q: 'I like ___.', a: 'her', wrong: ['she', 'hers', 'she\'s'] },
      { q: '___ are playing football.', a: 'They', wrong: ['Them', 'Their', 'Theirs'] },
      { q: 'The teacher told ___ to be quiet.', a: 'us', wrong: ['we', 'our', 'ours'] },
      { q: '___ is a beautiful day.', a: 'It', wrong: ['Its', 'It\'s', 'Is'] },
      { q: 'Can you help ___?', a: 'him', wrong: ['he', 'his', 'he\'s'] },
      { q: '___ house is very big.', a: 'Their', wrong: ['They', 'Them', 'Theirs'] }
    ]
    
    return shuffleArray(pronounQuestions.map(item => ({
      type: 'choice',
      typeLabel: '人称代词',
      question: item.q,
      options: shuffleArray([item.a, ...item.wrong]),
      answer: item.a
    }))).slice(0, count)
  }
  
  // 动词三单题
  const generateThirdPersonQuestions = (count) => {
    const thirdPersonRules = [
      { base: 'go', third: 'goes' },
      { base: 'do', third: 'does' },
      { base: 'have', third: 'has' },
      { base: 'watch', third: 'watches' },
      { base: 'wash', third: 'washes' },
      { base: 'teach', third: 'teaches' },
      { base: 'miss', third: 'misses' },
      { base: 'fix', third: 'fixes' },
      { base: 'study', third: 'studies' },
      { base: 'carry', third: 'carries' },
      { base: 'try', third: 'tries' },
      { base: 'fly', third: 'flies' },
      { base: 'play', third: 'plays' },
      { base: 'stay', third: 'stays' },
      { base: 'like', third: 'likes' },
      { base: 'love', third: 'loves' },
      { base: 'make', third: 'makes' },
      { base: 'take', third: 'takes' }
    ]
    
    const questions = []
    const shuffled = shuffleArray([...thirdPersonRules])
    
    for (let i = 0; i < Math.min(count, shuffled.length); i++) {
      const item = shuffled[i]
      
      questions.push({
        type: 'input',
        typeLabel: '动词三单',
        question: `请写出 "${item.base}" 的第三人称单数形式`,
        answer: item.third
      })
    }
    
    return questions
  }
  
  // 混合题目
  const generateMixedQuestions = (count) => {
    const vocabQ = generateVocabularyQuestions(Math.ceil(count / 3))
    const grammarQ = generateGrammarQuestions(Math.ceil(count / 3))
    const pluralQ = generatePluralQuestions(Math.ceil(count / 3))
    
    return shuffleArray([...vocabQ, ...grammarQ, ...pluralQ]).slice(0, count)
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
    // 计算属性
    getStats,
    getWrongQuestions,
    getCategoryStats,
    // 方法
    recordAnswer,
    removeFromWrongBook,
    clearWrongBook,
    resetStats,
    generateQuestions,
    shuffleArray
  }
})
