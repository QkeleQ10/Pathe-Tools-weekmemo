<script setup lang="ts">
import { computed } from 'vue';
import IconRateBad from '../assets/symbols/IconRateBad.vue';
import IconRate from '../assets/symbols/IconRate.vue';
import IconRateHigh from '../assets/symbols/IconRateHigh.vue';
import IconAdded from '../assets/symbols/IconAdded.vue';
import IconNicam16 from '../assets/symbols/IconNicam16.vue';
import IconNicam18 from '../assets/symbols/IconNicam18.vue';
import type { CombinedPatheShow } from '../scripts/types.ts';
import { formatSynopsis, formatDuration, formatDate, formatSentenceCase } from './ShowcaseThumbnail.vue';

const props = defineProps<{
    movie: CombinedPatheShow;
}>();

const cumulativeFeeling = computed(() => (props.movie.details.feelings.countEmotionDisappointed + props.movie.details.feelings.countEmotionLike + props.movie.details.feelings.countEmotionLove))
</script>

<template>
    <div class="showcase-hero" :key="movie.slug">
        <div :style="{ '--image': `url(${movie.backgroundPath.lg})`, '--accent': movie.backgroundDominantColor }"
            class="background"></div>
        <div class="content-wrapper">
            <div>
                <h2 class="title">{{ movie.title }}
                    <div class="icons">
                        <IconNicam16 v-if="movie.contentRating.ref === '-16ans'" />
                        <IconNicam18 v-if="movie.contentRating.ref === '-18ans'" />
                    </div>
                </h2>
                <p class="metadata">
                    {{ movie.theatreShow?.next24ShowtimesCount }}x
                    &bull;
                    {{ formatDuration(movie.duration) }}
                    &bull;
                    {{ formatSentenceCase(movie.genres.join(', ').toLowerCase()) }}
                    &bull;
                    {{ movie.releaseAt?.['NL_NL'] ? formatDate(movie.releaseAt['NL_NL'] ?? '') : '' }}
                </p>
                <p class="plot">{{ formatSynopsis(movie.details.synopsis) }}</p>
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
.showcase-hero {
    width: 100%;
    height: 100%;
    box-sizing: border-box;

    padding: 7em 3em 19em 25em;

    overflow: hidden;
}

.background {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;

    z-index: -1;
    pointer-events: none;

    filter: blur(0.2em);

    background:
        linear-gradient(to bottom, transparent 70%, #090a0b 90%),
        radial-gradient(ellipse farthest-corner at top, transparent 50%, #090a0b 90%),
        linear-gradient(hsl(from var(--accent) h calc(s * 0.6) calc(l * 0.6) / 0.8)),
        var(--image) no-repeat center/cover;
}

.content-wrapper {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: end;
}

.title {
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    font: 500 4em "Trade Gothic Bold Condensed 20", Arial, Helvetica, sans-serif;
    text-transform: uppercase;
}

.metadata {
    margin: .5em 0 .5em;

    font-size: 1.5em;
    color: #ffffffaa;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.icons {
    display: inline;
    margin-left: 0.25em;

    svg {
        height: 1em;
        vertical-align: -0.15em;
        fill: currentColor;
    }
}

.plot {
    margin-right: 4em;
    text-wrap: pretty;
    font-size: 1.25em;
    line-height: 1.7em;
    max-height: 10em;
    overflow: hidden;
    text-overflow: ellipsis;
}

.feelings {
    display: flex;
    gap: 5px;
    font-size: 1.25em;
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

svg {
    height: 1.3em;
    vertical-align: -0.25em;
    fill: #fff;
}
</style>