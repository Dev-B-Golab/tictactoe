<script setup>
import { ref, nextTick } from 'vue'
import { useGameStore } from '../stores/game'
import { useRouter } from 'vue-router'

const store = useGameStore()
const router = useRouter()

// Pre-fill with the previous session so "Main Menu" -> replay is quick
const step = ref(1) // 1: mode selection, 2: name input, 3: difficulty (for vs bot)
const gameMode = ref('') // 'bot' or 'pvp'
const player1Name = ref(store.player1Name)
const player2Name = ref(store.gameMode === 'pvp' ? store.player2Name : '')
const difficulty = ref(store.difficulty)
const error = ref('')
const player1Input = ref(null)

const selectMode = async (mode) => {
  gameMode.value = mode
  error.value = ''
  step.value = 2
  await nextTick()
  player1Input.value?.focus()
}

const goBack = () => {
  step.value = step.value - 1
  error.value = ''
}

const submitNames = () => {
  if (player1Name.value.trim() === '') {
    error.value = 'Player 1 name is required!'
    return
  }
  
  if (gameMode.value === 'pvp' && player2Name.value.trim() === '') {
    error.value = 'Player 2 name is required!'
    return
  }
  
  if (gameMode.value === 'bot') {
    step.value = 3
  } else {
    startGame()
  }
}

const startGame = () => {
  store.setGameSettings({
    player1Name: player1Name.value.trim(),
    player2Name: gameMode.value === 'pvp' ? player2Name.value.trim() : 'CPU',
    gameMode: gameMode.value,
    difficulty: difficulty.value
  })
  
  router.push({ name: 'Game' })
}

const difficulties = [
  { id: 'easy', name: 'Easy', icon: '🌱', desc: 'Random moves', color: 'green' },
  { id: 'medium', name: 'Medium', icon: '⚡', desc: 'Basic strategy', color: 'yellow' },
  { id: 'hard', name: 'Hard', icon: '🔥', desc: 'Smart AI', color: 'red' },
  { id: 'impossible', name: 'Impossible', icon: '💀', desc: 'Unbeatable', color: 'pink' }
]
</script>

<template>
  <main class="home-view">
    <div class="particles" aria-hidden="true">
      <div class="particle" v-for="n in 20" :key="n"></div>
    </div>
    
    <!-- Step 1: Mode Selection -->
    <div v-if="step === 1" class="arcade-card mode-selection">
      <h2 class="section-title">SELECT MODE</h2>
      <div class="mode-buttons">
        <button class="arcade-btn cyan mode-btn" @click="selectMode('bot')">
          <span class="mode-icon" aria-hidden="true">🤖</span>
          <span class="mode-text">VS Computer</span>
          <span class="mode-desc">Challenge the AI</span>
        </button>
        <button class="arcade-btn pink mode-btn" @click="selectMode('pvp')">
          <span class="mode-icon" aria-hidden="true">👥</span>
          <span class="mode-text">2 Players</span>
          <span class="mode-desc">Play with a friend</span>
        </button>
      </div>
    </div>

    <!-- Step 2: Name Input -->
    <div v-if="step === 2" class="arcade-card name-input">
      <button class="back-btn" @click="goBack">← Back</button>
      <h2 class="section-title">ENTER NAMES</h2>
      
      <div class="input-group">
        <label class="input-label" for="player1-name">
          <span class="player-indicator p1">P1</span> Player 1
        </label>
        <input
          id="player1-name"
          ref="player1Input"
          type="text"
          class="arcade-input"
          v-model="player1Name"
          placeholder="Enter name..."
          maxlength="12"
          autocomplete="off"
          :enterkeyhint="gameMode === 'pvp' ? 'next' : 'go'"
          @keyup.enter="submitNames"
        >
      </div>
      
      <div v-if="gameMode === 'pvp'" class="input-group">
        <label class="input-label" for="player2-name">
          <span class="player-indicator p2">P2</span> Player 2
        </label>
        <input
          id="player2-name"
          type="text"
          class="arcade-input pink"
          v-model="player2Name"
          placeholder="Enter name..."
          maxlength="12"
          autocomplete="off"
          enterkeyhint="go"
          @keyup.enter="submitNames"
        >
      </div>
      
      <p v-if="error" class="error-message" role="alert">⚠️ {{ error }}</p>
      
      <button class="arcade-btn filled" @click="submitNames">
        {{ gameMode === 'pvp' ? '🎮 START GAME' : 'NEXT →' }}
      </button>
    </div>

    <!-- Step 3: Difficulty Selection (Bot mode only) -->
    <div v-if="step === 3" class="arcade-card difficulty-selection">
      <button class="back-btn" @click="goBack">← Back</button>
      <h2 class="section-title">SELECT DIFFICULTY</h2>
      
      <div class="difficulty-grid">
        <button 
          v-for="diff in difficulties" 
          :key="diff.id"
          class="difficulty-btn"
          :class="[diff.color, { active: difficulty === diff.id }]"
          :aria-pressed="difficulty === diff.id"
          @click="difficulty = diff.id"
        >
          <span class="diff-icon" aria-hidden="true">{{ diff.icon }}</span>
          <span class="diff-name">{{ diff.name }}</span>
          <span class="diff-desc">{{ diff.desc }}</span>
        </button>
      </div>
      
      <button class="arcade-btn filled" @click="startGame">
        🎮 START BATTLE
      </button>
    </div>
  </main>
</template>

<style scoped>
.home-view {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  position: relative;
}

.particles {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: var(--primary-color);
  border-radius: 50%;
  animation: floatParticle 15s infinite linear;
  opacity: 0;
  top: 100vh;
}

.particle:nth-child(odd) {
  background: var(--secondary-color);
}

.particle:nth-child(3n) {
  background: var(--accent-color);
}

@keyframes floatParticle {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 0;
  }
  5% {
    opacity: 0.3;
  }
  95% {
    opacity: 0.3;
  }
  100% {
    transform: translateY(-200vh) rotate(720deg);
    opacity: 0;
  }
}

.particle:nth-child(1) { left: 5%; animation-delay: 0s; animation-duration: 12s; }
.particle:nth-child(2) { left: 10%; animation-delay: 1s; animation-duration: 14s; }
.particle:nth-child(3) { left: 15%; animation-delay: 2s; animation-duration: 11s; }
.particle:nth-child(4) { left: 20%; animation-delay: 3s; animation-duration: 16s; }
.particle:nth-child(5) { left: 25%; animation-delay: 4s; animation-duration: 13s; }
.particle:nth-child(6) { left: 30%; animation-delay: 5s; animation-duration: 15s; }
.particle:nth-child(7) { left: 35%; animation-delay: 0.5s; animation-duration: 12s; }
.particle:nth-child(8) { left: 40%; animation-delay: 1.5s; animation-duration: 14s; }
.particle:nth-child(9) { left: 45%; animation-delay: 2.5s; animation-duration: 11s; }
.particle:nth-child(10) { left: 50%; animation-delay: 3.5s; animation-duration: 16s; }
.particle:nth-child(11) { left: 55%; animation-delay: 4.5s; animation-duration: 13s; }
.particle:nth-child(12) { left: 60%; animation-delay: 5.5s; animation-duration: 15s; }
.particle:nth-child(13) { left: 65%; animation-delay: 0.2s; animation-duration: 12s; }
.particle:nth-child(14) { left: 70%; animation-delay: 1.2s; animation-duration: 14s; }
.particle:nth-child(15) { left: 75%; animation-delay: 2.2s; animation-duration: 11s; }
.particle:nth-child(16) { left: 80%; animation-delay: 3.2s; animation-duration: 16s; }
.particle:nth-child(17) { left: 85%; animation-delay: 4.2s; animation-duration: 13s; }
.particle:nth-child(18) { left: 90%; animation-delay: 5.2s; animation-duration: 15s; }
.particle:nth-child(19) { left: 95%; animation-delay: 0.7s; animation-duration: 12s; }
.particle:nth-child(20) { left: 3%; animation-delay: 2.7s; animation-duration: 14s; }

.arcade-card {
  position: relative;
  z-index: 1;
  animation: slideIn 0.5s ease;
  width: 100%;
  max-width: 460px;
}

.section-title {
  font-family: 'Press Start 2P', cursive;
  font-size: 18px;
  margin-bottom: 30px;
  text-align: center;
  color: var(--accent-color);
  text-shadow: 0 0 20px var(--accent-color);
}

.back-btn {
  position: absolute;
  top: 8px;
  left: 8px;
  min-height: 44px;
  padding: 0 12px;
  background: transparent;
  border: none;
  color: var(--primary-color);
  font-family: 'Orbitron', sans-serif;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover,
.back-btn:focus-visible {
  color: var(--accent-color);
  text-shadow: 0 0 10px var(--accent-color);
}

/* Mode Selection */
.mode-buttons {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.mode-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 25px;
  min-height: 120px;
}

.mode-icon {
  font-size: 40px;
  margin-bottom: 10px;
}

.mode-text {
  font-size: 18px;
  margin-bottom: 5px;
}

.mode-desc {
  font-size: 10px;
  opacity: 0.7;
  text-transform: none;
  letter-spacing: 1px;
}

/* Name Input */
.name-input {
  padding-top: 50px;
}

.input-group {
  margin-bottom: 25px;
}

.input-label {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  font-size: 14px;
}

.player-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 5px;
  font-size: 12px;
  font-weight: bold;
}

.player-indicator.p1 {
  background: var(--primary-color);
  color: #000;
  box-shadow: 0 0 10px var(--primary-color);
}

.player-indicator.p2 {
  background: var(--secondary-color);
  color: #000;
  box-shadow: 0 0 10px var(--secondary-color);
}

.arcade-input {
  display: block;
  margin: 0 auto;
  max-width: none;
}

.error-message {
  color: var(--computer-color);
  text-align: center;
  margin-bottom: 20px;
  animation: shake 0.5s ease;
}

.name-input .arcade-btn {
  display: block;
  width: 100%;
  margin-top: 10px;
}

/* Difficulty Selection */
.difficulty-selection {
  padding-top: 50px;
}

.difficulty-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 25px;
}

.difficulty-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 15px;
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Orbitron', sans-serif;
}

.difficulty-btn.green {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.difficulty-btn.yellow {
  border-color: var(--player2-color);
  color: var(--player2-color);
}

.difficulty-btn.red {
  border-color: var(--computer-color);
  color: var(--computer-color);
}

.difficulty-btn.pink {
  border-color: var(--secondary-color);
  color: var(--secondary-color);
}

.difficulty-btn:not(.active) {
  opacity: 0.75;
}

.difficulty-btn.active {
  transform: scale(1.05);
  opacity: 1;
}

.difficulty-btn:focus-visible {
  outline: 3px solid var(--accent-color);
  outline-offset: 3px;
}

.difficulty-btn.green.active {
  box-shadow: var(--glow-green);
  background: rgba(0, 255, 136, 0.1);
}

.difficulty-btn.yellow.active {
  box-shadow: var(--glow-yellow);
  background: rgba(255, 170, 0, 0.1);
}

.difficulty-btn.red.active {
  box-shadow: var(--glow-red);
  background: rgba(255, 51, 102, 0.1);
}

.difficulty-btn.pink.active {
  box-shadow: var(--glow-pink);
  background: rgba(255, 0, 255, 0.1);
}

@media (hover: hover) {
  .difficulty-btn:hover {
    opacity: 1;
    transform: scale(1.05);
  }
}

.diff-icon {
  font-size: 30px;
  margin-bottom: 8px;
}

.diff-name {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 5px;
}

.diff-desc {
  font-size: 10px;
  opacity: 0.8;
}

.difficulty-selection .arcade-btn {
  display: block;
  width: 100%;
}

@media (max-width: 500px) {
  .arcade-card {
    padding: 20px 16px;
  }

  .name-input,
  .difficulty-selection {
    padding-top: 56px;
  }

  .section-title {
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 24px;
  }

  .mode-buttons {
    gap: 14px;
  }

  .mode-btn {
    padding: 18px 12px;
    min-height: 0;
  }

  .mode-icon {
    font-size: 30px;
  }

  .mode-text {
    font-size: 15px;
  }

  .difficulty-grid {
    gap: 10px;
  }

  .difficulty-btn {
    padding: 14px 8px;
  }

  .diff-icon {
    font-size: 24px;
  }

  .diff-name {
    font-size: 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .particles {
    display: none;
  }
}
</style>
