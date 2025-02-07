// server/api/lobbies/leave.ts
import { defineEventHandler, readBody } from "h3"
import { serverSupabaseClient } from "#supabase/server"

export default defineEventHandler(async (event) => {
	const supabase = await serverSupabaseClient(event)
	const rawBody = await readBody(event)

	let body
	try {
		body = JSON.parse(rawBody as string)
	}
	catch (e) {
		console.error("Erreur lors du parsing JSON du body (API /api/lobbies/leave.ts):", e) // Log plus précis
		console.error("Body brut reçu (non parsable en JSON):", rawBody) // Log du body brut en erreur
		return { statusCode: 400, body: { error: "Body de la requête invalide (JSON incorrect)" } }
	}

	const { lobby, userId } = body

	if (!lobby.playerIds || lobby.playerIds.length === 0) {
		const { error } = await supabase
			.from("lobbies")
			.delete()
			.eq("id", lobby.id)

		if (error) {
			console.error(`Erreur Supabase lors de la suppression du lobby (API /api/lobbies/leave.ts):`, error) // Log Supabase plus précis
			console.error(`Lobby ID: ${lobby.id}, Utilisateur ID: ${userId}`) // Infos contextuelles dans le log d'erreur
			return { success: false, message: `Erreur ${error.code}: ${error.message}` }
		}
	}
	else if (lobby.host === userId) {
		const { error } = await supabase
			.from("lobbies")
			.update({ host: lobby.playerIds[0], players: lobby.playerIds })
			.eq("id", lobby.id)
			.select()
			.single()

		if (error) {
			console.error(`Erreur Supabase lors de la mise à jour du lobby (changement d'hôte, API /api/lobbies/leave.ts):`, error) // Log Supabase plus précis
			console.error(`Lobby ID: ${lobby.id}, Utilisateur ID: ${userId}`) // Infos contextuelles dans le log d'erreur
			return { success: false, message: `Erreur ${error.code}: ${error.message}` }
		}
	}
	else {
		const { error } = await supabase
			.from("lobbies")
			.update({ players: lobby.playerIds })
			.eq("id", lobby.id)
			.select()
			.single()

		if (error) {
			console.error(`Erreur Supabase lors de la mise à jour des joueurs du lobby (API /api/lobbies/leave.ts):`, error) // Log Supabase plus précis
			console.error(`Lobby ID: ${lobby.id}, Utilisateur ID: ${userId}`) // Infos contextuelles dans le log d'erreur
			return { success: false, message: `Erreur ${error.code}: ${error.message}` }
		}
	}

	const { error } = await supabase
		.from("players")
		.update({ status: "offline", lobby_id: null })
		.eq("id", userId)

	if (error) {
		console.error(`Erreur Supabase lors de la mise à jour du statut du joueur (API /api/lobbies/leave.ts):`, error) // Log Supabase plus précis
		console.error(`Utilisateur ID: ${userId}`) // Infos contextuelles dans le log d'erreur
		return { success: false, message: `Erreur ${error.code}: ${error.message}` }
	}

	return { success: true, message: "Joueur supprimé et statut mis à jour avec succès." }
})
