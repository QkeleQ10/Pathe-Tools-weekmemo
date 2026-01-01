<script setup lang="ts">
import { ref, computed, onMounted, useTemplateRef } from 'vue';
import type * as types from '@/scripts/types.ts';
import ShowcaseHero from './ShowcaseHero.vue';
import ShowcaseItem from './ShowcaseItem.vue';
import Loader from './Loader.vue';

const sortedMovies = ref<types.CombinedPatheShow[]>([]);
const thumbnailsEl = useTemplateRef('thumbnailsEl');

function animateScroll(el: HTMLElement, to: number, duration = 2500) {
    const start = el.scrollLeft;
    const change = to - start;
    const startTime = performance.now();
    const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    function step(now: number) {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);
        const eased = easeInOutCubic(t);
        el.scrollLeft = start + change * eased;
        if (t < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
}

async function populate() {
    sortedMovies.value = (await getShows())
        .filter(movie => movie.theatreShow?.next24ShowtimesCount)
        .sort((a, b) => {
            const dateA = new Date(a.releaseAt[0] ?? '').getTime();
            const dateB = new Date(b.releaseAt[0] ?? '').getTime();
            const freqA = a.theatreShow?.next24ShowtimesCount ?? 0;
            const freqB = b.theatreShow?.next24ShowtimesCount ?? 0;
            return dateB - dateA || freqB - freqA;
        }).slice(0, 12);
}
populate();

async function getShows() {
    return new Promise<types.CombinedPatheShow[]>(async (resolve, reject) => {
        try {
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
            resolve(Promise.all(combinedShows));
        } catch (error) {
            reject(error);
        }
    });
}

async function fetchJson<T>(url: string): Promise<T> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }
    return response.json() as Promise<T>;
}

const currentIndex = ref(0);
const relevantMovies = computed(() => {
    const mostRecentReleaseDate = sortedMovies.value.length
        ? new Date(sortedMovies.value[0]?.releaseAt[0] ?? '').getTime()
        : 0;
    // return movies not older than 5 days from most recent release date
    return sortedMovies.value.filter(movie => {
        const releaseDate = new Date(movie.releaseAt[0] ?? '').getTime();
        return (mostRecentReleaseDate - releaseDate) <= 5 * 24 * 60 * 60 * 1000 || (new Date().getTime() - releaseDate) <= 6 * 24 * 60 * 60 * 1000;
    });
})

function autoAdvance() {

    const scheduleScroll = (delayMs: number) => {
        setTimeout(() => {
            const el = thumbnailsEl.value;
            if (!el) return;
            const scrollAmount = el.clientWidth * 0.6;
            const maxScroll = el.scrollWidth - el.clientWidth;
            const next = Math.min(el.scrollLeft + scrollAmount, maxScroll);
            animateScroll(el, next, 2500);
        }, delayMs);
    };

    scheduleScroll(11000);
    scheduleScroll(20000);
    setTimeout(() => {
        if (thumbnailsEl.value)
            thumbnailsEl.value.scrollTo({ left: 0, behavior: 'smooth' });
    }, 29000)

    setTimeout(() => {
        currentIndex.value = (currentIndex.value + 1) % relevantMovies.value.length;
        autoAdvance();
    }, 30000);
}

onMounted(() => {
    autoAdvance();
});
</script>

<template>
    <div class="slide" id="films-playing" v-if="sortedMovies.length">
        <div id="backgrounds">
            <TransitionGroup name="fade">
                <template v-for="(movie, i) in sortedMovies" :key="movie.slug">
                    <div class="background" v-show="currentIndex === i" :style="{
                        '--image': `url(${movie.backgroundPath.lg})`,
                        '--accent': movie.backgroundDominantColor
                    }"></div>
                </template>
            </TransitionGroup>
        </div>
        <div id="header">
            <h3>Wat draait er?</h3>
            <small>
                <slot name="date"></slot>
            </small>
        </div>
        <div id="heroes">
            <TransitionGroup name="slide">
                <template v-for="(movie, i) in sortedMovies" :key="movie.slug">
                    <ShowcaseHero v-show="currentIndex === i" :movie="movie" :i="i" />
                </template>
            </TransitionGroup>
        </div>
        <div id="thumbnails" ref="thumbnailsEl">
            <ShowcaseItem :minimal="true" :class="{ selected: currentIndex === i }" v-for="(movie, i) in sortedMovies"
                :key="movie.slug" :movie="movie" :i="i" @click="currentIndex = i" />
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
    position: relative;
    display: grid;
    grid-template-rows: 12vh 58vh 30vh;

    background-color: #090a0b;
    color: #ffffff;
    font-size: 1.7rem;
}

#backgrounds {
    position: absolute;
    inset: 0;
}

.background {
    position: absolute;
    inset: 0;
    background:
        linear-gradient(to bottom, transparent 70%, #090a0b 90%),
        radial-gradient(ellipse farthest-corner at top, transparent 50%, #090a0b 90%),
        linear-gradient(hsl(from var(--accent) h calc(s * 0.6) calc(l * 0.6) / 0.8)),
        var(--image) no-repeat center/cover;
}

#header {
    padding: 5vh 5vw 0;

    display: flex;
    justify-content: space-between;
    align-items: baseline;

    z-index: 1;

    h3 {
        font: 2.5em "Trade Gothic Bold Condensed 20", Arial, Helvetica, sans-serif;
        text-transform: uppercase;
        margin: 0;
    }
}

#heroes {
    position: relative;

    .showcase-hero {
        position: absolute;
        inset: 0;
        padding: 2.5vh 5vw;
    }
}

#thumbnails {
    display: flex;
    gap: 1vw;
    overflow: hidden;
    padding: 2.5vh 5vw 10vh;

    .showcase-item {
        flex: 1 0 15vw;

        &.selected {
            transform: translateY(-1em);
            /* opacity: 0; */
        }
    }
}
</style>

<style>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
