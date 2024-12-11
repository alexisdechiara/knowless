<template>
	<Card class="flex size-2/3 flex-col justify-between p-6 shadow-md">
		<span class="text-center text-6xl font-semibold">Partie solo</span>
		<ToggleGroup v-model="selectedDificulty" type="single" class="grid grid-cols-3 gap-12">
			<Card v-for="dificulty in dificulties" :key="dificulty.title" class="h-full">
				<ToggleGroupItem :value="dificulty.value" class="block size-full">
					<CardHeader class="flex flex-col items-center">
						<Icon :name="dificulty.icon" class="my-8 text-6xl" />
						<CardTitle>{{ dificulty.title }}</CardTitle>
					</CardHeader>
					<CardContent>
						<CardDescription class="text-balance">
							{{ dificulty.description }}
						</CardDescription>
					</CardContent>
				</ToggleGroupItem>
			</Card>
		</ToggleGroup>
		<Button class="w-full" size="xxl" @click="emit('start', dificulties.find((d) => d.value === selectedDificulty))">
			Commencer
		</Button>
	</Card>
</template>

<script lang="ts" setup>
const selectedDificulty = ref("easy")

const emit = defineEmits(["start"])

const dificulties = [
	{
		title: "Facile",
		value: "easy",
		description: "Pour se relaxer, apprendre tout en simplicité",
		icon: "fluent-emoji:unamused-face",
	},
	{
		title: "Moyen",
		value: "medium",
		description: "Il faut quand même un peu de difficulté pour pimenter",
		icon: "fluent-emoji:slightly-smiling-face",
	},
	{
		title: "Difficile",
		value: "hard",
		description: "Met moi ce que tu a de plus dure, ici on ne rigole pas !",
		icon: "fluent-emoji:angry-face",
	},
]
</script>
