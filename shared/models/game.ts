/* eslint-disable @typescript-eslint/no-explicit-any */
import { Quizz } from "./quizz"

export class Game {
	id: number
	createdAt: Date
	phase: string | "start" | "question" | "correction" | "adjustment" | "scoreboard" | "end"
	questions: Array<Quizz>
	playersData: Array<{
		id: string
		answers: Array<string>
		score: {
			default: number
			adjustment: number
		}
	}>

	currentQuestionIndex: number
	currentPlayerIndex: number

	constructor(data: Record<string, any>) {
		this.id = data.id
		this.createdAt = new Date(data.created_at)
		this.phase = data?.phase || "start"

		if (data?.questions && Array.isArray(data?.questions)) {
			this.questions = data?.questions.map((question: any) => new Quizz(question))
		}
		else {
			this.questions = []
		}
		this.playersData = data?.players_data || []
		this.currentQuestionIndex = data?.current_question_index || 0
		this.currentPlayerIndex = data?.current_player_index || 0
	}
}
