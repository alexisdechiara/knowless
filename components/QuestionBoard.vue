<template>
	<div class="absolute inset-0 flex size-full flex-col gap-4 p-4">
		<ProgressBar v-if=" mode === 'solo' || phase === 'question'" :value="convertMillisecondsToPercentage" :duration="0" tickness="xl" />
		<div class="relative h-9 w-full">
			<Badge :class="content?.difficulty === 'easy' ? 'bg-emerald-500' : content?.difficulty === 'hard' ? 'bg-red-500' : 'bg-amber-500'" class="pointer-events-none absolute start-0 top-0 px-4 py-1 text-sm capitalize">{{ content?.difficulty }}</Badge>
			<template v-if=" mode === 'solo' || phase === 'question'">
				<span class="absolute start-1/2 top-0 -translate-x-1/2 text-3xl font-semibold">Question {{ nbQuestion }}</span>
				<div class="absolute right-0 top-0 font-semibold">
					<NumberFlowGroup>
						<div style="font-variant-numeric: tabular-nums; --number-flow-char-height: 0.85em" class="flex items-baseline text-xl font-semibold">
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
			</template>
			<template v-if=" mode === 'multi' && phase === 'correction'">
				<span v-if="content?.points" class="absolute right-0 top-0 text-xl font-semibold">{{ content.points }} {{ content.points > 1 ? 'points' : 'point' }}</span>
			</template>
			<slot name="header" :status="status" />
		</div>
		<div class="relative mt-16 flex size-full flex-col items-center justify-start sm:mt-0 sm:justify-center">
			<div class="flex flex-col gap-y-4 px-6 sm:w-1/2 sm:px-0">
				<NuxtImg v-if="content?.image" class="aspect-video rounded-md" :src="content?.image?.url" :alt="content?.image?.alt" />
				<span class="mb-4 text-pretty text-center text-2xl font-semibold sm:mb-8 sm:text-3xl">{{ content?.question }}</span>
				<template v-if="content?.type === 'open'">
					<span v-if="mode === 'multi' && phase === 'correction'" class="text-center">
						<bold class="font-medium">Réponse : </bold>
						{{ content.answers.filter((answer: Quizz["answers"][number]) => answer.isCorrect).map((answer : Quizz["answers"][number]) => answer.answer).join(', ') }}
					</span>
					<Input ref="openInput" v-model="inputAnswer" type="text" class="mx-auto max-w-xs" :disabled="mode === 'multi' && phase === 'correction'" />
					<Switch v-if="mode === 'multi' && phase === 'correction'" v-model:checked="isCorrect" class="mx-auto data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-red-500" @update:checked="emit('corrected', isCorrect)">
						<template #thumb>
							<Icon v-if="isCorrect" name="lucide:check" />
							<Icon v-else name="lucide:x" />
						</template>
					</Switch>
				</template>
				<ToggleGroup v-else-if="content?.type === 'four' || content?.type === 'two'" v-model="selectedAnswer" :type="checkMultipleCorrectAnswers ? 'multiple' : 'single'" variant="outline" :class="{ 'pointer-events-none': showResult }" class="grid auto-rows-fr grid-cols-2 gap-4">
					<ToggleGroupItem v-for="(choice, index) in content.answers" :key="`choice${index}`" :ref="`choice-${index}`" :data-result="showResult" :class="{ correctAnswerClass: choice.isCorrect, selectedAnswerClass: selectedAnswer === String(index) && !choice.isCorrect }" class="size-full py-4" :value="String(index)">
						{{ choice.answer }}
					</ToggleGroupItem>
				</ToggleGroup>
			</div>

			<Dialog v-if="mode === 'solo' && showResult">
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger as-child>
							<Button variant="outline" size="icon" class="absolute bottom-28 left-0 flex size-fit rounded-full p-3 sm:bottom-40 sm:left-8" @click="emit('scoreBoard')">
								<Icon name="lucide:trophy" class="text-xl" />
							</Button>
						</TooltipTrigger>
						<TooltipContent side="right">
							Voir le <b class="font-medium">tableau des scores</b>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</Dialog>

			<Dialog v-if="content?.anecdote && showResult">
				<DialogTrigger>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger as-child>
								<Button variant="outline" size="icon" class="absolute bottom-14 left-0 flex size-fit rounded-full p-3 sm:bottom-24 sm:left-8">
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
					<DialogDescription class="text-justify"> {{ content.anecdote }} </DialogDescription>
					<DialogFooter />
				</DialogContent>
			</Dialog>

			<TooltipProvider v-if="content?.wikipedia && showResult">
				<Tooltip>
					<TooltipTrigger as-child>
						<Button variant="outline" size="icon" class="absolute bottom-0 left-0 flex size-fit rounded-full p-3 sm:bottom-8 sm:left-8" @click="navigateTo(content.wikipedia, { external: true, open: { target: '_blank' } })">
							<Icon name="bi:wikipedia" class="text-xl" />
						</Button>
					</TooltipTrigger>
					<TooltipContent side="right">
						Voir la page <b class="font-medium">Wikipedia</b>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>

			<Button v-if="((mode === 'solo' && status === 'correct') || (mode === 'multi' && phase === 'correction')) && showResult && showNext" variant="secondary" class="absolute bottom-0 right-0 flex h-fit py-4 pl-5 sm:bottom-8 sm:right-8" @click="emit('next')">
				<div class="flex flex-col">
					<span class="text-xl font-medium">Suivant</span>
					<span v-if="nbQuestion" class="text-sm text-secondary-foreground/50">Question {{ nbQuestion + 1 }}</span>
				</div>
				<Icon name="lucide:arrow-right" class="text-3xl" />
			</Button>

			<div v-if="status === 'incorrect' && showResult" class="absolute bottom-0 right-0 mt-16 flex justify-between gap-x-2 sm:bottom-8 sm:right-8">
				<Button v-if="showBack" size="icon" variant="secondary" class="px-7 py-6 text-xl" @click="emit('back')">
					<Icon name="lucide:arrow-left" class="aspect-square" />
				</Button>
				<Button v-if="showRestart" size="lg" class="w-full px-5 py-6 text-lg" @click="emit('restart')">Recommencer</Button>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup generic="UNUSED">
import NumberFlow, { NumberFlowGroup } from "@number-flow/vue"
import { useFocus, watchDebounced } from "@vueuse/core"
import type { Quizz } from "~/models/quizz"

type QuestionBoardProps = {
	mode: "solo"
	phase?: never
	content: Quizz | null
	duration: number
	questionNumber?: number
	showRestart?: boolean
	showBack?: boolean
	showNext?: boolean
	answer?: never
} | {
	mode: "multi"
	phase: "question" | "correction"
	content: Quizz | null
	duration: number
	questionNumber?: number
	showRestart?: never
	showBack?: never
	answer?: string
	showNext?: boolean
}

const emit = defineEmits(["started", "ended", "badAnswer", "goodAnswer", "next", "restart", "back", "status", "scoreBoard", "answer", "corrected"])

const props = withDefaults(defineProps<QuestionBoardProps>(), {
	showNext: true,
})

const nbQuestion = computed(() => props?.questionNumber || props?.questionNumber === 0 ? props.questionNumber + 1 : undefined)
const remainingTime = ref(0)
const selectedAnswer = ref<string>()
const inputAnswer = ref<string>("")
const emittedAnswer = ref<string>("")
const status = ref<"correct" | "incorrect" | "pending" | undefined>(undefined)
const showResult = ref(false)
const isCorrect = ref<boolean>(false)
const openInput = shallowRef<HTMLInputElement | null>()

useFocus(openInput, { initialValue: true })

if (props.answer) {
	if (props.content?.type === "open") {
		inputAnswer.value = props.answer
	}
	else selectedAnswer.value = String(props.content?.answers.findIndex(answer => answer.answer === props.answer))
}

watchDebounced(selectedAnswer, () => {
	emittedAnswer.value = String(props.content?.answers[Number(selectedAnswer.value)].answer)
	emit("answer", emittedAnswer.value)
}, { debounce: 1000 })

watchDebounced(inputAnswer, () => {
	emittedAnswer.value = inputAnswer.value
	emit("answer", emittedAnswer.value)
}, { debounce: 1000 })

onUnmounted(() => {
	if (inputAnswer.value === "" && selectedAnswer.value === "") {
		emit("answer", "")
	}
	else {
		if (props.content?.type === "open" && emittedAnswer.value !== inputAnswer.value) {
			emit("answer", inputAnswer.value)
		}
		else if ((props.content?.type === "four" || props.content?.type === "two") && emittedAnswer.value !== selectedAnswer.value) {
			emit("answer", String(props.content?.answers[Number(selectedAnswer.value)].answer))
		}
	}
})

const convertMillisecondsToPercentage = computed(() => {
	if (remainingTime.value <= 0) return 100
	if (remainingTime.value >= props.duration) return 0
	return ((props.duration - remainingTime.value) / props.duration) * 100
})

onMounted(() => {
	startTimer(props.duration)
})

function startTimer(nbMilliseconds: number) {
	remainingTime.value = nbMilliseconds
	status.value = "pending"
	emit("started")
	if (nbMilliseconds > 0) {
		setTimeout(() => {
			startTimer(nbMilliseconds - 10)
		}, 10)
	}
	else {
		if (props.mode === "solo" || (props.mode === "multi" && props.phase === "correction")) {
			showResult.value = true
			if (props.content?.type === "open") {
				isCorrect.value = props.content.answers.some((answer) => {
					// Fonction pour normaliser une chaîne: minuscules, sans accents, sans ponctuation, espaces normalisés
					const normalizeString = (str: string) => {
						return str
							.toLowerCase() // Convertir en minuscules
							.normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Supprimer les accents
							.replace(/[.,;:!?'"()[\]{}]/g, "") // Supprimer la ponctuation
							.replace(/\s+/g, " ") // Normaliser les espaces multiples
							.trim() // Supprimer les espaces de début et fin
					}

					// Normaliser les deux chaînes pour la comparaison
					const formattedAnswer = normalizeString(answer.answer)
					const formattedInput = normalizeString(inputAnswer.value)

					// Vérification avec les chaînes normalisées
					return formattedAnswer === formattedInput
				})
			}
			else if (props.content?.type === "four" || props.content?.type === "two") {
				isCorrect.value = selectedAnswer.value === String(props.content?.answers.findIndex(answer => answer.isCorrect))
			}

			if (isCorrect.value) {
				status.value = "correct"
				emit("goodAnswer")
			}
			else {
				status.value = "incorrect"
				emit("badAnswer")
			}
		}
		emit("ended")
	}
}

watch(status, () => emit("status", status.value))

const checkMultipleCorrectAnswers = computed(() => props.content?.answers && props.content.answers.filter(answer => answer.isCorrect).length > 1)
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
