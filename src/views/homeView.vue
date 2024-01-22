<script setup>
import buttonThemeComponet from '@/components/dashboard/buttonThemeComponet.vue';

import { useAuth } from '@/stores/auth';
import { useRouter } from 'vue-router'
import { ref } from 'vue';
import { espacios } from '@/lib/spaces.js';
import { openModal, closeModal } from '@/lib/modal.js';
import { auth } from '@/lib/firebase.js';


const auther = useAuth();
const router = useRouter()
const isDarkMode = ref(document.querySelector('html').classList.contains('dark'));

const newSpaceName = ref(''); // Variable reactiva para el nombre del nuevo espacio 
const newSpaceSensors = ref([]); // Variable reactiva para los sensores del nuevo espacio
const newSpaceExecutors = ref([]); // Variable reactiva para los ejecutores del nuevo espacio

const newSpaceNameError = ref(false); // Variable reactiva para el error del nombre del nuevo espacio
const spaces = ref([]); // Variable reactiva para los espacios del usuario

// Array unidades de medida
const units = [
    { name: 'Temperatura', unit: '°C' },
    { name: 'Humedad', unit: '%' },
    { name: 'Luz', unit: 'LUX' },
    { name: 'Movimiento', unit: 'Movimiento' },
    { name: 'Sonido', unit: 'Sonido' },
    { name: 'Distancia', unit: 'cm' },
    { name: 'Presión', unit: 'Pa' },
    { name: 'Corriente', unit: 'A' },
    { name: 'Voltaje', unit: 'V' },
    { name: 'Potencia', unit: 'W' },
    { name: 'Energía', unit: 'J' },
    { name: 'Fuerza', unit: 'N' },
    { name: 'Velocidad', unit: 'm/s' },
    { name: 'Aceleración', unit: 'm/s²' },
    { name: 'Masa', unit: 'kg' },
    { name: 'Ángulo', unit: '°' },
    { name: 'Tiempo', unit: 's' },
    { name: 'Frecuencia', unit: 'Hz' },
    { name: 'Densidad', unit: 'kg/m³' },
    { name: 'Conductividad', unit: 'S/m' },
    { name: 'Conductancia', unit: 'S' },
    { name: 'Resistencia', unit: 'Ω' },
    { name: 'Capacitancia', unit: 'F' },
    { name: 'Inductancia', unit: 'H' },
    { name: 'Flujo magnético', unit: 'Wb' },
    { name: 'Flujo magnético', unit: 'T' },
];

// EJECUTORES
// Array de ejecutores
const executors = [
    { name: 'LED', icon: 'lightbulb' },
    { name: 'Buzzer', icon: 'volume-up' },
    { name: 'Motor', icon: 'fan' },
    { name: 'Servo', icon: 'cog' },
    { name: 'Relay', icon: 'bolt' },
    { name: 'Pantalla', icon: 'desktop-computer' },
    { name: 'Cámara', icon: 'camera' },
    { name: 'Micrófono', icon: 'microphone' },
    { name: 'Altavoz', icon: 'speakerphone' },
    { name: 'Luz', icon: 'lightning-bolt' },
    { name: 'Ventilador', icon: 'wind' },
    { name: 'Puerta', icon: 'door-open' },
    { name: 'Persiana', icon: 'window-shutter' },
    { name: 'Cortina', icon: 'window-shutter' },
    { name: 'Cerradura', icon: 'lock-closed' },
    { name: 'Calefacción', icon: 'fire' },
    { name: 'Aire acondicionado', icon: 'snowflake' },
    { name: 'Cafetera', icon: 'coffee' },
    { name: 'Horno', icon: 'fire' },
    { name: 'Nevera', icon: 'fridge' },
    { name: 'Lavadora', icon: 'washing-machine' },
    { name: 'Secadora', icon: 'washing-machine' },
    { name: 'Lavavajillas', icon: 'dishwasher' },
    { name: 'Aspiradora', icon: 'vacuum' },
    { name: 'Robot aspirador', icon: 'vacuum' },
    { name: 'Cortacésped', icon: 'grass' },
    { name: 'Riego', icon: 'water' },
    { name: 'Bomba de agua', icon: 'water' },
    { name: 'Bomba de aire', icon: 'air' },
    { name: 'Bomba de gas', icon: 'air' },
    { name: 'Bomba de aceite', icon: 'air' },
    { name: 'Otro', icon: 'dots-horizontal' }
]

const logout = async () => {
    try {
        if (confirm('¿Estás seguro de cerrar sesión?')) {
            await auther.logout();
            router.replace({ name: 'login' });
        }
    } catch (error) {
        console.log(error)
    }
};

//Crea un nuevo espacio
const createSpace = async () => {
    try {
        if (newSpaceName.value === '') throw new Error('El nombre del espacio no puede estar vacío');
        spaces.value.push({ name: newSpaceName.value, sensores: {}, ejecutores: {} });
        await espacios.updateDocument(auther.id, { space: spaces.value })
        closeModal();
    } catch (error) {
        newSpaceNameError.value = true;
    }
};

const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value;
    document.querySelector('html').classList.toggle('dark');
};

const getSpaces = async () => {
    try {
        const { space } = await espacios.getDocument(auther.id);
        space.map(el => spaces.value.push(el))

    } catch (error) {
        console.log(error)
    }
};


getSpaces();


</script>

<template>
    <!-- Navegación Component -->
    <nav
        class="fixed inset-x-0 top-0 z-10 w-full px-4 py-1 bg-white shadow-md border-slate-500 transition duration-700 ease-out">
        <div class="flex justify-between p-4">
            <div class="text-[2rem] leading-[3rem] tracking-tight font-bold text-black ">
                Bienvenido a <span class="text-blue-700">IoT</span>
            </div>
            <div class="flex items-center space-x-4 text-lg font-semibold tracking-tight">
                <!-- Espacios -->
                <div>
                    <button
                        class="flex items-center px-6 py-2 text-white transition duration-500 ease-out bg-blue-700 rounded-lg hover:bg-blue-800 hover:ease-in hover:underline"
                        type="button" @click="openModal">
                        <!-- Icono de plus-->
                        <svg class="w-6 h-6 text-black mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="{2}"
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                        Añadir un nuevo espacio
                    </button>
                </div>

                <button
                    class="flex items-center px-6 py-2 mx-2 text-black transition duration-700 ease-out bg-white border border-black rounded-lg hover:bg-black hover:border hover:text-white"
                    type="button" @click="logout">
                    <!-- Icono de cerrar sesión-->
                    <svg class="w-6 h-6 text-black mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg">
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
    <main class="flex flex-col items-center justify-center w-full h-screen bg-gray-100 ">
        <buttonThemeComponet class="fixed top-4 right-4 p-2 bg-gray-200 rounded-full mt-20" @toggleTheme="toggleTheme"
            :isDarkMode="isDarkMode" />
        <!-- Parrafo donde dice ningun espacio -->
        <div v-if="spaces.length === 0">
            <div class="flex flex-col items-center justify-center w-full h-full">
                <p class="text-2xl font-bold text-gray-500 ">No tienes ningún espacio</p>
                <!-- Boton que hace para crear un nuevo espacio -->
                <button
                    class="flex items-center px-6 py-2 mt-4 text-white transition duration-500 ease-out bg-blue-700 rounded-lg hover:bg-blue-800 hover:ease-in hover:underline"
                    type="button" @click="openModal">
                    <!-- Icono de plus-->
                    <svg class="w-6 h-6 text-black mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="{2}"
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6">
                        </path>
                    </svg>
                    Añadir un nuevo espacio
                </button>
            </div>
        </div>
        <!-- Espacios -->
        <div v-else class="flex flex-col items-start justify-start h-screen m-20 w-screen">
            <div>
                <div class="p-4">
                    <!-- Texto "TUS ESPACIOS" en la parte superior izquierda con padding -->
                    <p class="text-3xl font-bold text-gray-500 mx-4">Tus espacios</p>
                </div>
                <div class="flex flex-wrap justify-center">
                    <div v-for="space in spaces" :key="space.id">
                        <div
                            class="flex flex-col items-start justify-start w-screen h-20 bg-white rounded-lg shadow-md m-4">
                            <p class="text-2xl font-bold text-gray-500 p-6">{{ space.name }}</p>
                            <p class="text-2xl font-bold text-gray-500">{{ space.sensores }}</p>

                        </div>
                    </div>
                </div>
            </div>
        </div>


        <!-- Main modal -->
        <div id="crud-modal" tabindex="-1" aria-hidden="true"
            class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
            <div class="relative p-4 w-full max-w-md max-h-full">
                <!-- Modal content -->
                <div class="relative bg-white rounded-lg shadow " id="modal">
                    <!-- Modal header -->
                    <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t ">
                        <h3 class="text-lg font-semibold text-gray-900 ">
                            Crear un nuevo espacio
                        </h3>
                        <button type="button"
                            class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center "
                            data-modal-toggle="crud-modal" @click="closeModal">
                            <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                                viewBox="0 0 14 14">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                            </svg>
                            <span class="sr-only">Close modal</span>
                        </button>
                    </div>
                    <!-- Modal body -->
                    <form class="p-4 md:p-5" @submit.prevent="createSpace">
                        <div class="grid gap-4 mb-4 grid-cols-2">
                            <div class="col-span-2">
                                <!-- Mensaje en caso de que este vacio  -->
                                <p class="text-sm font-medium text-red-600" v-if="newSpaceNameError">Debes ingresar un
                                    nombre para el espacio</p>
                                <label for="name" class="block mb-2 text-sm font-medium text-gray-900 ">Name</label>
                                <input type="text" name="name" id="name"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 "
                                    placeholder="Nombre del espacio" v-model="newSpaceName">
                                <!-- Sensores con su nombre y su unidad de medida mediante un select-->
                                <label for="sensor" class="block mb-2 text-sm font-medium text-gray-900 p-1">Sensor</label>
                                <div class="col-span-2 flex items-center">
                                    <input type="text" name="sensor" id="sensor"
                                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 mr-2"
                                        placeholder="Nombre del sensor">
                                    <select name="unit" id="unit"
                                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5">
                                        <option v-for="unit in units" :key="unit.name" :value="unit.name">
                                            {{ unit.name }}
                                        </option>
                                    </select>
                                </div>
                                <!-- Ejecutores con su nombre y su icono mediante un select-->
                                <label for="executor"
                                    class="block mb-2 text-sm font-medium text-gray-900 p-1">Ejecutor</label>
                                <div class="col-span-2 flex items-center">
                                    <input type="text" name="executor" id="executor"
                                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 mr-2"
                                        placeholder="Nombre del ejecutor">
                                    <select name="icon" id="icon"
                                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5">
                                        <option v-for="executor in executors" :key="executor.name" :value="executor.name">
                                            {{ executor.name }}
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <button type="submit"
                            class="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                            <svg class="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd"
                                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                    clip-rule="evenodd"></path>
                            </svg>
                            Crear nuevo espacio
                        </button>
                    </form>
                </div>
            </div>
        </div>



    </main>
</template>

<style scoped>
.dark nav {
    @apply bg-[#0c1015]
}

.dark nav div div {
    @apply text-white
}

.dark p {
    @apply text-white
}

.dark svg, .dark h3, .dark label {
    @apply text-white
}

.dark main {
    @apply bg-[#0c1015]
}

button:hover {
    @apply bg-blue-800;
    @apply transition duration-500 ease-out;
    @apply hover:ease-in;
}

.dark #modal,
.dark #modal div {
    @apply bg-[#0c1015]
}

.dark input {
    @apply bg-[#0c1015]
}
</style>
