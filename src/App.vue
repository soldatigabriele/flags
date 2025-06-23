<template>
  <div id="app">
    <FlagGame />
  </div>
</template>

<script>
import FlagGame from './components/FlagGame.vue'

export default {
  name: 'App',
  components: {
    FlagGame
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
