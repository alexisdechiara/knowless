import { defineStore } from "pinia"
import { User } from "~/models/user"

export const usePlayerStore = defineStore("Player Store", () => {
	const supabase = useSupabaseClient()
	const authUser = useSupabaseUser()

	const player = ref<User>()
	const loading = ref<boolean>(false)
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
			if (e instanceof Error) {
				error.value = e
			}
			else {
				error.value = new Error(String(e))
			}
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
			if (e instanceof Error) {
				error.value = e
			}
			else {
				error.value = new Error(String(e))
			}
			loading.value = false
		}
	}

	const getPlayer = computed(() => player.value)
	const getLoading = computed(() => loading.value)
	const getError = computed(() => error.value)

	fetchPlayer()

	return {
		getPlayer,
		getLoading,
		getError,
		fetchPlayer,
		updatePlayer,
	}
})
