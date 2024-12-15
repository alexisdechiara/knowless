import type { OpenQuizzDBResult } from "./openquizzdb"

export class Quizz {
	category?: string
	theme?: string
	difficulty?: string
	points?: number
	wikipedia?: string
	image?: {
		url: string
		alt: string
	}

	anecdote?: string
	type: "open" | "two" | "four" | "range"
	question: string
	answers: Array<Answer>

	constructor(data: OpenQuizzDBResult) {
		this.category = data?.categorie
		this.theme = data?.theme
		this.difficulty = data?.difficulte
		this.wikipedia = data.wikipedia
		this.question = data.question
		this.answers = shuffle<Answer>(data.autres_choix.map((answer: string) => ({ answer, isCorrect: answer === data.reponse_correcte })))
		this.anecdote = data?.anecdote
		this.type = "four"
	}
}

type Answer = {
	answer: string
	isCorrect: boolean
}

function shuffle<T>(array: Array<T>): Array<T> {
	for (let i = array.length - 1; i >= 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]]
	}
	return array
}
