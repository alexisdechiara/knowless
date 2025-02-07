<template>
	<CustomCard>
		<div class="flex size-full flex-col justify-between gap-4">
			<span class="text-center text-6xl font-semibold leading-loose">Sélection du type de lobby</span>
			<ToggleGroup :model-value="selectedStatus" type="single" class="grid h-full grid-cols-1 gap-6 p-6 sm:p-10 sm:pt-5" @update:model-value="(status) => { if (status) selectedStatus = status as string }">
				<Card v-for="status in statuses" :key="status.title" class="h-fit w-full">
					<ToggleGroupItem :value="status.value" class="flex size-full items-center justify-start gap-4 px-4 py-6">
						<Icon :name="status.icon" class="text-4xl" />
						<span class="text-2xl font-semibold sm:text-4xl">{{ status.title }}</span>
						<Icon name="lucide:chevron-right" class="ms-auto text-2xl" />
					</ToggleGroupItem>
				</Card>
			</ToggleGroup>
			<div class="flex gap-x-4 pb-4 sm:pb-0">
				<Button class="aspect-square size-16 text-2xl sm:h-full sm:w-fit" variant="outline" size="icon" @click="navigateTo('/')">
					<Icon name="lucide:arrow-left" />
				</Button>
				<Button class="w-full" size="xxl" @click="createLobby">
					Créer le lobby
				</Button>
			</div>
		</div>
	</CustomCard>
</template>

<script lang="ts" setup>
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const selectedStatus = ref("public")

const statuses = [
	{
		title: "Public",
		value: "public",
		icon: "lucide:globe",
		description: "Le lobby sera visible par tout le monde",
	},
	{
		title: "Privé",
		value: "private",
		icon: "lucide:lock",
		description: "Le lobby ne sera pas visible dans la liste des parties",
	},
]

async function createLobby() {
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
				is_public: selectedStatus.value === "public",
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
