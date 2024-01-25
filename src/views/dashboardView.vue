<script setup>
import buttonThemeComponet from '@/components/dashboard/buttonThemeComponet.vue';
import selectComponent from '@/components/dashboard/selects/selectComponent.vue';

import { useAuth } from '@/lib/auth.js'
import { useRouter } from 'vue-router'
import { ref, reactive, onBeforeMount } from 'vue';
import { hasEmptyFields } from '@/lib/validations.js';
import { espacios } from '@/lib/spaces.js';
import { openModal, closeModal } from '@/lib/modal.js';
import { devices } from '@/lib/devices.js'

let id;
const router = useRouter() // Variable router para redireccionar

const spaces = reactive([]); // Variable reactiva para los espacios del usuario
const units = reactive([]) // Variable para las unidades de medida
const executors = reactive([]) // Variable para los ejecutores

const newSpaceName = ref(''); // Variable reactiva para el nombre del nuevo espacio 
const newSpaceSensors = ref({ // Variable reactiva para los sensores del nuevo espacio
    name: '',
    unit: '',
    value: ''
});
const newSpaceExecutors = ref({ // Variable reactiva para los ejecutores del nuevo espacio
    name: '',
    executor: '',
    state: ''
});

const newSpaceNameError = ref(false); // Variable reactiva para el error del nombre del nuevo espacio

const logout = async () => {
    try {
        if (confirm('¿Estás seguro de cerrar sesión?')) {
            await useAuth.logout();
            router.replace({ name: 'home' });
        }
    } catch (error) {
        console.log(error)
    }
};

//Crea un nuevo espacio
const createSpace = async () => {
    try {
        if (newSpaceName.value === '') throw new Error('El nombre del espacio no puede estar vacío'); // Si el nombre del espacio esta vacio lanza un error , es obligatorio
        // Si devuelve false , significa que todos los elementos del objeto tienen valor lo envuelvo en un array para convertilo en array de objectos 
        const sensor = !hasEmptyFields(newSpaceSensors.value) ? [{ ...newSpaceSensors.value }] : [];  // De lo contrario lo devuelve un array vacio
        const executor = !hasEmptyFields(newSpaceExecutors.value) ? [{ ...newSpaceExecutors.value }] : []; // De lo contrario lo devuelve un array vacio
        spaces.push({ name: newSpaceName.value, sensores: sensor, ejecutores: executor }); // Añado el nuevo espacio al array de espacios
        await espacios.updateDocument(id, { space: spaces }); // Actualizo el documento del usuario con el nuevo espacio
        closeModal(); // Cierro el modal
    } catch (error) {
        console.log(error)
        newSpaceNameError.value = true;
    }
};

const handleSelect = (event) => {
    const selectedOption = event.target.selectedOptions[0].value; // Obtengo el valor del select a medida que se va seleccionando
    if (event.target.id === 'unit') newSpaceSensors.value.unit = selectedOption;
    if (event.target.id === 'executor') newSpaceExecutors.value.executor = selectedOption;
    if (event.target.id === 'stateExecutor') newSpaceExecutors.value.state = selectedOption;
}

onBeforeMount(async () => {
    const { uid } = await useAuth.getAuth();
    id = uid;

    const getUnits = async () => {
        const unitsData = await devices.getUnits();
        unitsData.map(unit => units.push(unit))

    }
    const getExecutors = async () => {
        const executorsData = await devices.getExecutors();
        executorsData.forEach(executor => executors.push(executor))
    }
    const getSpaces = async () => {
        const { space } = await espacios.getDocument(uid);
        space.forEach(space => spaces.push(space))
    }

    await getSpaces();
    await getUnits();
    await getExecutors();
})



</script>

<template>
    <!-- Navegación Component -->
    <nav
        class="fixed inset-x-0 top-0 z-10 w-full px-4 py-1 bg-white shadow-md border-slate-500 transition duration-700 ease-out">
        <div class="flex justify-between p-4">
            <div class="text-[2rem] leading-[3rem] tracking-tight font-bold text-black " id="h1">
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
        <buttonThemeComponet class="fixed top-6 right-4 p-2 bg-gray-200 rounded-full mt-20" />
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
        <div v-else class="flex flex-col items-start justify-start h-screen pt-20 w-full">
            <div class="w-full ">
                <div class="p-4">
                    <!-- Texto "TUS ESPACIOS" en la parte superior izquierda con padding -->
                    <p class="text-3xl font-bold text-gray-500">Tus espacios</p>
                </div>
                <!-- Contenedor en columnas -->
                <div class="flex flex-col justify-center w-ful mx-4">
                    <div v-for="space in spaces" :key="space.id" class="w-full flex rounded-lg bg-blue-500 mb-2 mt-1">
                        <!-- El div centra margen entre la pantalla y fondo blanco pero ocupara todo lo largo -->
                        <div>
                            <p class="text-2xl font-bold text-white p-2">{{ space.name }} </p>
                            <!-- div que sera en fila para el numero de sensores y ejecutores tendra icono -->
                            <div class="flex items-center p-1  containerDevice">
                                <!-- Parrafo para el numero de sensores -->
                                <p class="text-base font-bold text-white mx-1 underline">Sensores: {{
                                    space.sensores.length }}</p>

                                <!-- Parrafo para el numero de ejecutores -->
                                <p class="text-base font-bold text-white mx-1 underline">Ejecutores: {{
                                    space.ejecutores.length }}</p>
                            </div>
                        </div>
                        <div class="flex flex-col items-end w-1/2 ml-auto p-5" @click="console.log('hola')">
                            <!-- svg de eliminar -->
                            <svg class="w-6 h-6 text-white mr-2 mt-2 rounded-lg cursor-pointer hover:bg-sky-700" fill="none"
                                stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                                title="Más información sobre el espacio">
                                >
                                >
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="{2}" d="M19 5l-7 7-7-7">
                                </path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="{2}" d="M19 5l-7 7-7-7">
                                </path>
                            </svg>
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
                                <label for="name" class="block mb-2 text-sm font-medium text-gray-900 ">Name <span
                                        class="text-red-500">*</span></label>
                                <input type="text" name="name" id="name"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 "
                                    placeholder="Nombre del espacio" v-model="newSpaceName">
                                <!-- Sensores con su nombre y su unidad de medida mediante un select-->
                                <label for="sensor" class="block mb-2 text-sm font-medium text-gray-900 p-1">Sensor</label>
                                <div class="col-span-2 flex items-center justify-between">
                                    <input type="text" name="sensor" id="sensor"
                                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 mr-2"
                                        placeholder="Nombre del sensor" v-model="newSpaceSensors.name">
                                    <selectComponent name="unit" :elementos="units" @change="handleSelect" />
                                </div>
                                <!-- Contenedor para el valor de la unidad -->
                                <div class="col-span-2 flex items-center justify-between pt-2">
                                    <input type="text" name="value" id="value"
                                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 "
                                        placeholder="Valor de la unidad" v-model="newSpaceSensors.value">

                                </div>
                                <!-- Ejecutores con su nombre y su icono mediante un select-->
                                <label for="executor"
                                    class="block mb-2 text-sm font-medium text-gray-900 p-1">Ejecutor</label>
                                <div class="col-span-2 flex items-center">
                                    <input type="text" name="executor" id="executor"
                                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 mr-2"
                                        placeholder="Nombre del ejecutor" v-model="newSpaceExecutors.name">
                                    <selectComponent name="executor" :elementos="executors" @change="handleSelect" />
                                </div>
                                <div class="col-span-2 flex items-center justify-between pt-2">
                                    <selectComponent name="stateExecutor" id="stateExecutor"
                                        :elementos="[{ name: 'Activo', value: 'on' }, { name: 'Inactivo', value: 'off' }]"
                                        text="Estado del ejecutor" />
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

.dark select {
    @apply bg-[#0c1015];
    @apply text-white;
}


.dark #modal,
.dark #modal div {
    @apply bg-[#0c1015]
}

.dark input {
    @apply bg-[#0c1015]
}

@media (max-width: 820px) {

    #h1 {
        @apply hidden;
    }

    button {
        @apply text-sm
    }
}

@media (max-width: 600px) {
    .containerDevice {
        @apply hidden
    }

}
</style>
