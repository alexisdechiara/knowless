/* eslint-disable @typescript-eslint/no-explicit-any */
import type { OpenQuizzDBResult } from "./openquizzdb"

export class Quizz {
	themeId: string
	theme: string
	category: string
	question: string
	answers: Array<Answer>
	difficulty?: string
	anecdote?: string
	wikipedia?: string
	nbCount?: number
	language: string
	type?: "open" | "two" | "four" | "range"
	metadata?: Record<string, any>

	/* Custom value for front */
	points: number
	image?: {
		url: string
		alt: string
	}

	constructor(data: OpenQuizzDBResult | any, additionalData?: Record<string, any>) {
		this.themeId = data?.theme_id || data?.themeId
		this.theme = data?.theme
		this.language = data?.language || "fr"
		this.category = data.categorie
		this.category = data?.category
		this.difficulty = data?.difficulty
		this.wikipedia = data?.wikipedia || data?.wiki
		this.question = data.question
		if (data.answers && Array.isArray(data.answers)) {
			this.answers = shuffle<Answer>(data.answers)
		}
		else {
			this.answers = []
		}
		this.anecdote = data?.anecdote
		if (additionalData?.type) {
			this.type = additionalData.type
		}
		else if (data?.type) {
			this.type = data.type
		}
		else {
			this.type = "open"
		}
		if (data?.points) {
			this.points = data.points
		}
		else if (additionalData?.points) {
			this.points = additionalData.points
		}
		else {
			switch (this.difficulty) {
				case "easy": this.points = 1
					break
				case "medium": this.points = 2
					break
				case "hard": this.points = 3
					break
				default: this.points = 1
			}
		}
		this.nbCount = data?.nb_count || data?.nbCount
		if (data?.image) {
			this.image = {
				url: data.image.url,
				alt: data.image.alt,
			}
		}
		this.metadata = data?.metadata
	}
}

type Answer = {
	value: string
	isCorrect: boolean
	variants?: Array<string>
	[key: string]: any
}

function shuffle<T>(array: Array<T>): Array<T> {
  for (let i = array.length - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j]!, array[i]!];
  }
  return array;
}
