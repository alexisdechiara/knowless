<template>
	<NuxtLayout name="selection" :previous="{ icon: 'lucide:chevron-left', button: { variant: 'default' }, to: '/multi' }">
		<SelectionCard v-for="status in statuses" :key="status.title" :title="status.title" :description="status.description" @click="createLobby(status.value)">
			<template #img>
				<Icon :name="status.icon" class="h-32 text-8xl" />
			</template>
		</SelectionCard>
	</NuxtLayout>
</template>

<script lang="ts" setup>
const supabase = getSupabaseClient()
const { getPlayer } = usePlayerStore()

definePageMeta({
	title: "Multijoueurs - Création d'un salon",
})

const statuses = [
	{
		title: "Public",
		value: "public",
		icon: "lucide:globe",
		description: "Le lobby sera accessible depuis la liste des serveurs",
	},
	{
		title: "Privé",
		value: "private",
		icon: "lucide:lock",
		description: "Le lobby ne sera accessible que par un code d'invite",
	},
]

async function createLobby(status: string) {
	const { data, error } = await supabase
		.from("lobbies")
		.insert([
			{
				title: `Partie de ${getPlayer.username}`,
				is_public: status === "public",
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
}
</script>
