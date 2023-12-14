<script setup>
import { ref } from "vue"
import { launch } from '../game/game.js';

const showButton = ref(true);

function handleClickStart() {
    showButton.value = false;

    launch();
}

</script>
<template>
    <div id="game">
        <button v-if="showButton" @click="handleClickStart">Start</button>
    </div>
</template>
<style scoped>
#game {
    height: 100vh;
    width: 100%
}
</style>
