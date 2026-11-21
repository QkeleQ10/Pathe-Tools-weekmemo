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

const thumbnailsEl = useTemplateRef('thumbnailsEl');

let heroInterval: ReturnType<typeof setInterval> | undefined;
let slideTimer: ReturnType<typeof setTimeout> | undefined;

const currentIndex = ref(0);
const relevantFilmsIndices = computed(() => {

    // select movies for which the release date is no more than 6 days ago
    const selection = props.movies.map((movie, index) => ({ movie, index })).filter(({ movie }) => {
        const releaseDate = new Date(movie.releaseAt['NL_NL'] ?? '').getTime();
        return releaseDate >= Date.now() - 6 * 24 * 60 * 60 * 1000; // 6 days in milliseconds

    }).map(({ index }) => index);

    return selection.length > 0
        ? [...new Set([0, ...selection])] // return selection if it is not empty
        : [0, 1, 2]; // fallback to first 3 movies otherwise
})

function focusFilm(index: number) {
    currentIndex.value = index;
    thumbnailsEl.value?.children[index]?.scrollIntoView({
        behavior: 'smooth',
        inline: 'start'
    });
}

function* infinitelyYield<T>(items: T[]): Generator<T, never, void> {
    while (items.length > 0) {
        yield* items;
    }

    throw new Error('Collection is empty.');
}

onMounted(() => {
    const slideIndices = infinitelyYield(relevantFilmsIndices.value);
    slideIndices.next();

    heroInterval = setInterval(() => {
        focusFilm(slideIndices.next().value);
    }, 20000);

    slideTimer = setTimeout(() => {
        emit('slidedone');
    }, relevantFilmsIndices.value.length * 20000 - 2500); // 20 seconds per movie - 2.5 seconds for the last transition
});

onBeforeUnmount(() => {
    if (heroInterval) clearInterval(heroInterval);
    if (slideTimer) clearTimeout(slideTimer);
});
</script>

<template>
    <div class="slide" id="films-playing">
        <div id="header">
            <h3>Wat draait er?</h3>
        </div>

        <div class="centre" v-if="!movies.length">
            <Loader />
        </div>

        <template v-else>
            <div id="heroes">
                <TransitionGroup name="details">
                    <template v-for="(m, i) in movies" :key="m.slug">
                        <ShowcaseHero v-if="currentIndex === i" :movie="m" />
                    </template>
                </TransitionGroup>
            </div>
            <div id="thumbnails" ref="thumbnailsEl">
                <ShowcaseThumbnail :minimal="true" :selected="currentIndex === i" v-for="(m, i) in movies" :key="m.slug"
                    :movie="m" @click="focusFilm(i)" />
            </div>
        </template>
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

    color-scheme: dark;
}


#header {
    grid-area: header;

    margin: 2em 3em;

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

    z-index: 1;

    padding: 2em 3em;
    padding-right: calc(100vw - 20em);

    &>* {
        flex: 0 0 auto;
        width: 20em;
    }

    overflow-x: hidden;

    &:hover {
        overflow-x: overlay;
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
