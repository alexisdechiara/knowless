<template>
	<Card class="flex size-2/3 flex-col justify-between p-6 shadow-md">
		<span class="text-center text-6xl font-semibold">Partie solo</span>
		<ToggleGroup :model-value="selectedDifficulty" type="single" class="grid grid-cols-3 gap-12" @update:model-value="(difficulty) => { if (difficulty) selectedDifficulty = difficulty as string }">
			<Card v-for="difficulty in difficulties" :key="difficulty.title" class="h-full">
				<ToggleGroupItem :value="difficulty.value" class="block size-full">
					<CardHeader class="flex flex-col items-center">
						<Icon :name="difficulty.icon" class="my-8 text-6xl" />
						<CardTitle>{{ difficulty.title }}</CardTitle>
					</CardHeader>
					<CardContent>
						<CardDescription class="text-balance">
							{{ difficulty.description }}
						</CardDescription>
					</CardContent>
				</ToggleGroupItem>
			</Card>
		</ToggleGroup>
		<div class="flex gap-x-4">
			<Button class="aspect-square h-full w-fit text-2xl" variant="outline" size="icon" @click="navigateTo('/')">
				<Icon name="lucide:arrow-left" />
			</Button>
			<Button class="w-full" size="xxl" @click="emit('start', difficulties.find((d) => d.value === selectedDifficulty))">
				Commencer
			</Button>
		</div>
	</Card>
</template>

<script lang="ts" setup>
const selectedDifficulty = ref("easy")

const emit = defineEmits(["start"])

const difficulties = [
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
