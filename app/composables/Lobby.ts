import { toast } from "vue-sonner"
import { Lobby } from "#shared/models/lobby"
import { User } from "#shared/models/user"

type OptionsType = {
	log?: boolean
	toast?: boolean
}

export function useLobby() {
	const supabase = getSupabaseClient()

	async function getPlayers(playerIds: Array<string>, options?: OptionsType): Promise<Array<User>> {
		const { data: data, error } = await supabase
			.from("players")
			.select("*")
			.in("id", playerIds)

		if (error) {
			if (options?.log) {
				console.log("Erreur lors de la recherche des joueurs")
				console.error(error)
			}
			if (options?.toast) {
				toast.error(`Erreur ${error.code}`, {
					description: "Les joueurs n'ont pas était trouvés.",
				})
			}
			throw error
		}
		if (data && data.length > 0) {
			if (options?.log) {
				console.log("Joueurs trouvés", data)
			}
			if (options?.toast) {
				toast.success("Modification détectée", {
					description: "Mise à jours de la liste des joueurs",
				})
			}
			return new Array<User>(...data.map(player => new User(player)))
		}
		else {
			return []
		}
	}

	async function removePlayer(player: User, lobby: Lobby, options?: OptionsType): Promise<Lobby | null> {
		console.log(player, lobby)

		const { error } = await supabase
			.from("players")
			.update({ status: "offline", lobby_id: null })
			.eq("id", player.id)

		if (error) {
			if (options?.log) {
				console.log("Erreur lors de la suppression du joueur")
				console.error(error)
			}
			if (options?.toast) {
				toast.error(`Erreur lors de la suppression du joueur`, {
					description: `${player.username} n'a pas pu être supprimé.`,
				})
			}
			throw error
		}
		else {
			const updatedPlayerIds: Array<string> = lobby.playerIds.filter(playerId => playerId !== player.id)
			if (!updatedPlayerIds || updatedPlayerIds.length === 0) {
				const { error } = await supabase
					.from("lobbies")
					.delete()
					.eq("id", Number(lobby.id))

				if (error) {
					if (options?.log) {
						console.log("Erreur lors de la suppression du lobby")
						console.error(error)
					}
					if (options?.toast) {
						toast.error(`Erreur lors de la suppression du lobby`, {
							description: error.message,
						})
					}
					throw error
				}
				else {
					if (options?.log) {
						console.log("Lobby supprimé")
					}
					if (options?.toast) {
						toast.success("Lobby supprimé", {
							description: "Le lobby a été supprimé.",
						})
					}
					return null
				}
			}
			else if (lobby.host === player.id) {
				const { data, error } = await supabase
					.from("lobbies")
					.update({ host: updatedPlayerIds[0], players: updatedPlayerIds })
					.eq("id", Number(lobby.id))
					.select()
					.single()

				if (error) {
					if (options?.log) {
						console.log("Erreur lors de la mise à jour du lobby")
						console.error(error)
					}
					if (options?.toast) {
						toast.error(`Erreur lors de la mise à jour du lobby`, {
							description: error.message,
						})
					}
					throw error
				}
				else {
					if (options?.log) {
						console.log("Lobby mis à jour")
					}
					if (options?.toast) {
						toast.success("Lobby mis à jour", {
							description: "Le lobby a été mis à jour.",
						})
					}
					return new Lobby(data)
				}
			}
			else {
				const { data, error } = await supabase
					.from("lobbies")
					.update({ players: updatedPlayerIds })
					.eq("id", Number(lobby.id))
					.select()
					.single()

				if (error) {
					if (options?.log) {
						console.log("Erreur lors de la mise à jour du lobby")
						console.error(error)
					}
					if (options?.toast) {
						toast.error(`Erreur lors de la mise à jour du lobby`, {
							description: error.message,
						})
					}
					throw error
				}
				else {
					if (options?.log) {
						console.log("Lobby mis à jour")
					}
					if (options?.toast) {
						toast.success("Lobby mis à jour", {
							description: "Le lobby a été mis à jour.",
						})
					}
					return new Lobby(data)
				}
			}
		}
	}

	async function banPlayer(player: User, lobby: Lobby, options: OptionsType = { log: true, toast: true }): Promise<Lobby | null> {
		const { data, error } = await supabase
			.from("lobbies")
			.update({ banned_players: [...lobby.bannedPlayersId, player.id] })
			.eq("id", Number(lobby.id))
			.select()

		if (error) {
			if (options?.log) {
				console.log(`Erreur lors du bannissement de ${player.username}`)
				console.error(error)
				throw error
			}
			if (options?.toast) {
				toast.error(`Erreur lors du bannissement`, {
					description: `${player.username} n'a pas pu etre banni`,
				})
			}
			throw error
		}
		else {
			return await removePlayer(player, new Lobby(data)).then(() => {
				if (options?.log) {
					console.log(`${player.username} banni`)
				}
				if (options?.toast) {
					toast.success(`bannissement effectué`, {
						description: `${player.username} a été banni du lobby`,
					})
				}
				return new Lobby(data)
			}).catch((error) => {
				if (options?.log) {
					console.log(`Erreur lors du bannissement de ${player.username}`)
					console.error(error)
				}
				if (options?.toast) {
					toast.error(`Erreur lors du bannissement`, {
						description: `${player.username} n'a pas pu etre banni`,
					})
				}
				throw error
			})
		}
	}

	async function promotePlayer(player: User, lobby: Lobby, options: OptionsType = { log: true, toast: true }): Promise<Lobby | null> {
		const { data, error } = await supabase
			.from("lobbies")
			.update({ host: player.id })
			.eq("id", Number(lobby.id))

		if (error) {
			if (options?.log) {
				console.log("Le nouvel hôte n'a pas pu être mis à jour")
				console.error(error)
			}
			toast.error("Une erreur est survenue", {
				description: `Le nouvel hôte n'a pas pu être mis à jour`,
			})
		}
		else if (data) {
			if (options?.log) {
				console.log("Nouvel hôte mis à jour")
			}
			if (options?.toast) {
				toast.success("Nouvel hôte mis à jour", {
					description: "Le nouvel hôte a été mis à jour.",
				})
			}
			return new Lobby(data)
		}
		return null
	}

	return {
		getPlayers,
		removePlayer,
		banPlayer,
		promotePlayer,
	}
}

async function updateLobbyPlayers(lobby: Lobby) {
	const supabase = getSupabaseClient()
	const { getPlayer } = usePlayerStore()


	const { error } = await supabase.rpc("add_player_to_lobby", {
		new_lobby_id: Number(lobby.id),
		player_id: getPlayer.id,
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
