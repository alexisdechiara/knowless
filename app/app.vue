<template>
	<NuxtLayout>
		<NuxtPage />
	</NuxtLayout>
	<Toaster />
</template>

<script setup lang="ts">
const supabase = getSupabaseClient()
const user = useSupabaseUser()


onMounted(() => {
	updateActivity()
	setInterval(updateActivity, 30000) // Ping toutes les 30s
	window.addEventListener("unload", () => {
		navigator.sendBeacon("/api/players/status", JSON.stringify({ id: user.value?.id, status: "offline" }))
	})
})

async function updateActivity() {
	// Ne pas écraser "in-lobby" ou "playing"
	if(user.value?.id) {
		const { error } = await supabase
			.from("players")
			.update({ last_active_at: new Date().toISOString(), status: "online" })
			.eq("id", user.value.id)
			.neq("status", "in-lobby")
			.neq("status", "playing")
	
		if (error) {
			console.error(error)
		}
	}
}
</script>
