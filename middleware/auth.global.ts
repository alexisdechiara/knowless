export default defineNuxtRouteMiddleware((to, _from) => {
	const user = useSupabaseUser()
	const { fetchPlayer, getPlayer } = usePlayerStore()

	if (!["/login", "/register", "/forgot-password", "/reset-password", "/terms", "/privacy", "/legal-notice"].includes(to.path)) {
		if (getPlayer == null) {
			fetchPlayer().catch((error) => {
				createError({
					statusCode: 500,
					statusMessage: "Une erreur est survenue lors du chargement du compte du joueur",
				})
			})
		}
		if (!user.value) {
			return navigateTo({
				path: "/register",
				query: {
					redirect: to.path,
				},
				replace: true,
			})
		}
	}
})
