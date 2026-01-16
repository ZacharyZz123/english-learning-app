import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/topics',
      name: 'topics',
      component: () => import('../views/TopicView.vue')
    },
    {
      path: '/quiz/:category',
      name: 'quiz',
      component: () => import('../views/QuizView.vue'),
      props: true
    },
    {
      path: '/wrongbook',
      name: 'wrongbook',
      component: () => import('../views/WrongBookView.vue')
    },
    {
      path: '/stats',
      name: 'stats',
      component: () => import('../views/StatsView.vue')
    }
  ]
})

export default router
