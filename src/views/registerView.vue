<script setup>
import formComponent from '@/components/forms/formComponent.vue';
import errorComponent from '@/components/alerts/errorComponent.vue';
import buttonThemeComponet from '@/components/dashboard/buttonThemeComponet.vue';
import { hasEmptyFields, isSamePassword } from '@/lib/validations.js';
import { useAuth } from '@/lib/auth.js';
import { ref } from 'vue'; // Importo ref para crear variables reactivas
import { useRouter } from 'vue-router' //Importo router para redireccionar

const router = useRouter()
const showError = ref(false);
const errorMessage = ref('');

const inputs = [
    {
        id: 'mail',
        placeholder: 'Correo electrónico ',
        type: 'email',
    },
    {
        id: 'username',
        placeholder: 'Nombre de usuario',
        type: 'text',
    },
    {
        id: 'password',
        placeholder: 'Contraseña',
        type: 'password',
    },
    {
        id: 'password_confirmation',
        placeholder: 'Confirmar contraseña',
        type: 'password',
    }
]

const button = {
    text: 'Registrarse en IoT',
    class:
        'w-full bg-blue-500 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center focus:ring-blue-800 text-white',
    type: 'submit',
}


const register = async (datos) => {
    try {
        if (hasEmptyFields(datos))
            throw new Error('Todos los campos son obligatorios');

        if (!isSamePassword(datos.password, datos.password_confirmation))
            throw new Error('Las contraseñas no coinciden');

        await useAuth.register(datos);
        router.replace({ name: 'login' });
    } catch (error) {
        showError.value = true;
        errorMessage.value = error.message;
    }
};
</script>

<template>
    <!-- Botón para cambiar el tema -->
    <buttonThemeComponet class="fixed top-4 right-4 p-2 bg-gray-200 rounded-full" />
    <div v-if="showError" class="flex flex-col items-center justify-center">
        <errorComponent :error="errorMessage" />
    </div>
    <formComponent text="Registrarse en IoT" :inputs="inputs" :button="button" link="/login"
        toLink="¿Ya tienes cuenta? ¡Inicia sesión ahora!" @action="register" />
</template>



<style lang="scss" scoped></style>