<template>
	<div class="relative flex h-svh w-screen flex-col items-center justify-center bg-background">
		<template v-if="!isPlaying">
			<SoloStartCard @start="start" />
			<div class="absolute bottom-4 right-4 hidden sm:block">
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
					@bad-answer="isFinished = true"
					@restart="restart"
					@back="backToSelection"
					@score-board="showGameOverDialog = true"
				/>
				<Dialog v-model:open="showGameOverDialog">
					<DialogContent class="max-w-xl pb-4 sm:p-12" :class="{ 'sm:pb-4': isFinished, 'sm:pb-6': !isFinished }">
						<span class="mb-2 text-center text-2xl font-bold uppercase leading-loose tracking-wider sm:text-4xl">{{ isFinished ? 'Vous avez perdu' : 'tableau des scores' }}</span>
						<div class="flex justify-between text-2xl">
							<span class="inline-flex w-full">Votre score</span>
							<span class="inline-flex font-medium">{{ currentScore }}</span>
						</div>
						<div class="flex justify-between text-2xl">
							<span class="inline-flex w-full">Meilleur score</span>
							<span class="inline-flex font-medium">{{ stats.bestScore }}</span>
						</div>
						<div v-if="isFinished" class="mt-16 flex justify-between gap-x-4">
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

const config = useRuntimeConfig()

const isPlaying = ref(false)
const isFinished = ref(false)
const selectedDifficulty = ref<Difficulty>("easy")
const maxDurationTime = ref(5000)
const showGameOverDialog = ref(false)
const currentScore = ref(0)
const nextScore = ref(0)
const roundKey = ref(0)

function start(difficulty: Difficulty) {
	isPlaying.value = true
	selectedDifficulty.value = difficulty
	stats.nbGames++
	stats.nbRounds++
	execute()
}

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const { data: player } = await supabase.from("players").select("categories, stats").eq("id", user.value?.id).single()
const stats = reactive({
	nbGames: player.stats[selectedDifficulty.value].nb_games || 0,
	nbRounds: player.stats[selectedDifficulty.value].nb_rounds || 0,
	bestScore: player.stats[selectedDifficulty.value].best_score || 0,
})

const getDifficultyValue = (key: Difficulty): number => difficultyMapping[key]
const category = ref<string | null>(localCategoryToOpenQuizzCategory(getRandomCategory(player.categories)))

const getNewCategory = () => {
	category.value = localCategoryToOpenQuizzCategory(getRandomCategory(player.categories))
}

const { data, status, error, execute, refresh } = useFetch(`${config.public.openQuizzDbApiUrl || "https://api.openquizzdb.org"}`, {
	query: {
		key: config.public.openQuizzDbApiKey,
		diff: getDifficultyValue(selectedDifficulty.value),
		categ: computed(() => category.value),
		anec: 1,
		wiki: 1,
		lang: "fr",
	},
	transform: (data: OpenQuizzDB) => new Quizz(data.results[0] as OpenQuizzDBResult),
	server: false,
	immediate: false,
	cache: "no-cache",
	watch: [category],
})

watch(error, () => {
	console.error(error.value)
	toast.error(`Erreur ${error.value?.statusCode}`, {
		description: error.value?.message,
		action: {
			label: "Actualiser",
			onClick: () => refresh(),
		},
	})
})

watch(roundKey, () => {
	getNewCategory()
})

function incrementScore() {
	nextScore.value++
	stats.bestScore = Math.max(stats.bestScore, nextScore.value)
}

function nextQuestion() {
	reduceDurationTime()
	currentScore.value = nextScore.value
	stats.nbRounds++
	roundKey.value++
	refresh()
}

function reduceDurationTime() {
	if (maxDurationTime.value > 2000) {
		maxDurationTime.value -= 100
	}
}

function backToSelection() {
	showGameOverDialog.value = false
	isFinished.value = false
	isPlaying.value = false
}

async function restart() {
	showGameOverDialog.value = false
	isFinished.value = false
	maxDurationTime.value = 5000
	currentScore.value = 0
	nextScore.value = 0
	roundKey.value++
	refresh()
}

watch(isFinished, async () => {
	if (isFinished.value) {
		await supabase
			.from("players")
			.update({ stats: {
				easy: selectedDifficulty.value === "easy" ? { nb_games: stats.nbGames, nb_rounds: stats.nbRounds, best_score: stats.bestScore } : player.stats.easy,
				medium: selectedDifficulty.value === "medium" ? { nb_games: stats.nbGames, nb_rounds: stats.nbRounds, best_score: stats.bestScore } : player.stats.medium,
				hard: selectedDifficulty.value === "hard" ? { nb_games: stats.nbGames, nb_rounds: stats.nbRounds, best_score: stats.bestScore } : player.stats.hard,
			} })
			.eq("id", user.value?.id)
	}
})
</script>
