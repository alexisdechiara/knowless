export default defineNuxtRouteMiddleware((to, _from) => {
	const user = useSupabaseUser()
	const { fetchPlayer, getPlayer } = usePlayerStore()

	if (!user.value) {
		return navigateTo("/register")
	}
	else if (getPlayer == null) {
		fetchPlayer()
	}
})
