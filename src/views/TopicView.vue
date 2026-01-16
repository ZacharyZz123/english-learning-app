<template>
  <div class="topic-view">
    <header class="topic-header">
      <h1>📚 选择知识专项</h1>
      <p class="subtitle">选择一个知识点开始练习</p>
    </header>

    <!-- 难度选择弹窗 -->
    <div v-if="showDifficultyModal" class="modal-overlay" @click.self="closeDifficultyModal">
      <div class="difficulty-modal">
        <h2>选择练习模式</h2>
        <p class="modal-category">{{ selectedCategory?.name }}</p>
        
        <!-- 模式切换 -->
        <div class="mode-tabs">
          <button 
            class="mode-tab" 
            :class="{ active: selectedMode === 'normal' }"
            @click="selectedMode = 'normal'"
          >
            <span class="mode-icon">📝</span>
            <span>选择题</span>
          </button>
          <button 
            class="mode-tab" 
            :class="{ active: selectedMode === 'challenge', disabled: isChallengeDisabled }"
            @click="!isChallengeDisabled && (selectedMode = 'challenge')"
            :disabled="isChallengeDisabled"
          >
            <span class="mode-icon">🔥</span>
            <span>挑战模式</span>
          </button>
        </div>
        
        <p v-if="isChallengeDisabled" class="mode-hint">
          💡 音标题目不支持挑战模式
        </p>
        <p v-else-if="selectedMode === 'challenge'" class="mode-hint challenge">
          🔥 挑战模式：题目变为填空题，需要手动输入答案
        </p>
        
        <div class="difficulty-list">
          <div 
            v-for="level in difficultyLevels" 
            :key="level.id"
            class="difficulty-item"
            :style="{ borderLeftColor: level.color }"
            @click="startQuiz(level)"
          >
            <span class="difficulty-icon">{{ level.icon }}</span>
            <div class="difficulty-info">
              <h3>{{ level.name }} ({{ level.questionCount }}题)</h3>
              <p>{{ level.description }}</p>
            </div>
            <span class="arrow">→</span>
          </div>
        </div>
        <button class="close-btn" @click="closeDifficultyModal">取消</button>
      </div>
    </div>

    <!-- 知识专项网格 -->
    <div class="topics-grid">
      <div 
        v-for="category in categories" 
        :key="category.id"
        class="topic-card"
        :style="{ '--card-color': category.color }"
        @click="selectCategory(category)"
      >
        <div class="topic-icon">{{ category.icon }}</div>
        <h3 class="topic-name">{{ category.name }}</h3>
        <p class="topic-desc">{{ category.description }}</p>
      </div>
    </div>

    <!-- 综合练习入口 -->
    <div class="comprehensive-section">
      <div 
        class="comprehensive-card"
        @click="selectCategory({ id: 'comprehensive', name: '综合练习', icon: '🎯', description: '混合题目挑战' })"
      >
        <span class="comp-icon">🎯</span>
        <div class="comp-info">
          <h3>综合练习</h3>
          <p>混合所有知识点，全面测试</p>
        </div>
        <span class="arrow">→</span>
      </div>
    </div>
    
    <!-- 底部统计信息 -->
    <div class="stats-footer">
      <div class="stat-badge">
        <span class="stat-icon">📖</span>
        <span class="stat-text">200+ 词汇</span>
      </div>
      <div class="stat-badge">
        <span class="stat-icon">📝</span>
        <span class="stat-text">100+ 名词/动词</span>
      </div>
      <div class="stat-badge">
        <span class="stat-icon">🎯</span>
        <span class="stat-text">400+ 练习题</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import learningData from '../data/learning_data.json'

const router = useRouter()

const categories = ref([])
const difficultyLevels = ref([])
const showDifficultyModal = ref(false)
const selectedCategory = ref(null)
const selectedMode = ref('normal')

onMounted(() => {
  categories.value = learningData.categories
  difficultyLevels.value = learningData.difficultyLevels
})

// 音标类型不支持挑战模式
const isChallengeDisabled = computed(() => {
  return selectedCategory.value?.id === 'phonics'
})

const selectCategory = (category) => {
  selectedCategory.value = category
  selectedMode.value = 'normal'
  showDifficultyModal.value = true
}

const closeDifficultyModal = () => {
  showDifficultyModal.value = false
  selectedCategory.value = null
}

const startQuiz = (level) => {
  const categoryId = selectedCategory.value.id
  const mode = selectedMode.value
  closeDifficultyModal()
  
  const query = { 
    difficulty: level.id, 
    count: level.questionCount 
  }
  
  if (mode === 'challenge') {
    query.mode = 'challenge'
  }
  
  router.push({
    name: 'quiz',
    params: { category: categoryId },
    query
  })
}
</script>

<style scoped>
.topic-view {
  min-height: 100vh;
  padding: 20px;
  padding-bottom: 100px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}

.topic-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px 0;
}

.topic-header h1 {
  font-size: 1.8rem;
  color: #fff;
  margin-bottom: 8px;
}

.subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
}

/* 知识专项网格 */
.topics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  max-width: 600px;
  margin: 0 auto;
}

.topic-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px 15px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.topic-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--card-color);
}

.topic-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.12);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.topic-card:active {
  transform: scale(0.98);
}

.topic-icon {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.topic-name {
  font-size: 1rem;
  color: #fff;
  margin-bottom: 5px;
  font-weight: 600;
}

.topic-desc {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.4;
}

/* 综合练习 */
.comprehensive-section {
  max-width: 600px;
  margin: 25px auto 0;
}

.comprehensive-card {
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.2) 0%, rgba(254, 202, 87, 0.2) 100%);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.comprehensive-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(255, 107, 107, 0.2);
}

.comp-icon {
  font-size: 2.5rem;
  margin-right: 15px;
}

.comp-info {
  flex: 1;
}

.comp-info h3 {
  color: #fff;
  font-size: 1.1rem;
  margin-bottom: 5px;
}

.comp-info p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
}

.arrow {
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.5rem;
  font-weight: 300;
}

/* 底部统计 */
.stats-footer {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 30px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.stat-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 14px;
  border-radius: 20px;
}

.stat-icon {
  font-size: 1rem;
}

.stat-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.8rem;
}

/* 难度选择弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
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

.difficulty-modal {
  background: linear-gradient(135deg, #1e3a5f 0%, #16213e 100%);
  border-radius: 20px;
  padding: 25px;
  width: 100%;
  max-width: 400px;
  animation: slideUp 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

.difficulty-modal h2 {
  text-align: center;
  color: #fff;
  margin-bottom: 5px;
  font-size: 1.3rem;
}

.modal-category {
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 15px;
  font-size: 0.9rem;
}

/* 模式切换 */
.mode-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.mode-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid transparent;
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-tab:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.12);
}

.mode-tab.active {
  background: rgba(76, 175, 80, 0.2);
  border-color: #4CAF50;
  color: #fff;
}

.mode-tab.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.mode-icon {
  font-size: 1.5rem;
}

.mode-hint {
  text-align: center;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 15px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.mode-hint.challenge {
  color: #FF9800;
  background: rgba(255, 152, 0, 0.15);
}

.difficulty-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.difficulty-item {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 15px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 4px solid transparent;
}

.difficulty-item:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateX(5px);
}

.difficulty-icon {
  font-size: 2rem;
  margin-right: 12px;
}

.difficulty-info {
  flex: 1;
}

.difficulty-info h3 {
  color: #fff;
  font-size: 1rem;
  margin-bottom: 3px;
}

.difficulty-info p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
}

.close-btn {
  width: 100%;
  padding: 12px;
  margin-top: 15px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* 响应式 */
@media (max-width: 400px) {
  .topics-grid {
    gap: 10px;
  }
  
  .topic-card {
    padding: 15px 10px;
  }
  
  .topic-icon {
    font-size: 2rem;
  }
  
  .topic-name {
    font-size: 0.9rem;
  }
  
  .stats-footer {
    gap: 8px;
  }
  
  .stat-badge {
    padding: 6px 10px;
  }
  
  .stat-text {
    font-size: 0.7rem;
  }
}
</style>
