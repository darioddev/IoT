<script setup>
import buttonThemeComponet from '@/components/dashboard/buttonThemeComponet.vue';
import selectComponent from '@/components/dashboard/selects/selectComponent.vue';
import modalComponent from '@/components/dashboard/modal/modalComponent.vue';

import { useAuth } from '@/lib/auth.js'
import { useRouter } from 'vue-router'
import { ref, reactive, onBeforeMount } from 'vue';
import { hasEmptyFields } from '@/lib/validations.js';
import { espacios } from '@/lib/spaces.js';
import { devices } from '@/lib/devices.js'
import { auth, getSubCollection } from '@/lib/firebase.js';

const id = ref(auth.currentUser.uid)

const router = useRouter() // Variable router para redireccionar
const isLoading = ref(false); // Variable reactiva para mostrar el loader
const spaces = reactive([]); // Variable reactiva para el nombre y id de los espacios del usuario 
const devicesAndSensors = reactive([]) // Variable reactiva para los dispositivos y sensores del usuario

const units = reactive([]) // Variable para las unidades de medida que obtengo de la base de datos
const executors = reactive([]) // Variable para los ejecutores que obtengo de la base de datos
const showDetails = ref([]); // Variable reactiva para mostrar los detalles del espacio

// Devuelve los sensores y ejecutores de un espacio en base al id del espacio y el tipo de entidad
const getDevicesAndSensors = (id) => devicesAndSensors.filter(device => device.idSpace === id)

const newSpaceName = ref(''); // Variable reactiva para el nombre del nuevo espacio 
const createSpaceWithoutDevices = ref(false); //Toogle que permite crear un espacio sin sensores ni ejecutores
const newSpaceSensors = ref({ // Variable reactiva para los sensores del nuevo espacio
    name: '', // Nombre del sensor
    unit: '', // Unidad de medida del sensor
    type: 'sensor',
    value: '' // Valor del sensor
});
const newSpaceExecutors = ref({ // Variable reactiva para los ejecutores del nuevo espacio
    name: '', // Nombre del ejecutor
    executor: '', // Dispositivo del ejecutor
    type: 'executor',
    state: 1 // Estado del ejecutor
});

const isOpenModals = ref({  // Variable reactiva para mostrar el modal
    id: -1, // Variable reactiva para controlar el id del espacio
    sensor: false, // Variable reactiva para mostrar el modal de añadir un nuevo sensor
    executor: false, // Variable reactiva para mostrar el modal de añadir un nuevo ejecutor
    addSpace: false, // Variable reactiva para mostrar el modal de añadir un nuevo espacio
    name: false, // Variable reactiva para mostrar el modal de modificar el nombre del espacio
    message: '', // Variable reactiva para mostrar un mensaje de error
    editSpace: false, // Variable reactiva para mostrar el modal de editar un espacio
    loading: { // Variable reactiva para mostrar el loader en los modales 
        load: false,
        message: 'Cargando...'
    }
});

const resetModal = () => {
    isOpenModals.value.id = -1; // Me aseguro de que el id del espacio sea -1
    newSpaceName.value = ''; // Reseteo el nombre del espacio
    newSpaceSensors.value = { name: '', unit: '', value: '' }; // Reseteo los sensores del espacio
    newSpaceExecutors.value = { name: '', executor: '', state: 1 }; // Reseteo los ejecutores del espacio
    createSpaceWithoutDevices.value = false; // Reseteo el valor del toggle
}

const closeModal = () => {
    isOpenModals.value = { // Reseteo los valores del modal
        id: -1,
        sensor: false,
        executor: false,
        addSpace: false,
        name: false,
        message: '',
        loading: { load: false, message: 'Cargando...' }
    }
    resetModal(); // Reseteo los valores del modal
}

const closeModalComponent = (object) => { // Reseteo los campos cuando se agregan nuevos sensores o ejecutores
    if (object !== undefined && object !== null) {
        Object.keys(object).forEach(key => {
            if (key !== 'id') object[key] = ''; // En caso de que el objeto tenga un id no lo reseteo
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
        if (espacios.isExistSpace(spaces, newSpaceName.value)) throw new Error(`Ya existe un espacio con el nombre : ${newSpaceName.value}`); // Muestro un mensaje de error
        if (!createSpaceWithoutDevices.value) {
            if (hasEmptyFields(newSpaceSensors.value)) throw new Error('Los campos del sensor no pueden estar vacíos'); // Si algun campo del sensor esta vacio lanza un error
            if (hasEmptyFields(newSpaceExecutors.value)) throw new Error('Los campos del ejecutor no pueden estar vacíos'); // Si algun campo del ejecutor esta vacio lanza un error
        }
        isOpenModals.value.loading = { load: true, message: 'Creando espacio...' }; // Muestro el loader
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulo un retraso para demostrar el cargador
        const space = await espacios.saveSpace(id.value, { name: newSpaceName.value }); // Guardo el espacio en la base de datos

        if (!createSpaceWithoutDevices.value) {
            await devices.saveDevice(id.value, { ...newSpaceSensors.value, idSpace: space.id }) // Guardo el sensor en la base de datos
            await devices.saveDevice(id.value, { ...newSpaceExecutors.value, idSpace: space.id }) // Guardo el ejecutor en la base de datos   
        }
        closeModal(); // Cierro el modal
    } catch (error) {
        isOpenModals.value.message = error.message; // Muestro un mensaje de error
    }
};

//Añado un nuevo sensor o ejecutor
const addDevice = async (datos) => {
    try {
        datos = devices.deviceObject(isOpenModals.value.sensor, datos); // Creo un objeto con los datos del sensor o ejecutor
        if (hasEmptyFields(datos)) throw new Error('Debes completar todos los campos'); // Si algun campo esta vacio lanza un error
        const items = getDevicesAndSensors(isOpenModals.value.id); // Obtengo los dispositivos y sensores del espacio en base al id
        if (isOpenModals.value.sensor) { // Si el modal es de añadir un nuevo sensor
            if (devices.isExistDevice(items, 'sensor', datos.name)) { // Si el nombre del sensor ya existe lanza un error
                throw new Error(`Ya existe un sensor con el nombre : ${datos.name} en el espacio ${spaces.find(space => space.id === isOpenModals.value.id).name}`); // Muestro un mensaje de error
            }
        } else { // Si el modal es de añadir un nuevo ejecutor
            if (devices.isExistDevice(items, 'executor', datos.name)) { // Si el nombre del ejecutor ya existe lanza un error
                throw new Error(`Ya existe un ejecutor con el nombre : ${datos.name}`); // Muestro un mensaje de error
            }
        }
        isOpenModals.value.loading = { load: true, message: `Añadiendo ${datos.type}...` };
        await new Promise((resolve) => setTimeout(resolve, 500));
        await devices.saveDevice(
            id.value, // Id del usuario
            {
                ...datos, // Datos del dispositivo ,
                idSpace: isOpenModals.value.id // Id del espacio para saber a que espacio pertenece
            }
        )
        closeModal(); // Cierro el modal
    } catch (error) {
        isOpenModals.value.message = error.message;
    }
};

const deleteSpace = async (idSpace) => {
    try {
        if (confirm(`¿Estás seguro de eliminar el espacio ${spaces.find(space => space.id === idSpace).name}?`)) {
            await espacios.deleteDocument(id.value, idSpace); // Elimino el espacio del documento del usuario
            getDevicesAndSensors(idSpace) // Obtengo los dispositivos y sensores del espacio
            .map(device => devices.deleteDevice(id.value, device.id)) // Elimino los dispositivos y sensores del espacio
        }
    } catch (error) {
        console.error(error) // Si hay un error lo muestro por consola
    }
};

const deleteDevice = async (idSpace, idDevice) => {
    try {
        const nameSpace = spaces.find(space => space.id === idSpace).name; // Obtengo el nombre del espacio en base al id
        const { name: nameDevice, type } = devicesAndSensors.find(sensor => sensor.id === idDevice); // Obtengo el nombre del sensor en base al id
        if (confirm(`¿Estás seguro de eliminar el ${type} ${nameDevice} del espacio ${nameSpace}?`)) {
            await devices.deleteDevice(id.value, idDevice); // Elimino el sensor del documento del usuario
        }
    } catch (error) {
        console.error(error) // Si hay un error lo muestro por consola
    }
};

const showInformationDevice = (idDevice, type) => {
    const devices = devicesAndSensors.find(device => device.id === idDevice && device.type === type) // Busco el sensor en el array de sensores en base al id

    if (type === 'sensor')
        newSpaceSensors.value = { ...devices }; // Asigno los valores del sensor a la variable reactiva
    if (type === 'executor')
        newSpaceExecutors.value = { ...devices }; // Asigno los valores del ejecutor a la variable reactiva
    OpenModal('editSpace'); // Abro el modal de editar espacio
};

const showInfomartionName = (idSpace) => {
    newSpaceName.value = spaces.find(space => space.id === idSpace).name.trim(); // Asigno el nombre del espacio a la variable reactiva
    OpenModal('name', idSpace); // Abro el modal de editar espacio
}

const updateDevice = async (data, type) => {
    try {
        if (hasEmptyFields(data)) throw new Error('Debes completar todos los campos'); // Si algun campo esta vacio lanza un error
        //Primero de todo comprobaremos si el nombre nuevo del sensor es igual al que ya tenia
        //Si es igual no habra problema y se actualizara el sensor
        //Si es distinto comprobaremos si ya existe un sensor con ese nombre
        //Si existe un sensor con ese nombre lanzaremos un error
        const device = devicesAndSensors.find(device => device.id === data.id && device.type === type); // Busco el dispositivo en el array de dispositivos en base al id y el tipo
        if (data.name !== device.name) { // Si el nombre del sensor es distinto al que ya tenia
            if (devices.isExistDevice(devicesAndSensors, type, data.name)) { // Si el nombre del sensor ya existe lanza un error
                throw new Error(`Ya existe un sensor con el nombre : ${data.name}`); // Muestro un mensaje de error
            }
        }
        const { id: uid, ...rest } = data // Extraigo el id del dispositivo y el resto de datos para almacenar todo menos el id
        // Mostrar cargador antes de cerrar el modal
        isOpenModals.value.loading = { load: true, message: `Actualizando ${type}...` }
        // Simular un retraso para demostrar el cargador
        await new Promise((resolve) => setTimeout(resolve, 500));
        devices.updateDevice(
            id.value, // Id del usuario
            uid, // Id del dispositivo
            { ...rest } // Datos del dispositivo , sin el id
        )
        closeModal(); // Cierro el modal
    } catch (error) {
        isOpenModals.value.message = error.message; // Muestro un mensaje de error
    }
};

const updateNameSpace = async () => {
    try {
        if (!newSpaceName.value.trim()) throw new Error('El nombre del espacio no puede estar vacío'); // Si el nombre del espacio ya existe lanza un error
        const space = spaces.find(space => space.id === isOpenModals.value.id); // Busco el espacio en el array de espacios en base al id
        if (espacios.isExistSpace(spaces, newSpaceName.value) && newSpaceName.value !== space.name) throw new Error(`Ya existe un espacio con el nombre : ${newSpaceName.value}`); // Muestro un mensaje de error
        isOpenModals.value.loading = { load: true, message: 'Actualizando nombre del espacio...' }; // Muestro el loader
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulo un retraso para demostrar el cargador
        espacios.updateSpace(id.value, isOpenModals.value.id, { name: newSpaceName.value }); // Actualizo el nombre del espacio
        closeModal(); // Cierro el modal
    } catch (error) {
        isOpenModals.value.message = error.message; // Muestro un mensaje de error
    }
};

const handleSubmitFunction = (data) => {
    if (!newSpaceSensors.value.name.trim()) {
        updateDevice(data, 'executor');
    } else {
        updateDevice(data, 'sensor');
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


getSubCollection(import.meta.env.VITE_APP_FIREBASE_COLLECTION_SPACE, id.value, import.meta.env.VITE_APP_FIREBASE_COLLLECTION_NAMES, (doc) => {
    spaces.splice(0, spaces.length);
    doc.forEach((doc) => spaces.push({ id: doc.id, name: doc.data().name }))
});

// Cada vez que se actualice el documento de los espacios se actualizara la variable reactiva 
getSubCollection(import.meta.env.VITE_APP_FIREBASE_COLLECTION_SPACE, id.value, import.meta.env.VITE_APP_FIREBASE_COLLECTION_DEVICES, (doc) => {
    devicesAndSensors.splice(0, devicesAndSensors.length);
    doc.forEach((doc) => devicesAndSensors.push({ id: doc.id, ...doc.data() }))
});

// Antes de montar el componente obtengo los datos del usuario y los espacios que tiene
onBeforeMount(async () => {
    isLoading.value = true; // Muestro el loader
    try {
        const getUnits = async () => {
            const unitsData = await devices.getUnits();
            unitsData.map(unit => units.push(unit))
        }
        const getExecutors = async () => {
            const executorsData = await devices.getExecutors();
            executorsData.forEach(executor => executors.push(executor))
        }
        await getUnits();
        await getExecutors();
    } catch (error) {
        console.error(error) // Si hay un error lo muestro por consola
    } finally {
        isLoading.value = false; // Oculto el loader
    }
})
</script>

<template>
    <nav
        class="fixed inset-x-0 top-0 z-10 w-full px-4 py-1 bg-white shadow-md border-slate-500 transition duration-700 ease-out">
        <div class="flex justify-between p-4">
            <div class="text-[2rem] leading-[3rem] tracking-tight font-bold text-black " id="h1">
                Bienvenido a <span class="text-blue-700">IoT</span>
            </div>
            <div class="flex items-center space-x-4 text-lg font-semibold tracking-tight">
                <div>
                    <button
                        class="flex items-center px-6 py-2 text-white transition duration-500 ease-out bg-blue-700 rounded-lg hover:bg-blue-800 hover:ease-in hover:underline"
                        type="button" @click="OpenModal('addSpace')">
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
    <main class="flex flex-col items-center justify-center w-full h-screen bg-gray-100 ">
        <buttonThemeComponet class="fixed top-6 right-4 p-2 bg-gray-200 rounded-full mt-20" />
        <div v-if="isLoading"
            class="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-white opacity-75">
            <p class="text-2xl font-bold text-gray-500">Cargando...</p>
        </div>
        <div v-if="spaces.length === 0 && !isLoading">
            <div class="flex flex-col items-center justify-center w-full h-full">
                <p class="text-2xl font-bold text-gray-500 ">No tienes ningún espacio</p>
                <button
                    class="flex items-center px-6 py-2 mt-4 text-white transition duration-500 ease-out bg-blue-700 rounded-lg hover:bg-blue-800 hover:ease-in hover:underline"
                    type="button" @click="OpenModal('addSpace')">
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
        <div v-else-if="!isLoading && spaces.length !== 0"
            class="flex flex-col items-start justify-start h-screen pt-20 w-full">
            <div class="w-full ">
                <div class="p-4">
                    <p class="text-3xl font-bold text-gray-500">Tus espacios</p>
                </div>
                <div class="flex flex-col justify-center w-ful mx-4">
                    <div v-for="space in spaces" :key="space.name" class="mx-1">
                        <div class="w-full flex rounded-t-lg bg-blue-700 mt-1">
                            <div>
                                <p class="text-2xl font-bold text-white p-2">
                                    {{ space.name.trim().toLowerCase() }}
                                </p>
                                <div class="flex items-center p-1  containerDevice">
                                    <p class="text-base font-bold text-white mx-1 ">Número de dispositivos :
                                        {{ getDevicesAndSensors(space.id).length }} </p>
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
                            <div v-if="getDevicesAndSensors(space.id).length !== 0">
                                <div v-for="device in getDevicesAndSensors(space.id)" :key="device.id" class="">
                                    <div v-if="device.type === 'sensor'" class="w-full">
                                        <div class="w-full flex flex-row bg-blue-600 rounder-lg p-2 items-center">
                                            <div class="w-1/3 mx-4">
                                                <!-- p con diciendo nombre del sensor -->
                                                <p class="text-base font-medium text-white flex items-center">
                                                    <i class='bx bx-radar bx-sm' style="vertical-align: middle;"></i>
                                                    <span class="font-bold px-2 cursor-pointer" title="Nombre del sensor">{{
                                                        device.name.toLowerCase() }}</span>
                                                </p>
                                            </div>
                                            <div class="w-1/3 pl-2">
                                                <p class="text-base font-medium text-white flex items-center">
                                                    <i class='bx bxs-bolt-circle bx-sm cursor-pointer'
                                                        style="vertical-align: middle;" title="Unidad del sensor"></i>
                                                    <span class="font-bold px-2 cursor-pointer"
                                                        title="Unidad del sensor ">{{ device.unit }}</span>
                                                </p>
                                            </div>
                                            <div class="w-1/3 pl-2">
                                                <p class="text-base font-medium text-white flex items-center">
                                                    <i class='bx bxs-data bx-sm cursor-pointer'
                                                        style="vertical-align: middle;" title="Valor del sensor"></i>
                                                    <span class="font-bold px-2 cursor-pointer" title="Valor del sensor">{{
                                                        device.value }}</span>
                                                </p>
                                            </div>
                                            <div class="w-1/3">
                                                <div class="flex flex-row item-center justify-end mr-20">
                                                    <button
                                                        class="flex items-center px-6 py-2 mx-2 text-white transition duration-500 ease-out bg-blue-700 rounded-lg hover:bg-blue-800 hover:ease-in hover:underline"
                                                        type="button" @click="showInformationDevice(device.id, 'sensor')">
                                                        <i class='bx bxs-rename'></i>
                                                    </button>
                                                    <button
                                                        class="flex items-center px-3 py-2 mx-2 text-white transition duration-500 ease-out bg-red-700 rounded-lg hover:bg-red-800 hover:ease-in hover:underline"
                                                        type="button" @click="deleteDevice(space.id, device.id)">
                                                        <i class='bx bxs-trash'></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-else>
                                        <div class="w-full flex flex-row bg-blue-600 rounder-lg p-2 items-center">
                                            <div class="w-1/3 mx-4">
                                                <p class="text-base font-medium text-white flex items-center">
                                                    <i class='bx bx-devices bx-sm' style="vertical-align: middle;"
                                                        title="Nombre del ejecutor"></i>
                                                    <span class="font-bold px-2 cursor-pointer"
                                                        title="Nombre del ejecutor">{{
                                                            device.name }}</span>
                                                </p>
                                            </div>
                                            <div class="w-1/3 pl-2">
                                                <p class="text-base font-medium text-white flex items-center">
                                                    <i class='bx bxs-data bx-sm cursor-pointer'
                                                        style="vertical-align: middle;"
                                                        title="Dispositivo del ejecutor"></i>
                                                    <span class="font-bold px-2 cursor-pointer"
                                                        title="Dispositivo del ejecutor">{{ device.executor }}</span>
                                                </p>
                                            </div>
                                            <div class="w-1/3 pl-2">
                                                <p class="text-base font-medium text-white flex items-center">
                                                    <i :class="['bx', Number(device.state) === 1 ? 'bxs-toggle-right' : 'bxs-toggle-left', 'bx-lg', 'cursor-pointer', Number(device.state) === 1 ? 'text-green-500' : 'text-red-500', 'rounded-full', 'transition-opacity duration-300 ease-in-out']"
                                                        style="vertical-align: middle; opacity: 1;"
                                                        title="Estado del ejecutor"
                                                        @click="devices.updateDevice(id, device.id, { state: device.state === 1 ? 0 : 1 })"></i>
                                                </p>
                                            </div>
                                            <div class="w-1/3">
                                                <div class="flex flex-row item-center justify-end mr-20">
                                                    <button
                                                        class="flex items-center px-6 py-2 mx-2 text-white transition duration-500 ease-out bg-blue-700 rounded-lg hover:bg-blue-800 hover:ease-in hover:underline"
                                                        type="button" @click="showInformationDevice(device.id, 'executor')">
                                                        <i class='bx bxs-rename'></i>
                                                    </button>
                                                    <button
                                                        class="flex items-center px-3 py-2 mx-2 text-white transition duration-500 ease-out bg-red-700 rounded-lg hover:bg-red-800 hover:ease-in hover:underline"
                                                        type="button" @click="deleteDevice(space.id, device.id)">
                                                        <i class='bx bxs-trash'></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- Si el sensor y los ejecutores son vacios muestro mensaje de sin sensores y sin dispositivos-->
                            <div v-if="getDevicesAndSensors(space.id).length === 0">
                                <div class="flex flex-col items-center justify-center w-full p-2 bg-blue-100 content">
                                    <p class="text-2xl font-bold text-gray-500 ">No tienes sensores ni ejecutores en este
                                        espacio</p>

                                </div>
                            </div>
                            <div>
                                <div class="flex flex-row bg-blue-700 rounded-b-lg p-3">
                                    <button
                                        class="flex items-center px-4 py-2 mx-2 text-white transition duration-500 ease-out bg-blue-700 rounded-lg hover:bg-blue-800 hover:ease-in hover:underline"
                                        type="button" @click="OpenModal('sensor', space.id)" :id="id">
                                        <i class='bx bx-radar bx-sm'></i>
                                        <span class="hidden md:block">Añadir un nuevo sensor</span>
                                    </button>
                                    <button
                                        class="flex items-center px-4 py-2 mx-2 text-white transition duration-500 ease-out bg-blue-700 rounded-lg hover:bg-blue-800 hover:ease-in hover:underline"
                                        type="button" @click="OpenModal('executor', space.id)">
                                        <i class='bx bx-devices bx-sm'></i>
                                        <span class="hidden md:block">Añadir un nuevo ejecutor</span>
                                    </button>
                                    <button
                                        class="flex items-center px-4 py-2 mx-2 text-white transition duration-500 ease-out bg-blue-700 rounded-lg hover:bg-blue-800 hover:ease-in hover:underline"
                                        type="button" @click="showInfomartionName(space.id)">
                                        <i class='bx bxs-rename'></i>
                                        <span class="hidden md:block">Renombrar</span>
                                    </button>
                                    <button
                                        class="flex items-center px-4 py-2 mx-2 text-white transition duration-500 ease-out bg-red-700 rounded-lg hover:bg-red-800 hover:ease-in hover:underline"
                                        type="button" @click="deleteSpace(space.id)">
                                        <i class='bx bxs-trash text-lg mr-1'></i>
                                        <span class="hidden md:block">Eliminar espacio</span>
                                    </button>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!--Componente 
        Modal para añadir un nuevo sensor o ejecutor a un espacio
        -->
        <modalComponent :head="`Añadir un nuevo ${isOpenModals.sensor ? 'sensor' : 'ejecutor'}`"
            :name="isOpenModals.sensor ? 'sensor' : 'executor'"
            :placeholder="isOpenModals.sensor ? 'Nombre del sensor' : 'Nombre del ejecutor'"
            :elements="isOpenModals.sensor ? units : executors"
            :state="isOpenModals.executor ? [{ name: 'Activo', value: 1 }, { name: 'Inactivo', value: 0 }] : []"
            :value="isOpenModals[isOpenModals.sensor ? 'sensor' : 'executor']" @closeModal="closeModalComponent"
            @handleSubmit="addDevice" :messageError="isOpenModals.message" :isLoading="isOpenModals.loading"
            :initialData="isOpenModals.sensor ? newSpaceSensors : newSpaceExecutors" />
        <!--
        Modal para editar un espacio
        -->
        <modalComponent :head="`Modificar ${!newSpaceSensors.name.trim() ? 'ejecutor' : 'sensor'} ${newSpaceSensors.name}`"
            :name="!newSpaceSensors.name.trim() ? 'ejecutor' : 'sensor'"
            :placeholder="`Nombre del ${!newSpaceSensors.name.trim() ? 'ejecutor' : 'sensor'}`"
            :elements="!newSpaceSensors.name.trim() ? executors : units"
            :state="!newSpaceSensors.name.trim() ? [{ name: 'Activo', value: 1 }, { name: 'Inactivo', value: 0 }] : []"
            :value="isOpenModals.editSpace" @closeModal="closeModalComponent" @handleSubmit="handleSubmitFunction"
            :messageError="isOpenModals.message" :isLoading="isOpenModals.loading"
            :initialData="!newSpaceSensors.name.trim() ? newSpaceExecutors : newSpaceSensors" />

        <!--
            Modal para modficiar el nombre 
        -->
        <div id="crud-modal" tabindex="-1" aria-hidden="true"
            class="flex overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
            v-if="isOpenModals.name">
            <div class="relative p-4 w-full max-w-md max-h-full">
                <div class="relative bg-white rounded-lg shadow " id="modal">
                    <div class="flex items center justify-between p-4 md:p-5 border-b rounded-t ">
                        <h3 class="text-lg font-semibold text-gray-900 ">
                            Modificar nombre
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
                    <form class="p-4 md:p-5" @submit.prevent="updateNameSpace">
                        <div class="grid gap-4 mb-4 grid-cols-2">
                            <div class="col-span-2">
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
                                <p class="text-sm font-bold text-blue-600 flex text-center"
                                    v-if="isOpenModals.loading.load">
                                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600"
                                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                            stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z">
                                        </path>
                                    </svg>
                                    {{ isOpenModals.loading.message }}
                                </p>
                                <label for="name" class="block mb-2 text-sm font-medwium text-gray-900 ">Name <span
                                        class="text-red-500">*</span></label>
                                <input type="text" name="name" id="name"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 "
                                    
                                    placeholder="Nombre del espacio" v-model="newSpaceName">
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
                            Renombrar espacio
                        </button>
                    </form>
                </div>
            </div>
        </div>


        <div id="crud-modal" tabindex="-1" aria-hidden="true"
            class="flex overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
            v-if="isOpenModals.addSpace">
            <div class="relative p-4 w-full max-w-md max-h-full">
                <div class="relative bg-white rounded-lg shadow " id="modal">
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
                    <form class="p-4 md:p-5" @submit.prevent="createSpace">
                        <div class="grid gap-4 mb-4 grid-cols-2">
                            <div class="col-span-2">
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
                                <p class="text-sm font-bold text-blue-600 flex text-center"
                                    v-if="isOpenModals.loading.load">
                                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600"
                                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                            stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z">
                                        </path>
                                    </svg>
                                    {{ isOpenModals.loading.message }}
                                </p>
                                <label for="name" class="block mb-2 text-sm font-medwium text-gray-900 ">Name <span
                                        class="text-red-500">*</span></label>
                                <input type="text" name="name" id="name"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 "
                                    placeholder="Nombre del espacio" v-model="newSpaceName">
                                <div v-if="!createSpaceWithoutDevices">
                                    <label for="sensor" class="block mb-2 text-sm font-medium text-gray-900 p-1">Sensor
                                        <span class="text-red-500">*</span>
                                    </label>
                                    <div class="col-span-2 flex items-center justify-between">
                                        <input type="text" name="sensor" id="sensor"
                                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 mr-2"
                                            placeholder="Nombre del sensor" v-model="newSpaceSensors.name">
                                        <selectComponent name="unit" :elementos="units" @change="handleSelect" />
                                    </div>
                                    <div class="col-span-2 flex items-center justify-between pt-2">
                                        <input type="text" name="value" id="value"
                                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 "
                                            placeholder="Valor de la unidad" v-model="newSpaceSensors.value">

                                    </div>
                                    <label for="executor" class="block mb-2 text-sm font-medium text-gray-900 p-1">Ejecutor
                                        <span class="text-red-500">*</span>
                                    </label>
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
                        </div>
                        <!--Contenedor con toogle que servira para poder crear el espacio sin dispositivos -->
                        <div class="flex items-center justify-start">
                            <label for="toggle" class="flex items-center cursor-pointer">
                                <i :class="['bx', createSpaceWithoutDevices ? 'bxs-toggle-right' : 'bxs-toggle-left', 'bx-lg', 'cursor-pointer', createSpaceWithoutDevices ? 'text-green-500' : 'text-red-500', 'rounded-full', 'transition-opacity duration-300 ease-in-out']"
                                    style="vertical-align: middle; opacity: 1;" title="Estado del ejecutor"
                                    @click="createSpaceWithoutDevices = !createSpaceWithoutDevices"></i>
                                <div class="text-gray-900 text-center">
                                    Crear espacio sin dispositivos
                                </div>
                            </label>
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