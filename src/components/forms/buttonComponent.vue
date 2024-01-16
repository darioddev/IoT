<script setup>
const props = defineProps({
    text: {
        type: String,
        required: true,
    },
    class: {
        type: String,
        required: false,
        default: 'w - full bg- blue - 500 hover: bg - blue - 700 focus: ring - 4 focus: outline - none focus: ring - primary - 300 font- medium rounded - lg text - sm px - 5 py - 2.5 text - center  focus: ring - blue - 800 text - white'
    },
    type: {
        type: String,
        required: false,
        default: 'submit'
    },
})
</script>

<template>
    <button :class="props.class" :type="props.type">
        {{ props.text }}
    </button>
</template>

<style lang="scss" scoped></style>