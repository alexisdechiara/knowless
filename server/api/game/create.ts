import { any, z } from "zod"
import { Quizz } from "#shared/models/quizz"
import { serverSupabaseClient } from "#supabase/server"
import { Lobby } from "#shared/models/lobby"
import type { Game } from "#shared/models/game"
import type { Json } from "#shared/types/database.types"
import { defaultCategories } from "~/utils/categories"

const querySchema = z.object({
	lobbyId: z.string().length(4),
	nbQuestions: z.coerce.number().min(1).max(20).default(20).optional(),
	categories: z.string().array().default(defaultCategories).optional(),
})

export default defineEventHandler(async (event) => {
	const supabase = await serverSupabaseClient<Database>(event)
	const { nbQuestions = 20, lobbyId, categories = defaultCategories } = await getValidatedQuery(event, querySchema.parse)

	let questions: Array<Quizz> = []

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
			message: "Le nombre de questions doit être compris entre 1 et 20",
		})
	}

	const { data: lobbyData, error: lobbyError } = await supabase
		.from("lobbies")
		.select()
		.eq("id", Number(lobbyId))
		.single()

	if (lobbyError) {
		console.error(`Erreur Supabase lors de la recherche du lobby (API /api/lobbies/leave.ts):`, lobbyError) // Log Supabase plus précis
		console.error(`Lobby ID: ${lobbyId}`) // Infos contextuelles dans le log d'erreur
		throw lobbyError
	}

	if (lobbyData) {
		let lobby = new Lobby(lobbyData)
		try {
			const { data: responses, error } = await supabase
				.rpc("get_random_quizzes", {
					p_categories: categories,
					p_language: "fr",
					p_limit: nbQuestions,
				})

			if (error) throw error
			if (!responses || responses.length === 0) throw new Error("Aucune question reçue")

			const keywords = [
				// fr
				"laquelle", "lequel", "lesquels", "lesquelles", "parmi",
				"choisir", "choisis", "choisit", "choisissons", "choisissez", "choisissent",
				"sélectionner", "sélectionne", "sélectionnes", "sélectionnons", "sélectionnez", "sélectionnent",
				"trouver", "trouve", "trouves", "trouvons", "trouvez", "trouvent",
				"le bon", "la bonne", "les bonnes", "la bonne réponse", "bonne réponse",

				// en
				"which", "among",
				"choose", "chooses", "choosing", "chosen",
				"select", "selects", "selecting", "selected",
				"pick", "picks", "picking", "picked",
				"find", "finds", "finding", "found",
				"the right answer", "correct answer", "right option", "correct one",

				// de
				"welche", "welcher", "welches", "welchen", "unter",
				"wählen", "wähle", "wählst", "wählt", "wählten", "gewählt",
				"finden", "finde", "findest", "findet", "fanden", "gefunden",
				"die richtige", "richtige antwort", "die korrekte antwort",

				// es
				"cuál", "cuáles", "entre",
				"elegir", "elige", "eliges", "elegimos", "elegís", "eligen", "eligió", "elegido",
				"seleccionar", "selecciona", "seleccionas", "seleccionamos", "seleccionáis", "seleccionan",
				"encontrar", "encuentra", "encuentras", "encontramos", "encontráis", "encuentran", "encontró", "encontrado",
				"la correcta", "respuesta correcta",

				// it
				"quale", "quali", "tra", "fra",
				"scegliere", "scegli", "sceglie", "scegliamo", "scegliete", "scelgono", "scelto",
				"selezionare", "seleziona", "selezioni", "selezioniamo", "selezionate", "selezionano",
				"trovare", "trova", "trovi", "troviamo", "trovate", "trovano", "trovato",
				"la risposta giusta", "quella giusta", "risposta corretta",

				// nl
				"welke", "onder",
				"kiezen", "kies", "kiest", "koos", "gekozen",
				"selecteren", "selecteer", "selecteert", "selecteerde", "geselecteerd",
				"vinden", "vind", "vindt", "vonden", "gevonden",
				"het juiste antwoord", "correct antwoord", "goede antwoord",
			]

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			questions = responses.map((response: any) => {
				const questionText = response.question?.toLowerCase() ?? ""

				return keywords.some(word => questionText.includes(word))
					? new Quizz(response)
					: new Quizz(response, { type: "open" })
			})
		}
		catch (error) {
			console.error(error)
			throw error
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
				questions: questions.map(q => ({ ...q })) as Json[],
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
				.eq("id", Number(lobby.id))
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
