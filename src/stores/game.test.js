import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGameStore } from './game'

const STORAGE_KEY = 'tictactoe:state'

const createMemoryStorage = () => {
  const data = new Map()
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
    clear: () => data.clear()
  }
}

describe('game store', () => {
  beforeEach(() => {
    globalThis.localStorage = createMemoryStorage()
    setActivePinia(createPinia())
  })

  it('starts with defaults when nothing is saved', () => {
    const store = useGameStore()
    expect(store.hasSettings).toBe(false)
    expect(store.gameMode).toBe('bot')
    expect(store.displayName2).toBe('CPU')
    expect(store.scores).toEqual({ player1: 0, player2: 0, draws: 0 })
  })

  it('restores state saved by the previous (Vuex) version', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      player1Name: 'Ala',
      player2Name: 'Ola',
      gameMode: 'pvp',
      difficulty: 'hard',
      scores: { player1: 2, player2: 1, draws: 3 }
    }))
    const store = useGameStore()
    expect(store.hasSettings).toBe(true)
    expect(store.displayName1).toBe('Ala')
    expect(store.displayName2).toBe('Ola')
    expect(store.scores.draws).toBe(3)
  })

  it('ignores corrupted storage', () => {
    localStorage.setItem(STORAGE_KEY, '{not json')
    expect(useGameStore().hasSettings).toBe(false)
  })

  it('persists settings and scores', () => {
    const store = useGameStore()
    store.setGameSettings({ player1Name: 'Ala', player2Name: 'CPU', gameMode: 'bot', difficulty: 'easy' })
    store.incrementScore('player1')
    store.incrementScore('draw')

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    expect(saved.player1Name).toBe('Ala')
    expect(saved.difficulty).toBe('easy')
    expect(saved.scores).toEqual({ player1: 1, player2: 0, draws: 1 })
  })

  it('new settings and resetScores clear the scoreboard', () => {
    const store = useGameStore()
    store.incrementScore('player2')
    store.resetScores()
    expect(store.scores).toEqual({ player1: 0, player2: 0, draws: 0 })

    store.incrementScore('player1')
    store.setGameSettings({ player1Name: 'A', player2Name: 'B', gameMode: 'pvp', difficulty: 'medium' })
    expect(store.scores).toEqual({ player1: 0, player2: 0, draws: 0 })
  })
})
