<script setup lang="ts">
import { ref } from 'vue';
import { format } from 'date-fns';
import FilmsShowcase from './FilmsShowcase.vue';
import Loader from './Loader.vue';

const now = ref(new Date());
setInterval(() => {
    now.value = new Date();
}, 1000);
</script>

<template>
    <main id="slides">
        <Transition name="slide">
            <KeepAlive>
                <Suspense>
                    <FilmsShowcase />
                    <template #fallback>
                        <div class="centre">
                            <Loader />
                        </div>
                    </template>
                </Suspense>
            </KeepAlive>
        </Transition>
    </main>
    <span id="clock">
        {{ format(now, 'HH:mm:ss') }}
    </span>
</template>

<style scoped>
#slides {
    position: fixed;
    inset: 0;
    overflow: hidden;

    .slide {
        box-sizing: border-box;
    }
}

#clock {
    position: absolute;
    top: 16px;
    right: 16px;
    color: #ffffffb3;
    font-size: 1.2em;
}

.centre {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
}

.slide-enter-active,
.slide-leave-active {
    position: absolute;
    transition: all 0.5s;
}

.slide-enter-from {
    transform: translateX(20%);
    opacity: 0;
}

.slide-enter-to {
    transform: none;
    opacity: 1;
}

.slide-leave-to {
    transform: scale(0.9);
    opacity: 0;
}
</style>