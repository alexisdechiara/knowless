<template>
	<div class="flex h-screen w-screen flex-col items-center justify-center bg-background">
		<SoloStartCard v-if="!isPlaying" @start="start" />
		<template v-else>
			<template v-if="loading">
				<Icon v-if="loading" name="line-md:loading-loop" class="text-9xl" />
			</template>
			<QuestionBoard v-else :key="roundKey" :content="quizz" :question-number="currentScore" :duration="maxDurationTime" @next="nextQuestion" @good-answer="incrementScore" @bad-answer="showGameOverDialog = true" @status="(response) => (status = response)" />
			<Dialog v-model:open="showGameOverDialog">
				<DialogContent class="p-16 pb-4">
					<span class="text-center text-4xl font-bold uppercase leading-loose tracking-wider">Vous avez perdu</span>
					<div class="flex justify-between text-2xl">
						<span class="inline-flex w-full">Votre score</span>
						<span class="inline-flex font-medium">{{ currentScore }}</span>
					</div>
					<div class="flex justify-between text-2xl">
						<span class="inline-flex w-full">Meilleur score</span>
						<span class="inline-flex font-medium">{{ bestScore }}</span>
					</div>
					<div class="mt-16 flex justify-between gap-x-4">
						<Button size="xl" variant="secondary" @click="backToSelection">
							<Icon name="lucide:arrow-left" class="aspect-square" />
						</Button>
						<Button size="xl" class="w-full" @click="restart">Recommencer</Button>
					</div>
					<DialogFooter />
				</DialogContent>
			</Dialog>
		</template>
	</div>
</template>

<script lang="ts" setup>
import type { OpenQuizzDBResult } from "~/models/openquizzdb"
import { Quizz } from "~/models/quizz"

const isPlaying = ref(false)
const dificulty = ref<Dificulty>({ label: "Facile", value: "easy" })
const loading = ref(false)
const maxDurationTime = ref(5000)
const showGameOverDialog = ref(false)
const bestScore = ref(0)
const currentScore = ref(0)
const nextScore = ref(0)
const roundKey = ref(0)
const status = ref<"correct" | "incorrect" | "pending" | undefined>("pending")

const quizz = new Quizz({
	langue: "fr",
	categorie: "tourisme",
	theme: "Nice",
	difficulte: "débutant",
	question: "Quel café de Nice, construit au XIXe siècle, fut un haut lieu de rencontre piémontais ?",
	reponse_correcte: "Café de Turin",
	autres_choix: [
		"Café de Turin",
		"Café de Naples",
		"Café de Florence",
		"Café de Milan",
	],
	anecdote: "Le café de Turin, situé place Garibaldi, reste encore aujourd'hui l'un des cafés les plus connus de la ville de Nice.",
	wikipedia: "https://fr.wikipedia.org/wiki/Nice",
} as OpenQuizzDBResult)

export type Dificulty = {
	label: string
	value: string
}

function start(selectedDificulty: any) {
	isPlaying.value = true
	dificulty.value = {
		label: selectedDificulty["title"],
		value: selectedDificulty["value"],
	}
}

function incrementScore() {
	nextScore.value++
	bestScore.value = Math.max(bestScore.value, nextScore.value)
}

function nextQuestion() {
	// TODO fetch
	loading.value = true
	reduceDurationTime()
	currentScore.value = nextScore.value
	roundKey.value++
	loading.value = false
}

function reduceDurationTime() {
	if (maxDurationTime.value > 2000) {
		maxDurationTime.value -= 100
	}
}

function backToSelection() {
	showGameOverDialog.value = false
	isPlaying.value = false
}

function restart() {
	loading.value = true
	showGameOverDialog.value = false
	maxDurationTime.value = 5000
	currentScore.value = 0
	nextScore.value = 0
	roundKey.value++
	loading.value = false
}
</script>
