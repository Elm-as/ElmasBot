import { quizEngine } from '../src/services/quizEngine.js'

describe('quizEngine', () => {
  test('isQuizActive returns false by default', () => {
    expect(quizEngine.isQuizActive('group')).toBe(false)
  })
  // Pour tester plus loin, il faudrait mocker supabase et les timers
})
