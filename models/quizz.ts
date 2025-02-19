/* eslint-disable @typescript-eslint/no-explicit-any */
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

	constructor(data: OpenQuizzDBResult | any) {
		this.category = data?.categorie
		this.theme = data?.theme
		if (data && typeof data.difficulte === "string") {
			switch (data.difficulte) {
				case "débutant": this.difficulty = "easy"
					break
				case "confirmé": this.difficulty = "medium"
					break
				case "expert": this.difficulty = "hard"
					break
				default: this.difficulty = data?.difficulty
			}
		}
		else {
			this.difficulty = data?.difficulty
		}
		this.wikipedia = data?.wikipedia
		this.question = data.question
		if ("autres_choix" in data && "reponse_correcte" in data) {
			this.answers = shuffle<Answer>(data.autres_choix.map((answer: string) => ({ answer, isCorrect: false }))).concat({ answer: data.reponse_correcte, isCorrect: true })
		}
		else {
			this.answers = data.answers
		}
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
