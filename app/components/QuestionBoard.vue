<template>
	<div class="absolute inset-0 flex size-full flex-col gap-4 p-4">
		<ProgressBar v-if=" mode === 'solo' || phase === 'question'" :value="progressPercentage" :duration="0" tickness="xl" />
		<div class="relative h-9 w-full">
			<div class="pointer-events-none absolute start-0 top-0 inline-flex gap-x-4 capitalize">
				<Badge :class="content?.difficulty === 'easy' ? 'bg-emerald-500' : content?.difficulty === 'hard' ? 'bg-red-500' : 'bg-amber-500'" class="md:px-4 md:py-1 md:text-sm">{{ content?.difficulty }}</Badge>
				<!-- <span class="inline-flex items-center py-1 align-middle text-sm font-medium"><Icon name="lucide:gamepad" class="mr-1 size-4" /> {{ content?.category }}</span> -->
			</div>
			<template v-if=" mode === 'solo' || phase === 'question'">
				<span class="absolute start-1/2 top-0 -translate-x-1/2 text-2xl font-semibold leading-none! md:text-3xl">Question {{ nbQuestion }}</span>
				<div class="absolute right-0 top-0 font-semibold">
					<NumberFlowGroup>
						<div style="font-variant-numeric: tabular-nums; --number-flow-char-height: 0.85em" class="flex items-baseline text-xl font-semibold">
							<NumberFlow
								:trend="-1"
								:value="remainingSeconds"
								:format="{ minimumIntegerDigits: 2, maximumFractionDigits: 0 }"
								will-change
							/>
							<NumberFlow
								prefix=":"
								:trend="-1"
								:value="remainingMilliseconds"
								:format="{ minimumIntegerDigits: 2, maximumFractionDigits: 0 }"
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
		<div class="relative -mt-32 flex size-full flex-col items-center justify-center sm:-mt-20">
			<div class="flex w-full flex-col gap-y-4 px-6 sm:max-w-md sm:px-0 md:max-w-lg">
				<span v-if="props.content?.theme" class="pb-4 text-center text-3xl font-bold sm:pb-6 sm:text-4xl md:pb-10 md:text-5xl"> {{ content?.theme }} </span>
				<NuxtImg v-if="content?.image" class="aspect-video rounded-md" :src="content?.image?.url" :alt="content?.image?.alt" />
				<span class="mb-4 text-pretty text-center text-xl font-semibold sm:mb-8 sm:text-xl md:text-3xl">{{ content?.question }}</span>
				<template v-if="content?.type === 'open'">
					<span v-if="mode === 'multi' && phase === 'correction'" class="text-center">
						<b class="font-medium">Réponse : </b>
						{{ content.answers.filter((answer: Quizz["answers"][number]) => answer.isCorrect).map((answer : Quizz["answers"][number]) => answer.value).join(', ') }}
					</span>
					<Input ref="openInput" v-model="inputAnswer" type="text" class="mx-auto max-w-xs" :disabled="mode === 'multi' && phase === 'correction'" />
					<Switch v-if="mode === 'multi' && phase === 'correction' && showSwitch" class="mx-auto data-[state=checked]:bg-emerald-500" :class="validationStatus === 'uncertain' ? 'data-[state=unchecked]:bg-amber-500' : 'data-[state=unchecked]:bg-red-500'" v-model="isCorrect" @update:modelValue="onOpenSwitchUpdate">
						<template #thumb>
							<Icon v-if="isCorrect" name="lucide:check" class="text-xs"/>
							<Icon v-else-if="validationStatus === 'uncertain'" name="ic:round-question-mark" class="text-xs" />
							<Icon v-else name="lucide:x" class="text-xs"/>
						</template>
					</Switch>
				</template>
				<ToggleGroup v-else-if="content?.type === 'four' || content?.type === 'two'" v-model="selectedAnswer" :type="checkMultipleCorrectAnswers ? 'multiple' : 'single'" variant="outline" :class="{ 'pointer-events-none': showResult }" class="grid auto-rows-fr grid-cols-2 gap-4 w-full !shadow-none">
					<ToggleGroupItem v-for="(choice, index) in content.answers" :key="`choice${index}`" :ref="`choice-${index}`" :class="{ '!bg-emerald-500' : showResult && choice.isCorrect, '!bg-red-500' : showResult && (selectedAnswer == String(index) && !choice.isCorrect) }" class="size-full py-4 cursor-pointer" :value="String(index)">
						{{ choice.value }}
					</ToggleGroupItem>
				</ToggleGroup>
			</div>

			<Dialog v-if="mode === 'solo' && showResult">
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger as-child>
							<Button :variant="outlineOrSecondary()" size="icon" class="absolute bottom-28 left-0 flex size-fit rounded-full p-3 sm:bottom-40 sm:left-8" @click="emit('scoreBoard')">
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
								<Button :variant="outlineOrSecondary()" size="icon" class="absolute bottom-14 left-0 flex size-fit rounded-full p-3 sm:bottom-24 sm:left-8">
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
						<Button :variant="outlineOrSecondary()" size="icon" class="absolute bottom-0 left-0 flex size-fit rounded-full p-3 sm:bottom-8 sm:left-8" @click="navigateTo(content.wikipedia, { external: true, open: { target: '_blank' } })">
							<Icon name="bi:wikipedia" class="text-xl" />
						</Button>
					</TooltipTrigger>
					<TooltipContent side="right">
						Voir la page <b class="font-medium">Wikipedia</b>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>

			<template v-if="((mode === 'solo' && status === 'correct') || (mode === 'multi' && phase === 'correction')) && showResult && showNext">
				<slot v-if="$slots.next" name="next" />

				<Button v-else variant="secondary" class="absolute bottom-0 right-0 flex h-fit py-4 pl-5 sm:bottom-8 sm:right-8" @click="emit('next')">
					<div class="flex flex-col">
						<span class="text-xl font-medium">Suivant</span>
						<span v-if="nbQuestion" class="text-sm text-secondary-foreground/50">Question {{ nbQuestion + 1 }}</span>
					</div>
					<Icon name="lucide:arrow-right" class="text-3xl" />
				</Button>
			</template>

			<div v-if="status === 'incorrect' && showResult" class="absolute bottom-0 right-0 mt-16 flex justify-between gap-x-2 sm:bottom-8 sm:right-8">
				<Button v-if="showBack" size="icon" :variant="outlineOrSecondary()" class="px-7 py-6 text-xl" @click="emit('back')">
					<Icon name="lucide:arrow-left" class="aspect-square" />
				</Button>
				<Button v-if="showRestart" size="lg" class="px-5 py-6 text-lg" @click="emit('restart')">Recommencer</Button>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup generic="UNUSED">
import { useFuse } from "@vueuse/integrations/useFuse"
import NumberFlow, { NumberFlowGroup } from "@number-flow/vue"
import type { Quizz } from "#shared/models/quizz"
import normalize from "@/utils/normalize"

// ... (le reste des types et props reste inchangé) ...
type QuestionBoardProps = {
	mode: "solo"
	phase?: never
	content: Quizz | null
	duration: number
	questionNumber?: number
	showRestart?: boolean
	showBack?: boolean
	showNext?: boolean
	showSwitch?: boolean
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
	showSwitch?: boolean
	startAt?: number
}

const emit = defineEmits(["started", "ended", "badAnswer", "goodAnswer", "next", "restart", "back", "status", "scoreBoard", "answer", "corrected"])

const props = withDefaults(defineProps<QuestionBoardProps>(), {
	showNext: true,
})

// Aides de typage pour éviter les conflits de l'union discriminée dans les checks runtime
const isMultiMode = computed(() => (props as any).mode === "multi")
const isQuestionPhase = computed(() => (props as any).phase === "question")

const nbQuestion = computed(() => props?.questionNumber || props?.questionNumber === 0 ? props.questionNumber + 1 : undefined)
const remainingTime = ref(0)
const selectedAnswer = ref<string>()
const inputAnswer = ref<string>("") // La réponse du joueur
const emittedAnswer = ref<string>("")
const status = ref<"correct" | "incorrect" | "pending" | undefined>(undefined)
const showResult = ref(false)
const validationStatus = ref<"correct" | "uncertain" | "incorrect">("incorrect")
const isCorrect = ref<boolean>(false)
const openInput = shallowRef<HTMLInputElement | null>()
const intervalId = ref<NodeJS.Timeout | undefined>(undefined)
const animationFrameId = ref<number | undefined>(undefined)
const timerStartAt = ref<number | undefined>(undefined)
const timerEndAt = ref<number | undefined>(undefined)
const endedEmitted = ref<boolean>(false)
const { outlineOrSecondary } = useDarkMode()

function onOpenSwitchUpdate(val: boolean) {
	console.log("onOpenSwitchUpdate", val);
	validationStatus.value = val ? 'correct' : 'incorrect'
	emit('corrected', val)
}

onUnmounted(() => {
	if ((inputAnswer.value === "" || inputAnswer.value == null) && (selectedAnswer.value === "" || selectedAnswer.value == null)) {
		emit("answer", "")
	}
	else {
		if (props.content?.type === "open" && emittedAnswer.value !== inputAnswer.value) {
			emit("answer", inputAnswer.value)
		}
		else if ((props.content?.type === "four" || props.content?.type === "two") && emittedAnswer.value !== selectedAnswer.value) {
			emit("answer", String(props.content?.answers[Number(selectedAnswer.value)]?.value))
		}
	}

	if (intervalId.value) clearInterval(intervalId.value)
	if (animationFrameId.value != null) cancelAnimationFrame(animationFrameId.value)
})

onMounted(() => {
	if (isMultiMode.value) {
		if (isQuestionPhase.value) {
			if (typeof (props as any).startAt === "number") {
				startTimerFromStartAt(props.duration, (props as any).startAt as number)
			}
			else {
				startTimer(props.duration)
			}
		}
		else {
			remainingTime.value = 0
		}
	}
	else {
		startTimer(props.duration)
	}

	// Si l'onglet revient en visibilité, on recalcule et on finalise si nécessaire
	const handleVisibility = () => {
		if (document.visibilityState === 'visible') {
			updateRemainingFromNow()
			if ((timerEndAt.value ?? 0) <= Date.now() && !endedEmitted.value) {
				finalizeTimer()
			}
		}
	}
	document.addEventListener('visibilitychange', handleVisibility)
	onUnmounted(() => document.removeEventListener('visibilitychange', handleVisibility))
})

useFocus(openInput, { initialValue: true })

if (props.answer) {
	if (props.content?.type === "open") {
		inputAnswer.value = props.answer
	}
	else selectedAnswer.value = String(props.content?.answers.findIndex(answer => answer.value === props.answer))
}

watchDebounced(selectedAnswer, () => {
	emittedAnswer.value = String(props.content?.answers[Number(selectedAnswer.value)]?.value)
	emit("answer", emittedAnswer.value)
}, { debounce: 1000 })

watchDebounced(inputAnswer, () => {
	emittedAnswer.value = inputAnswer.value
	emit("answer", emittedAnswer.value)
}, { debounce: 1000 })

watch(status, () => emit("status", status.value))

const progressPercentage = computed(() => {
	if (remainingTime.value <= 0) return 100
	if (remainingTime.value >= props.duration) return 0
	return ((props.duration - remainingTime.value) / props.duration) * 100
})

// Synchronise l'affichage en fonction de la phase multi
// (placé après l'initialisation de Fuse pour éviter la TDZ sur `results`)
//

const correctAnswers = computed(() => {
	if (!props.content?.answers) {
		return []
	}
	return props.content.answers
		.filter((answer): answer is Quizz["answers"][number] & { isCorrect: true } => answer.isCorrect) // Garde seulement les réponses correctes (avec type guard)
		.flatMap((answer) => {
			const validStrings = [answer.value]
			if (Array.isArray(answer.variants)) {
				validStrings.push(...answer.variants)
			}
			return validStrings.filter(str => typeof str === "string" && str.length > 0)
		})
})

const fuseOptions = computed(() => ({
	fuseOptions: {
		includeScore: true,
		threshold: 0.6,
		ignoreLocation: true,
	},
	matchAllWhenSearchEmpty: false,
}))

const normalizedInputAnswer = computed(() => normalize(inputAnswer.value ?? ""))
const normalizedCorrectAnswers = computed(() => correctAnswers.value.map(str => normalize(str)))
const { results } = useFuse(normalizedInputAnswer, normalizedCorrectAnswers, fuseOptions)

// Synchronise l'affichage en fonction de la phase multi (après init de `results`)
watch(() => (props as any).phase, (newPhase) => {
	if ((props as any).mode === 'multi') {
		if (newPhase === 'correction') {
			showResult.value = true
			if (props.content?.type === "open") {
				isCorrect.value = evaluateOpenAnswerCorrectness()
			}
			else if (props.content?.type === "four" || props.content?.type === "two") {
				isCorrect.value = evaluateChoiceAnswerCorrectness()
			}
			status.value = isCorrect.value ? "correct" : "incorrect"
		}
		else if (newPhase === 'question') {
			showResult.value = false
		}
	}
}, { immediate: true })

function startTimer(nbMilliseconds: number) {
	endedEmitted.value = false
	timerStartAt.value = Date.now()
	timerEndAt.value = (timerStartAt.value as number) + nbMilliseconds
	remainingTime.value = nbMilliseconds
	status.value = "pending"
	emit("started")
	startAnimationLoop()
}

function startTimerFromStartAt(durationMs: number, startAt: number) {
	endedEmitted.value = false
	timerStartAt.value = startAt
	timerEndAt.value = startAt + durationMs
	const now = Date.now()
	remainingTime.value = Math.max(0, (timerEndAt.value as number) - now)
	status.value = "pending"
	emit("started")
	startAnimationLoop()
}

function updateRemainingFromNow() {
	const endAt = timerEndAt.value
	if (endAt == null) return
	const now = Date.now()
	const duration = Math.max(0, (endAt - (timerStartAt.value || 0)))
	const remaining = Math.min(duration, Math.max(0, endAt - now))
	remainingTime.value = remaining
}

function startAnimationLoop() {
	if (animationFrameId.value != null) cancelAnimationFrame(animationFrameId.value)
	const loop = () => {
		updateRemainingFromNow()
		if ((timerEndAt.value ?? 0) <= Date.now()) {
			if (!endedEmitted.value) finalizeTimer()
			return
		}
		animationFrameId.value = requestAnimationFrame(loop)
	}
	animationFrameId.value = requestAnimationFrame(loop)

	// Fallback interval pour mobiles/navigateurs qui throttlent RAF
	if (intervalId.value) clearInterval(intervalId.value)
	intervalId.value = setInterval(() => {
		updateRemainingFromNow()
		if ((timerEndAt.value ?? 0) <= Date.now() && !endedEmitted.value) {
			finalizeTimer()
		}
	}, 150)
}

function finalizeTimer() {
	endedEmitted.value = true
	if (intervalId.value) clearInterval(intervalId.value)
	showResult.value = true
	if (props.content?.type === "open") {
		isCorrect.value = evaluateOpenAnswerCorrectness()
	}
	else if (props.content?.type === "four" || props.content?.type === "two") {
		isCorrect.value = evaluateChoiceAnswerCorrectness()
	}

	status.value = isCorrect.value ? "correct" : "incorrect"
	if (status.value === "correct") emit("goodAnswer")
	else emit("badAnswer")

	emit("ended")
}

function evaluateOpenAnswerCorrectness(): boolean {
	if (results.value.length > 0) {
		const bestMatchScore = results.value[0]?.score
		if (bestMatchScore != null && bestMatchScore <= 0.3) {
			validationStatus.value = "correct"
		}
		else if (bestMatchScore != null && bestMatchScore <= fuseOptions.value.fuseOptions.threshold) {
			validationStatus.value = "uncertain"
		}
		else {
			validationStatus.value = "incorrect"
		}
	}
	else {
		validationStatus.value = "incorrect"
	}
	return validationStatus.value === "correct"
}

function evaluateChoiceAnswerCorrectness(): boolean {
	const correctIndex = props.content?.answers.findIndex(answer => answer.isCorrect)
	return selectedAnswer.value === String(correctIndex)
}

const checkMultipleCorrectAnswers = computed(() => props.content?.answers && props.content.answers.filter(answer => answer.isCorrect).length > 1)
const remainingSeconds = computed(() => Math.floor(remainingTime.value / 1000))
// Affiche 2 digits pour les centièmes, sans séparateur décimal
const remainingMilliseconds = computed(() => Math.floor((remainingTime.value % 1000) / 10))

watch(() => (props as any).startAt, (newStartAt) => {
	if (isMultiMode.value && isQuestionPhase.value && typeof newStartAt === "number") {
		startTimerFromStartAt(props.duration, newStartAt)
	}
})
</script>
