<script setup>
    //Se crea una vista 404 no encontrado muy estilada con tailwind
</script>

<template>
    <div class="flex justify-center items-center h-screen">
        <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <div class="mb-4">
                <h1 class="text-gray-700 font-bold text-2xl mb-2">404 Not Found</h1>
                <p class="text-gray-700 text-base">La página que buscas no existe.</p>
            </div>
            <div class="flex items-center justify-between">
                <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                    <RouterLink to="/">Volver al inicio</RouterLink>
                </button>
            </div>
        </div>
    </div>
</template>