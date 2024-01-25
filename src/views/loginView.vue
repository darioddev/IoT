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


  </main>
</template>

<style scoped></style>
