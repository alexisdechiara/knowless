<template>
	<div />
</template>

<script lang="ts" setup>
const supabase = useSupabaseClient()

const { data, error } = await supabase.from("lobbies").update({ players: ["cbf389e8-4e24-47ef-89b3-165a4d2c2ee9", "e9ff4226-31e9-437c-bab1-d30ca1237836"] }).eq("id", 3445).single()
</script>

<style scoped>

</style>
