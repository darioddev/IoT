
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')


// Tema en base a lo que el usuario tenga en el localStorage
const userTheme = localStorage.getItem('dark') || localStorage.setItem('dark', true)
document.querySelector('html').classList.add(userTheme ? 'dark' : '')