<template>
	<div />
</template>

<script lang="ts" setup>
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const { data: host } = await supabase
	.from("players")
	.select("*")
	.eq("id", user.value?.id)
	.single()

const { data, error } = await supabase
	.from("lobbies")
	.insert([
		{
			title: `Partie de ${host.username}`,
			is_public: true,
		},
	])
	.select()
	.single()

if (error) {
	console.error(error)
}
else if (data) {
	await navigateTo(`/multi/${data.id}`)
}
</script>
