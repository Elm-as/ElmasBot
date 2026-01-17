import { supabase } from '../db/supabase.js'
import { addXp, incWinLose } from './xp.js'
import { logQuizEvent } from './quizLogs.js'

const ACTIVE_QUIZZES = new Map()
const DIFF_REWARDS = { easy: 50, normal: 150, hard: 400 }

export const quizEngine = {
  isQuizActive(groupJid) {
    return ACTIVE_QUIZZES.has(groupJid)
  },
  get(groupJid) {
    return ACTIVE_QUIZZES.get(groupJid)
  },
  async start({ sock, groupJid, startedBy, difficulty = 'normal', total = 1, marathon = false }) {
    if (this.isQuizActive(groupJid)) {
      await sock.sendMessage(groupJid, { text: "⚠️ Un quiz est déjà en cours." })
      return
    }
    await logQuizEvent({ groupJid, quizId: null, event: 'start', data: { startedBy, difficulty, total, marathon } })
    const { data: questions, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('difficulty', difficulty)
    if (error) throw error
    if (!questions || questions.length === 0) {
      await sock.sendMessage(groupJid, { text: `⚠️ Aucune question trouvée pour difficulté: ${difficulty}` })
      return
    }
    // Shuffle questions
    const shuffled = questions.sort(() => Math.random() - 0.5)
    const quizSession = {
      state: 'active',
      groupJid,
      startedBy,
      difficulty,
      questions: shuffled,
      current: 0,
      total: marathon ? Infinity : Math.max(1, total),
      marathon,
      timer: null,
      answers: {},
      firstCorrectWinnerJid: null
    }
    ACTIVE_QUIZZES.set(groupJid, quizSession)
    await this.nextQuestion({ sock, groupJid })
  },

  async nextQuestion({ sock, groupJid }) {
    const quiz = this.get(groupJid)
    if (!quiz) return
    if (quiz.current >= quiz.total || quiz.current >= quiz.questions.length) {
      await sock.sendMessage(groupJid, { text: `🎉 Quiz terminé ! (${quiz.current} questions posées)` })
      ACTIVE_QUIZZES.delete(groupJid)
      return
    }
    const q = quiz.questions[quiz.current]
    quiz.state = 'active'
    quiz.questionId = q.id
    quiz.question = q.question
    quiz.choices = q.choices
    quiz.answerIndex = q.answer_index
    quiz.startTime = Date.now()
    quiz.durationMs = 90000
    quiz.answers = {}
    quiz.firstCorrectWinnerJid = null
    await logQuizEvent({ groupJid, quizId: q.id, event: 'question', data: { question: q.question, choices: q.choices } })
    const text =
`🎯 *QUIZ (${quiz.difficulty.toUpperCase()})*  [${quiz.current + 1}/${quiz.total === Infinity ? '?' : quiz.total}]
${q.question}

A) ${q.choices[0]}
B) ${q.choices[1]}
C) ${q.choices[2]}
D) ${q.choices[3]}

⏳ Répondez par: A / B / C / D`
    await sock.sendMessage(groupJid, { text })
    quiz.timer = setTimeout(async () => {
      try {
        await this.reveal({ sock, groupJid, autoNext: true })
      } catch (e) {}
    }, quiz.durationMs)
  },
  async submitAnswer({ sock, groupJid, senderJid, letter }) {
    const quiz = this.get(groupJid)
    if (!quiz || quiz.state !== 'active') return
    const map = { A: 0, B: 1, C: 2, D: 3 }
    const choiceIndex = map[letter]
    if (choiceIndex === undefined) return
    if (quiz.answers[senderJid]) return
    quiz.answers[senderJid] = { choiceIndex, ts: Date.now() }
    if (choiceIndex === quiz.answerIndex && !quiz.firstCorrectWinnerJid) {
      quiz.firstCorrectWinnerJid = senderJid
      await sock.sendMessage(groupJid, { text: `⚡ 1er correct : @${senderJid.split('@')[0]} (+bonus vitesse)`, mentions: [senderJid] })
    }
  },
  async reveal({ sock, groupJid, autoNext = false }) {
    const quiz = this.get(groupJid)
    if (!quiz) return
    if (quiz.timer) clearTimeout(quiz.timer)
    quiz.state = 'revealed'
    const correctLetter = ['A', 'B', 'C', 'D'][quiz.answerIndex]
    const winners = []
    const losers = []
    for (const [jid, ans] of Object.entries(quiz.answers)) {
      if (ans.choiceIndex === quiz.answerIndex) winners.push(jid)
      else losers.push(jid)
    }
    await logQuizEvent({
      groupJid,
      quizId: quiz.questionId,
      event: 'reveal',
      data: {
        correct: correctLetter,
        winners,
        losers,
        answers: quiz.answers
      }
    })
    const baseXp = DIFF_REWARDS[quiz.difficulty] ?? 150
    const speedBonus = 50
    const results = []
    for (const w of winners) {
      let delta = baseXp
      if (quiz.firstCorrectWinnerJid === w) delta += speedBonus
      const xpRes = await addXp({ jid: w, groupJid, delta, reason: `quiz_${quiz.difficulty}` })
      await incWinLose({ jid: w, win: true })
      results.push({ jid: w, delta, rank: xpRes.rank })
    }
    for (const l of losers) {
      await incWinLose({ jid: l, win: false })
    }
    const topLine = winners.length
      ? `🏆 Gagnants: ${winners.length}`
      : `😅 Personne n'a trouvé la bonne réponse`
    const msg =
`✅ *RÉPONSE QUIZ*
Bonne réponse : *${correctLetter}*

${topLine}
Participants : ${Object.keys(quiz.answers).length}`
    await sock.sendMessage(groupJid, { text: msg })
    if (results.length) {
      const lines = results.slice(0, 10).map(r => `+${r.delta} XP → ${r.rank} @${r.jid.split('@')[0]}`)
      await sock.sendMessage(groupJid, { text: "📈 Gains XP:\n" + lines.join('\n'), mentions: results.map(r => r.jid) })
    }
    quiz.current = (quiz.current || 0) + 1
    if (autoNext && quiz.current < quiz.total && quiz.current < quiz.questions.length) {
      setTimeout(() => this.nextQuestion({ sock, groupJid }), 3500)
    } else {
      quiz.state = 'closed'
      ACTIVE_QUIZZES.delete(groupJid)
    }
  },
  async stop({ sock, groupJid }) {
    const quiz = this.get(groupJid)
    if (!quiz) {
      await sock.sendMessage(groupJid, { text: "ℹ️ Aucun quiz actif." })
      return
    }
    if (quiz.timer) clearTimeout(quiz.timer)
    await logQuizEvent({ groupJid, quizId: quiz.questionId, event: 'stop', data: { stoppedBy: null } })
    ACTIVE_QUIZZES.delete(groupJid)
    await sock.sendMessage(groupJid, { text: "🛑 Quiz arrêté." })
  }
}
