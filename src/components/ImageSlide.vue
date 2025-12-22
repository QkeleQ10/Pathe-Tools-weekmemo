<script setup lang="ts">
defineProps<{
    src: string;
}>();
</script>

<template>
    <div class="slide image-slide">
        <img :src="src" alt="Slide image" />
    </div>
</template>

<style scoped>
.image-slide {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #1b1d23;
    width: 100%;
    height: 100%;
}

.image-slide img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}
</style>
