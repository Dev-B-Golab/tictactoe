<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { useGameStore } from '../stores/game'
import { useRouter } from 'vue-router'
import {
  createBoard,
  getWinningLine,
  isBoardFull,
  getBotMove,
  otherMark
} from '../game/logic'

const BOT_MARK = 'O'
const BOT_DELAYS = { easy: 300, medium: 500, hard: 500, impossible: 800 }
const DIFFICULTY_LABELS = {
  easy: '🌱 EASY',
  medium: '⚡ MEDIUM',
  hard: '🔥 HARD',
  impossible: '💀 IMPOSSIBLE'
}

const store = useGameStore()
const router = useRouter()

const squares = ref(createBoard())
const startingPlayer = ref('X')
const currentPlayer = ref('X')
const winningCells = ref([])
const winnerMark = ref(null)
const draw = ref(false)
const isThinking = ref(false)
let botTimer = null

const {
  gameMode,
  difficulty,
  scores,
  displayName1: player1Name,
  displayName2: player2Name
} = storeToRefs(store)

const nameFor = (mark) => (mark === 'X' ? player1Name.value : player2Name.value)
const currentPlayerName = computed(() => nameFor(currentPlayer.value))
const winnerName = computed(() => (winnerMark.value ? nameFor(winnerMark.value) : ''))
const gameOver = computed(() => winnerMark.value !== null || draw.value)
const isBotTurn = computed(() => gameMode.value === 'bot' && currentPlayer.value === BOT_MARK)
const difficultyLabel = computed(() => DIFFICULTY_LABELS[difficulty.value] || DIFFICULTY_LABELS.medium)

const canMove = (index) => !squares.value[index] && !gameOver.value && !isBotTurn.value

const cellLabel = (index) => {
  const row = Math.floor(index / 3) + 1
  const col = (index % 3) + 1
  return `Row ${row}, column ${col}: ${squares.value[index] || 'empty'}`
}

const clearBotTimer = () => {
  clearTimeout(botTimer)
  botTimer = null
  isThinking.value = false
}

// Places a mark and resolves win/draw; returns true when the game continues
const placeMark = (index, mark) => {
  squares.value[index] = mark

  const line = getWinningLine(squares.value)
  if (line) {
    winningCells.value = line
    winnerMark.value = mark
    store.incrementScore(mark === 'X' ? 'player1' : 'player2')
    return false
  }

  if (isBoardFull(squares.value)) {
    draw.value = true
    store.incrementScore('draw')
    return false
  }

  currentPlayer.value = otherMark(mark)
  return true
}

const scheduleBotMove = () => {
  isThinking.value = true
  botTimer = setTimeout(() => {
    botTimer = null
    isThinking.value = false
    const move = getBotMove(squares.value, difficulty.value, BOT_MARK)
    if (move !== null) placeMark(move, BOT_MARK)
  }, BOT_DELAYS[difficulty.value] ?? 500)
}

const makeMove = (index) => {
  if (!canMove(index)) return
  if (placeMark(index, currentPlayer.value) && isBotTurn.value) {
    scheduleBotMove()
  }
}

const startRound = () => {
  clearBotTimer()
  squares.value = createBoard()
  winningCells.value = []
  winnerMark.value = null
  draw.value = false
  currentPlayer.value = startingPlayer.value
  if (isBotTurn.value) scheduleBotMove()
}

const resetGame = () => {
  // Alternate who opens each round so neither side keeps the first-move advantage
  startingPlayer.value = otherMark(startingPlayer.value)
  startRound()
}

const resetScores = () => {
  store.resetScores()
  startingPlayer.value = 'X'
  startRound()
}

const goHome = () => {
  clearBotTimer()
  router.push({ name: 'main' })
}

onBeforeUnmount(clearBotTimer)
</script>

<template>
  <div class="game-container">
    <!-- Difficulty indicator for bot mode -->
    <div v-if="gameMode === 'bot'" class="difficulty-badge" :class="difficulty">
      {{ difficultyLabel }}
    </div>

    <!-- Scoreboard -->
    <div class="scoreboard">
      <div class="score-item p1" :class="{ active: currentPlayer === 'X' && !gameOver }">
        <span class="score-name" :title="player1Name">{{ player1Name }}</span>
        <span class="score-mark">X</span>
        <span class="score-value">{{ scores.player1 }}</span>
      </div>
      <div class="score-item draws">
        <span class="score-name">Draws</span>
        <span class="score-mark">—</span>
        <span class="score-value">{{ scores.draws }}</span>
      </div>
      <div class="score-item p2" :class="{ active: currentPlayer === 'O' && !gameOver }">
        <span class="score-name" :title="player2Name">{{ player2Name }}</span>
        <span class="score-mark">O</span>
        <span class="score-value">{{ scores.player2 }}</span>
      </div>
    </div>

    <!-- Status Message -->
    <div class="status" aria-live="polite">
      <h2 v-if="winnerMark" class="winner-text">
        <span class="trophy" aria-hidden="true">🏆</span>
        {{ winnerName }} WINS!
      </h2>
      <h2 v-else-if="draw" class="draw-text">
        <span aria-hidden="true">🤝</span>
        IT'S A DRAW!
      </h2>
      <h2 v-else class="turn-text">
        <span :class="currentPlayer === 'X' ? 'p1-turn' : 'p2-turn'">
          {{ currentPlayerName }}'s turn
        </span>
        <span v-if="isThinking" class="thinking" aria-hidden="true">
          <span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>
        </span>
      </h2>
    </div>

    <!-- Game Board -->
    <div class="board-wrapper">
      <div class="board-glow" aria-hidden="true"></div>
      <div class="game-board" :class="currentPlayer === 'X' ? 'turn-x' : 'turn-o'">
        <button
          v-for="(cell, index) in squares"
          :key="index"
          type="button"
          class="cell"
          :class="{
            'cell-x': cell === 'X',
            'cell-o': cell === 'O',
            'cell-win': winningCells.includes(index),
            'cell-disabled': !canMove(index)
          }"
          :aria-label="cellLabel(index)"
          :aria-disabled="!canMove(index)"
          @click="makeMove(index)"
        >
          <span v-if="cell" class="cell-content pop-in">{{ cell }}</span>
          <span v-else class="cell-hover" aria-hidden="true">{{ currentPlayer }}</span>
        </button>
      </div>
    </div>

    <!-- Controls -->
    <div class="controls">
      <button class="arcade-btn cyan" :class="{ 'attention': gameOver }" @click="resetGame">
        <span aria-hidden="true">🔄</span> New Round
      </button>
      <button class="arcade-btn pink" @click="goHome">
        <span aria-hidden="true">🏠</span> Menu
      </button>
    </div>

    <button class="text-btn" @click="resetScores">Reset score</button>
  </div>
</template>

<style scoped>
.game-container {
  /* Board takes whatever height is left after header, scores and controls,
     so the buttons stay on screen on short phones */
  --board-chrome: 440px;
  --board-size: min(92vw, 380px, max(220px, 100vh - var(--board-chrome)));
  --board-size: min(92vw, 380px, max(220px, 100dvh - var(--board-chrome)));

  display: flex;
  flex-direction: column;
  align-items: center;
  animation: slideIn 0.5s ease;
}

/* Difficulty Badge */
.difficulty-badge {
  padding: 6px 16px;
  margin-bottom: 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  letter-spacing: 1px;
  background: var(--card-bg);
  border: 2px solid;
}

.difficulty-badge.easy {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.difficulty-badge.medium {
  border-color: var(--player2-color);
  color: var(--player2-color);
}

.difficulty-badge.hard {
  border-color: var(--computer-color);
  color: var(--computer-color);
}

.difficulty-badge.impossible {
  border-color: var(--secondary-color);
  color: var(--secondary-color);
  animation: neonBlink 1s infinite;
}

/* Scoreboard */
.scoreboard {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  width: 100%;
  max-width: 440px;
}

.score-item {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 14px 10px;
  background: var(--card-bg);
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.score-item.p1 {
  border-color: rgba(0, 255, 136, 0.3);
}

.score-item.p1.active {
  border-color: var(--primary-color);
  box-shadow: var(--glow-green);
}

.score-item.p2 {
  border-color: rgba(255, 0, 255, 0.3);
}

.score-item.p2.active {
  border-color: var(--secondary-color);
  box-shadow: var(--glow-pink);
}

.score-item.draws {
  border-color: rgba(0, 255, 255, 0.3);
}

.score-name {
  max-width: 100%;
  font-size: 12px;
  opacity: 0.7;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.score-mark {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.score-item.p1 .score-mark {
  color: var(--primary-color);
  text-shadow: 0 0 10px var(--primary-color);
}

.score-item.p2 .score-mark {
  color: var(--secondary-color);
  text-shadow: 0 0 10px var(--secondary-color);
}

.score-item.draws .score-mark {
  color: var(--accent-color);
}

.score-value {
  font-size: 24px;
  font-family: 'Press Start 2P', cursive;
}

/* Status */
.status {
  min-height: 2.5em;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.status h2 {
  font-size: 20px;
  font-family: 'Orbitron', sans-serif;
  margin: 0;
  overflow-wrap: anywhere;
}

.winner-text {
  color: var(--winner-color);
  animation: winPulse 0.5s ease infinite alternate;
  text-shadow: 0 0 20px var(--winner-color);
}

.trophy {
  display: inline-block;
  animation: bounce 0.5s ease infinite alternate;
}

@keyframes bounce {
  from { transform: translateY(0); }
  to { transform: translateY(-10px); }
}

@keyframes winPulse {
  from { transform: scale(1); }
  to { transform: scale(1.05); }
}

.draw-text {
  color: var(--accent-color);
  text-shadow: 0 0 20px var(--accent-color);
}

.p1-turn {
  color: var(--primary-color);
  text-shadow: 0 0 10px var(--primary-color);
}

.p2-turn {
  color: var(--secondary-color);
  text-shadow: 0 0 10px var(--secondary-color);
}

.thinking {
  color: var(--secondary-color);
}

.thinking .dot {
  animation: blink 1s infinite;
  font-size: 24px;
}

.thinking .dot:nth-child(2) { animation-delay: 0.2s; }
.thinking .dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes blink {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}

/* Game Board */
.board-wrapper {
  position: relative;
  margin: 12px 0 20px;
}

.board-glow {
  position: absolute;
  inset: -10%;
  background: radial-gradient(circle, rgba(0, 255, 136, 0.2) 0%, transparent 70%);
  filter: blur(30px);
  z-index: 0;
  pointer-events: none;
}

.game-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: calc(var(--board-size) * 0.03);
  width: var(--board-size);
  height: var(--board-size);
  padding: calc(var(--board-size) * 0.04);
  background: var(--card-bg);
  border-radius: 15px;
  border: 2px solid rgba(0, 255, 136, 0.3);
  position: relative;
  z-index: 1;
}

.cell {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  min-height: 0;
  padding: 0;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(0, 255, 136, 0.3);
  border-radius: 10px;
  color: inherit;
  cursor: pointer;
  transition: border-color 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
  position: relative;
  overflow: hidden;
  touch-action: manipulation;
}

.cell:focus-visible {
  outline: 3px solid var(--accent-color);
  outline-offset: 2px;
}

.cell-hover {
  position: absolute;
  font-family: 'Press Start 2P', cursive;
  font-size: calc(var(--board-size) * 0.14);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.turn-x .cell-hover { color: var(--primary-color); }
.turn-o .cell-hover { color: var(--secondary-color); }

@media (hover: hover) {
  .cell:hover:not(.cell-disabled) {
    border-color: var(--primary-color);
    box-shadow: 0 0 15px rgba(0, 255, 136, 0.3);
  }

  .turn-o .cell:hover:not(.cell-disabled) {
    border-color: var(--secondary-color);
    box-shadow: 0 0 15px rgba(255, 0, 255, 0.3);
  }

  .cell:hover:not(.cell-disabled) .cell-hover {
    opacity: 0.3;
  }
}

.cell-content {
  font-size: calc(var(--board-size) * 0.14);
  font-family: 'Press Start 2P', cursive;
  line-height: 1;
}

.cell-x .cell-content {
  color: var(--primary-color);
  text-shadow: 0 0 20px var(--primary-color);
}

.cell-o .cell-content {
  color: var(--secondary-color);
  text-shadow: 0 0 20px var(--secondary-color);
}

.cell-win {
  animation: winCell 0.5s ease infinite alternate;
}

.cell-win.cell-x {
  background: rgba(0, 255, 136, 0.2);
  border-color: var(--primary-color);
}

.cell-win.cell-o {
  background: rgba(255, 0, 255, 0.2);
  border-color: var(--secondary-color);
}

@keyframes winCell {
  from { transform: scale(1); }
  to { transform: scale(1.05); }
}

.cell-disabled {
  cursor: default;
}

.pop-in {
  animation: popIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes popIn {
  from {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }
  to {
    transform: scale(1) rotate(0);
    opacity: 1;
  }
}

/* Controls */
.controls {
  display: flex;
  gap: 15px;
  width: 100%;
  max-width: 440px;
}

.controls .arcade-btn {
  flex: 1 1 0;
  padding-left: 12px;
  padding-right: 12px;
  white-space: nowrap;
}

.arcade-btn.attention {
  animation: pulse 1s ease-in-out infinite;
  box-shadow: var(--glow-cyan);
}

.text-btn {
  margin-top: 14px;
  padding: 10px 16px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-family: 'Orbitron', sans-serif;
  font-size: 12px;
  letter-spacing: 1px;
  text-decoration: underline;
  text-underline-offset: 4px;
  cursor: pointer;
}

.text-btn:hover,
.text-btn:focus-visible {
  color: var(--computer-color);
}

/* Responsive */
@media (max-width: 500px) {
  .game-container {
    --board-chrome: 350px;
  }

  .difficulty-badge {
    margin-bottom: 12px;
    font-size: 11px;
  }

  .scoreboard {
    gap: 8px;
    margin-bottom: 8px;
  }

  .score-item {
    padding: 8px 6px;
  }

  .score-name {
    font-size: 10px;
  }

  .score-mark {
    font-size: 16px;
    margin-bottom: 2px;
  }

  .score-value {
    font-size: 16px;
  }

  .status h2 {
    font-size: 16px;
  }

  .board-wrapper {
    margin: 8px 0 16px;
  }

  .cell {
    border-radius: 8px;
  }

  .controls {
    gap: 10px;
  }
}
</style>
