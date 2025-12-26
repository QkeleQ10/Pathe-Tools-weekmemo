<script setup lang="ts">
import { ref } from 'vue';
import type * as types from '@/scripts/types.ts';
import ShowcaseItem from './ShowcaseItem.vue';
import Loader from './Loader.vue';

const sortedMovies = ref<types.CombinedPatheShow[]>([]);

async function populate() {
    sortedMovies.value = (await getShows())
        .filter(movie => movie.theatreShow?.next24ShowtimesCount)
        .sort((a, b) => {
            const dateA = new Date(a.releaseAt[0] ?? '').getTime();
            const dateB = new Date(b.releaseAt[0] ?? '').getTime();
            const freqA = a.theatreShow?.next24ShowtimesCount ?? 0;
            const freqB = b.theatreShow?.next24ShowtimesCount ?? 0;
            return dateB - dateA || freqB - freqA;
        }).slice(0, 6);
    console.log(sortedMovies.value);
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
</script>

<template>
    <div class="slide" id="films-playing" v-if="sortedMovies.length">
        <div id="header">
            <h3>Wat draait er?</h3>
            <small>
                <slot name="date"></slot>
            </small>
        </div>
        <div class="flex" id="grid-top">
            <ShowcaseItem v-for="(movie, i) in sortedMovies.slice(0, 2)" :key="movie.slug" :movie="movie" :i="i" />
        </div>
        <div class="flex" id="grid-bottom">
            <ShowcaseItem v-for="(movie, i) in sortedMovies.slice(2, 6)" :key="movie.slug" :movie="movie" :i="i + 2"
                :minimal="true" />
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
    grid-template-rows: auto 2fr 1fr auto;
    gap: 2.5vh 1.5vw;

    padding: 5vh 5vw 8vh;
    background-color: #090a0b;
    /* background-image: radial-gradient(90% 90% at 0% 100%, #ffffff1a 0%, transparent 100%); */
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

.flex {
    display: flex;
    gap: 1.5vw;
    width: 100%;
    height: 100%;
    overflow: hidden;
    padding: 2em;
    margin: -2em;

    &>* {
        flex: 1 1 0;
    }
}

#grid-top {
    grid-template-columns: 55% 45%;
    grid-auto-rows: 1fr;

    *>*:first-child {
        flex: 1.2 1 0;
    }
}

#grid-bottom {
    grid-auto-columns: 1fr;
    grid-template-rows: 1fr;
}
</style>