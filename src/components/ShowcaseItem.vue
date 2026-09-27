<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { format, parse } from 'date-fns';
import { nl } from 'date-fns/locale';
import IconRateBad from '../assets/symbols/IconRateBad.vue';
import IconRate from '../assets/symbols/IconRate.vue';
import IconRateHigh from '../assets/symbols/IconRateHigh.vue';
import IconAdded from '../assets/symbols/IconAdded.vue';
import IconNicam16 from '../assets/symbols/IconNicam16.vue';
import IconNicam18 from '../assets/symbols/IconNicam18.vue';
import type { CombinedPatheShow } from '../scripts/types.ts';

const props = defineProps<{
    movie: CombinedPatheShow;
    i: number;
    selected?: boolean;
}>();

const cumulativeFeeling = computed(() => (props.movie.details.feelings.countEmotionDisappointed + props.movie.details.feelings.countEmotionLike + props.movie.details.feelings.countEmotionLove))

const transitionDelayMultiplier = ref(1);
onMounted(() => setTimeout(() => {
    transitionDelayMultiplier.value = 0;
}, 2000));
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
    <div class="showcase-item" :class="{ [`i${i}`]: true, selected }" :key="movie.slug"
        :style="{ '--accent': movie.backgroundDominantColor, '--animation-delay': `${(0.15 * i + 0.2) * transitionDelayMultiplier}s` }">
        <div class="image" :style="{ backgroundImage: `url(${movie.posterPath.lg})` }" alt="Movie Poster"></div>

        <div class="content">
            <h4 class="title">{{ movie.title }}</h4>
            <div class="details">
                <p class="metadata miscellaneous"><b>
                        {{ movie.theatreShow?.next24ShowtimesCount }}x &bull; {{ formatDuration(movie.duration)
                        }}
                        &bull; {{ formatSentenceCase(movie.genres.join(', ').toLowerCase()) }}
                    </b>
                    <IconNicam16 v-if="movie.contentRating.ref === '-16ans'" />
                    <IconNicam18 v-if="movie.contentRating.ref === '-18ans'" />
                </p>
                <p class="metadata release">
                    <em>Releasedatum: {{ movie.releaseAt?.['NL_NL'] ? formatDate(movie.releaseAt['NL_NL'] ?? '') : ''
                        }}</em>
                </p>
                <div class="feelings" v-if="cumulativeFeeling > 10">
                    <div class="feeling"
                        :style="{ flexBasis: `${(movie.details.feelings.countEmotionDisappointed + 1) / (cumulativeFeeling + 3) * 100}%` }">
                        <IconRateBad /> {{ movie.details.feelings.countEmotionDisappointed }}
                    </div>
                    <div class="feeling"
                        :style="{ flexBasis: `${(movie.details.feelings.countEmotionLike + 1) / (cumulativeFeeling + 3) * 100}%` }">
                        <IconRate /> {{ movie.details.feelings.countEmotionLike }}
                    </div>
                    <div class="feeling"
                        :style="{ flexBasis: `${(movie.details.feelings.countEmotionLove + 1) / (cumulativeFeeling + 3) * 100}%` }">
                        <IconRateHigh /> {{ movie.details.feelings.countEmotionLove }}
                    </div>
                </div>
                <div class="feelings" v-else>
                    <div>
                        <IconAdded /> {{ movie.details.feelings.countWishList }}x op watchlist
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<style scoped>
.showcase-item {
    --accent: transparent;

    position: relative;
    overflow: hidden;

    display: grid;
    grid-template-columns: 20% 80%;
    column-gap: .6em;

    font-size: 1.7rem;
    background-color: var(--accent);
    border-radius: .3em;
    padding: .4em;
    margin: .5em 1em;
    border: 1px solid #fff3;
    box-shadow: .1em .1em 1em rgba(0, 0, 0, 0.25);

    opacity: 1;
    transform: none;
    overflow: hidden;

    /* Fade-in animation */
    transition: opacity 0.5s ease, transform 0.5s ease, grid-template-columns 500ms, padding 500ms, translate 500ms;
    transition-delay: var(--animation-delay, 0s);

    @starting-style {
        opacity: 0;
        transform: scale(0.95) translateY(20%);
    }

    &.selected {
        grid-template-columns: 100% 0%;
        padding: 0;
        translate: .5em;

        .content {
            opacity: 0;
        }
    }
}

.content {
    display: grid;
    grid-template-rows: auto 1fr;
    overflow: hidden;

    transition: opacity 500ms;
}

.background {
    position: absolute;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: -1;
    mask-image: linear-gradient(to right, rgba(0, 0, 0, .25) 50%, rgba(0, 0, 0, 0) 100%);
}

.image {
    max-width: 100%;
    max-height: 100%;
    aspect-ratio: 2 / 3;
    background-size: 100% 100%;
    background-position: center;
    border-radius: .25vmax;
    outline: 1px solid #fff3;
    box-shadow: .1em .1em 1em rgba(0, 0, 0, 0.25);
}

.title {
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.details {
    display: grid;
    grid-template-rows: auto auto 1fr auto;
    height: 100%;
    overflow: hidden;

    svg {
        height: 1.3em;
        vertical-align: -0.25em;
        fill: #fff;
    }
}

.metadata {
    margin-top: 0;
    margin-bottom: 0;
    font-size: .5em;
    text-overflow: ellipsis;

    em {
        opacity: .6;
        font-style: normal;
    }
}

.miscellaneous {
    margin-bottom: .5em;

    svg {
        margin-left: .5em;
    }
}

.plot-wrapper {
    overflow: hidden;
    mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) calc(100% - 1em), rgba(0, 0, 0, 0) 100%);
}

.plot {
    margin-top: 0.5em;
    margin-bottom: 0.5em;
    font-size: .45em;
}

.feelings {
    display: flex;
    gap: 5px;
    font-size: .45em;
    overflow: hidden;

    .feeling {
        position: relative;
        flex: 1 1 0px;
        overflow: visible;
        text-wrap: nowrap;
        padding-bottom: 5px;

        &::after {
            content: '';
            position: absolute;
            height: 5px;
            bottom: 0;
            left: 0;
            right: 0;
            background-color: #fff;
            border-radius: 50vmax;
        }
    }
}
</style>