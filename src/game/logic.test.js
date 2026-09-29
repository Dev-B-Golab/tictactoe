import { describe, it, expect } from 'vitest'
import {
  createBoard,
  getWinningLine,
  getWinner,
  isBoardFull,
  getAvailableMoves,
  findWinningMove,
  getSmartMove,
  getBestMove,
  getBotMove,
  otherMark
} from './logic'

const board = (str) => str.split('').map(c => (c === '.' ? '' : c))

// Plays every possible X reply against the bot and returns true if X can ever win
const xCanBeat = (b, botMark, xToMove) => {
  const winner = getWinner(b)
  if (winner) return winner !== botMark
  if (isBoardFull(b)) return false

  if (xToMove) {
    return getAvailableMoves(b).some(i => {
      const next = [...b]
      next[i] = otherMark(botMark)
      return xCanBeat(next, botMark, false)
    })
  }
  const next = [...b]
  next[getBestMove(b, botMark)] = botMark
  return xCanBeat(next, botMark, true)
}

describe('board helpers', () => {
  it('creates an empty 3x3 board', () => {
    expect(createBoard()).toEqual(Array(9).fill(''))
  })

  it('detects rows, columns and diagonals', () => {
    expect(getWinningLine(board('XXX......'))).toEqual([0, 1, 2])
    expect(getWinningLine(board('O..O..O..'))).toEqual([0, 3, 6])
    expect(getWinningLine(board('..X.X.X..'))).toEqual([2, 4, 6])
    expect(getWinner(board('O...O...O'))).toBe('O')
    expect(getWinner(board('XOX......'))).toBeNull()
  })

  it('reports full boards and available moves', () => {
    expect(isBoardFull(board('XOXXOOOXX'))).toBe(true)
    expect(isBoardFull(board('XOX.OOOXX'))).toBe(false)
    expect(getAvailableMoves(board('X.O.X.O..'))).toEqual([1, 3, 5, 7, 8])
  })
})

describe('bot strategies', () => {
  it('finds a winning square', () => {
    expect(findWinningMove(board('OO.XX....'), 'O')).toBe(2)
    expect(findWinningMove(board('X.O.X.O..'), 'X')).toBe(8)
    expect(findWinningMove(board('X........'), 'X')).toBeNull()
  })

  it('smart move prefers winning over blocking', () => {
    expect(getSmartMove(board('XX.OO....'), 'O')).toBe(5)
  })

  it('smart move blocks the opponent', () => {
    expect(getSmartMove(board('XX..O....'), 'O')).toBe(2)
  })

  it('smart move takes the centre when free', () => {
    expect(getSmartMove(board('X........'), 'O')).toBe(4)
  })

  it('does not mutate the input board', () => {
    const b = board('X...O....')
    const copy = [...b]
    getBestMove(b, 'O')
    expect(b).toEqual(copy)
  })

  it('returns null when no moves are left', () => {
    const full = board('XOXXOOOXX')
    for (const level of ['easy', 'medium', 'hard', 'impossible']) {
      expect(getBotMove(full, level)).toBeNull()
    }
  })

  it('impossible bot never loses when playing second', () => {
    expect(xCanBeat(createBoard(), 'O', true)).toBe(false)
  })

  it('impossible bot never loses when playing first', () => {
    expect(xCanBeat(createBoard(), 'O', false)).toBe(false)
  })
})
