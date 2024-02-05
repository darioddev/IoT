import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/lib/auth.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // Mode hash para que funcione en gh-pages
  mode: 'hash', // 'history' o 'hash
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
      path: '/dashboard',
      name: 'dashboard',
      meta: {
        title: 'Dashboard',
        requireAuth: true // Requiere autenticación
      },
      component: () => import('@/views/dashboardView.vue')
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

router.beforeEach(async (to, from, next) => {
  document.title = to.meta.title || 'IoT'
  const isLogged = await useAuth.isAuthenticated() // Obtenemos si el usuario está autenticado
  const requireAuth = to.matched.some((record) => record.meta.requireAuth) // Obtenemos si la ruta requiere autenticación
  if (requireAuth && !isLogged)
    next({
      name: 'home'
    }) // Si la ruta requiere autenticación y el usuario no está autenticado lo redirigimos al home
  else if (!requireAuth && isLogged)
    next({
      name: 'dashboard'
    }) // Si la ruta no requiere autenticación y el usuario está autenticado lo redirigimos al home
  else next() // Si no , lo dejamos pasar
})

export default router
