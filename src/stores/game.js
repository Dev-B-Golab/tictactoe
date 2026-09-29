import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'tictactoe:state'

const emptyScores = () => ({ player1: 0, player2: 0, draws: 0 })

const loadState = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (saved && typeof saved === 'object') return saved
  } catch {
    // Storage unavailable or corrupted - fall back to defaults
  }
  return {}
}

export const useGameStore = defineStore('game', () => {
  const saved = loadState()

  const player1Name = ref(saved.player1Name ?? '')
  const player2Name = ref(saved.player2Name ?? '')
  const gameMode = ref(saved.gameMode ?? 'bot') // 'bot' or 'pvp'
  const difficulty = ref(saved.difficulty ?? 'medium') // 'easy', 'medium', 'hard', 'impossible'
  const scores = ref({ ...emptyScores(), ...saved.scores })

  const hasSettings = computed(() => player1Name.value !== '')
  const displayName1 = computed(() => player1Name.value || 'Player 1')
  const displayName2 = computed(() => player2Name.value || (gameMode.value === 'bot' ? 'CPU' : 'Player 2'))

  const setGameSettings = (settings) => {
    player1Name.value = settings.player1Name
    player2Name.value = settings.player2Name
    gameMode.value = settings.gameMode
    difficulty.value = settings.difficulty
    // Reset scores when starting new game session
    scores.value = emptyScores()
  }

  const incrementScore = (player) => {
    if (player === 'player1') scores.value.player1++
    else if (player === 'player2') scores.value.player2++
    else if (player === 'draw') scores.value.draws++
  }

  const resetScores = () => {
    scores.value = emptyScores()
  }

  watch(
    [player1Name, player2Name, gameMode, difficulty, scores],
    () => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          player1Name: player1Name.value,
          player2Name: player2Name.value,
          gameMode: gameMode.value,
          difficulty: difficulty.value,
          scores: scores.value
        }))
      } catch {
        // Ignore quota / private mode errors
      }
    },
    { deep: true, flush: 'sync' }
  )

  return {
    player1Name,
    player2Name,
    gameMode,
    difficulty,
    scores,
    hasSettings,
    displayName1,
    displayName2,
    setGameSettings,
    incrementScore,
    resetScores
  }
})
