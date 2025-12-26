<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { format } from 'date-fns';
import FilmsShowcaseSlide from './FilmsShowcaseSlide.vue';
import ImageSlide from './ImageSlide.vue';
import { useIdle } from '@vueuse/core';

const now = ref(new Date());
setInterval(() => {
    now.value = new Date();
}, 1000);

const { idle } = useIdle(2000);

const images = ref<string[]>([]);
const currentSlideIndex = ref(0);
const totalSlides = computed(() => images.value.length + 1); // +1 for FilmsShowcaseSlide

async function fetchImages() {
    try {
        const response = await fetch('http://localhost:3541/slides');
        if (!response.ok) {
            throw new Error(`Failed to fetch slides: ${response.status}`);
        }
        const data: string[] = await response.json();
        images.value = data;
    } catch (error) {
        console.error('Error fetching images:', error);
    }
}

function prevSlide() {
    currentSlideIndex.value = (currentSlideIndex.value - 1 + totalSlides.value) % totalSlides.value;
}

function nextSlide() {
    currentSlideIndex.value = (currentSlideIndex.value + 1) % totalSlides.value;
}

function autoAdvance() {
    setTimeout(() => {
        nextSlide();
        autoAdvance();
    }, currentSlideIndex.value === images.value.length ? 60000 : 60000); // 60s for FilmsShowcaseSlide, 60s for images
}

onMounted(() => {
    fetchImages();

    autoAdvance();

    // Bind keyboard controls for slide navigation
    const handleKeydown = (event: KeyboardEvent) => {
        if (event.key === 'ArrowLeft') {
            prevSlide();
        } else if (event.key === 'ArrowRight') {
            nextSlide();
        }
    };

    window.addEventListener('keydown', handleKeydown);
});
</script>

<template>
    <main id="slides" :class="{ 'cursor-hidden': idle }">
        <TransitionGroup name="slide">
            <ImageSlide v-for="(filename, index) in images" v-show="currentSlideIndex === index && filename?.length"
                :key="`image-${index}`" :src="`http://localhost:3541/slides/${filename}`" class="slide" />
            <FilmsShowcaseSlide v-show="currentSlideIndex === images.length" key="films-slide" class="slide" />
        </TransitionGroup>
    </main>
    <img id="logo" src="https://media.pathe.nl/files_nl/logo/logo.svg"
        :class="{ hide: currentSlideIndex !== images.length }">
    <span id="clock" :class="{ hide: currentSlideIndex !== images.length }">
        {{ format(now, 'HH:mm:ss') }}
    </span>
</template>

<style scoped>
#slides {
    position: fixed;
    inset: 0;
    overflow: hidden;

    .slide {
        box-sizing: border-box;
        height: 100%;
        width: 100%;
    }
}

#slides.cursor-hidden {
    cursor: none;
}

#logo {
    position: absolute;
    bottom: 3vh;
    left: 5vw;
    height: 4vh;
    transition: opacity 0.5s, bottom 0.5s, left 0.5s, height 0.5s;

    &.hide {
        opacity: 0.25;
        bottom: 8px;
        left: 8px;
        height: 2.5vh;
    }
}

#clock {
    position: absolute;
    bottom: 3.75vh;
    right: 5vw;
    color: #fff;
    font-size: 2vh;
    transition: bottom 0.5s, right 0.5s, font-size 0.5s;

    &.hide {
        bottom: 8px;
        right: 8px;
        font-size: 1.2em;
    }
}

.slide-enter-active,
.slide-leave-active {
    position: absolute;
    transition: all 0.5s;
}

.slide-enter-from {
    transform: translateX(20%);
    opacity: 0;
}

.slide-enter-to {
    transform: none;
    opacity: 1;
}

.slide-leave-to {
    transform: scale(0.9);
    opacity: 0;
}
</style>