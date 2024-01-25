<script setup>
import buttonThemeComponet from '@/components/dashboard/buttonThemeComponet.vue';

import { ref, onMounted } from 'vue';

const typedText = ref(null);


onMounted(() => {
    setInterval(animateText, 100); 
});

function animateText() {
    if (typedText.value) {
        const targetText = 'IoT - Devices';
        const currentText = typedText.value.textContent || '';
        const nextChar = targetText[currentText.length];

        if (nextChar !== undefined) {
            typedText.value.textContent = currentText + nextChar;
        } else {
            clearInterval(animateText);
        }
    }
}


</script>


<template>
    <div class="bg-white min-h-screen flex items-center justify-center" id="main">
        <div class="absolute top-0 right-0 p-4">
            <buttonThemeComponet />
        </div>
        <div class="flex flex-col items-center justify-center text-center text-black">
            <h1 class="text-6xl font-bold mb-4">
                Bienvenido a <span class="text-blue-700" ref="typedText"></span>
            </h1>
            <!-- Contenedor con un button -->
            <div class="flex flex-row items-center justify-center">
                <button class="bg-blue-700 text-white font-bold py-2 px-4 rounded-full m-4">
                    <!--RouterLink -->
                    <router-link to="/login">Iniciar sesión</router-link>
                </button>
                <button class="bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
                    <router-link to="/registro">Registrarse</router-link>
                </button>
            </div>
        </div>
    </div>
</template>


<style scoped>
.dark #main {
    @apply bg-[#0c1015]
}
.dark h1 {
    @apply text-white
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes fadeOut {
    from {
        opacity: 1;
    }

    to {
        opacity: 0;
    }
}

.animate__fadeOut {
    animation: fadeOut 1s ease-in-out;
}

.animate__fadeIn {
    animation: fadeIn 1s ease-in-out;
}
</style>
