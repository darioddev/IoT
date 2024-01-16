<script setup>
import formComponent from '@/components/forms/formComponent.vue'
import errorComponent from '@/components/alerts/errorComponent.vue'
import buttonThemeComponet from '@/components/buttonThemeComponet.vue';
import { useAuth } from '@/stores/auth';
import { hasEmptyFields } from '@/lib/validations.js'
import { ref } from 'vue';
import { useRouter } from 'vue-router'

const router = useRouter()

const showError = ref(false)
const errorMessage = ref('')
const isDarkMode = ref(document.querySelector('html').classList.contains('dark'));

const inputs = [
  {
    id: 'mail',
    placeholder: 'dario.alexander@gmail.com',
    type: 'email',
  },
  {
    id: 'password',
    placeholder: '*********',
    type: 'password',
  },
]

const button = {
  text: 'Iniciar sesión',
  class: 'w-full bg-blue-500 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center focus:ring-blue-800 text-white',
  type: 'submit',
}

const login = async (datos) => {
  try {
    if (hasEmptyFields(datos)) throw new Error('Todos los campos son obligatorios'); // Si hay campos vacíos, lanzo un error
    const auth = useAuth(); // Obtengo el store de autenticación 
    await auth.login(datos.mail, datos.password); // Llamo al método login del store de autenticación , si ahi errores se lanza desde el store que es donde se maneja la autenticación
    router.replace({ name: 'home' });
  } catch (error) {
    errorMessage.value = error.message;
    showError.value = true;
  }
}

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value;
  document.querySelector('html').classList.toggle('dark');
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light');
}


</script>

<template>
  <main>
    <buttonThemeComponet class="fixed top-4 right-4 p-2 bg-gray-200 rounded-full" @toggleTheme="toggleTheme"
      :isDarkMode="isDarkMode" />
    <div v-if="showError" class="flex flex-col items-center justify-center">
      <errorComponent :error="errorMessage" />
    </div>
    <formComponent text="Iniciar sesión" :inputs="inputs" :button="button" link="/registro"
      toLink="¿No tienes cuenta? ¡Regístrate ahora!" @action="login" />
  </main>
</template>

<style></style>
