<template>
	<div class="fixed inset-0 flex flex-col p-32">
		<h1 class="mb-16 text-center text-5xl font-semibold">{{ data.title }}</h1>
		<div class="grid size-full grid-cols-5 gap-x-32">
			<div class="col-span-2 flex w-fit flex-col">
				<div class="flex items-center gap-4">
					<Avatar size="lg">
						<AvatarImage :src="user.avatar ? user.avatar : ''" alt="avatar" />
						<AvatarFallback class="text-xl">{{ user.username }}</AvatarFallback>
					</Avatar>
					<div class="flex flex-col text-2xl leading-normal">
						<span class="font-semibold text-primary">{{ user.username }}</span>
						<span class="italic text-muted-foreground">{{ data.host === user.id ? 'Hôte de la partie' : 'Joueur' }}</span>
					</div>
				</div>
				<div class="mt-auto flex flex-col gap-y-2 pt-4">
					<div class="flex items-center gap-1.5">
						<TooltipProvider :delay-duration="0" trigger="hover" placement="top">
							<Tooltip>
								<TooltipTrigger as-child>
									<Input :model-value="code" class="cursor-pointer text-center tracking-[1rem]" :type="showCode ? 'text' : 'password'" readonly @click="copy(code)" />
								</TooltipTrigger>
								<TooltipContent>
									Cliquez pour copier le code
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
						<Button variant="outline" size="lg" class="block aspect-square w-fit p-0" @click="showCode = !showCode">
							<Icon :name="showCode ? 'lucide:eye-off' : 'lucide:eye'" />
						</Button>
					</div>
					<Button variant="outline" size="lg" class="block w-full">Paramètres</Button>
				</div>
			</div>
			<div class="col-span-3 flex w-full flex-col justify-between gap-8">
				<div class="flex flex-col gap-y-4">
					<div v-for="player in players" :key="player.id" class="flex w-full items-center gap-2">
						<Avatar size="sm">
							<AvatarImage :src="player.avatar ? player.avatar : ''" alt="avatar" />
							<AvatarFallback class="text-xl">{{ player.username }}</AvatarFallback>
						</Avatar>
						<div class="flex flex-col text-sm leading-tight">
							<span class="font-semibold text-primary">{{ player.username }}</span>
							<span class="italic text-muted-foreground">{{ data.host === player.id ? 'Hôte de la partie' : 'Joueur' }}</span>
						</div>
					</div>
				</div>
				<div class="flex w-full gap-x-8">
					<Button size="xxl" class="block w-full">Démarrer</Button>
					<Button size="xxl" variant="outline" class="block aspect-square w-fit items-center justify-center p-0">
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

const players = ref<any[]>([])
const supabase = useSupabaseClient()
const route = useRoute()
const showCode = ref(false)
const code = ref(String(route.params.id))
const { copy, copied, isSupported } = useClipboard({ source: code })

watch(copied, (value) => {
	if (value) {
		toast.success("Code copié dans le presse-papier")
	}
})

const { data: user } = await supabase
	.from("players")
	.select("*")
	.eq("id", useSupabaseUser().value?.id).single()

const { data, error } = await supabase
	.from("lobbies")
	.select()
	.eq("id", route.params.id)
	.single()

if (error) {
	console.error(error)
}
else if (data) {
	const { data: fetchedPlayers } = await supabase
		.from("players")
		.select("*")
		.in("id", data.players)

	if (fetchedPlayers) {
		players.value = fetchedPlayers
	}
}

const fetchPlayers = async (newData?: any) => {
	const { data: fetchedPlayers } = await supabase
		.from("players")
		.select("*")
		.in("id", newData ? newData.players : data.players)

	if (fetchedPlayers) {
		console.log(fetchedPlayers)
		players.value = fetchedPlayers
	}
}

onMounted(() => {
	fetchPlayers()

	const channel = supabase
		.channel(`lobby-${route.params.id}-updates`)
		.on(
			"postgres_changes",
			{ event: "*", schema: "public", table: "lobbies", filter: `id=eq.${route.params.id}` },
			(payload) => {
				console.log("Update detected", payload.new)
				fetchPlayers(payload.new)
			},
		)
		.subscribe()

	onUnmounted(() => {
		supabase.removeChannel(channel)
	})
})
</script>

<style scoped>

</style>
