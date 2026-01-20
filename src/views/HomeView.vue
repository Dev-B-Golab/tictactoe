<script setup>
import MainContent from '../components/MainContent.vue'
</script>

<template>
  <main class="home-view">
    <div class="welcome-container">
      <h1>Welcome to Tic Tac Toe! 🎮</h1>
      <p>Please enter your nickname to start playing</p>
      <MainContent />
    </div>
  </main>
</template>

<style scoped>
.home-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.welcome-container {
  text-align: center;
}

.welcome-container h1 {
  font-size: 28px;
  margin-bottom: 10px;
}

.welcome-container p {
  opacity: 0.8;
  margin-bottom: 20px;
}
</style>
