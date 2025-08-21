<template>
	<NuxtLayout>
		<NuxtPage />
	</NuxtLayout>
	<Sonner />
</template>

<script setup lang="ts">
const presence = usePresenceStore()

onMounted(() => {
    // Centralized presence handling (heartbeat + unload)
    presence.init()
})
</script>
