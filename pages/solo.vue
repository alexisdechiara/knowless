<template>
	<div class="flex h-screen w-screen flex-col items-center justify-center bg-background">
		<SoloStartCard v-if="!isPlaying" @start="start" />
		<template v-else-if="isPlaying && loading">
			<Icon v-if="loading" name="line-md:loading-loop" class="text-9xl" />
		</template>
		<div v-else class="flex size-full flex-col gap-4 p-4">
			<ProgressBar :value="50" tickness="xl" />
			<div class="relative h-9 w-full">
				<Badge :class="dificulty.value === 'easy' ? 'bg-emerald-500' : dificulty.value === 'medium' ? 'bg-amber-500' : 'bg-red-500'" class="pointer-events-none absolute start-0 top-0 px-4 py-1 text-sm">{{ dificulty.label }}</Badge>
				<span class="absolute start-1/2 top-0 -translate-x-1/2 text-3xl font-semibold">Question 1</span>
				<div class="absolute right-0 top-0 font-semibold">
					<NumberFlowGroup>
						<div
							style="font-variant-numeric: tabular-nums; --number-flow-char-height: 0.85em"
							class="flex items-baseline text-xl font-semibold"
						>
							<NumberFlow
								:trend="-1"
								:value="remainingSeconds"
								:format="{ minimumIntegerDigits: 2, maximumSignificantDigits: 2 }"
								will-change
							/>
							<NumberFlow
								prefix=":"
								:trend="-1"
								:value="remainingMilliseconds"
								:format="{ minimumIntegerDigits: 2 }"
								:spin-timing="{ duration: 100 }"
								:transform-timing="{ duration: 0 }"
								will-change
							/>
						</div>
					</NumberFlowGroup>
				</div>
			</div>
			<div class="relative flex size-full flex-col items-center justify-center">
				<div class="flex w-1/3 flex-col gap-y-4">
					<NuxtImg class="aspect-video rounded-md" src="https://placehold.co/600x400" alt="" />
					<span class="mb-8 text-pretty text-center text-3xl font-semibold">{{ quizz.question }}</span>
					<!-- <Input type="text" /> -->
					<ToggleGroup v-model="selectedAnswer" type="single" variant="outline" :class="{ 'pointer-events-none': showResult }" class="grid grid-cols-2 gap-4">
						<ToggleGroupItem v-for="(choice, index) in quizz.answers" :key="`choice${index}`" :ref="`choice-${index}`" :data-result="showResult" :class="{ correctAnswerClass: choice.isCorrect, selectedAnswerClass: selectedAnswer === String(index) && !choice.isCorrect }" class="w-full" :value="String(index)">
							{{ choice.answer }}
						</ToggleGroupItem>
					</ToggleGroup>
				</div>

				<Dialog>
					<DialogTrigger>
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger as-child>
									<Button variant="outline" size="icon" class="absolute bottom-24 left-8 flex size-fit rounded-full p-3">
										<Icon name="lucide:message-circle-more" class="text-xl" />
									</Button>
								</TooltipTrigger>
								<TooltipContent side="right">
									Voir une <b class="font-medium">annecdote</b>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle class="text-2xl">Anecdote</DialogTitle>
						</DialogHeader>
						<DialogDescription class="text-justify">
							Lorem ipsum dolor sit amet consectetur adipisicing elit. Animi vero voluptates commodi, repudiandae ea esse. Nostrum, labore impedit! Tenetur, neque libero doloremque maxime facilis inventore? Harum quisquam sit ullam esse.
						</DialogDescription>
						<DialogFooter />
					</DialogContent>
				</Dialog>

				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger as-child>
							<Button variant="outline" size="icon" class="absolute bottom-8 left-8 flex size-fit rounded-full p-3" @click="navigateTo(quizz.wikipedia, { external: true, open: { target: '_blank' } })">
								<Icon name="bi:wikipedia" class="text-xl" />
							</Button>
						</TooltipTrigger>
						<TooltipContent side="right">
							Voir la page <b class="font-medium">Wikipedia</b>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
				<Button variant="secondary" class="absolute bottom-8 right-8 flex h-fit">
					<div class="flex flex-col">
						<span class="text-xl font-medium">Suivant</span>
						<span class="text-sm text-secondary-foreground/50">Question 2</span>
					</div>
					<Icon name="lucide:chevron-right" class="text-3xl" />
				</Button>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import NumberFlow, { NumberFlowGroup } from "@number-flow/vue"
import type { OpenQuizzDBResult } from "~/models/openquizzdb"
import { Quizz } from "~/models/quizz"

const isPlaying = ref(false)
const dificulty = ref<Dificulty>({ label: "Facile", value: "easy" })
const loading = ref(false)
const showResult = ref(false)
const remainingTime = ref(5000)

const quizz = new Quizz({
	categorie: "musique",
	theme: "Depeche Mode",
	difficulte: "expert",
	question: "Quel morceau a été choisi pour figurer en face B du titre ‘NewLife’?",
	reponse_correcte: "’Shout’",
	autres_choix: ["’Ice Machine’", "’Any Second Now’", "’See You’"],
	wikipedia: "https://fr.wikipedia.org/wiki/New_Life",
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
	startTimer(5000)
}

const selectedAnswer = ref<string>()

function startTimer(nbMilliseconds: number) {
	remainingTime.value = nbMilliseconds
	if (nbMilliseconds > 0) {
		setTimeout(() => {
			startTimer(nbMilliseconds - 10)
		}, 10)
	}
	else {
		showResult.value = true
	}
}

const remainingSeconds = computed(() => Math.floor(remainingTime.value / 1000))
const remainingMilliseconds = computed(() => (remainingTime.value % 1000) / 10)
</script>

<style scoped>
.correctAnswerClass {
	@apply data-[result=true]:bg-emerald-500
}

.selectedAnswerClass {
	@apply data-[result=true]:bg-red-500
}
</style>
