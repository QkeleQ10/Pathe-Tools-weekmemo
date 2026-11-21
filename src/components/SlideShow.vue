<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { useIdle } from '@vueuse/core';
import { format } from 'date-fns';
import FilmsShowcaseSlide from './FilmsShowcaseSlide.vue';
import ImageSlide from './ImageSlide.vue';
import type * as types from '@/scripts/types.ts';
import VideoSlide from './VideoSlide.vue';
import { nl } from 'date-fns/locale';

const now = ref(new Date());
setInterval(() => {
    now.value = new Date();
}, 1000);

const { idle } = useIdle(2000);

const media = ref<string[]>([]);
const mediaSources = ref<Record<string, string>>({});
const mediaSourcePromises = new Map<string, Promise<string>>();
const filmsShowcaseMovies = ref<types.CombinedPatheShow[]>([]);
const currentSlideIndex = ref(0);
const totalSlides = computed(() => media.value.length + 1); // +1 for FilmsShowcaseSlide

function fetchMediaSource(filename: string): Promise<string> {
    const cachedSource = mediaSources.value[filename];
    if (cachedSource) {
        return Promise.resolve(cachedSource);
    }

    const pendingSource = mediaSourcePromises.get(filename);
    if (pendingSource) {
        return pendingSource;
    }

    const sourcePromise = fetch(`http://localhost:3541/media/file/${filename}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch media file ${filename}: ${response.status}`);
            }
            return response.blob();
        })
        .then(blob => {
            const source = URL.createObjectURL(blob);
            mediaSources.value = { ...mediaSources.value, [filename]: source };
            return source;
        });

    mediaSourcePromises.set(filename, sourcePromise);
    return sourcePromise;
}

function mediaSourceFor(index: number): string {
    const filename = media.value[index];
    return filename ? mediaSources.value[filename] ?? '' : '';
}

async function fetchImages() {
    try {
        const response = await fetch('http://localhost:3541/media/all');
        if (!response.ok) {
            throw new Error(`Failed to fetch media: ${response.status}`);
        }
        const data: string[] = await response.json();
        const loadedMedia = await Promise.all(data.map(async filename => {
            try {
                await fetchMediaSource(filename);
                return filename;
            } catch (error) {
                console.error(`Error fetching media file ${filename}:`, error);
                return null;
            }
        }));
        media.value = loadedMedia.filter((filename): filename is string => filename !== null);
    } catch (error) {
        console.error('Error fetching images:', error);
    }
}

async function fetchJson<T>(url: string): Promise<T> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }
    return response.json() as Promise<T>;
}

async function getShows() {
    const shows = await fetchJson<{ shows: types.PatheApiShow[] }>('http://localhost:3541/proxy?url=https://www.pathe.nl/api/shows?language=nl');
    if (!shows?.shows?.length) throw new Error('No shows found');

    const theatreShows = await fetchJson<types.PatheApiTheatreShows>('http://localhost:3541/proxy?url=https://www.pathe.nl/api/cinema/pathe-utrecht-leidsche-rijn/shows?language=nl');
    if (!theatreShows?.shows || !Object.keys(theatreShows.shows).length) throw new Error('No theatre shows found');

    const combinedShows = Object.entries(theatreShows.shows).map(async ([slug, theatreShow]) => {
        const details = await fetchJson<types.PatheApiShowDetails>(`http://localhost:3541/proxy?url=https://www.pathe.nl/api/show/${slug}?language=nl`);
        const showtimes = await fetchJson<types.PatheApiShowtime[]>(`http://localhost:3541/proxy?url=https://www.pathe.nl/api/show/${slug}/showtimes/pathe-utrecht-leidsche-rijn/${new Date().toISOString().split('T')[0]}?language=nl`);
        const baseShow = shows.shows.find(show => show.slug === slug);
        return {
            ...baseShow,
            theatreShow,
            details,
            showtimes,
        } as types.CombinedPatheShow;
    });

    return Promise.all(combinedShows);
}

async function fetchFilmsShowcaseMovies() {
    try {
        filmsShowcaseMovies.value = (await getShows())
            .filter(movie => movie.theatreShow?.next24ShowtimesCount)
            .sort((a, b) => {
                const dateA = new Date(a.releaseAt['NL_NL'] ?? '').getTime();
                const dateB = new Date(b.releaseAt['NL_NL'] ?? '').getTime();
                const freqA = a.theatreShow?.next24ShowtimesCount ?? 0;
                const freqB = b.theatreShow?.next24ShowtimesCount ?? 0;
                return freqB - freqA || dateB - dateA;
            }).slice(0, 25);
    } catch (error) {
        console.error('Error fetching films showcase movies:', error);
    }
}

function manPrevSlide() {
    currentSlideIndex.value = (currentSlideIndex.value - 1 + totalSlides.value) % totalSlides.value;
}

function manNextSlide() {
    currentSlideIndex.value = (currentSlideIndex.value + 1) % totalSlides.value;
}

function nextSlide() {
    currentSlideIndex.value = (currentSlideIndex.value + 1) % totalSlides.value;
}

onMounted(() => {
    fetchImages();
    fetchFilmsShowcaseMovies();

    // Bind keyboard controls for slide navigation
    const handleKeydown = (event: KeyboardEvent) => {
        if (event.key === 'ArrowLeft') {
            manPrevSlide();
        } else if (event.key === 'ArrowRight') {
            manNextSlide();
        }
    };

    window.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
    Object.values(mediaSources.value).forEach(source => URL.revokeObjectURL(source));
});
</script>

<template>
    <main id="slides" :class="{ 'cursor-hidden': idle }">

        <TransitionGroup name="slide">

            <template v-for="n in media.length + 1" :key="n">
                <template v-if="currentSlideIndex === n - 1">
                    <FilmsShowcaseSlide v-if="n - 1 === media.length" key="films-slide" class="slide"
                        :movies="filmsShowcaseMovies" @slidedone="nextSlide" />

                    <ImageSlide
                        v-else-if="['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].some(ext => media[n - 1]?.toLowerCase().endsWith(ext))"
                        :src="mediaSourceFor(n - 1)" class="slide" @slidedone="nextSlide" />

                    <VideoSlide
                        v-else-if="['.mp4', '.webm', '.ogg', '.mov', '.mkv', '.avi', '.wmv'].some(ext => media[n - 1]?.toLowerCase().endsWith(ext))"
                        :src="mediaSourceFor(n - 1)" class="slide" @slidedone="nextSlide" />

                </template>
            </template>

        </TransitionGroup>
    </main>
    <footer :class="{ hide: currentSlideIndex !== media.length }">
        <span id="date">
            {{ format(now, 'EEEE d MMMM', { locale: nl }) }}
        </span>
        <span class="essential" id="clock">
            {{ format(now, 'HH:mm:ss') }}
        </span>
        <img class="essential" id="logo" src="https://media.pathe.nl/files_nl/logo/logo.svg">
    </footer>
</template>

<style scoped>
#slides {
    width: 100vw;
    height: 100vh;
    overflow: hidden;

    .slide {
        box-sizing: border-box;
        height: 100%;
        width: 100%;
        overflow: hidden;
    }
}

#slides.cursor-hidden {
    cursor: none;
}

footer {
    position: absolute;
    top: 1.5em;
    right: 1.5em;

    display: flex;
    align-items: center;
    gap: 1.25em;

    font-size: 2em;
    color: #fff;

    z-index: 2;

    transform-origin: top right;

    transition: transform 0.5s;
    transition-delay: 1s;

    &>*:not(.essential) {
        opacity: 1;
        color: #ffffffaa;
        transition: opacity 500ms;
        transition-delay: 1s;
    }

    &.hide {
        transform: translateY(-0.5em) translateX(0.5em) scale(0.75);

        &>*:not(.essential) {
            opacity: 0;
        }
    }

    #logo {
        height: 2em;
    }
}
</style>

<style>
.slide-enter-active,
.slide-leave-active {
    position: absolute;
    width: 100%;
}

.slide-enter-active {
    z-index: 1;
    animation: peek-in 500ms both, slide-in 800ms 1000ms both;
}

@keyframes peek-in {
    from {
        transform: translateX(75%);
    }

    to {
        transform: translateX(70%);
    }
}

@keyframes slide-in {
    from {
        clip-path: inset(0 25% 0 25%);
    }

    to {
        clip-path: inset(0 0 0 0);
        transform: none;
    }
}

.slide-leave-active {
    z-index: 0;
    animation: peek-out 500ms both, slide-out 800ms 1000ms both;
}

@keyframes peek-out {
    to {
        transform: translateX(-2.5%);
    }
}

@keyframes slide-out {
    to {
        transform: translateX(-50%);
    }
}
</style>