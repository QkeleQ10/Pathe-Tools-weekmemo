<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, useTemplateRef } from 'vue';
import type * as types from '@/scripts/types.ts';
import ShowcaseHero from './ShowcaseHero.vue';
import ShowcaseThumbnail from './ShowcaseThumbnail.vue';
import Loader from './Loader.vue';

const props = defineProps<{
    movies: types.CombinedPatheShow[];
}>();

const emit = defineEmits<{
    slidedone: [];
}>();

const sortedMovies = computed(() => props.movies);
const thumbnailsEl = useTemplateRef('thumbnailsEl');

let heroInterval: ReturnType<typeof setInterval> | undefined;
let slideTimer: ReturnType<typeof setTimeout> | undefined;

const currentIndex = ref(0);
const relevantMovies = computed(() => {
    const mostRecentReleaseDate = sortedMovies.value.length
        ? new Date(sortedMovies.value[0]?.releaseAt['NL_NL'] ?? '').getTime()
        : 0;

    // select movies not older than 5 days from most recent release date
    const selection = sortedMovies.value.filter(movie => {
        const releaseDate = new Date(movie.releaseAt['NL_NL'] ?? '').getTime();
        return (mostRecentReleaseDate - releaseDate) <= 5 * 24 * 60 * 60 * 1000 || (new Date().getTime() - releaseDate) <= 6 * 24 * 60 * 60 * 1000;
    });


    return selection.length > 0
        ? selection // return selection if it is not empty
        : sortedMovies.value.slice(0, 3); // fallback to first 3 movies otherwise
})

function goToSlide(index: number) {
    currentIndex.value = index;
    thumbnailsEl.value?.children[index]?.scrollIntoView({
        behavior: 'smooth',
        inline: 'start'
    });
}

onMounted(() => {
    heroInterval = setInterval(() => {
        goToSlide((currentIndex.value + 1) % relevantMovies.value.length);
    }, 20000);
    slideTimer = setTimeout(() => {
        emit('slidedone');
    }, relevantMovies.value.length * 20000 - 2500); // 20 seconds per movie - 2.5 seconds for the last transition
});

onBeforeUnmount(() => {
    if (heroInterval) clearInterval(heroInterval);
    if (slideTimer) clearTimeout(slideTimer);
});
</script>

<template>
    <div class="slide" id="films-playing" v-if="sortedMovies.length">
        <div id="header">
            <h3>Wat draait er?</h3>
            <small>
                <slot name="date"></slot>
            </small>
        </div>
        <div id="heroes">
            <TransitionGroup name="details">
                <template v-for="(movie, i) in sortedMovies" :key="movie.slug">
                    <ShowcaseHero v-if="currentIndex === i" :movie="movie" />
                </template>
            </TransitionGroup>
        </div>
        <div id="thumbnails" ref="thumbnailsEl">
            <ShowcaseThumbnail :minimal="true" :selected="currentIndex === i" v-for="(movie, i) in sortedMovies"
                :key="movie.slug" :movie="movie" @click="goToSlide(i)" />
        </div>
    </div>

    <div class="slide centre" v-else>
        <div class="centre">
            <Loader />
        </div>
    </div>

</template>

<style scoped>
.centre {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
}

#films-playing {
    display: grid;
    grid-template:
        "header" auto
        "heroes" 1fr
        "thumbnails" auto
        / 100%;
    gap: 1em;

    background-color: #090a0b;
    color: #ffffff;
    font-size: 1.7rem;
}


#header {
    grid-area: header;

    margin: 2em 3em;

    display: flex;
    justify-content: space-between;
    align-items: baseline;

    z-index: 1;

    h3 {
        font: 2em "Trade Gothic Bold Condensed 20", Arial, Helvetica, sans-serif;
        text-transform: uppercase;
        margin: 0;
    }
}

#heroes {
    position: absolute;
    inset: 0;
    z-index: 0;
    overflow: hidden;
}

#thumbnails {
    grid-area: thumbnails;

    display: flex;
    align-items: end;
    gap: 2em;

    overflow-x: auto;
    z-index: 1;

    padding: 2em 3em;
    padding-right: calc(100vw - 20em);

    &>* {
        flex: 0 0 auto;
        width: 20em;
    }
}
</style>

<style>
.fade-enter-active,
.fade-leave-active {
    position: absolute;
    transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.details-enter-active,
.details-leave-active {
    position: absolute;
    transition: opacity 500ms ease-out, transform 500ms ease-out;
}

.details-enter-from {
    transform: scale(1.05);
}

.details-enter-from,
.details-leave-to {
    opacity: 0;
}
</style>
