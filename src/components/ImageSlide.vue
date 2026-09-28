<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue';

defineProps<{
    src: string;
}>();

const emit = defineEmits<{
    slidedone: [];
}>();

let slideTimer: ReturnType<typeof setTimeout> | undefined;

onMounted(() => {
    slideTimer = setTimeout(() => {
        emit('slidedone');
    }, 35000);
});

onBeforeUnmount(() => {
    if (slideTimer) clearTimeout(slideTimer);
});
</script>

<template>
    <div class="slide image-slide">
        <img :src="src" />
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

.image-slide img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}
</style>
