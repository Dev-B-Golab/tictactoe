export const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6] // diagonals
]

export const createBoard = () => Array(9).fill('')

export const otherMark = (mark) => (mark === 'X' ? 'O' : 'X')

export const getWinningLine = (board) =>
  WINNING_LINES.find(([a, b, c]) => board[a] && board[a] === board[b] && board[a] === board[c]) || null

export const getWinner = (board) => {
  const line = getWinningLine(board)
  return line ? board[line[0]] : null
}

export const isBoardFull = (board) => board.every(cell => cell !== '')

export const getAvailableMoves = (board) =>
  board.reduce((moves, cell, i) => (cell === '' ? [...moves, i] : moves), [])

const pickRandom = (items) =>
  items.length ? items[Math.floor(Math.random() * items.length)] : null

export const getRandomMove = (board) => pickRandom(getAvailableMoves(board))

export const findWinningMove = (board, mark) => {
  for (const line of WINNING_LINES) {
    const values = line.map(i => board[i])
    const markCount = values.filter(v => v === mark).length
    const emptyIndex = values.indexOf('')
    if (markCount === 2 && emptyIndex !== -1) return line[emptyIndex]
  }
  return null
}

export const getSmartMove = (board, mark) => {
  // Win if possible, otherwise block, then prefer center and corners
  const winMove = findWinningMove(board, mark)
  if (winMove !== null) return winMove

  const blockMove = findWinningMove(board, otherMark(mark))
  if (blockMove !== null) return blockMove

  if (board[4] === '') return 4

  const corner = pickRandom([0, 2, 6, 8].filter(i => board[i] === ''))
  if (corner !== null) return corner

  return getRandomMove(board)
}

// Minimax with alpha-beta pruning; scores favour faster wins and slower losses
const minimax = (board, depth, isMaximizing, mark, alpha, beta) => {
  const winner = getWinner(board)
  if (winner === mark) return 10 - depth
  if (winner) return depth - 10
  if (isBoardFull(board)) return 0

  const current = isMaximizing ? mark : otherMark(mark)
  let best = isMaximizing ? -Infinity : Infinity

  for (let i = 0; i < 9; i++) {
    if (board[i] !== '') continue
    board[i] = current
    const score = minimax(board, depth + 1, !isMaximizing, mark, alpha, beta)
    board[i] = ''

    if (isMaximizing) {
      best = Math.max(best, score)
      alpha = Math.max(alpha, score)
    } else {
      best = Math.min(best, score)
      beta = Math.min(beta, score)
    }
    if (beta <= alpha) break
  }
  return best
}

export const getBestMove = (board, mark) => {
  const work = [...board]
  let bestScore = -Infinity
  let bestMoves = []

  for (const i of getAvailableMoves(work)) {
    work[i] = mark
    const score = minimax(work, 0, false, mark, -Infinity, Infinity)
    work[i] = ''

    if (score > bestScore) {
      bestScore = score
      bestMoves = [i]
    } else if (score === bestScore) {
      bestMoves.push(i)
    }
  }
  // Pick randomly among equally good moves so games don't repeat
  return pickRandom(bestMoves)
}

export const getBotMove = (board, difficulty, mark = 'O') => {
  switch (difficulty) {
    case 'easy':
      return getRandomMove(board)
    case 'medium':
      return Math.random() > 0.5 ? getSmartMove(board, mark) : getRandomMove(board)
    case 'impossible':
      return getBestMove(board, mark)
    case 'hard':
    default:
      return getSmartMove(board, mark)
  }
}
