<script setup>
import { ref, watch, onMounted } from 'vue';

const isDarkMode = ref(localStorage.getItem('dark') === 'true');

const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value;
}

watch(isDarkMode, (newValue) => {
    localStorage.setItem('dark', newValue);
    document.documentElement.classList.toggle('dark', newValue);
});

onMounted(() => {
    document.documentElement.classList.toggle('dark', isDarkMode.value);
});
</script>

<template>
    <!-- Botón para cambiar el tema -->
    <button class="fixed top-4 right-4 p-2 rounded-full" @click="toggleTheme">
        <svg v-if="isDarkMode" class="w-6 h-6 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
            <!-- Ícono de luna para el modo oscuro -->
            <path
                d="M10.392 2.392a1 1 0 0 1 1.414 0l8 8a1 1 0 0 1 0 1.415l-8 8a1 1 0 0 1-1.414 0l-8-8a1 1 0 0 1 0-1.414l8-8z"
                clip-rule="evenodd" fill-rule="evenodd"></path>
        </svg>
        <svg v-else class="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
            <!-- Ícono de sol para el modo claro -->
            <path d="M21.735 9.96A10 10 0 1 1 9.95 2.265a10 10 0 0 1 11.785 7.695zM12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z"
                clip-rule="evenodd" fill-rule="evenodd"></path>
        </svg>
    </button>
</template>

