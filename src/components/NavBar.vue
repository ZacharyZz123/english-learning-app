<script setup>
import { RouterLink, useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

const navItems = [
  { path: '/', icon: '🏠', label: '首页' },
  { path: '/topics', icon: '📚', label: '练习' },
  { path: '/wrongbook', icon: '📝', label: '错题本' },
  { path: '/stats', icon: '📊', label: '统计' }
]

const isActive = (path) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <nav class="navbar">
    <RouterLink
      v-for="item in navItems"
      :key="item.path"
      :to="item.path"
      class="nav-item"
      :class="{ active: isActive(item.path) }"
    >
      <span class="nav-icon">{{ item.icon }}</span>
      <span class="nav-label">{{ item.label }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.navbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 0.5rem 1rem;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
  z-index: 100;
  border-top-left-radius: 1.5rem;
  border-top-right-radius: 1.5rem;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: var(--text-secondary);
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
}

.nav-item:hover {
  color: var(--primary);
  background: var(--primary-bg);
}

.nav-item.active {
  color: var(--primary);
  background: var(--primary-bg);
}

.nav-item.active .nav-icon {
  transform: scale(1.2);
}

.nav-icon {
  font-size: 1.5rem;
  transition: transform var(--transition-fast);
}

.nav-label {
  font-size: 0.75rem;
  font-weight: 600;
}
</style>
