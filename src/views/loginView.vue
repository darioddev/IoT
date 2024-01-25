<script setup>
import formComponent from '@/components/forms/formComponent.vue'
import errorComponent from '@/components/alerts/errorComponent.vue'
import buttonThemeComponet from '@/components/dashboard/buttonThemeComponet.vue';
import { useAuth } from '@/lib/auth.js'
import { hasEmptyFields } from '@/lib/validations.js'
import { ref } from 'vue';
import { useRouter } from 'vue-router'

const router = useRouter()

const showError = ref(false)
const errorMessage = ref('')
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
    await useAuth.login(datos); // Llamo al método login del servicio de autenticación
    router.replace({ name: 'dashboard' }); // Redirecciono al home
  } catch (error) {
    console.log(error)
    errorMessage.value = error.message;  // Si hay errores, muestro el mensaje de error
    showError.value = true; // Muestro el componente de error
  }
}


</script>

<template>
  <main cl>
    <buttonThemeComponet class="fixed top-4 right-4 p-2 bg-gray-200 rounded-full" />
    <div v-if="showError" class="flex flex-col items-center justify-center">
      <errorComponent :error="errorMessage" />
    </div>
    <formComponent text="Iniciar sesión" :inputs="inputs" :button="button" link="/registro"
      toLink="¿No tienes cuenta? ¡Regístrate ahora!" @action="login" />

    <!-- Contenedor con estilos tailwind con registro de google y github -->
    <div class="flex flex-col items-center justify-center mt-2">
      <div class="flex items-center justify-center space-x-4 ">
        <button
          class="flex items-center px-6 py-2 text-white transition duration-500 ease-out bg-blue-700 rounded-lg hover:bg-blue-800 hover:ease-in hover:underline"
          type="button">
          <!-- Icono de google-->
          <svg class="w-6 h-6 text-black mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2c3.309 0 6.233 1.343 8.376 3.494l-3.18 3.18C16.234 6.28 14.234 5.333 12 5.333c-2.72 0-5.053 1.76-5.886 4.213l-3.2-3.2C5.77 3.56 8.77 2 12 2z">
            </path>
            <path
              d="M21.333 12c0-.72-.062-1.413-.177-2.08H12v3.76h5.573a4.68 4.68 0 0 1-2.027 3.067v2.547h3.28A10.67 10.67 0 0 0 21.333 12z">
            </path>
            <path
              d="M6.114 8.427l-3.2 3.2A6.682 6.682 0 0 0 2 12c0 1.093.26 2.127.714 3.04l3.2-3.2A4.68 4.68 0 0 0 6.114 8.427z">
            </path>
            <path
              d="M12 21.333c2.453 0 4.56-.813 6.114-2.187l-3.28-2.547c-.907.6-2.08.96-2.834 1.6-.754.504-1.68.8-2.667.8-2.027 0-3.76-1.28-4.427-3.04l-3.2 3.2C5.467 19.84 8.28 21.333 12 21.333z">
            </path>
          </svg>
          Iniciar sesión con Google
        </button>
      </div>
    </div>


  </main>
</template>

<style scoped></style>
