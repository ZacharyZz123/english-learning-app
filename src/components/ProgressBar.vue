<script setup>
import { computed } from 'vue'

const props = defineProps({
  current: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  showLabel: {
    type: Boolean,
    default: true
  }
})

const percentage = computed(() => {
  if (props.total === 0) return 0
  return Math.round((props.current / props.total) * 100)
})
</script>

<template>
  <div class="progress-container">
    <div v-if="showLabel" class="progress-label">
      <span class="progress-text">{{ current }} / {{ total }}</span>
      <span class="progress-percent">{{ percentage }}%</span>
    </div>
    <div class="progress-bar">
      <div 
        class="progress-bar-fill"
        :style="{ width: `${percentage}%` }"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.progress-container {
  width: 100%;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.progress-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.progress-percent {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--primary);
}
</style>
