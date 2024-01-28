<script setup>
import buttonThemeComponet from '@/components/dashboard/buttonThemeComponet.vue';
import selectComponent from '@/components/dashboard/selects/selectComponent.vue';
import modalComponent from '@/components/dashboard/modal/modalComponent.vue';

import { useAuth } from '@/lib/auth.js'
import { useRouter } from 'vue-router'
import { ref, reactive, onBeforeMount } from 'vue';
import { hasEmptyFields, generateUUID } from '@/lib/validations.js';
import { espacios } from '@/lib/spaces.js';
import { devices } from '@/lib/devices.js'

let id;
const router = useRouter() // Variable router para redireccionar

const spaces = reactive([]); // Variable reactiva para los espacios del usuario
const units = reactive([]) // Variable para las unidades de medida
const executors = reactive([]) // Variable para los ejecutores
const showDetails = ref([]); // Variable reactiva para mostrar los detalles del espacio

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

const isOpenModals = ref({  // Variable reactiva para mostrar el modal
    id: -1,
    sensor: false,
    executor: false,
    addSpace: false,
    message: '',
});

const propdsModal = ref({
    head: '',
    name: '',
    placeholder: '',
    elements: [],
    state: [],
    value: false,
    messageError: '',
    initialValues: {}
})


const resetModal = () => {
    isOpenModals.value.id = -1; // Me aseguro de que el id del espacio sea -1
    newSpaceName.value = ''; // Reseteo el nombre del espacio
    newSpaceSensors.value = { name: '', unit: '', value: '' }; // Reseteo los sensores del espacio
    newSpaceExecutors.value = { name: '', executor: '', state: 0 }; // Reseteo los ejecutores del espacio
}

const closeModal = () => {
    isOpenModals.value = {
        id: -1,
        sensor: false,
        executor: false,
        addSpace: false,
        message: '',
        values: {}
    }
    resetModal();
}

const closeModalComponent = (object) => {
    if (object !== undefined && object !== null) {
        Object.keys(object).forEach(key => {
            if (key !== 'id') object[key] = '';
        })
    }
    closeModal();
}

// Abro el modal en base al tipo de entidad que se le pase por parametro
const OpenModal = (type, id = -1) => { // El id por defecto es -1
    isOpenModals.value.id = id; // Asigno el id del espacio
    isOpenModals.value[type] = !isOpenModals.value[type]; // Cambio el valor de la propiedad del modal recibida por parametro
}

//Crea un nuevo espacio
const createSpace = async () => {
    try {
        if (!newSpaceName.value.trim()) throw new Error('El nombre del espacio no puede estar vacío'); // Si el nombre del espacio ya existe lanza un error
        if (espacios.isExistSpace(spaces, newSpaceName.value)) { // Si el nombre del espacio ya existe lanza un error
            throw new Error(`Ya existe un espacio con el nombre : ${newSpaceName.value}`); // Muestro un mensaje de error
        }
        const sensor = [{ id: generateUUID(), ...newSpaceSensors.value }]; // Creo un array de sensores con el nuevo sensor y los valores del nuevo sensor
        const executor = [{ id: generateUUID(), ...newSpaceExecutors.value }]; // Creo un array de ejecutores con el nuevo ejecutor y los valores del nuevo ejecutor

        if (hasEmptyFields(newSpaceSensors.value) || hasEmptyFields(newSpaceExecutors.value)) { // Si algun campo esta vacio lanza un error
            throw new Error('Debes añadir al menos un sensor y un ejecutor');
        }

        spaces.push({ id: generateUUID(), name: newSpaceName.value, sensores: sensor, ejecutores: executor }); // Añado el nuevo espacio al array de espacios
        await espacios.updateDocument(id, { space: spaces }); // Actualizo el documento del usuario con el nuevo espacio
        closeModal(); // Cierro el modal
        resetModal(); // Reseteo los valores del modal
    } catch (error) {
        isOpenModals.value.message = error.message; // Muestro un mensaje de error
    }
};

//Añado un nuevo sensor o ejecutor
const addItem = async (data) => {
    try {
        if (isOpenModals.value.id === -1) throw new Error('Debes seleccionar un espacio'); // Si no se selecciono un espacio lanza un error
        if (hasEmptyFields(data)) throw new Error('Debes completar todos los campos'); // Si algun campo esta vacio lanza un error
        const index = espacios.findSpaceIndex(spaces, isOpenModals.value.id); // Busco el indice del espacio en el array de espacios en base al id

        // Si el tipo de entidad es un sensor y ya existe un sensor con ese nombre lanza un error
        if (isOpenModals.value.sensor && espacios.isExistSensor(spaces, isOpenModals.value.id, data.name)) throw new Error(`Ya existe un sensor con el nombre : ${data.name}`);

        // Si el tipo de entidad es un ejecutor y ya existe un ejecutor con ese nombre lanza un error
        if (isOpenModals.value.executor && espacios.isExistExecutor(spaces, isOpenModals.value.id, data.name)) throw new Error(`Ya existe un ejecutor con el nombre : ${data.name}`);

        if (isOpenModals.value.sensor) spaces[index].sensores.push({ ...data }); // Si el tipo de entidad es un sensor , añado el nuevo sensor al array de sensores del espacio
        if (isOpenModals.value.executor) spaces[index].ejecutores.push({ ...data }); // Si el tipo de entidad es un ejecutor , añado el nuevo ejecutor al array de ejecutores del espacio
        await espacios.updateDocument(id, { space: spaces }); // Actualizo el documento del usuario con el nuevo array de espacios
        closeModalComponent(data); // Cierro el modal
    } catch (error) {
        console.error(error)
        isOpenModals.value.message = error.message;
    }
};

//Modifico un sensor o ejecutor
const updateItem = async (idSpace, idSensor) => {
    try {
        const sensor = espacios.findSensor(spaces, idSpace, idSensor);
        newSpaceSensors.value.name = sensor.data.name;
        OpenModal('sensor');

    } catch (error) {
        console.error(error)
        isOpenModals.value.message = error.message;
    }
};

//Elimino un espacio 
const deleteSpace = async (idSpace) => {
    try {
        const index = espacios.findSpaceIndex(spaces, idSpace); // Busco el indice del espacio en el array de espacios en base al id
        if (confirm(`¿Estás seguro de eliminar el espacio ${spaces[index].name}?`)) {
            spaces.splice(index, 1); // Elimino el espacio del array de espacios 
            //await espacios.updateDocument(id, { space: spaces }); // Actualizo el documento del usuario con el nuevo array de espacios
            closeModal(); // Cierro el modal
        }
    } catch (error) {
        console.error(error) // Si hay un error lo muestro por consola
    }
};

//Elimino un sensor 
// idSpace : id del espacio
// idSensor : id del sensor
const deleteSensor = async (idSpace, idSensor) => {
    try {
        const sensor = espacios.findSensor(spaces, idSpace, idSensor); // Busco el sensor en el array de sensores en base al id
        if (confirm(`¿Estás seguro de eliminar el sensor ${sensor.data.name} del espacio ${spaces[sensor.indexSpace].name}?`)) {
            // Elimino el sensor del array de sensores
            spaces[sensor.indexSpace].sensores.splice(sensor.executorIndex, 1);
            await espacios.updateDocument(id, { space: spaces }); // Actualizo el documento del usuario con el nuevo array de espacios
            closeModal(); // Cierro el modal
        }
    } catch (error) {
        console.error(error) // Si hay un error lo muestro por consola
    }
};

//Elimino un ejecutor
// idSpace : id del espacio
// idExecutor : id del ejecutor

const deleteExecutor = async (idSpace, idExecutor) => {
    try {
        const executor = espacios.findExecutor(spaces, idSpace, idExecutor); // Busco el ejecutor en el array de ejecutores en base al id
        if (confirm(`¿Estás seguro de eliminar el ejecutor ${executor.data.name} del espacio ${spaces[executor.indexSpace].name}?`)) {
            // Elimino el ejecutor del array de ejecutores
            spaces[executor.indexSpace].ejecutores.splice(executor.executorIndex, 1);
            await espacios.updateDocument(id, { space: spaces }); // Actualizo el documento del usuario con el nuevo array de espacios
            closeModal(); // Cierro el modal
        }
    } catch (error) {
        console.error(error) // Si hay un error lo muestro por consola
    }
};


// Funcion que es utilizada junto al @change en los select para obtener el valor seleccionado a medida que se va seleccionando
const handleSelect = (event) => {
    const selectedOption = event.target.selectedOptions[0].value; // Obtengo el valor del select a medida que se va seleccionando
    if (event.target.id === 'unit') newSpaceSensors.value.unit = selectedOption; // Si el id del select es unit , el valor seleccionado se lo asigno a la unidad del nuevo espacio
    if (event.target.id === 'executor') newSpaceExecutors.value.executor = selectedOption; // Si el id del select es executor , el valor seleccionado se lo asigno al ejecutor del nuevo espacio
    if (event.target.id === 'stateExecutor') newSpaceExecutors.value.state = selectedOption; // Si el id del select es stateExecutor , el valor seleccionado se lo asigno al estado del ejecutor del nuevo espacio
}

// Funcion para cerrar sesión
const logout = async () => {
    try {
        if (confirm('¿Estás seguro de cerrar sesión?')) {
            await useAuth.logout(); // Cierro sesión
            router.replace({ name: 'home' }); // Redirecciono al home
        }
    } catch (error) {
        console.log(error) // Si hay un error lo muestro por consola
    }
};

// Antes de montar el componente obtengo los datos del usuario y los espacios que tiene
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
                        type="button" @click="OpenModal('addSpace')">
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
                    type="button" @click="OpenModal('addSpace')">
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
                    <div v-for="(space, id) in spaces" :key="space.name" class="mx-1">
                        <div class="w-full flex rounded-t-lg bg-blue-700 mt-1">
                            <!-- El div centra margen entre la pantalla y fondo blanco pero ocupara todo lo largo -->
                            <div>
                                <p class="text-2xl font-bold text-white p-2">{{ space.name.trim() }} </p>
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
                            <div class="flex flex-col items-end w-1/2 ml-auto p-5"
                                @click="showDetails[space.name] = !showDetails[space.name]">
                                <svg class="w-6 h-6 text-white mr-2 mt-2 rounded-lg cursor-pointer hover:bg-sky-700"
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                                    title="Más información sobre el espacio">
                                    >
                                    >
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="{2}"
                                        d="M19 5l-7 7-7-7">
                                    </path>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="{2}"
                                        d="M19 5l-7 7-7-7">
                                    </path>
                                </svg>
                            </div>
                        </div>

                        <div v-if="showDetails[space.name]">
                            <div class="flex flex-col items-center justify-center w-full p-2 bg-blue-100 content" >
                                <p class="text-2xl font-bold text-gray-500">Sensores</p>

                            </div>
                            <!-- Div que contendra el nombre del sensor , unidad de medida y valor -->
                            <div class="flex flex-row items-center justify-between w-full pl-4 bg-blue-600">
                                <!--Tabla con encabezado -->
                                <div class="flex flex-row items-center justify-between w-full pl-4 bg-blue-600">
                                    <div class="w-1/3">
                                        <p class="text-base font-bold text-white mx-1 ">Nombre</p>
                                    </div>
                                    <div class="w-1/3">
                                        <p class="text-base font-bold text-white mx-1">Unidad de medida</p>
                                    </div>
                                    <div class="w-1/3">
                                        <p class="text-base font-bold text-white mx-1 ">Valor</p>
                                    </div>
                                    <!--Contenedor adiccional para las acciones-->
                                    <div class="w-1/3">
                                        <p class="text-base font-bold text-white mx-1 "></p>
                                    </div>
                                </div>
                            </div>
                            <div v-for="(sensor, index) in space.sensores " :key="sensor.id" class="w-full flex flex-row bg-blue-600 rounder-lg
                                pl-8
                                ">
                                <div class="w-1/3">
                                    <p class="text-base font-medium text-white"> {{ index + 1 }} - {{ sensor.name }}</p>
                                </div>
                                <div class="w-1/3 pl-2">
                                    <p class="text-base font-medium text-white"> {{ sensor.unit }}</p>
                                </div>
                                <div class="w-1/3 pl-2">
                                    <p class="text-base font-medium text-white "> {{ sensor.value }}</p>
                                </div>
                                <!--Contenedor adiccional para las acciones-->
                                <div class="w-1/3">
                                    <div class="flex flex-row item-center justify-end p-1 mr-20">
                                        <button
                                            class="flex items-center px-6 py-2 mx-2 text-white transition duration-500 ease-out bg-blue-700 rounded-lg hover:bg-blue-800 hover:ease-in hover:underline"
                                            type="button" @click="updateItem(space.id, sensor.id)">
                                            <i class='bx bxs-rename'></i>
                                        </button>
                                        <button
                                            class="flex items-center px-3 py-2 mx-2 text-white transition duration-500 ease-out bg-red-700 rounded-lg hover:bg-red-800 hover:ease-in hover:underline"
                                            type="button" @click="deleteSensor(space.id, sensor.id)">
                                            <!--Icono de basura con boxicon i -->
                                            <i class='bx bxs-trash'></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div class="flex flex-col items-center justify-center w-full p-2 bg-blue-100 content">
                                    <p class="text-2xl font-bold text-gray-500 ">Ejecutores</p>
                                </div>
                                <!-- Div que contendra el nombre del sensor , unidad de medida y valor -->
                                <div class="flex flex-row items-center justify-between w-full pl-4 bg-blue-600">
                                    <!--Tabla con encabezado -->
                                    <div class="flex flex-row items-center justify-between w-full pl-4 bg-blue-600">
                                        <div class="w-1/3">
                                            <p class="text-base font-bold text-white mx-1 ">Nombre</p>
                                        </div>
                                        <div class="w-1/3">
                                            <p class="text-base font-bold text-white mx-1">Dispositivo</p>
                                        </div>
                                        <div class="w-1/3">
                                            <p class="text-base font-bold text-white mx-1 ">Estado</p>
                                        </div>
                                        <!--Contenedor adiccional para las acciones-->
                                        <div class="w-1/3">
                                            <p class="text-base font-bold text-white mx-1 "></p>
                                        </div>
                                    </div>
                                </div>
                                <div v-for="(ejecutor, index) in space.ejecutores " :key="ejecutor.id"
                                    class="w-full flex flex-row bg-blue-600 rounder-lg pl-8 pb-2">
                                    <div class="w-1/3">
                                        <p class="text-base font-medium text-white"> {{ index + 1 }} - {{ ejecutor.name }}
                                        </p>
                                    </div>
                                    <div class="w-1/3 pl-2">
                                        <p class="text-base font-medium text-white"> {{ ejecutor.executor }}</p>
                                    </div>
                                    <div class="w-1/3 pl-2">
                                        <p class="text-base font-medium text-white "> {{ ejecutor.state }}</p>
                                    </div>
                                    <!--Contenedor adiccional para las acciones-->
                                    <div class="w-1/3">
                                        <div class="flex flex-row item-center justify-end p-1 mr-20">
                                            <button
                                                class="flex items-center px-6 py-2 mx-2 text-white transition duration-500 ease-out bg-blue-700 rounded-lg hover:bg-blue-800 hover:ease-in hover:underline"
                                                type="button" @click="updateItem(space.id, sensor.id)">
                                                <i class='bx bxs-rename'></i>
                                            </button>
                                            <button
                                                class="flex items-center px-3 py-2 mx-2 text-white transition duration-500 ease-out bg-red-700 rounded-lg hover:bg-red-800 hover:ease-in hover:underline"
                                                type="button" @click="deleteExecutor(space.id, ejecutor.id)">
                                                <!--Icono de basura con boxicon i -->
                                                <i class='bx bxs-trash'></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <!--Botones de añadir sensor , añadir ejecutor , eliminar espacio -->
                                <div class="flex flex-row bg-blue-700 rounded-b-lg p-3">
                                    <button
                                        class="flex items-center px-4 py-2 mx-2 text-white transition duration-500 ease-out bg-blue-700 rounded-lg hover:bg-blue-800 hover:ease-in hover:underline"
                                        type="button" @click="OpenModal('sensor', space.id)" :id="id">
                                        <i class='bx bx-devices bx-sm'></i>
                                        Añadir un nuevo sensor
                                    </button>
                                    <button
                                        class="flex items-center px-4 py-2 mx-2 text-white transition duration-500 ease-out bg-blue-700 rounded-lg hover:bg-blue-800 hover:ease-in hover:underline"
                                        type="button" @click="OpenModal('executor', space.id)">
                                        <i class='bx bx-radar bx-sm'></i>
                                        Añadir un nuevo ejecutor
                                    </button>
                                    <button
                                        class="flex items-center px-4 py-2 mx-2 text-white transition duration-500 ease-out bg-red-700 rounded-lg hover:bg-red-800 hover:ease-in hover:underline"
                                        type="button" @click="deleteSpace(space.id)">
                                        <i class='bx bxs-trash text-lg mr-1'></i>
                                        Eliminar espacio
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Modal para añadir sensores -->
        <modalComponent :head="'Añadir un nuevo sensor'" :name="'sensor'" :placeholder="'Nombre del sensor'"
            :elements="units" :value="isOpenModals.sensor" @closeModal="closeModalComponent" @handleSubmit="addItem"
            :messageError="isOpenModals.message" />
        <!-- Modal para añadir ejecutores -->
        <modalComponent :head="'Añadir un nuevo ejecutor'" :name="'executor'" :placeholder="'Nombre del ejecutor'"
            :elements="executors" :state="[{ name: 'Activo', value: 1 }, { name: 'Inactivo', value: 0 }]"
            :value="isOpenModals.executor" @closeModal="closeModalComponent" @handleSubmit="addItem"
            :messageError="isOpenModals.message" />
        <!-- Modal para mdoificar -->


        <!-- Modal para añadir un nuevo espacio -->
        <div id="crud-modal" tabindex="-1" aria-hidden="true"
            class="flex overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
            v-if="isOpenModals.addSpace">
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
                                <p class="text-sm font-bold text-red-600 flex" v-if="isOpenModals.message !== ''">
                                    <svg xmlns="http://www.w3.org/2000/svg" x="20px" y="0px" width="25" height="25"
                                        viewBox="0 0 48 48" class="pb-1">
                                        <path fill="#f44336"
                                            d="M44,24c0,11.045-8.955,20-20,20S4,35.045,4,24S12.955,4,24,4S44,12.955,44,24z">
                                        </path>
                                        <path fill="#fff"
                                            d="M29.656,15.516l2.828,2.828l-14.14,14.14l-2.828-2.828L29.656,15.516z">
                                        </path>
                                        <path fill="#fff"
                                            d="M32.484,29.656l-2.828,2.828l-14.14-14.14l2.828-2.828L32.484,29.656z">
                                        </path>
                                    </svg>
                                    {{ isOpenModals.message }}
                                </p>
                                <label for="name" class="block mb-2 text-sm font-medwium text-gray-900 ">Name <span
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
                                        :elementos="[{ name: 'Activo', value: 1 }, { name: 'Inactivo', value: 0 }]"
                                        text="Estado del ejecutor" @change="handleSelect" />
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

.dark main {
    @apply bg-[#0c1015]
}

button:hover {
    @apply bg-blue-800;
    @apply transition duration-500 ease-out;
    @apply hover:ease-in;
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
.dark .content {
    @apply bg-[#1f2731]
}
</style>