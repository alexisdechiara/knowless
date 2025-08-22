<template>
	<NuxtLayout name="selection" :previous="{ icon: 'lucide:chevron-left', button: { variant: 'outline' }, to: '/' }">
		<SelectionCard v-for="difficulty in difficulties" :key="difficulty.title" :title="difficulty.title" :description="difficulty.description" :to="`/solo/${difficulty.value}`">
			<template #img>
				<Icon :name="difficulty.icon" class="text-8xl md:text-9xl" />
			</template>
		</SelectionCard>
		<div class="fixed sr-only bottom-4 left-1/2 -translate-x-1/2 hidden sm:block">
			<NuxtLink to="https://www.openquizzdb.org/" target="_blank">
				<span class="text-sm font-medium text-primary flex w-full justify-center">Powered by</span>
				<NuxtImg src="/img/OpenQuizzDB.webp" alt="OpenQuizzDB" class="h-10" />
			</NuxtLink>
		</div>
		<div class="fixed bottom-4 right-4 md:bottom-8 md:right-8">
			<SoloLeaderboard />
		</div>
	</NuxtLayout>
</template>

<script lang="ts" setup>
import SoloLeaderboard from "~/components/SoloLeaderboard.vue"

definePageMeta({
    title: "Solo",
    description: "Jouer en solo",
})

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
