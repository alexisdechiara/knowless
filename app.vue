<template>
	<NuxtLayout>
		<NuxtPage />
	</NuxtLayout>
	<Toaster />
</template>

<script setup lang="ts">
import { Toaster } from "@/components/ui/sonner"

const supabase = useSupabaseClient()
const user = useSupabaseUser()

async function updateActivity() {
	if (!user.value) return

	// Ne pas écraser "in-lobby" ou "playing"
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

onMounted(() => {
	updateActivity()
	setInterval(updateActivity, 30000) // Ping toutes les 30s
	window.addEventListener("unload", () => {
		navigator.sendBeacon("/api/players/status", JSON.stringify({ id: user.value?.id, status: "offline" }))
	})
})
</script>
