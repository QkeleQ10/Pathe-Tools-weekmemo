<script setup lang="ts">
import { ref } from 'vue';
import type * as types from '@/scripts/types.ts';
import ShowcaseItem from './ShowcaseItem.vue';

// gather all films from https://www.pathe.nl/api/shows?language=nl
// filter by slugs that appear in https://www.pathe.nl/api/cinema/pathe-utrecht-leidsche-rijn/shows?language=nl
// expand with https://www.pathe.nl/api/show/<SLUG>?language=nl
// and with https://www.pathe.nl/api/show/<SLUG>/showtimes/pathe-utrecht-leidsche-rijn/<YYYY-MM-DD>?language=nl

const sortedMovies = ref<types.CombinedPatheShow[]>([]);
sortedMovies.value = (await getShows()).sort((a, b) => {
    const freqA = a.showtimes.length;
    const freqB = b.showtimes.length;
    return freqB - freqA;
}).slice(0, 5);

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
</script>

<template>

    <div class="slide" id="films-playing">
        <div id="header">
            <h3>Wat draait er?</h3>
            <small>
                <slot name="date"></slot>
            </small>
        </div>
        <ShowcaseItem v-for="(movie, i) in sortedMovies" :key="movie.slug" :movie="movie" :i="i" />
    </div>

</template>

<style scoped>
#films-playing {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
    grid-template-rows: auto 3fr 2fr auto;
    gap: 2.5%;

    height: 100%;

    padding: 5%;
    background-color: #1b1d23;
    background-image: radial-gradient(90% 90% at 0% 100%, #ffffff1a 0%, transparent 100%);
    background-repeat: no-repeat;
    background-size: 340px 100%;
    color: #ffffff;
    font-size: 1.7rem;
}

#header {
    grid-column: 1 / -1;

    display: flex;
    justify-content: space-between;
    align-items: baseline;
}

h3 {
    font: 2.5em "Special Gothic Condensed One", Arial, Helvetica, sans-serif;
    text-transform: uppercase;
    margin: 0;
}

.showcase-item {
    grid-column: span 3;

    &.i0 {
        grid-column: span 5;
    }

    &.i1 {
        grid-column: span 4;
    }
}
</style>