<template>
	<div class="flex min-h-screen flex-col items-center justify-center">
		<Icon v-if="status === 'pending'" name="line-md:loading-loop" class="text-9xl" />
		<template v-else-if="status === 'success'">
			<QuestionBoard
				:key="roundKey"
				mode="solo"
				:content="data"
				:question-number="currentScore"
				:duration="maxDurationTime"
				show-restart
				show-back
				@next="nextQuestion"
				@good-answer="incrementScore"
				@bad-answer="isFinished = true"
				@restart="restart"
				@back="backToMenu"
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
					<DialogFooter />
				</DialogContent>
			</Dialog>
		</template>
		<template v-else>
			<div class="flex max-w-xl flex-col items-center gap-y-4">
				<span class="text-center text-4xl font-bold tracking-tight text-foreground"> Oh, oh ! une erreur est survenue </span>
				<p class="max-w-md text-pretty text-center text-lg text-muted-foreground"> Il semblerait que nous n'avons pas réeussi à obtenir une question à afficher, veuillez réessayer plus tard ou essayez d'actualiser la page.</p>
				<div class="mt-4 flex gap-x-4">
					<Button size="lg" @click="backToHomepage">Retour à l'accueil</Button>
					<Button size="lg" variant="outline" @click="refresh">Actualiser</Button>
				</div>
			</div>
		</template>
	</div>
</template>

<script lang="ts" setup>
import { toast } from "vue-sonner"
import type { Database } from "~~/shared/types/database.types"

const isPlaying = ref(false)
const isFinished = ref(false)
const maxDurationTime = ref(5000)
const showGameOverDialog = ref(false)
const currentScore = ref(0)
const nextScore = ref(0)
const roundKey = ref(0)
const newBestThisRun = ref(false)

const difficulty = String(useRoute().params.difficulty)
const supabase = useSupabaseClient<Database>()
const { getPlayer } = usePlayerStore()
const presence = usePresenceStore()

useHead({
	title: `Solo - ${difficulty === "easy" ? "Facile" : difficulty === "medium" ? "Moyen" : "Difficile"}`,
})

const stats = reactive({
	nbGames: 0,
	nbRounds: 0,
	bestScore: 0,
	bestScoreDate: null as string | null,
})

async function loadStats() {
	try {
		const { data } = await supabase
			.from('statistics')
			.select('nb_games, nb_rounds, best_score, best_score_date')
			.eq('user_id', getPlayer.id as string)
			.eq('difficulty', difficulty as Database['public']['Enums']['difficulties'])
			.maybeSingle()

		if (data) {
			stats.nbGames = data.nb_games ?? 0
			stats.nbRounds = data.nb_rounds ?? 0
			stats.bestScore = data.best_score ?? 0
			stats.bestScoreDate = data.best_score_date ?? null
		}
	} catch (e) {
		console.error(e)
	}
}

const category = ref<string | undefined>(getRandomCategory(getPlayer?.categories))

const getNewCategory = () => {
	category.value = getRandomCategory(getPlayer?.categories)
}

const { data, status, error, execute, refresh } = useQuizz(getPlayer?.categories, getPlayer?.language, difficulty)

watch(error, () => {
	console.error(error.value)
	toast.error(`Erreur ${error.value}`, {
		description: error.value?.message,
		action: {
			label: "Actualiser",
			onClick: () => refresh(),
		},
	})
})

watch(roundKey, () => {
	getNewCategory()
	refresh()
})

function incrementScore() {
	nextScore.value++
	if (nextScore.value > stats.bestScore) {
		stats.bestScore = nextScore.value
		newBestThisRun.value = true
	}
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

function backToMenu() {
	presence.clear()
	navigateTo("/solo")
}

async function backToHomepage() {
	presence.clear()
	await navigateTo("/")
}

async function restart() {
	showGameOverDialog.value = false
	isFinished.value = false
	maxDurationTime.value = 5000
	currentScore.value = 0
	nextScore.value = 0
	stats.nbGames++
	roundKey.value++
	newBestThisRun.value = false
	refresh()
}

watch(isFinished, async () => {
	if (isFinished.value) {
		try {
			const newDate = new Date().toISOString()
			stats.bestScoreDate = newBestThisRun.value ? newDate : stats.bestScoreDate
			const { error } = await supabase
				.from('statistics')
				.upsert(
					{
						user_id: getPlayer.id as string,
						difficulty: difficulty as Database['public']['Enums']['difficulties'],
						nb_games: stats.nbGames,
						nb_rounds: stats.nbRounds,
						best_score: stats.bestScore,
						best_score_date: stats.bestScoreDate,
						updated_at: newDate,
					},
					{ onConflict: 'user_id,difficulty' }
				)
			if (error) throw error
		} catch (e) {
			console.error(e)
			toast.error('Impossible d\'enregistrer les statistiques')
		}
	}
})

onMounted(async () => {
	const valid = ["easy", "medium", "hard"].includes(difficulty)
	if (!valid) {
		await navigateTo("/solo")
		return
	}
	await loadStats()
	stats.nbGames++
	stats.nbRounds++
	isPlaying.value = true
	presence.setPlaying(null)
	newBestThisRun.value = false
	execute()
})

onUnmounted(() => {
    // Leaving solo page -> back to online
    presence.clear()
})
</script>
