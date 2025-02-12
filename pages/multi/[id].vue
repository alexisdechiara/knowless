<template>
	<div class="fixed inset-0 flex flex-col px-64 py-32">
		<h1 class="mb-16 text-center text-5xl font-semibold">
			{{ lobby?.title }}
			<TooltipProvider v-if="!lobby.isPublic" :delay-duration="0">
				<Tooltip>
					<TooltipTrigger as-child>
						<Icon class="ms-2 cursor-pointer text-3xl text-muted-foreground" name="lucide:lock" />
					</TooltipTrigger>
					<TooltipContent :side-offset="16">
						Le lobby est en privé, il ne sera pas visible dans la liste des parties.
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		</h1>
		<div class="grid size-full grid-cols-5 gap-x-32">
			<div class="col-span-2 flex w-fit flex-col">
				<div class="flex items-center gap-4">
					<Avatar size="lg">
						<AvatarImage :src="user.avatar ? user.avatar : ''" alt="avatar" />
						<AvatarFallback class="text-xl">{{ user.username }}</AvatarFallback>
					</Avatar>
					<div class="flex flex-col text-2xl leading-normal">
						<span class="font-semibold text-primary">{{ user.username }}</span>
						<span class="italic text-muted-foreground">{{ lobby?.host === user.id ? 'Hôte de la partie' : 'Joueur' }}</span>
					</div>
				</div>
				<div class="mt-auto flex flex-col gap-y-2 pt-4">
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
			</div>
			<div class="col-span-3 flex w-full flex-col justify-between gap-8">
				<div class="flex flex-col gap-y-4">
					<template v-for="player in lobby.players.filter(player => player.id !== user.id)" :key="player.id">
						<div v-if="player.id !== user.id" class="flex w-full items-center gap-2">
							<Avatar size="sm">
								<AvatarImage :src="player.avatar ? player.avatar : ''" alt="avatar" />
								<AvatarFallback class="text-xl">{{ player.username }}</AvatarFallback>
							</Avatar>
							<div class="flex flex-col text-sm leading-tight">
								<span class="font-semibold text-primary">{{ player.username }}</span>
								<span class="italic text-muted-foreground">{{ lobby?.host === player.id ? 'Hôte de la partie' : 'Joueur' }}</span>
							</div>
							<DropdownMenu v-if="isHost">
								<DropdownMenuTrigger as-child>
									<Button class="ms-auto" size="icon" variant="link">
										<Icon name="lucide:ellipsis-vertical" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									<DropdownMenuItem v-if="isHost" @click="kickPlayer(player.id)">
										<Icon name="lucide:user-round-x" /> Exclure
									</DropdownMenuItem>
									<DropdownMenuItem v-if="isHost" @click="banPlayer(player.id)">
										<Icon name="lucide:ban" /> Bannir
									</DropdownMenuItem>
									<DropdownMenuItem v-if="isHost" @click="promotePlayer(player.id)">
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
				<div class="flex w-full gap-x-8">
					<Button size="xxl" class="block w-full">Démarrer</Button>
					<Button size="xxl" variant="outline" class="block aspect-square w-fit items-center justify-center p-0" @click="leaveLobby()">
						<Icon name="lucide:log-out" />
					</Button>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { useClipboard } from "@vueuse/core"
import { toast } from "vue-sonner"
import { Lobby } from "~/models/lobby"
import type { User } from "~/models/user"

const supabase = useSupabaseClient()
const route = useRoute()
const showCode = ref(false)
const code = ref(String(route.params.id))
const { copy, copied, isSupported } = useClipboard({ source: code })
const lobby = ref<Lobby>(new Lobby())

watch(copied, (value) => {
	if (value) {
		toast.success("Code copié dans le presse-papier")
	}
})

const { data: user } = await supabase
	.from("players")
	.select("*")
	.eq("id", useSupabaseUser().value?.id).single()

const fetchPlayers = async (newData: any) => {
	const { data: fetchedPlayers } = await supabase
		.from("players")
		.select("*")
		.in("id", newData.players)

	if (fetchedPlayers && lobby.value) {
		lobby.value.players = fetchedPlayers
	}
}

const isHost = computed(() => lobby.value?.host === user.id)

function kickPlayer(id: string) {
	removePlayer(id)
}

async function leaveLobby() {
	removePlayer(user.id)
	await navigateTo("/")
}

async function removePlayer(id: string) {
	const updatedPlayerIds: Array<string> = lobby.value.playerIds.filter(playerId => playerId !== id)
	if (!updatedPlayerIds || updatedPlayerIds.length === 0) {
		const { error } = await supabase
			.from("lobbies")
			.delete()
			.eq("id", lobby.value.id)

		if (error) {
			toast.error(`Erreur ${error.code}`, {
				description: error.message,
			})
		}
	}
	else if (lobby.value.host === id) {
		const { error } = await supabase
			.from("lobbies")
			.update({ host: updatedPlayerIds[0], players: updatedPlayerIds })
			.eq("id", lobby.value.id)
			.select()
			.single()

		if (error) {
			toast.error(`Erreur ${error.code}`, {
				description: error.message,
			})
		}
	}
	else {
		const { error } = await supabase
			.from("lobbies")
			.update({ players: updatedPlayerIds })
			.eq("id", lobby.value.id)
			.select()
			.single()

		if (error) {
			toast.error(`Erreur ${error.code}`, {
				description: error.message,
			})
		}
	}

	const { error } = await supabase
		.from("players")
		.update({ status: "offline", lobby_id: null })
		.eq("id", id)

	if (error) {
		toast.error(`Erreur ${error.code}`, {
			description: error.message,
		})
	}
}

const banPlayer = async (id: string) => {
	const { data: newData, error } = await supabase.from("lobbies").update({ banned_players: [...lobby.value.bannedPlayersId, id] }).eq("id", lobby.value.id).select()
	console.log(newData, error)

	if (error) {
		toast.error(`Erreur ${error.code}`, {
			description: error.message,
		})
	}
	else if (newData) {
		lobby.value.bannedPlayersId.push(id)
		kickPlayer(id)
	}
}

const promotePlayer = async (id: string) => {
	const { data: newData, error } = await supabase.from("lobbies").update({ host: id }).eq("id", lobby?.value.id)

	if (error) {
		toast.error("Une erreur est survenue", {
			description: error.message,
		})
	}
	else if (newData && lobby.value) {
		lobby.value.host = id
	}
}

onMounted(async () => {
	const { data, error } = await supabase
		.from("lobbies")
		.select()
		.eq("id", route.params.id)
		.single()

	if (error) {
		throw showError({
			statusCode: 404,
			statusMessage: "Le lobby n'existe pas",
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

		const channel = supabase
			.channel(`lobby-${route.params.id}-updates`)
			.on(
				"postgres_changes",
				{ event: "*", schema: "public", table: "lobbies", filter: `id=eq.${route.params.id}` },
				(payload) => {
					if (payload.new) {
						const newLobby = new Lobby(payload.new)
						lobby.value.host = newLobby.host
						fetchPlayers(payload.new)
					}
				},
			)
			.subscribe()

		onUnmounted(() => {
			supabase.removeChannel(channel)
		})
	}
})

async function handleUnload() {
	navigator.sendBeacon(`/api/lobby/leave`, JSON.stringify({ lobby: { id: lobby.value?.id, host: lobby.value?.host, playerIds: lobby.value?.playerIds.filter(playerId => playerId !== user.id) }, userId: user.id }))
}

onMounted(() => {
	window.addEventListener("unload", handleUnload)
})

onUnmounted(() => {
	window.removeEventListener("unload", handleUnload)
})
</script>

<style scoped>

</style>
