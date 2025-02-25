import { z } from "zod"
import { Quizz } from "./../../../models/quizz"
import type { OpenQuizzDB, OpenQuizzDBResult } from "~/models/openquizzdb"
import { serverSupabaseClient } from "#supabase/server"
import { Lobby } from "~/models/lobby"
import type { Game } from "~/models/game"

const querySchema = z.object({
	lobbyId: z.string().length(4),
	nbQuestions: z.number({ coerce: true }).min(1).max(20).default(20).optional(),
})

export default defineEventHandler(async (event) => {
	const supabase = await serverSupabaseClient(event)
	const { nbQuestions = 20, lobbyId } = await getValidatedQuery(event, querySchema.parse)
	const questions: Array<Quizz> = []

	if (!lobbyId) {
		throw createError({
			statusCode: 400,
			statusMessage: "Lobby ID manquant",
			message: "L'id du lobby est obligatoire",
		})
	}

	if (nbQuestions < 1 || nbQuestions > 20) {
		throw createError({
			statusCode: 400,
			statusMessage: "Nombre de questions invalide",
			message: "Le nombre de questions doit être compris entre 5 et 20",
		})
	}

	const { data: lobbyData, error: lobbyError } = await supabase
		.from("lobbies")
		.select()
		.eq("id", lobbyId)
		.single()

	if (lobbyError) {
		console.error(`Erreur Supabase lors de la recherche du lobby (API /api/lobbies/leave.ts):`, lobbyError) // Log Supabase plus précis
		console.error(`Lobby ID: ${lobbyId}`) // Infos contextuelles dans le log d'erreur
		throw lobbyError
	}

	if (lobbyData) {
		let lobby = new Lobby(lobbyData)
		for (let i = 0; i < nbQuestions; i++) {
			try {
				const response = await $fetch<OpenQuizzDB>("/api/placeholder/openquizzdb", {
					retry: 5,
					retryDelay: 500,
				})

				if (!response.results.length) throw new Error("Aucune question reçue")

				questions.push(new Quizz(response.results[0] as OpenQuizzDBResult, { points: response.results[0].difficulte === "débutant" ? 1 : response.results[0].difficulte === "confirmé" ? 2 : 3, type: "open" }))
				console.log(new Quizz(response.results[0] as OpenQuizzDBResult))
			}
			catch (error) {
				console.error(error)
				throw error
			}
		}

		const playersData: Game["playersData"] = []
		for (const player of lobby.playerIds) {
			playersData.push({
				id: player,
				answers: new Array(nbQuestions).fill(""),
				score: {
					default: 0,
					adjustment: 0,
				},
			})
		}

		const { data: game, error: gameError } = await supabase
			.from("games")
			.insert({
				questions: questions,
				players_data: playersData,
			})
			.select()
			.single()

		if (gameError) {
			console.error(gameError)
			throw gameError
		}

		if (game) {
			const { data, error } = await supabase
				.from("lobbies")
				.update({ game_id: game.id })
				.eq("id", lobby.id)
				.select()
				.single()

			if (error) {
				console.error(error)
				throw error
			}

			if (data) {
				lobby = new Lobby(data)
				return {
					lobby: lobby,
					game: game,
				}
			}
		}
	}
})
