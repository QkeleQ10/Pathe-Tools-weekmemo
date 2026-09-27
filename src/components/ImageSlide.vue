<script setup lang="ts">
defineProps<{
    src: string;
}>();
</script>

<template>
    <div class="slide image-slide">
        <video v-if="src.endsWith('mp4')" :src="src" autoplay muted></video>
        <img v-else :src="src" alt="Slide image" />
    </div>
</template>

<style scoped>
.image-slide {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #000;
    width: 100%;
    height: 100%;
}

.image-slide img, .image-slide video {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}
</style>
