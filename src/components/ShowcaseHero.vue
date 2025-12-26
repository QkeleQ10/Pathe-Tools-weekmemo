<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import IconRateBad from '../assets/symbols/IconRateBad.vue';
import IconRate from '../assets/symbols/IconRate.vue';
import IconRateHigh from '../assets/symbols/IconRateHigh.vue';
import IconAdded from '../assets/symbols/IconAdded.vue';
import IconNicam16 from '../assets/symbols/IconNicam16.vue';
import IconNicam18 from '../assets/symbols/IconNicam18.vue';
import type { CombinedPatheShow } from '../scripts/types.ts';
import { formatSynopsis, formatDuration, formatDate, formatSentenceCase } from './ShowcaseItem.vue';

const props = defineProps<{
    movie: CombinedPatheShow;
}>();

const cumulativeFeeling = computed(() => (props.movie.details.feelings.countEmotionDisappointed + props.movie.details.feelings.countEmotionLike + props.movie.details.feelings.countEmotionLove))

const transitionDelayMultiplier = ref(1);
onMounted(() => setTimeout(() => {
    transitionDelayMultiplier.value = 0;
}, 2000));
</script>

<template>
    <div class="showcase-hero" :key="movie.slug">
        <div class="image" :style="{ backgroundImage: `url(${movie.posterPath.lg})` }" alt="Movie Poster"></div>
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
                <em>Releasedatum: {{ movie.releaseAt?.[0] ? formatDate(movie.releaseAt[0]) : '' }}</em>
            </p>
            <div class="plot-wrapper">
                <p class="plot">{{ formatSynopsis(movie.details.synopsis) }}</p>
            </div>
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
</template>

<style scoped>
.showcase-hero {
    --accent: transparent;

    position: relative;
    overflow: hidden;

    display: grid;
    grid-template:
        "image title" auto
        "image details" 1fr
        / auto 1fr;
    gap: 2vh 3vw;

    font-size: 4rem;

    .image {
        grid-area: image;
        max-width: 100%;
        max-height: 100%;
        aspect-ratio: 2 / 3;
        background-size: 100% 100%;
        background-position: center;
        border-radius: .25vmax;
        outline: 1px solid #fff3;
        box-shadow: .1em .1em 1em rgba(0, 0, 0, 0.25);

        z-index: 1;
    }

    .title {
        grid-area: title;
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        font: 500 1.25em "Trade Gothic Bold Condensed 20", Arial, Helvetica, sans-serif;
        text-transform: uppercase;

        z-index: 1;
    }

    .details {
        grid-area: details;
        display: grid;
        grid-template-rows: auto auto 1fr auto;
        height: 100%;
        overflow: hidden;

        z-index: 1;

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
}
</style>