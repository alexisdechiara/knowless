<template>
	<ClientOnly>
		<div class="fixed inset-0 flex flex-col px-8 py-6 sm:px-16 sm:py-12 md:px-32 md:py-24">
			<template v-if="game">
				<Countdown v-if="game.phase === 'start'" @finished="startGame()" />
				<QuestionBoard
					v-else-if="(game.phase === 'question' || game.phase === 'correction') && game?.questions[game?.currentQuestionIndex]"
					:key="`${game.phase}-${game.currentQuestionIndex}-${game.currentPlayerIndex}`"
					mode="multi"
					:phase="game.phase"
					:content="game.questions[game.currentQuestionIndex]"
					:question-number="game.currentQuestionIndex"
					:duration="game.phase === 'question' ? 10000 : 0"
					:lobby="lobby"
					:answer="getPlayerAnswerByIndex"
					:show-next="isHost"
					:show-switch="isHost"
					@answer="submitAnswer($event)"
					@good-answer="result = true"
					@bad-answer="result = false"
					@corrected="(correction: boolean) => result = correction"
					@ended="game.phase === 'question' && nextQuestion()"
					@next="isHost && nextPlayerCorrection()"
				>
					<template v-if="game.phase === 'correction'" #header>
						<div class="fixed left-1/2 top-4 flex -translate-x-1/2 items-center gap-4">
							<Avatar v-for="player in surroundingPlayers" :key="player.id" :size="game.playersData[game.currentPlayerIndex].id === player.id ? 'base' : 'sm'">
								<AvatarImage :src=" player.avatar ? player.avatar : ''" alt="avatar" />
								<AvatarFallback class="text-xl">{{ player.username }}</AvatarFallback>
							</Avatar>
						</div>
						<span v-if="isDesktopBreakpoint" class="absolute start-1/2 top-20 -translate-x-1/2 text-4xl font-semibold">{{ lobby.players.find(player => player.id === game?.playersData[game.currentPlayerIndex]?.id)?.username }}</span>
					</template>
					<template #next>
						<NextButton :variant="isLastPlayer && game.currentQuestionIndex === game.questions.length - 1 ? 'default' : outlineOrSecondary()" :title="isLastPlayer && game.currentQuestionIndex === game.questions.length - 1 ? 'Ajustements' : isLastPlayer ? 'Question suivante' : 'Joueur suivant'" @click="isHost && nextPlayerCorrection()" />
					</template>
				</QuestionBoard>
				<div v-else-if="game.phase === 'adjustment'" class="flex justify-center">
					<div class="grid w-fit auto-cols-auto grid-cols-2 gap-12 md:grid-cols-6">
						<PlayerAdjustment v-for="playerData in game.playersData" :key="playerData.id" v-model="playerData.score.adjustment" :player="new User(lobby.players.find((player: User) => player.id === playerData.id))" />
						<NextButton title="Terminer" description="Voir les résultats" class="bottom-4 right-4" @click="changePhase('scoreboard')" />
					</div>
				</div>
				<Scoreboard v-else-if="game.phase === 'scoreboard'" :game="game" :players="lobby.players" :current-index="game?.currentPlayerIndex" @next-player="nextPlayerScoreboard()" @end="changePhase('end')" />
			</template>
			<template v-else>
				<h1 class="mb-16 text-center text-2xl font-semibold sm:text-3xl md:text-5xl">
					{{ lobby?.title }}
					<TooltipProvider v-if="!lobby.isPublic" :delay-duration="0">
						<Tooltip>
							<TooltipTrigger as-child>
								<Icon class="ms-2 cursor-pointer text-3xl text-muted-foreground" name="lucide:lock" />
							</TooltipTrigger>
							<TooltipContent :side-offset="16">
								Le salon est en privé, il ne sera pas visible dans la liste des salons.
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</h1>
				<div class="flex size-full flex-col gap-y-8 md:grid md:grid-cols-5 md:gap-x-32">
					<div class="flex w-fit flex-col md:col-span-2">
						<div class="flex w-full max-w-lg items-center gap-4 overflow-auto md:mb-auto">
							<Avatar size="lg">
								<AvatarImage :src="user.avatar ? user.avatar : ''" alt="avatar" />
								<AvatarFallback class="text-xl">{{ user.username }}</AvatarFallback>
							</Avatar>
							<div class="flex flex-col text-2xl leading-normal">
								<span class="font-semibold text-primary">{{ user.username }}</span>
								<span class="italic text-muted-foreground">{{ lobby?.host === user.id ? 'Hôte du salon' : 'Joueur' }}</span>
							</div>
						</div>
						<div id="settings" />
					</div>
					<div class="flex size-full flex-col gap-4 md:col-span-3 md:justify-between md:gap-8">
						<div class="flex h-full flex-col gap-y-4">
							<template v-for="player in lobby.players.filter(player => player.id !== user.id)" :key="player.id">
								<div v-if="player.id !== user.id" class="flex w-full items-center gap-2">
									<Avatar size="sm">
										<AvatarImage :src="player.avatar ? player.avatar : ''" alt="avatar" />
										<AvatarFallback class="text-xl">{{ player.username }}</AvatarFallback>
									</Avatar>
									<div class="flex flex-col text-sm leading-tight">
										<span class="font-semibold text-primary">{{ player.username }}</span>
										<span class="italic text-muted-foreground">{{ lobby?.host === player.id ? 'Hôte du salon' : 'Joueur' }}</span>
									</div>
									<DropdownMenu v-if="isHost">
										<DropdownMenuTrigger as-child>
											<Button class="ms-auto" size="icon" variant="link">
												<Icon name="lucide:ellipsis-vertical" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent>
											<DropdownMenuItem v-if="isHost" @click="removePlayer(player, lobby)">
												<Icon name="lucide:user-round-x" /> Exclure
											</DropdownMenuItem>
											<DropdownMenuItem v-if="isHost" @click="banPlayer(player, lobby)">
												<Icon name="lucide:ban" /> Bannir
											</DropdownMenuItem>
											<DropdownMenuItem v-if="isHost" @click="promotePlayer(player, lobby)">
												<Icon name="lucide:circle-fading-arrow-up" /> Promouvoir hôte
											</DropdownMenuItem>
											<!-- <DropdownMenuItem>
										<Icon name="lucide:user-round-plus" /> Inviter en ami
									</DropdownMenuItem> -->
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							</template>
						</div>
						<div id="settings-mobile" />
						<div class="flex w-full justify-end gap-x-8">
							<Button v-if="isHost" size="xxl" class="block w-full" @click="startLobby()">Démarrer</Button>
							<Button size="xxl" :variant="outlineOrSecondary()" class="block aspect-square w-fit items-center justify-center p-0" @click="leaveLobby()">
								<Icon name="lucide:log-out" />
							</Button>
						</div>
					</div>
				</div>
			</template>
		</div>
		<Teleport :to="isDesktopBreakpoint ? '#settings' : '#settings-mobile'">
			<div v-if="isHost" class="mt-auto flex flex-col gap-y-2 pt-4">
				<div class="flex w-full gap-x-2">
					<div class="relative w-full items-center">
						<TooltipProvider :delay-duration="0" trigger="hover" placement="top">
							<Tooltip>
								<TooltipTrigger as-child>
									<Input :model-value="code" class="me-10 cursor-pointer text-center align-middle text-2xl tracking-[1rem]" :type="showCode ? 'text' : 'password'" readonly @click="isSupported ? copy(code) : showCode = !showCode" />
									<span class="absolute inset-y-0 end-0 flex cursor-pointer items-center justify-center px-4" @click="showCode = !showCode">
										<Icon :name="showCode ? 'lucide:eye-off' : 'lucide:eye'" />
									</span>
								</TooltipTrigger>
								<TooltipContent v-if="isSupported">
									Copier le code
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>
					<FriendListPopover>
						<Button variant="outline" size="lg" class="flex aspect-square w-fit items-center justify-center p-0">
							<Icon name="lucide:users" class="text-base" />
						</Button>
					</FriendListPopover>
				</div>
				<LobbySettings v-model="lobby">
					<Button variant="outline" size="lg" class="block w-full">Paramètres</Button>
				</LobbySettings>
			</div>
		</Teleport>
	</ClientOnly>
</template>

<script lang="ts" setup>
import { toast } from "vue-sonner"
import type { RealtimeChannel } from "@supabase/supabase-js"
import { useBreakpoints, breakpointsTailwind } from "@vueuse/core"
import { Lobby } from "~/models/lobby"
import { User } from "~/models/user"
import { Game } from "~/models/game"

const { getPlayers, removePlayer, banPlayer, promotePlayer } = useLobby()
const supabase = useSupabaseClient()
const route = useRoute()
const showCode = ref(false)
const code = ref(String(route.params.id))
const { copy, copied, isSupported } = useClipboard({ source: code })
const lobby = ref<Lobby>(new Lobby())
const game = ref<Game | null>(null)
const result = ref<boolean>(false)
const lobbyChannel = ref<null | RealtimeChannel>()
const gameChannel = ref<null | RealtimeChannel>()
const isDesktopBreakpoint = useBreakpoints(breakpointsTailwind).greaterOrEqual("md")
const { outlineOrSecondary } = useDarkMode()

const lobbyTitle = computed(() => {
	return game.value?.phase ? `Partie en cours - ${lobby.value?.title}` : lobby.value?.title || "Multijoueurs - Salon"
})

useHead({
	title: lobbyTitle,
})

onUnmounted(() => {
	window.removeEventListener("beforeunload", handleBeforeUnload)
	window.removeEventListener("unload", handleUnload)
	if (lobbyChannel.value) {
		supabase.removeChannel(lobbyChannel.value)
	}
	if (gameChannel.value) {
		supabase.removeChannel(gameChannel.value)
	}
})

onMounted(async () => {
	window.addEventListener("beforeunload", handleBeforeUnload)
	window.addEventListener("unload", handleUnload)

	const { data, error } = await supabase
		.from("lobbies")
		.select()
		.eq("id", route.params.id)
		.single()

	if (error) {
		throw showError({
			statusCode: 404,
			statusMessage: "Le salon n'existe pas",
		})
	}
	else if (data) {
		const { data: fetchedPlayers } = await supabase
			.from("players")
			.select("*")
			.in("id", data.players)

		lobby.value = new Lobby(data, fetchedPlayers)

		if (user.id !== lobby.value?.host && !lobby.value?.playerIds.includes(user.id)) {
			navigateTo(`/multi/join`)
		}
		else if (lobby.value?.invitedPlayersId && lobby.value?.invitedPlayersId.includes(user.id) && lobby.value?.maxPlayers > lobby.value?.players.length) {
			navigateTo(`/multi/join`)
		}

		lobbyChannel.value = supabase
			.channel(`lobby-${route.params.id}-updates`)
			.on(
				"postgres_changes",
				{ event: "*", schema: "public", table: "lobbies", filter: `id=eq.${route.params.id}` },
				async (payload) => {
					if (payload.new) {
						const newLobby: Lobby = new Lobby(payload.new)
						// La réassignation de lobby.value déclenchera le watcher sur lobby.value.gameId si gameId change.
						lobby.value = newLobby
						lobby.value.players = await getPlayers(newLobby.playerIds)
					}
				},
			)
			.subscribe()
	}
})

async function handleUnload() {
	navigator.sendBeacon(`/api/lobby/leave`, JSON.stringify({ lobby: { id: lobby.value?.id, host: lobby.value?.host, playerIds: lobby.value?.playerIds.filter(playerId => playerId !== user.id) }, userId: user.id }))
}

function handleBeforeUnload(event: BeforeUnloadEvent) {
	event.preventDefault()
}

watch(copied, (value) => {
	if (value) {
		toast.success("Code copié dans le presse-papier")
	}
})

const { data: user } = await supabase
	.from("players")
	.select("*")
	.eq("id", useSupabaseUser().value?.id)
	.single()

const isHost = ref<boolean>(false)

watch([lobby, user], () => {
	isHost.value = lobby.value?.host === user.id
}, { immediate: true })

async function leaveLobby() {
	await removePlayer(new User(user), lobby.value).then(async () => {
		await navigateTo("/")
	})
}

async function startLobby() {
	try {
		await $fetch("/api/game/create", {
			method: "POST",
			query: {
				nbQuestions: 20,
				lobbyId: route.params.id,
			},
		})
	}
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	catch (error: any) {
		console.error("Erreur lors de la création du salon:", error)
		toast.error("Une erreur est survenue lors de la création du salon", {
			description: error.data?.message || error.message || "Erreur inconnue",
		})
	}
}

async function startGame() {
	const { error } = await supabase
		.from("games")
		.update({
			phase: "question",
		})
		.eq("id", game.value?.id)

	console.log(game.value)

	if (error) {
		console.error(error)
		toast.error("Une erreur est survenue lors de la mise a jour", {
			description: error.details,
		})
	}
}

async function nextPlayerScoreboard() {
	const { error } = await supabase
		.from("games")
		.update({
			current_player_index: (game.value?.currentPlayerIndex || 0) + 1,
		})
		.eq("id", game.value?.id)

	if (error) {
		console.error(error)
		toast.error("Une erreur est survenue lors de la mise a jour", {
			description: error.details,
		})
	}
}

async function nextQuestion() {
	if (game.value?.currentQuestionIndex != null && game.value?.currentQuestionIndex < game.value?.questions.length - 1) {
		const { error } = await supabase
			.from("games")
			.update({
				current_question_index: (game.value?.currentQuestionIndex + 1) % game.value?.questions.length,
			})
			.eq("id", game.value?.id)

		if (error) {
			console.error(error)
			toast.error(`Erreur ${error.code}`, {
				description: error.details,
			})
		}
	}
	else {
		changePhase("correction")
	}
}

async function submitAnswer(newAnswer: string) {
	const { error } = await supabase
		.rpc("update_answer", {
			p_game_id: game.value?.id,
			p_player_id: user.id, // ID du joueur
			p_new_answer: newAnswer, // Nouvelle réponse
			p_answer_index: game.value?.currentQuestionIndex, // Index de la réponse à mettre à jour
		})

	if (error) {
		console.error(error)
		toast.error(`Erreur ${error.code}`, {
			description: error.message,
		})
	}
}

const isLastPlayer = computed(() => game.value?.playersData ? game.value?.currentPlayerIndex === game.value?.playersData.length - 1 : false)

async function nextPlayerCorrection() {
	if (game.value) {
		const currentPlayerIndex = game.value?.currentPlayerIndex ?? 0
		const currentQuestionIndex = game.value?.currentQuestionIndex ?? 0

		const baseScore = game.value?.playersData[currentPlayerIndex]?.score?.default ?? 0
		const questionPoints = game.value?.questions[currentQuestionIndex]?.points ?? 0

		const newDefaultScore = result.value ? baseScore + questionPoints : baseScore

		const { error } = await supabase
			.rpc("next_player_correction", {
				p_game_id: game.value?.id,
				p_player_id: game.value?.playersData[game.value?.currentPlayerIndex].id,
				p_new_default_score: newDefaultScore,
				p_new_player_index: isLastPlayer.value ? 0 : (game.value.currentPlayerIndex ?? 0) + 1,
				p_new_question_index: isLastPlayer.value ? (game.value?.currentQuestionIndex + 1) % game.value?.questions.length : game.value?.currentQuestionIndex,
			})

		if (error) {
			console.error(error)
			toast.error(`Erreur ${error.code}`, {
				description: error.message,
			})
		}
		else if (isLastPlayer.value && game.value?.currentQuestionIndex == game.value.questions.length - 1) {
			changePhase("adjustment")
		}
	}
}

async function changePhase(phase: "start" | "question" | "correction" | "adjustment" | "scoreboard" | "end") {
	if (phase === "scoreboard") {
		console.log(game.value?.playersData)
		const { error } = await supabase
			.from("games")
			.update({
				phase: phase,
				current_player_index: 0,
				current_question_index: 0,
				players_data: game.value?.playersData,
			})
			.eq("id", game.value?.id)

		if (error) {
			console.error(error)
			toast.error(`Erreur ${error.code}`, {
				description: error.details,
			})
		}
	}
	else {
		const { error } = await supabase
			.from("games")
			.update({
				current_question_index: 0,
				current_player_index: 0,
				phase: phase,
			})
			.eq("id", game.value?.id)

		if (error) {
			console.error(error)
			toast.error(`Erreur ${error.code}`, {
				description: error.details,
			})
		}
	}

	if (phase === "end") {
		const { data, error } = await supabase
			.from("lobbies")
			.update({
				game_id: null,
			})
			.eq("id", lobby.value?.id)
			.select()
			.single()

		if (error) {
			console.error(error)
			toast.error(`Erreur ${error.code}`, {
				description: error.details,
			})
		}
		else if (data) {
			lobby.value = new Lobby(data)
		}
	}
}

const getPlayerAnswerByIndex = computed(() => game.value?.playersData[game.value?.currentPlayerIndex]?.answers[game.value?.currentQuestionIndex])

watch(() => lobby.value?.gameId, async (newGameId, oldGameId) => {
	// Se désabonner de l'ancien canal de jeu si oldGameId existait et que le canal était actif
	if (oldGameId && gameChannel.value) {
		supabase.removeChannel(gameChannel.value)
		gameChannel.value = null
	}

	if (newGameId) {
		const { data, error } = await supabase
			.from("games")
			.select()
			.eq("id", newGameId)
			.single()

		console.log("watch gameId, fetching game data:", data)

		if (error) {
			toast.error(`Erreur lors du chargement du jeu ${newGameId}`, { description: error.message })
			game.value = null // Assurer que l'état du jeu est propre en cas d'erreur
		}
		else if (data) {
			game.value = new Game(data)
			gameChannel.value = supabase
				.channel(`game-${newGameId}-updates`)
				.on(
					"postgres_changes",
					{ event: "*", schema: "public", table: "games", filter: `id=eq.${newGameId}` },
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					async (payload: any) => {
						if (payload.new && game.value) {
							console.log("Game update received:", payload.new)
							let updated = false
							if (payload.new.phase !== undefined && game.value.phase !== payload.new.phase) {
								game.value.phase = payload.new.phase
								updated = true
							}
							if (payload.new.current_question_index !== undefined && typeof payload.new.current_question_index === "number" && game.value.currentQuestionIndex !== payload.new.current_question_index) {
								game.value.currentQuestionIndex = payload.new.current_question_index
								updated = true
							}
							if (payload.new.current_player_index !== undefined && typeof payload.new.current_player_index === "number" && game.value.currentPlayerIndex !== payload.new.current_player_index) {
								game.value.currentPlayerIndex = payload.new.current_player_index
								updated = true
							}
							if (payload.new.players_data !== undefined && JSON.stringify(game.value.playersData) !== JSON.stringify(payload.new.players_data)) {
								game.value.playersData = payload.new.players_data
								updated = true
							}
							if (updated) {
								// Utilisation de JSON.parse(JSON.stringify(...)) pour un log propre de l'objet sans les détails de Proxy Vue.
								console.log("Game state updated via merge:", JSON.parse(JSON.stringify(game.value)))
							}
							else {
								console.log("No relevant changes detected in payload.")
							}
							// La condition de log complexe précédente a été retirée pour simplifier,
							// la mise à jour est appliquée si `updated` est true.
						}
					},
				)
				.subscribe()
		}
	}
	else if (gameChannel.value) {
		// Si newGameId est null, l'ancien canal (si existant) a déjà été nettoyé au début du watcher.
		game.value = null
	}
}, { immediate: true }) // immediate: true pour charger le jeu si gameId est déjà défini lors de l'initialisation du lobby

const surroundingPlayers = computed(() => {
	if (game.value) {
		let surroundingPlayerIds: Array<string> = []
		if (game.value?.playersData && game.value.playersData.length > 5) {
			if (game.value?.currentPlayerIndex < 5) {
				surroundingPlayerIds = game.value?.playersData.slice(0, 5).map(player => player.id)
			}
			else if (game.value?.currentPlayerIndex > game.value?.playersData.length - 6) {
				surroundingPlayerIds = game.value?.playersData.slice(-5).map(player => player.id)
			}
			else {
				surroundingPlayerIds = game.value?.playersData.slice(game.value?.currentPlayerIndex - 2, game.value?.currentPlayerIndex + 3).map(player => player.id)
			}
		}
		else {
			surroundingPlayerIds = game.value?.playersData.map(player => player.id)
		}
		return lobby.value?.players.filter(player => surroundingPlayerIds.includes(player.id)).sort((a, b) => {
			return surroundingPlayerIds.indexOf(a.id) - surroundingPlayerIds.indexOf(b.id)
		})
	}
	else {
		return []
	}
})
</script>
