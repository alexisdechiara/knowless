<template>
	<div class="relative flex h-screen w-screen flex-col items-center justify-center bg-background">
		<template v-if="!isPlaying">
			<SoloStartCard @start="start" />
			<div class="absolute bottom-4 right-4">
				<NuxtLink to="https://www.openquizzdb.org/" target="_blank">
					<span class="text-sm font-medium text-primary">Powered by</span>
					<NuxtImg src="/img/OpenQuizzDB.webp" alt="OpenQuizzDB" class="h-10" />
				</NuxtLink>
			</div>
		</template>
		<template v-else>
			<Icon v-if="status === 'pending'" name="line-md:loading-loop" class="text-9xl" />
			<template v-else-if="status === 'success'">
				<QuestionBoard
					:key="roundKey"
					:content="data"
					:question-number="currentScore"
					:duration="maxDurationTime"
					show-restart
					show-back
					@next="nextQuestion"
					@good-answer="incrementScore"
					@bad-answer="showGameOverDialog = true"
					@restart="restart"
					@back="backToSelection"
				/>
				<Dialog v-model:open="showGameOverDialog">
					<DialogContent class="p-16 pb-4">
						<span class="text-center text-4xl font-bold uppercase leading-loose tracking-wider">Vous avez perdu</span>
						<div class="flex justify-between text-2xl">
							<span class="inline-flex w-full">Votre score</span>
							<span class="inline-flex font-medium">{{ currentScore }}</span>
						</div>
						<div class="flex justify-between text-2xl">
							<span class="inline-flex w-full">Meilleur score</span>
							<span class="inline-flex font-medium">{{ scoreboard.getScoreBoardByDifficulty(selectedDifficulty).bestScore }}</span>
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
			<template v-else>
				<div class="flex max-w-xl flex-col items-center gap-y-4">
					<span class="text-center text-4xl font-bold tracking-tight text-foreground"> Oh, oh ! une erreur est survenue </span>
					<p class="max-w-md text-pretty text-center text-lg text-muted-foreground"> Il semblerait que nous n'avons pas réeussi à obtenir une question à afficher, veuillez réessayer plus tard ou essayez d'actualiser la page.</p>
					<div class="mt-4 flex gap-x-4">
						<Button size="lg" @click="navigateTo('/')">Retour à l'accueil</Button>
						<Button size="lg" variant="outline" @click="refresh">Actualiser</Button>
					</div>
				</div>
			</template>
		</template>
	</div>
</template>

<script lang="ts" setup>
import { toast } from "vue-sonner"
import type { OpenQuizzDB, OpenQuizzDBResult } from "~/models/openquizzdb"
import { Quizz } from "~/models/quizz"
import type { Difficulty } from "~/types/Difficulty"
import { difficultyMapping } from "~/types/Difficulty"

const scoreboard = useScoreboardStore()
const config = useRuntimeConfig()

const isPlaying = ref(false)
const selectedDifficulty = ref<Difficulty>("easy")
const maxDurationTime = ref(5000)
const showGameOverDialog = ref(false)
const currentScore = ref(0)
const nextScore = ref(0)
const roundKey = ref(0)

function start(difficulty: Difficulty) {
	isPlaying.value = true
	selectedDifficulty.value = difficulty
	scoreboard.getScoreBoardByDifficulty(selectedDifficulty.value).nbGames++
	execute()
}

const getDifficultyValue = (key: Difficulty): number => difficultyMapping[key]

const { data, status, error, execute, refresh } = useFetch(`${config.public.openQuizzDbApiUrl || "https://api.openquizzdb.org"}`, {
	query: {
		key: config.public.openQuizzDbApiKey,
		diff: getDifficultyValue(selectedDifficulty.value),
		anec: 1,
		wiki: 1,
		lang: "fr",
	},
	transform: (data: OpenQuizzDB) => new Quizz(data.results[0] as OpenQuizzDBResult),
	server: false,
	immediate: false,
	cache: "no-cache",
})

watch(error, () => {
	console.error(error.value)
	toast(`Erreur ${error.value?.statusCode}`, {
		description: error.value?.message,
		action: {
			label: "Actualiser",
			onClick: () => refresh(),
		},
	})
})

function incrementScore() {
	nextScore.value++
	scoreboard.getScoreBoardByDifficulty(selectedDifficulty.value).bestScore = Math.max(scoreboard.getScoreBoardByDifficulty(selectedDifficulty.value).bestScore, nextScore.value)
}

function nextQuestion() {
	// TODO fetch
	reduceDurationTime()
	currentScore.value = nextScore.value
	roundKey.value++
	scoreboard.getScoreBoardByDifficulty(selectedDifficulty.value).nbRounds++
	refresh()
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
	showGameOverDialog.value = false
	maxDurationTime.value = 5000
	currentScore.value = 0
	nextScore.value = 0
	roundKey.value++
	scoreboard.getScoreBoardByDifficulty(selectedDifficulty.value).nbGames++
	scoreboard.getScoreBoardByDifficulty(selectedDifficulty.value).nbRounds++
	refresh()
}
</script>
