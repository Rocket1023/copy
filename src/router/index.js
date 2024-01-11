import Vue from 'vue'
import VueRouter from 'vue-router'
// import HomeView from '@/views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/home',
    name: 'home',
    component: () => import('@/views/home/Home.vue')
  },
  {
    path: '/',
    name: 'jjs',
    component: () => import('@/views/jjs/index.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
