import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/lib/auth.js'

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
        title: 'Inicio de sesion', // Titulo de la pagina
        requireAuth: true // Indicamos que esta ruta requiere autenticacion
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

router.beforeEach(async (to, from, next) => {
  document.title = to.meta.title || 'IoT' // Cambiamos el titulo de la pagina por el que hayamos definido en la ruta de lo contrario ponemos el titulo por defecto
  const isLogged = await useAuth.getAuth() // Obtenemos el estado de autenticacion

})

export default router
