import { get } from "@vueuse/core"
import { toast } from "vue-sonner"

type OptionsType = {
	log?: boolean
	toast?: boolean
}

export const useFriends = () => {
	const supabase = getSupabaseClient()
	const { getPlayer } = usePlayerStore()

	async function inviteFriend(username: string, usertag: string, options: OptionsType = { toast: true }): Promise<boolean> {
		const { data: friend, error: friendError } = await supabase
			.from("players")
			.select("*")
			.eq("username", username)
			.eq("usertag", usertag)
			.single()

		if (friendError) {
			if (options.log) {
				console.log("Erreur lors de la recherche de l'utilisateur")
				console.error(friendError)
			}
			if (options.toast) {
				if (friendError.code === "PGRST116") {
					toast.error("Cet utilisateur n'existe pas", {
						description: "Veuillez vérifier le nom d'utilisateur et le tag",
					})
				}
				else {
					toast.error(`Erreur ${friendError.code}`, {
						description: friendError.details,
					})
				}
			}
			throw friendError
		}
		else {
			const { error: friendShipError } = await supabase.from("friendship").insert({
				user_id: getPlayer.id,
				friend_id: friend.id,
				status: "pending",
			})

			if (friendShipError) {
				if (options.log) {
					console.log("Erreur lors de l'envoi de la demande d'ami")
					console.error(friendShipError)
				}
				if (options.toast) {
					if (friendShipError.code === "23505") {
						toast.error(`Une demande d'ami est deja envoyée`, {
							description: `Vous avez déjà envoyé une demande d'ami à ${username}#${usertag}`,
						})
					}
					else {
						toast.error(`Erreur ${friendShipError.code}`, {
							description: friendShipError.details,
						})
					}
				}
				throw friendShipError
			}
			else {
				if (options.log) {
					console.log("Demande d'ami envoyée")
				}
				if (options.toast) {
					toast.success("Demande envoyée", {
						description: `Votre demande d'ami a été envoyée à ${username}#${usertag}`,
					})
				}
				return true
			}
		}
	}

	async function removeFriend(id: string, options: OptionsType = { toast: true }): Promise<boolean> {
		const { error } = await supabase
			.rpc("remove_friendship", {
				p_user_id: getPlayer.id,
				p_friend_id: id,
			})

		if (error) {
			if (options.log) {
				console.log("Erreur lors de la suppression de l'ami")
				console.error(error)
			}
			if (options.toast) {
				toast.error("Erreur lors de la suppression de l'ami", {
					description: error.details || "Une erreur inconnue est survenue.",
				})
			}
			throw error
		}
		else {
			if (options.log) {
				console.log("Ami supprimé")
			}
			if (options.toast) {
				toast.success("Ami supprimé", {
					description: "Cet ami a été supprimé de votre liste.",
				})
			}
			return true
		}
	}

	async function acceptFriend(id: string, options: OptionsType = { toast: true }): Promise<boolean> {
		const { error } = await supabase
			.rpc("accept_friendship", {
				p_user_id: getPlayer.id,
				p_friend_id: id,
			})

		if (error) {
			if (options.log) {
				console.log("Erreur lors de l'acceptation de la demande en ami")
				console.error(error)
			}
			if (options.toast) {
				toast.error("Erreur lors de l'acceptation de l'ami", {
					description: error.details || "Une erreur inconnue est survenue.",
				})
			}
			throw error
		}
		else {
			if (options.log) {
				console.log("Demande d'ami acceptée")
			}
			if (options.toast) {
				toast.success("Demande d'ami acceptée", {
					description: "Vous avez accepté la demande en ami",
				})
			}
			return true
		}
	}

	return {
		inviteFriend,
		removeFriend,
		acceptFriend,
	}
}
