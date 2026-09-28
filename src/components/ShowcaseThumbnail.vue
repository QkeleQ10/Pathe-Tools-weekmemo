<script setup lang="ts">
import { format, parse } from 'date-fns';
import { nl } from 'date-fns/locale';
import IconNicam16 from '../assets/symbols/IconNicam16.vue';
import IconNicam18 from '../assets/symbols/IconNicam18.vue';
import type { CombinedPatheShow } from '../scripts/types.ts';

defineProps<{
    movie: CombinedPatheShow;
    selected?: boolean;
}>();
</script>

<script lang="ts">
export function formatDuration(minutes: number): string {
    return minutes < 60 ? `${minutes}` : `${Math.floor(minutes / 60)}h${minutes % 60 ? `${String(minutes % 60).padStart(2, '0')}` : ''}`;
}

export function formatDate(date: string) {
    try {
        // Parse the input date string (assuming "YYYY-MM-DD" format)
        const parsedDate = parse(date, 'yyyy-MM-dd', new Date());

        // Format the date according to the specified pattern and locale
        return format(parsedDate, 'd MMMM yyyy', { locale: nl });
    } catch (error) {
        console.error('Error formatting date:', error);
        return date; // Return original string if parsing fails
    }
}

export function formatSentenceCase(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatSynopsis(synopsis: string): string {
    return synopsis.replace(/<br\s*\/?>/g, '\n');
}
</script>

<template>
    <div class="showcase-thumbnail" :class="{ selected }" :key="movie.slug"
        :style="{ '--accent': movie.backgroundDominantColor }">

        <div class="image">
            <Transition name="fade">
                <div v-if="selected" class="poster">
                    <img :src="movie.posterPath.lg">
                </div>
                <div v-else class="background">
                    <img :src="movie.backgroundPath.lg">
                </div>
            </Transition>
        </div>

        <div class="details">
            <div class="icons">
                <IconNicam16 v-if="movie.contentRating.ref === '-16ans'" />
                <IconNicam18 v-if="movie.contentRating.ref === '-18ans'" />
            </div>
            <h4 class="title">
                {{ movie.title }}
            </h4>
            <p class="metadata">
                {{ movie.theatreShow?.next24ShowtimesCount }}x
                &bull;
                {{ formatSentenceCase(movie.genres.join(', ').toLowerCase()) }}
                &bull;
                {{ movie.releaseAt?.['NL_NL'] ? formatDate(movie.releaseAt['NL_NL'] ?? '') : '' }}
            </p>
        </div>

    </div>
</template>

<style scoped>
.showcase-thumbnail {
    scroll-margin: 2em 3em;
    cursor: pointer;

    &.selected {
        .image {
            aspect-ratio: 3 / 4;
        }
    }
}

.image {
    width: 100%;
    aspect-ratio: 16 / 9;
    border-radius: 0.5em;
    overflow: hidden;
    position: relative;

    box-shadow: .1em .1em 1em rgba(0, 0, 0, 0.25);

    transition: aspect-ratio 400ms ease;

    .background,
    .poster {
        width: 100%;
        height: 100%;
    }

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
}

.title {
    margin: 0.75em 0 0;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.metadata {
    margin: 0;

    font-size: 0.75em;
    color: #ffffffaa;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.icons {
    float: right;

    svg {
        height: 1.3em;
        vertical-align: -0.25em;
        fill: currentColor;
    }
}
</style>