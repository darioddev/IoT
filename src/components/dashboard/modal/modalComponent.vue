<script setup>
import selectComponent from '@/components/dashboard/selects/selectComponent.vue';

import { ref, watch } from 'vue';
const props = defineProps({
    head: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    placeholder: {
        type: String,
        required: false,
        default: ''
    },
    elements: {
        type: Array,
        required: true
    },
    state: {
        type: Array,
        required: false,
        default: () => []
    },
    value: {
        type: Boolean,
        required: false,
        default: false
    },
    messageError: {
        type: String,
        required: false,
        default: ''
    },
    initialData: {
        type: Object,
        required: false,
        default: () => ({})
    },
    isLoading: {
        type: Object,
        required: false,
    }
})
const object = ref({
    name: '',
    unit: '',
    value: '',
    executor: '',
    state: ''
});

const emit = defineEmits(['closeModal', 'handleSubmit']);
const handleSubmit = () => emit('handleSubmit', object.value);
const closeModal = () => emit('closeModal', object.value);



const handleSelect = (e) => {
    if (props.state.length === 0) object.value = { ...object.value, unit: e.target.value }; // Si el estado es vacio agrego el valor al objeto unit
    else object.value = { ...object.value, executor: e.target.value }; // De lo contrario agrego el valor al objeto state
}

const handleState = (e) => { // Agrego el valor al objeto state en caso de que este componente sea un ejecutor
    object.value = { ...object.value, state: e.target.value }; // Agrego el valor al objeto state
}

// Observar cambios en la propiedad initalData completa
watch(() => props.initialData, (newInitalData) => {
    // Actualizar object cuando initalData cambia sin perder las propiedades
    object.value = { ...newInitalData }; // Actualizo el objeto con los nuevos valores
},
    { deep: true }
);


</script>

<template>
    <div id="crud-modal" tabindex="-1" aria-hidden="true"
        class="flex overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
        v-if="props.value">
        <div class="relative p-4 w-full max-w-md max-h-full">
            <div class="relative bg-white rounded-lg shadow " id="modal">
                <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t ">
                    <h3 class="text-lg font-semibold text-gray-900 ">
                        {{ props.head }}
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
                <form class="p-4 md:p-5" @submit.prevent="handleSubmit">
                    <div class="mb-4 ">
                        <div class="mb-2">
                            <p class="text-sm font-bold text-red-600 text-center flex items-center justify-center"
                                v-if="props.messageError !== ''">
                                <svg xmlns="http://www.w3.org/2000/svg" x="20px" y="0px" width="25" height="25"
                                    viewBox="0 0 48 48" class="">
                                    <path fill="#f44336"
                                        d="M44,24c0,11.045-8.955,20-20,20S4,35.045,4,24S12.955,4,24,4S44,12.955,44,24z">
                                    </path>
                                    <path fill="#fff"
                                        d="M29.656,15.516l2.828,2.828l-14.14,14.14l-2.828-2.828L29.656,15.516z"></path>
                                    <path fill="#fff"
                                        d="M32.484,29.656l-2.828,2.828l-14.14-14.14l2.828-2.828L32.484,29.656z"></path>
                                </svg>
                                {{ props.messageError }}
                            </p>
                            <!-- Mensaje de cargando -->
                            <p class="text-sm font-bold text-blue-600 text-center flex items-center justify-center"
                                v-if="props.isLoading.load">
                                <svg class="animate-spin -ms-1 w-5 h-5 me-3" xmlns="http://www.w3.org/2000/svg" fill="none"
                                    viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                        stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z">
                                    </path>
                                </svg>
                                {{ props.isLoading.message  }}
                            </p>
                        </div>
                        <div class="col-span-2 flex items-center justify-between">
                            <input type="text" :name="props.name" :id="props.name"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 mr-2"
                                :placeholder="placeholder" v-model="object.name">
                            <selectComponent :name="props.name" :elementos="props.elements" @change="handleSelect"
                                :selectedValue="object.unit || object.executor" />
                        </div>
                        <div class="col-span-2 flex items-center justify-between pt-2">
                            <template v-if="props.state.length === 0">
                                <input type="text" name="value" id="value"
                                    class="bg-gray-50 border border-gray-300 teaxt-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 "
                                    placeholder="Valor de la unidad" v-model="object.value" />
                            </template>
                            <template v-else>
                                <selectComponent :name="props.name" :elementos="props.state" @change="handleState"
                                    :selectedValue="object.state || 'Activo'" :text="'Estado del ejecutor'" />
                            </template>
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
                        {{ head }}
                    </button>
                </form>
            </div>
        </div>
    </div>
</template>

<style scoped></style>