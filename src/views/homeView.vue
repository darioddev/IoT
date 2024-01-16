<script setup>

import { useAuth } from '@/stores/auth';
import { useRouter } from 'vue-router'

const auth = useAuth();
const router = useRouter()

const logout = async () => {
    try {
        await auth.logout();
        router.replace({ name: 'login' });
    } catch (error) {
        console.log(error)
    }
}


</script>

<template>
    <!-- Navegación Component -->
    <nav
        class="fixed inset-x-0 top-0 z-10 w-full px-4 py-1 bg-white shadow-md border-slate-500 transition duration-700 ease-out"> 
        <div class="flex justify-between p-4">
            <div class="text-[2rem] leading-[3rem] tracking-tight font-bold text-black dark:text-white">
                Bienvenido {{ auth.username }} a IoT
            </div>
            <div class="flex items-center space-x-4 text-lg font-semibold tracking-tight">
                <div>
                    <button
                        class="flex items-center px-6 py-2 text-white transition duration-500 ease-out bg-blue-700 rounded-lg hover:bg-blue-800 hover:ease-in hover:underline"
                        type="button">
                        <!-- Icono de plus-->
                        <svg class="w-6 h-6 text-black dark:text-white mr-2" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="{2}"
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                        Añadir un nuevo espacio
                    </button>
                </div>

                <button
                    class="flex items-center px-6 py-2 mx-2 text-black transition duration-700 ease-out bg-white border border-black rounded-lg hover:bg-black hover:border hover:text-white dark:border-white dark:bg-inherit dark:text-white dark:hover:bg-white dark:hover:text-black"
                    type="button" @click="logout">
                    <!-- Icono de cerrar sesión-->
                    <svg class="w-6 h-6 text-black dark:text-white mr-2" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="{2}"
                            d="M10 19l-7-7m0 0l7-7m-7 7h18">
                        </path>
                    </svg>
                    Cerrar sesión
                </button>

            </div>
        </div>

    </nav>

    <!-- Contenido principal -->
    <main class="flex flex-col items-center justify-center w-full h-screen bg-gray-100 dark:bg-[#0c1015]">

        <div class="flex flex-col items
        -center justify-center w-full h-full">
        </div>

        <!-- Parrafo donde dice ningun espacio -->
        <div class="flex flex-col items-center justify-center w-full h-full">
            <p class="text-2xl font-bold text-gray-500 dark:text-white">No tienes ningún espacio</p>
            <!-- Boton que hace para crear un nuevo espacio -->
            <button
                class="flex items-center px-6 py-2 mt-4 text-white transition duration-500 ease-out bg-blue-700 rounded-lg hover:bg-blue-800 hover:ease-in hover:underline"
                type="button">
                <!-- Icono de plus-->
                <svg class="w-6 h-6 text-black dark:text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="{2}" d="M12 6v6m0 0v6m0-6h6m-6 0H6">
                    </path>
                </svg>
                Añadir un nuevo espacio
            </button>
        </div>
    </main>
</template>

<style scoped></style>
