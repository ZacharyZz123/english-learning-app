<template>
  <div class="stats-view">
    <header class="stats-header">
      <h1>📊 学习统计</h1>
      <p class="subtitle">查看你的学习进度</p>
    </header>

    <!-- 总体统计 -->
    <div class="overall-stats">
      <div class="stat-card main">
        <div class="stat-circle" :style="{ '--accuracy': stats.accuracy }">
          <span class="stat-value">{{ stats.accuracy }}%</span>
          <span class="stat-label">正确率</span>
        </div>
      </div>
      
      <div class="stat-row">
        <div class="stat-card">
          <span class="stat-icon">📝</span>
          <span class="stat-value">{{ stats.totalQuestions }}</span>
          <span class="stat-label">总答题</span>
        </div>
        <div class="stat-card correct">
          <span class="stat-icon">✓</span>
          <span class="stat-value">{{ stats.totalCorrect }}</span>
          <span class="stat-label">正确</span>
        </div>
        <div class="stat-card wrong">
          <span class="stat-icon">✗</span>
          <span class="stat-value">{{ stats.totalWrong }}</span>
          <span class="stat-label">错误</span>
        </div>
      </div>
    </div>

    <!-- 分类统计 -->
    <div class="category-stats" v-if="Object.keys(categoryStats).length > 0">
      <h2 class="section-title">📚 分类进度</h2>
      
      <div class="category-list">
        <div 
          v-for="(data, categoryId) in categoryStats" 
          :key="categoryId"
          class="category-card"
        >
          <div class="category-info">
            <span class="category-name">{{ getCategoryName(categoryId) }}</span>
            <span class="category-count">{{ data.total }}题</span>
          </div>
          <div class="category-progress">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: getCategoryAccuracy(data) + '%' }"
              ></div>
            </div>
            <span class="accuracy-text">{{ getCategoryAccuracy(data) }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 最近练习记录 -->
    <div class="recent-records" v-if="recentRecords.length > 0">
      <h2 class="section-title">🕐 最近练习</h2>
      
      <div class="records-list">
        <div 
          v-for="record in recentRecords.slice(0, 10)" 
          :key="record.id"
          class="record-card"
        >
          <div class="record-left">
            <span class="record-category">{{ getCategoryName(record.category) }}</span>
            <span class="record-time">{{ formatTime(record.timestamp) }}</span>
          </div>
          <div class="record-right">
            <span class="record-score" :class="{ good: getRecordAccuracy(record) >= 80 }">
              {{ record.correct }}/{{ record.total }}
            </span>
            <span class="record-accuracy">{{ getRecordAccuracy(record) }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 重置按钮 -->
    <div class="reset-section">
      <button class="reset-btn" @click="resetAllStats">
        🗑️ 重置所有统计数据
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useQuizStore } from '../stores/quiz'
import learningData from '../data/learning_data.json'

const quizStore = useQuizStore()

const stats = computed(() => quizStore.getStats)
const categoryStats = computed(() => quizStore.getCategoryStats)
const recentRecords = computed(() => quizStore.getQuizRecords)

const getCategoryName = (categoryId) => {
  if (categoryId === 'comprehensive') return '综合练习'
  if (categoryId === 'wrongbook') return '错题重做'
  const category = learningData.categories.find(c => c.id === categoryId)
  return category ? category.name : categoryId
}

const getCategoryAccuracy = (data) => {
  const total = data.correct + data.wrong
  if (total === 0) return 0
  return Math.round((data.correct / total) * 100)
}

const getRecordAccuracy = (record) => {
  if (record.total === 0) return 0
  return Math.round((record.correct / record.total) * 100)
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
  
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

const resetAllStats = () => {
  if (confirm('确定要重置所有统计数据吗？此操作不可撤销。')) {
    quizStore.resetStats()
  }
}
</script>

<style scoped>
.stats-view {
  min-height: 100vh;
  padding: 20px;
  padding-bottom: 100px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}

.stats-header {
  text-align: center;
  margin-bottom: 25px;
  padding: 15px 0;
}

.stats-header h1 {
  color: #fff;
  font-size: 1.6rem;
  margin-bottom: 5px;
}

.subtitle {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

/* 总体统计 */
.overall-stats {
  max-width: 500px;
  margin: 0 auto 30px;
}

.stat-card.main {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  margin-bottom: 15px;
}

.stat-circle {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: conic-gradient(
    #4CAF50 calc(var(--accuracy) * 1%), 
    rgba(255, 255, 255, 0.15) 0
  );
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  position: relative;
}

.stat-circle::before {
  content: '';
  position: absolute;
  width: 110px;
  height: 110px;
  background: #1e3a5f;
  border-radius: 50%;
}

.stat-circle .stat-value {
  position: relative;
  font-size: 2.2rem;
  font-weight: 700;
  color: #4CAF50;
}

.stat-circle .stat-label {
  position: relative;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
}

.stat-row {
  display: flex;
  gap: 10px;
}

.stat-card {
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 15px;
  text-align: center;
}

.stat-icon {
  display: block;
  font-size: 1.5rem;
  margin-bottom: 5px;
}

.stat-card .stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
}

.stat-card.correct .stat-value {
  color: #4CAF50;
}

.stat-card.wrong .stat-value {
  color: #FF5252;
}

.stat-card .stat-label {
  display: block;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  margin-top: 3px;
}

/* 分类统计 */
.section-title {
  color: #fff;
  font-size: 1.1rem;
  margin-bottom: 15px;
  padding-left: 5px;
}

.category-stats {
  max-width: 500px;
  margin: 0 auto 30px;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.category-card {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 15px;
}

.category-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.category-name {
  color: #fff;
  font-weight: 500;
}

.category-count {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
}

.category-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-bar {
  flex: 1;
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

.accuracy-text {
  color: #4CAF50;
  font-size: 0.85rem;
  font-weight: 600;
  min-width: 45px;
  text-align: right;
}

/* 最近记录 */
.recent-records {
  max-width: 500px;
  margin: 0 auto 30px;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.record-card {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 12px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.record-left {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.record-category {
  color: #fff;
  font-size: 0.9rem;
}

.record-time {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.75rem;
}

.record-right {
  text-align: right;
}

.record-score {
  display: block;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.95rem;
  font-weight: 600;
}

.record-score.good {
  color: #4CAF50;
}

.record-accuracy {
  display: block;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.75rem;
}

/* 重置按钮 */
.reset-section {
  max-width: 500px;
  margin: 30px auto;
  text-align: center;
}

.reset-btn {
  padding: 12px 30px;
  background: rgba(255, 82, 82, 0.2);
  border: 1px solid rgba(255, 82, 82, 0.5);
  border-radius: 10px;
  color: #FF5252;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reset-btn:hover {
  background: rgba(255, 82, 82, 0.3);
}
</style>
