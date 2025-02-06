import { toast } from "vue-sonner"
import type { Lobby } from "~/models/lobby"

async function updateLobbyPlayers(lobby: Lobby) {
	const supabase = useSupabaseClient()
	const user = useSupabaseUser()

	const { error } = await supabase.rpc("add_player_to_lobby", {
		new_lobby_id: lobby.id,
		player_id: user.value?.id,
	})

	if (error) {
		toast.error(`Erreur: ${error.message}`, { description: error.message })
		throw new Error(error.message)
	}
}

export async function joinLobby(lobby: Lobby) {
	const user = useSupabaseUser()
	const supabase = useSupabaseClient()

	if (user.value && lobby.bannedPlayersId.includes(user.value?.id)) {
		toast.error("Vous avez été banni de ce lobby")
	}
	else if (lobby.players.length + 1 >= lobby.maxPlayers) {
		toast.error("Le lobby est plein")
	}
	else {
		if (lobby.isFriendsOnly && user.value) {
			const { data, status: isFriend } = await supabase
				.from("friendship")
				.select("*")
				.or(`and(friend_id.eq.${user.value?.id},user_id.eq.${lobby.host}),and(friend_id.eq.${lobby.host},user_id.eq.${user.value?.id})`)
				.eq("status", "accepted")
				.single()

			console.log(isFriend)

			if (!data || isFriend !== 200) {
				toast.error("Seul les amis de l'hôte sont acceptés")
				return
			}
		}

		// check if the user is already in the lobby
		if ((user.value && lobby.playerIds.includes(user.value?.id)) || lobby.host === user.value?.id) {
			await navigateTo(`/multi/${lobby.id}`)
		}

		// check if the user is invited to the lobby
		else if (user.value && lobby.invitedPlayersId && lobby.invitedPlayersId.includes(user.value?.id)) {
			try {
				updateLobbyPlayers(lobby)
				await navigateTo(`/multi/${lobby.id}`)
			}
			catch (error) {
				return
			}
		}

		// check if the lobby has a password
		else if (lobby.password) {
			const answer = prompt("Entrez le mot de passe du lobby")
			if (answer === lobby.password) {
				try {
					updateLobbyPlayers(lobby)
					await navigateTo(`/multi/${lobby.id}`)
				}
				catch (error) {
					return
				}
			}
			else {
				toast.error("Mauvais mot de passe")
			}
		}

		else {
			try {
				updateLobbyPlayers(lobby)
				await navigateTo(`/multi/${lobby.id}`)
			}
			catch (error) {
				return
			}
		}
	}
}
