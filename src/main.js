import { createApp } from 'vue'
import { createStore } from 'vuex'
import App from './App.vue'
import router from './router'

const store = createStore({
    state() {
      return {
        player1Name: '',
        player2Name: '',
        gameMode: 'bot', // 'bot' or 'pvp'
        difficulty: 'medium', // 'easy', 'medium', 'hard', 'impossible'
        scores: {
          player1: 0,
          player2: 0,
          draws: 0
        }
      }
    },
    mutations: {
      setGameSettings(state, { player1Name, player2Name, gameMode, difficulty }) {
        state.player1Name = player1Name
        state.player2Name = player2Name
        state.gameMode = gameMode
        state.difficulty = difficulty
        // Reset scores when starting new game session
        state.scores = { player1: 0, player2: 0, draws: 0 }
      },
      incrementScore(state, player) {
        if (player === 'player1') state.scores.player1++
        else if (player === 'player2') state.scores.player2++
        else if (player === 'draw') state.scores.draws++
      },
      resetScores(state) {
        state.scores = { player1: 0, player2: 0, draws: 0 }
      }
    },
    getters: {
      getPlayer1Name: (state) => state.player1Name || 'Player 1',
      getPlayer2Name: (state) => state.player2Name || 'Player 2',
      getGameMode: (state) => state.gameMode,
      getDifficulty: (state) => state.difficulty,
      getScores: (state) => state.scores
    }
  })

const app = createApp(App)

app.use(router)

app.use(store)

app.mount('#app')
