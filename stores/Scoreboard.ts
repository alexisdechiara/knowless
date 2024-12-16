import { defineStore } from "pinia"
import type { Difficulty } from "~/types/Difficulty"

export const useScoreboardStore = defineStore("scoreboard", () => {
	const easy = reactive<ScoreBoard>({ nbGames: 0, nbRounds: 0, bestScore: 0 })
	const medium = reactive<ScoreBoard>({ nbGames: 0, nbRounds: 0, bestScore: 0 })
	const hard = reactive<ScoreBoard>({ nbGames: 0, nbRounds: 0, bestScore: 0 })

	function getScoreBoardByDifficulty(difficulty: Difficulty): ScoreBoard {
		switch (difficulty) {
			case "easy": return easy
			case "medium": return medium
			case "hard": return hard
			default: return { nbGames: 0, nbRounds: 0, bestScore: 0 }
		}
	}

	return { easy, medium, hard, getScoreBoardByDifficulty }
})

export type ScoreBoard = {
	nbGames: number
	nbRounds: number
	bestScore: number
}
