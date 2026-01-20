<template>
  <div class="game-container">
    <div class="status">
      <h2 v-if="winner" :class="{ youWin: winnerName !== 'Computer' }">
        🎉 Winner: {{ winnerName }}!
      </h2>
      <h2 v-else-if="draw">🤝 Draw! Play again</h2>
      <h2 v-else>
        <span v-if="isPlayerTurn">Your turn, {{ playerName }}!</span>
        <span v-else>Computer is thinking...</span>
      </h2>
    </div>
    
    <div class="boardGame">
      <table class="game-table">
        <tr v-for="(row, x) in squares" :key="x">
          <td 
            v-for="(cell, y) in row" 
            :key="y" 
            class="board" 
            @click="playerMove(x, y)"
            :class="{ 
              computerColor: squares[x][y] === 'O', 
              playerColor: squares[x][y] === 'X',
              disabled: !isPlayerTurn || winner || draw
            }"
          >
            {{ squares[x][y] }}
          </td>
        </tr>
      </table>
    </div>
    
    <button @click="reset" class="btn primaryColor btn-lg reset-btn">
      🔄 New Game
    </button>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data() {
    return {
      playerName: 'Player',
      winnerName: '',
      winner: false,
      draw: false,
      isPlayerTurn: true,
      squares: [
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
      ]
    }
  },
  created() {
    this.playerName = this.nickname !== '' ? this.nickname : 'Player'
  },
  computed: {
    ...mapState(['nickname'])
  },
  methods: {
    playerMove(x, y) {
      // Sprawdź czy ruch jest dozwolony
      if (this.squares[x][y] !== '' || !this.isPlayerTurn || this.winner || this.draw) {
        return
      }

      // Wykonaj ruch gracza
      this.squares[x][y] = 'X'
      
      // Sprawdź wygraną gracza
      if (this.checkWinner('X')) {
        this.winner = true
        this.winnerName = this.playerName
        return
      }
      
      // Sprawdź remis
      if (this.checkDraw()) {
        this.draw = true
        return
      }

      // Tura komputera
      this.isPlayerTurn = false
      setTimeout(() => {
        this.computerMove()
      }, 500)
    },

    computerMove() {
      // Znajdź najlepszy ruch dla komputera (prosta AI)
      const move = this.findBestMove()
      
      if (move) {
        this.squares[move.x][move.y] = 'O'
        
        // Sprawdź wygraną komputera
        if (this.checkWinner('O')) {
          this.winner = true
          this.winnerName = 'Computer'
          return
        }
        
        // Sprawdź remis
        if (this.checkDraw()) {
          this.draw = true
          return
        }
      }
      
      this.isPlayerTurn = true
    },

    findBestMove() {
      // 1. Spróbuj wygrać
      const winMove = this.findWinningMove('O')
      if (winMove) return winMove

      // 2. Zablokuj gracza
      const blockMove = this.findWinningMove('X')
      if (blockMove) return blockMove

      // 3. Weź środek
      if (this.squares[1][1] === '') {
        return { x: 1, y: 1 }
      }

      // 4. Weź róg
      const corners = [
        { x: 0, y: 0 }, { x: 0, y: 2 },
        { x: 2, y: 0 }, { x: 2, y: 2 }
      ]
      const availableCorner = corners.find(c => this.squares[c.x][c.y] === '')
      if (availableCorner) return availableCorner

      // 5. Weź dowolne wolne pole
      for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
          if (this.squares[x][y] === '') {
            return { x, y }
          }
        }
      }
      return null
    },

    findWinningMove(mark) {
      const lines = [
        // Wiersze
        [[0, 0], [0, 1], [0, 2]],
        [[1, 0], [1, 1], [1, 2]],
        [[2, 0], [2, 1], [2, 2]],
        // Kolumny
        [[0, 0], [1, 0], [2, 0]],
        [[0, 1], [1, 1], [2, 1]],
        [[0, 2], [1, 2], [2, 2]],
        // Przekątne
        [[0, 0], [1, 1], [2, 2]],
        [[0, 2], [1, 1], [2, 0]]
      ]

      for (const line of lines) {
        const values = line.map(([x, y]) => this.squares[x][y])
        const markCount = values.filter(v => v === mark).length
        const emptyCount = values.filter(v => v === '').length

        if (markCount === 2 && emptyCount === 1) {
          const emptyIndex = values.findIndex(v => v === '')
          return { x: line[emptyIndex][0], y: line[emptyIndex][1] }
        }
      }
      return null
    },

    checkWinner(mark) {
      const lines = [
        // Wiersze
        [[0, 0], [0, 1], [0, 2]],
        [[1, 0], [1, 1], [1, 2]],
        [[2, 0], [2, 1], [2, 2]],
        // Kolumny
        [[0, 0], [1, 0], [2, 0]],
        [[0, 1], [1, 1], [2, 1]],
        [[0, 2], [1, 2], [2, 2]],
        // Przekątne
        [[0, 0], [1, 1], [2, 2]],
        [[0, 2], [1, 1], [2, 0]]
      ]

      return lines.some(line => 
        line.every(([x, y]) => this.squares[x][y] === mark)
      )
    },

    checkDraw() {
      return this.squares.every(row => row.every(cell => cell !== ''))
    },

    reset() {
      this.squares = [
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
      ]
      this.winner = false
      this.draw = false
      this.winnerName = ''
      this.isPlayerTurn = true
      this.playerName = this.nickname !== '' ? this.nickname : 'Player'
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
}

.status h2 {
  margin-bottom: 20px;
  font-size: 24px;
}

.boardGame {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.game-table {
  border-collapse: collapse;
}

.board {
  width: 100px;
  height: 100px;
  border: 3px solid var(--primary-color);
  font-size: 60px;
  font-weight: bold;
  text-align: center;
  vertical-align: middle;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.board:hover:not(.disabled) {
  background-color: #2B3A48;
}

.board.disabled {
  cursor: not-allowed;
}

.playerColor {
  color: var(--player-color);
}

.computerColor {
  color: var(--computer-color);
}

.reset-btn {
  margin-top: 20px;
  padding: 12px 30px;
  font-size: 18px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.reset-btn:hover {
  transform: scale(1.05);
}

.youWin {
  animation: youWin 0.5s ease infinite;
}

@keyframes youWin {
  0%, 100% { color: var(--primary-color); }
  50% { color: var(--winner-color); }
}

@media (min-width: 600px) {
  .board {
    width: 150px;
    height: 150px;
    font-size: 90px;
  }
}
</style>