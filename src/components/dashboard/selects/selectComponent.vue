
<script setup>

import { watch, ref } from 'vue';

const { name, elementos, text, selectedValue } = defineProps({
    name: {
        type: String,
        required: true,
    },

    elementos: {
        type: Array,
        required: true,
    },
    text: {
        type: String,
        required: false,
        default: 'Selecciona una opción'
    },
    selectedValue: {
        type: [String, Number, Boolean],
        required: false,
        default: ''
    },
})

const selectedOption = ref(selectedValue);

watch(() => selectedValue, (newValue) => {
    selectedOption.value = newValue;
},
    { immediate: true, deep: true }
);

</script>


<template>
    <select :name="name" :id="name"
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
        v-model="selectedOption">
        <!-- Primer valor que se vera pero que no se podra seleccionar -->
        <option v-if="!selectedValue" value="" disabled selected>{{ text }}</option>
        <option v-for="elemento in elementos" :key="elemento.name"
            :value="elemento.value ?? elemento.name ">
            {{ elemento.name }}
        </option>
    </select>
</template>


<style lang="scss" scoped></style>
