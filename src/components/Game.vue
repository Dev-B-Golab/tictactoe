<template>
  <div class="game-container">
    <!-- Scoreboard -->
    <div class="scoreboard">
      <div class="score-item p1" :class="{ active: currentPlayer === 'X' && !gameOver }">
        <span class="score-name">{{ player1Name }}</span>
        <span class="score-mark">X</span>
        <span class="score-value">{{ scores.player1 }}</span>
      </div>
      <div class="score-item draws">
        <span class="score-name">Draws</span>
        <span class="score-mark">—</span>
        <span class="score-value">{{ scores.draws }}</span>
      </div>
      <div class="score-item p2" :class="{ active: currentPlayer === 'O' && !gameOver }">
        <span class="score-name">{{ player2Name }}</span>
        <span class="score-mark">O</span>
        <span class="score-value">{{ scores.player2 }}</span>
      </div>
    </div>

    <!-- Status Message -->
    <div class="status">
      <h2 v-if="winner" class="winner-text">
        <span class="trophy">🏆</span>
        {{ winnerName }} WINS!
      </h2>
      <h2 v-else-if="draw" class="draw-text">
        <span class="handshake">🤝</span>
        IT'S A DRAW!
      </h2>
      <h2 v-else class="turn-text">
        <span :class="currentPlayer === 'X' ? 'p1-turn' : 'p2-turn'">
          {{ currentPlayerName }}'s turn
        </span>
        <span v-if="isThinking" class="thinking">
          <span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>
        </span>
      </h2>
    </div>

    <!-- Game Board -->
    <div class="board-wrapper">
      <div class="board-glow"></div>
      <div class="game-board">
        <div 
          v-for="(cell, index) in flatSquares" 
          :key="index"
          class="cell"
          :class="{ 
            'cell-x': cell === 'X',
            'cell-o': cell === 'O',
            'cell-win': winningCells.includes(index),
            'cell-disabled': !canMove(index)
          }"
          @click="makeMove(index)"
        >
          <span v-if="cell" class="cell-content" :class="{ 'pop-in': cell }">
            {{ cell }}
          </span>
          <span v-else class="cell-hover">{{ currentPlayer }}</span>
        </div>
      </div>
    </div>

    <!-- Controls -->
    <div class="controls">
      <button class="arcade-btn cyan" @click="resetGame">
        🔄 New Round
      </button>
      <button class="arcade-btn pink" @click="goHome">
        🏠 Main Menu
      </button>
    </div>

    <!-- Difficulty indicator for bot mode -->
    <div v-if="gameMode === 'bot'" class="difficulty-badge" :class="difficulty">
      {{ difficultyLabel }}
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations, mapGetters } from 'vuex'

export default {
  data() {
    return {
      squares: ['', '', '', '', '', '', '', '', ''],
      currentPlayer: 'X',
      winner: false,
      draw: false,
      winnerName: '',
      winningCells: [],
      isThinking: false
    }
  },
  computed: {
    ...mapState(['gameMode', 'difficulty', 'scores']),
    ...mapGetters(['getPlayer1Name', 'getPlayer2Name']),
    
    player1Name() {
      return this.getPlayer1Name
    },
    player2Name() {
      return this.getPlayer2Name
    },
    currentPlayerName() {
      return this.currentPlayer === 'X' ? this.player1Name : this.player2Name
    },
    flatSquares() {
      return this.squares
    },
    gameOver() {
      return this.winner || this.draw
    },
    difficultyLabel() {
      const labels = {
        easy: '🌱 EASY',
        medium: '⚡ MEDIUM',
        hard: '🔥 HARD',
        impossible: '💀 IMPOSSIBLE'
      }
      return labels[this.difficulty] || 'MEDIUM'
    }
  },
  methods: {
    ...mapMutations(['incrementScore']),
    
    canMove(index) {
      return !this.squares[index] && !this.gameOver && !this.isThinking
    },
    
    makeMove(index) {
      if (!this.canMove(index)) return
      
      // Player move
      this.squares[index] = this.currentPlayer
      
      // Check for winner
      if (this.checkWinner()) {
        this.winner = true
        this.winnerName = this.currentPlayerName
        this.incrementScore(this.currentPlayer === 'X' ? 'player1' : 'player2')
        return
      }
      
      // Check for draw
      if (this.checkDraw()) {
        this.draw = true
        this.incrementScore('draw')
        return
      }
      
      // Switch player
      this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X'
      
      // If playing against bot and it's bot's turn
      if (this.gameMode === 'bot' && this.currentPlayer === 'O') {
        this.isThinking = true
        const delay = this.difficulty === 'easy' ? 300 : this.difficulty === 'impossible' ? 800 : 500
        setTimeout(() => {
          this.botMove()
          this.isThinking = false
        }, delay)
      }
    },
    
    botMove() {
      let move
      
      switch (this.difficulty) {
        case 'easy':
          move = this.getRandomMove()
          break
        case 'medium':
          move = Math.random() > 0.5 ? this.getSmartMove() : this.getRandomMove()
          break
        case 'hard':
          move = this.getSmartMove()
          break
        case 'impossible':
          move = this.getMiniMaxMove()
          break
        default:
          move = this.getSmartMove()
      }
      
      if (move !== null) {
        this.squares[move] = 'O'
        
        if (this.checkWinner()) {
          this.winner = true
          this.winnerName = this.player2Name
          this.incrementScore('player2')
          return
        }
        
        if (this.checkDraw()) {
          this.draw = true
          this.incrementScore('draw')
          return
        }
        
        this.currentPlayer = 'X'
      }
    },
    
    getRandomMove() {
      const available = this.squares
        .map((cell, i) => cell === '' ? i : null)
        .filter(i => i !== null)
      
      if (available.length === 0) return null
      return available[Math.floor(Math.random() * available.length)]
    },
    
    getSmartMove() {
      // Try to win
      const winMove = this.findWinningMove('O')
      if (winMove !== null) return winMove
      
      // Block player
      const blockMove = this.findWinningMove('X')
      if (blockMove !== null) return blockMove
      
      // Take center
      if (this.squares[4] === '') return 4
      
      // Take corner
      const corners = [0, 2, 6, 8]
      const availableCorners = corners.filter(i => this.squares[i] === '')
      if (availableCorners.length > 0) {
        return availableCorners[Math.floor(Math.random() * availableCorners.length)]
      }
      
      // Take any available
      return this.getRandomMove()
    },
    
    getMiniMaxMove() {
      let bestScore = -Infinity
      let bestMove = null
      
      for (let i = 0; i < 9; i++) {
        if (this.squares[i] === '') {
          this.squares[i] = 'O'
          const score = this.minimax(this.squares, 0, false)
          this.squares[i] = ''
          
          if (score > bestScore) {
            bestScore = score
            bestMove = i
          }
        }
      }
      
      return bestMove
    },
    
    minimax(board, depth, isMaximizing) {
      const winner = this.checkWinnerForBoard(board)
      
      if (winner === 'O') return 10 - depth
      if (winner === 'X') return depth - 10
      if (board.every(cell => cell !== '')) return 0
      
      if (isMaximizing) {
        let bestScore = -Infinity
        for (let i = 0; i < 9; i++) {
          if (board[i] === '') {
            board[i] = 'O'
            const score = this.minimax(board, depth + 1, false)
            board[i] = ''
            bestScore = Math.max(score, bestScore)
          }
        }
        return bestScore
      } else {
        let bestScore = Infinity
        for (let i = 0; i < 9; i++) {
          if (board[i] === '') {
            board[i] = 'X'
            const score = this.minimax(board, depth + 1, true)
            board[i] = ''
            bestScore = Math.min(score, bestScore)
          }
        }
        return bestScore
      }
    },
    
    checkWinnerForBoard(board) {
      const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
        [0, 4, 8], [2, 4, 6] // diagonals
      ]
      
      for (const [a, b, c] of lines) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
          return board[a]
        }
      }
      return null
    },
    
    findWinningMove(mark) {
      const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
      ]
      
      for (const line of lines) {
        const values = line.map(i => this.squares[i])
        const markCount = values.filter(v => v === mark).length
        const emptyCount = values.filter(v => v === '').length
        
        if (markCount === 2 && emptyCount === 1) {
          const emptyIndex = values.findIndex(v => v === '')
          return line[emptyIndex]
        }
      }
      return null
    },
    
    checkWinner() {
      const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
      ]
      
      for (const line of lines) {
        const [a, b, c] = line
        if (this.squares[a] && 
            this.squares[a] === this.squares[b] && 
            this.squares[a] === this.squares[c]) {
          this.winningCells = line
          return true
        }
      }
      return false
    },
    
    checkDraw() {
      return this.squares.every(cell => cell !== '')
    },
    
    resetGame() {
      this.squares = ['', '', '', '', '', '', '', '', '']
      this.currentPlayer = 'X'
      this.winner = false
      this.draw = false
      this.winnerName = ''
      this.winningCells = []
      this.isThinking = false
    },
    
    goHome() {
      this.$router.push({ name: 'main' })
    }
  }
}
</script>

<style scoped>
.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  animation: slideIn 0.5s ease;
}

/* Scoreboard */
.scoreboard {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.score-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px 25px;
  background: var(--card-bg);
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  min-width: 100px;
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
  font-size: 12px;
  opacity: 0.7;
  margin-bottom: 5px;
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
  font-size: 28px;
  font-weight: bold;
  font-family: 'Press Start 2P', cursive;
}

/* Status */
.status {
  margin-bottom: 20px;
  text-align: center;
}

.status h2 {
  font-size: 20px;
  font-family: 'Orbitron', sans-serif;
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
  margin: 20px 0;
}

.board-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120%;
  height: 120%;
  background: radial-gradient(circle, rgba(0, 255, 136, 0.2) 0%, transparent 70%);
  filter: blur(30px);
  z-index: 0;
  animation: glowRotate 10s linear infinite;
}

@keyframes glowRotate {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

.game-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 15px;
  background: var(--card-bg);
  border-radius: 15px;
  border: 2px solid rgba(0, 255, 136, 0.3);
  position: relative;
  z-index: 1;
}

.cell {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(0, 255, 136, 0.3);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.cell:hover:not(.cell-disabled) {
  border-color: var(--primary-color);
  box-shadow: 0 0 15px rgba(0, 255, 136, 0.3);
}

.cell:hover:not(.cell-disabled) .cell-hover {
  opacity: 0.3;
}

.cell-hover {
  position: absolute;
  font-size: 50px;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: var(--primary-color);
}

.cell-content {
  font-size: 60px;
  font-weight: bold;
  font-family: 'Press Start 2P', cursive;
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
  cursor: not-allowed;
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
  margin-top: 20px;
}

/* Difficulty Badge */
.difficulty-badge {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
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

/* Responsive */
@media (max-width: 500px) {
  .scoreboard {
    gap: 10px;
  }
  
  .score-item {
    padding: 10px 15px;
    min-width: 80px;
  }
  
  .score-name {
    font-size: 10px;
  }
  
  .score-mark {
    font-size: 18px;
  }
  
  .score-value {
    font-size: 20px;
  }
  
  .cell {
    width: 80px;
    height: 80px;
  }
  
  .cell-content {
    font-size: 40px;
  }
  
  .controls {
    flex-direction: column;
  }
  
  .difficulty-badge {
    top: auto;
    bottom: 20px;
    right: 20px;
  }
}
</style>
