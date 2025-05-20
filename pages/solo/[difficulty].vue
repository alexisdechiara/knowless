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
				@back="navigateTo('/solo')"
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
						<Button size="xl" variant="secondary" @click="navigateTo('/solo')">
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
	</div>
</template>

<script lang="ts" setup>
import { toast } from "vue-sonner"

const isPlaying = ref(false)
const isFinished = ref(false)
const maxDurationTime = ref(5000)
const showGameOverDialog = ref(false)
const currentScore = ref(0)
const nextScore = ref(0)
const roundKey = ref(0)

const difficulty = useRoute().params.difficulty.toString()
const supabase = useSupabaseClient()
const user = useSupabaseUser()

useHead({
	title: `Solo - ${difficulty === "easy" ? "Facile" : difficulty === "medium" ? "Moyen" : "Difficile"}`,
})

const { data: player } = await supabase.from("players").select("categories, stats, language").eq("id", user.value?.id).single()
const stats = reactive({
	nbGames: player.stats[difficulty].nb_games || 0,
	nbRounds: player.stats[difficulty].nb_rounds || 0,
	bestScore: player.stats[difficulty].best_score || 0,
})

const category = ref<string>(getRandomCategory(player.categories))

const getNewCategory = () => {
	category.value = getRandomCategory(player.categories)
}

const { data, status, error, execute, refresh } = useQuizz(player.categories, player.language, difficulty)

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
				easy: difficulty === "easy" ? { nb_games: stats.nbGames, nb_rounds: stats.nbRounds, best_score: stats.bestScore } : player.stats.easy,
				medium: difficulty === "medium" ? { nb_games: stats.nbGames, nb_rounds: stats.nbRounds, best_score: stats.bestScore } : player.stats.medium,
				hard: difficulty === "hard" ? { nb_games: stats.nbGames, nb_rounds: stats.nbRounds, best_score: stats.bestScore } : player.stats.hard,
			} })
			.eq("id", user.value?.id)
	}
})

if (difficulty === undefined || !["easy", "medium", "hard"].includes(difficulty)) {
	navigateTo("/solo")
}
else {
	isPlaying.value = true
	stats.nbGames++
	stats.nbRounds++
	execute()
}
</script>
