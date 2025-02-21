/* eslint-disable @typescript-eslint/no-explicit-any */
import { Quizz } from "./quizz"

export class Game {
	id: number
	createdAt: Date
	phase: string | "start" | "question" | "correction" | "adjustment" | "scoreboard" | "end"
	questions: Array<Quizz>
	scoreboard: Array<{ id: string, score: { automatic: number, manual: number } }>
	answers: Array<{ id: string, answers: Array<string> }>
	currentQuestionIndex: number
	currentPlayerIndex: number

	constructor(data?: Record<string, any>) {
		this.id = data?.id
		this.createdAt = new Date(data?.created_at)
		this.phase = data?.phase

		// TODO: corriger le bug des answers des questions qui ne sont pas ajoutés
		if (data?.questions && Array.isArray(data?.questions)) {
			this.questions = data?.questions.map((question: any) => new Quizz(question))
		}
		else {
			this.questions = []
		}
		this.scoreboard = data?.scoreboard
		this.answers = data?.answers
		this.currentQuestionIndex = data?.current_question_index || 0
		this.currentPlayerIndex = data?.current_player_index || 0
	}
}
