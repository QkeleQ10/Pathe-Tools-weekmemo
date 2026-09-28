<script setup lang="ts">
import { onBeforeUnmount, useTemplateRef } from 'vue';

defineProps<{
    src: string;
}>();

const emit = defineEmits<{
    slidedone: [];
}>();

const video = useTemplateRef('video');

let slideDoneTimer: ReturnType<typeof setTimeout> | undefined;

function scheduleSlideDone() {
    if (!video.value || !Number.isFinite(video.value.duration)) return;

    if (slideDoneTimer) clearTimeout(slideDoneTimer);
    const delay = Math.max(0, video.value.duration - 2.5) * 1000;
    slideDoneTimer = setTimeout(() => emit('slidedone'), delay);
}

onBeforeUnmount(() => {
    if (slideDoneTimer) clearTimeout(slideDoneTimer);
});
</script>

<template>
    <div class="slide video-slide">
        <video ref="video" :src="src" muted autoplay playsinline @loadedmetadata="scheduleSlideDone"></video>
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
    width: 100%;
    height: 100%;
    object-fit: contain;
}
</style>
