// server/api/lobbies/leave.ts
import { defineEventHandler, readBody } from "h3"
import { serverSupabaseClient } from "#supabase/server"
import type { Database, TablesUpdate } from "#shared/types/database.types"

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient<Database>(event)
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

  // Fetch latest lobby state to determine if a game is active
  let lobbyHasActiveGame = false
  try {
    const { data: lobbyRow } = await supabase
      .from("lobbies")
      .select("id, game_id")
      .eq("id", lobby.id)
      .single()
    lobbyHasActiveGame = !!(lobbyRow as any)?.game_id
  }
  catch (e) {
    // If we cannot fetch the lobby, default to previous behavior (no active game)
  }

  // If a game is active, do not remove the player from the lobby list.
  // Only mark the player as offline to allow reconnection.
  if (lobbyHasActiveGame) {
    const { error } = await supabase
      .from("players")
      .update<TablesUpdate<"players">>({ status: "offline" })
      .eq("id", userId)

    if (error) {
      console.error(`Erreur Supabase lors de la mise à jour du statut du joueur (API /api/lobbies/leave.ts - game active):`, error)
      console.error(`Utilisateur ID: ${userId}`)
      return { success: false, message: `Erreur ${error.code}: ${error.message}` }
    }

    return { success: true, message: "Joueur marqué hors ligne (partie en cours)." }
  }

  // No active game: proceed with removal from the lobby
  const updatedPlayerIds: string[] = Array.isArray(lobby.playerIds) ? lobby.playerIds : []

  if (!updatedPlayerIds || updatedPlayerIds.length === 0) {
    const { error } = await supabase
      .from("lobbies")
      .delete()
      .eq("id", lobby.id)

    if (error) {
      console.error(`Erreur Supabase lors de la suppression du lobby (API /api/lobbies/leave.ts):`, error)
      console.error(`Lobby ID: ${lobby.id}, Utilisateur ID: ${userId}`)
      return { success: false, message: `Erreur ${error.code}: ${error.message}` }
    }
  }
  else if (lobby.host === userId) {
    const { error } = await supabase
      .from("lobbies")
      .update<TablesUpdate<"lobbies">>({ host: updatedPlayerIds[0], players: updatedPlayerIds })
      .eq("id", lobby.id)

    if (error) {
      console.error(`Erreur Supabase lors de la mise à jour du lobby (API /api/lobbies/leave.ts):`, error)
      console.error(`Lobby ID: ${lobby.id}, Utilisateur ID: ${userId}`)
      return { success: false, message: `Erreur ${error.code}: ${error.message}` }
    }
  }
  else {
    const { error } = await supabase
      .from("lobbies")
      .update<TablesUpdate<"lobbies">>({ players: updatedPlayerIds })
      .eq("id", lobby.id)

    if (error) {
      console.error(`Erreur Supabase lors de la mise à jour des joueurs du lobby (API /api/lobbies/leave.ts):`, error)
      console.error(`Lobby ID: ${lobby.id}, Utilisateur ID: ${userId}`)
      return { success: false, message: `Erreur ${error.code}: ${error.message}` }
    }
  }

  // Update player status and clear lobby_id
  {
    const { error } = await supabase
      .from("players")
      .update<TablesUpdate<"players">>({ status: "offline", lobby_id: null })
      .eq("id", userId)

    if (error) {
      console.error(`Erreur Supabase lors de la mise à jour du statut du joueur (API /api/lobbies/leave.ts):`, error)
      console.error(`Utilisateur ID: ${userId}`)
      return { success: false, message: `Erreur ${error.code}: ${error.message}` }
    }
  }

  return { success: true, message: "Joueur supprimé et statut mis à jour avec succès." }
})
