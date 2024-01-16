<script setup>
import inputComponent from '@/components/forms/inputComponent.vue'
import buttonComponent from '@/components/forms/buttonComponent.vue'

import { reactive } from 'vue';
const { text, inputs, button, link, toLink } = defineProps([
    'text',
    'inputs',
    'button',
    'link',
    'toLink',
])

const inputsValue = reactive(Object.fromEntries(inputs.map(input => [input.id, ''])));

const emit = defineEmits(['action']) // Defino el evento que se emitirá al hacer submit
const action = () =>  emit('action', inputsValue) // Función que se ejecutará al hacer submit


</script>

<template>
    <form @submit.prevent="action">
        <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0 mt-3">
            <div class="w-full bg-white rounded-lg shadow border md:mt-0 sm:max-w-md xl:p-0">
                <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
                    <p class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                        {{ text }}
                    </p>
                    <!-- Recorro todos los inputs -->
                    <div v-for="input in inputs" :key="input.id">
                        <inputComponent 
                        :id="input.id" 
                        :placeholder="input.placeholder" 
                        :type="input.type"
                        :value="inputsValue[input.id]" 
                        @updateValue="val => inputsValue[input.id] = val"/>
                    </div>
                    <buttonComponent :text="button.text" :class="button.class" :type="button.type" />
                    <!-- Creo un hiperenlace para registro -->
                    <div class="flex justify-center mt-4 text-sm text-gray-600">
                        <RouterLink :to="link" class="hover:underline hover: text-gray-400">
                            {{ toLink }}
                        </RouterLink>
                    </div>
                </div>
            </div>
        </div>
    </form>
</template>
<style lang="scss" scoped></style>