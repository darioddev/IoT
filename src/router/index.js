import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/stores/auth.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      meta: {
        title: 'Home'
      },
      component: () => import('@/views/homeView.vue')
    },
    {
      path: '/login',
      name: 'login',
      meta: {
        title: 'Inicio de sesion'
      },
      component: () => import('@/views/loginView.vue')
    },
    {
      path: '/registro',
      name: 'registro',
      meta: {
        title: 'Registro'
      },
      component: () => import('@/views/registerView.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'notFound',
      meta: {
        title: 'Pagina no encontrada'
      },
      component: () => import('@/views/notFoundView.vue')
    }
  ]
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Vue'
  // Compruebo mediante el store si el usuario esta logueado
  const auth = useAuth()
  if (auth.isLogged && (to.name === 'login' || to.name === 'registro')) next({ name: 'home' })
  else next()
})

export default router
