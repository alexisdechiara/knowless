// stores/player.ts
import { defineStore } from "pinia"
import { User } from "#shared/models/user"

export const usePlayerStore = defineStore("Player Store", () => {
	const supabase = useSupabaseClient()
	const authUser = useSupabaseUser()

	// Nullable pendant le chargement
	const player = ref<User | null>(null)
	const loading = ref(false)
	const error = ref<Error | null>(null)

	const checkAuth = () => {
		if (!authUser.value) {
			error.value = createError({
				statusCode: 401,
				statusMessage: "Unauthorized",
				message: "You are not logged in",
			})
			return false
		}
		return true
	}

	const fetchPlayer = async () => {
		loading.value = true
		error.value = null
		if (!checkAuth()) {
			loading.value = false
			return
		}
		try {
			const newPlayer = await User.fetchById(authUser.value!.id, supabase)
			if (!newPlayer) {
				error.value = createError({
					statusCode: 404,
					statusMessage: "Not Found",
					message: "Player not found",
				})
				loading.value = false
				return
			}

			player.value = newPlayer
			loading.value = false
			return newPlayer
		}
		catch (e) {
			error.value = e instanceof Error ? e : new Error(String(e))
			loading.value = false
		}
	}

	const updatePlayer = async (updates: Partial<User>) => {
		loading.value = true
		error.value = null
		if (!checkAuth()) {
			loading.value = false
			return
		}
		try {
			const newPlayer = await User.updateById(authUser.value!.id, updates, supabase)
			if (!newPlayer) {
				error.value = createError({
					statusCode: 404,
					statusMessage: "Not Found",
					message: "Player not found",
				})
				loading.value = false
				return
			}

			player.value = newPlayer
			loading.value = false
			return newPlayer
		}
		catch (e) {
			error.value = e instanceof Error ? e : new Error(String(e))
			loading.value = false
		}
	}

	const getPlayer = computed(() => player.value!)

	const getLoading = computed(() => loading.value)
	const getError = computed(() => error.value)

	// Chargement automatique au montage
	fetchPlayer()

	return {
		getPlayer,
		getLoading,
		getError,
		fetchPlayer,
		updatePlayer,
	}
})
