<script setup>
const props = defineProps({
    id: {
        type: String,
        required: true,
    },
    placeholder: {
        type: String,
        required: false,
    },
    class: {
        type: String,
        required: false,
        default: 'bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5'
    },
    type: {
        type: String,
        required: false,
        default: 'text'
    },
});

const emit = defineEmits(['updateValue']);
const updateValue = (event) => emit('updateValue', event.target.value);

</script>

<template>
    <input 
    :placeholder="props.placeholder" 
    :id="props.id" 
    :class="props.class" 
    :type="props.type"
    :value="props.value"
    :name="props.id"
    @input="updateValue"
    />
</template>

<style scoped></style>
