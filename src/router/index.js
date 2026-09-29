import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useGameStore } from '../stores/game'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'main',
      component: HomeView
    },
    {
      path: '/game',
      name: 'Game',
      component: () => import('../views/Game.vue'),
      // Without player setup there is nothing to play - send back to the menu
      beforeEnter: () => (useGameStore().hasSettings ? true : { name: 'main' })
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: 'main' }
    }
  ]
})

export default router
