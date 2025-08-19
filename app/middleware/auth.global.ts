export default defineNuxtRouteMiddleware(async (to, _from) => {
	const user = useSupabaseUser()
	const playerStore = usePlayerStore()

	const publicPaths = ["/login", "/register", "/forgot-password", "/reset-password", "/terms", "/privacy", "/legal-notice"]
	if (publicPaths.includes(to.path)) return

	// 1) Pas connecté → redirige vers /login avec redirect
	if (!user.value) {
		return navigateTo({
			path: "/register",
			query: { redirect: to.fullPath },
			replace: true,
		})
	}

	// 2) Connecté mais pas de player en mémoire → fetch
	if (playerStore.getPlayer == null) {
		await playerStore.fetchPlayer().catch(() => {
			navigateTo({
				path: "/register",
				query: { redirect: to.fullPath },
				replace: true,
			})
		})
	}

	// 3) Toujours pas de player → redirige vers /login
	if (playerStore.getPlayer == null) {
		return navigateTo({
			path: "/login",
			query: { redirect: to.fullPath },
			replace: true,
		})
	}
})
