<script setup>
import {onUnmounted, ref} from "vue"

const initialTime = 60;
const timeLeft = ref(initialTime);
var timer = ref(null);

function startTime() {
    clearInterval(timer.value);
    timeLeft.value = initialTime;

    timer.value = setInterval(() => {
        if (timeLeft.value > 0) {
            timeLeft.value -= 1;
        } else {
            clearInterval(timer)
            timer=null;
            // logic for finished time
        }
    }, 1000);
}

onUnmounted(()=> {
    if (timer.value) {
        clearInterval(timer.value);
    }
})

</script>
<template>
    <h1 id="timer">{{ timeLeft }}</h1>
    <span id="question"></span>
    <input id="user-input">
    <button id="start-button" @click="startTime">Start</button>
</template>
<style>
</style>
