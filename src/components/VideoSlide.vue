<script setup lang="ts">
defineProps<{
    src: string;
}>();

const emit = defineEmits<{
    slidedone: [];
}>();

function handleEnded() {
    emit('slidedone');
}
</script>

<template>
    <div class="slide video-slide">
        <video :src="src" muted autoplay playsinline @ended="handleEnded"></video>
    </div>
</template>

<style scoped>
.video-slide {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #000;
    width: 100%;
    height: 100%;
}

.video-slide video {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}
</style>
