<template>
	<Popover @update:open="$event === true ? popoverMount() : popoverUnmount()">
		<PopoverTrigger>
			<slot />
		</PopoverTrigger>
		<PopoverContent ref="card" :style="style" :side-offset="8" side="right" align="end" class="flex w-full min-w-[320px] max-w-7xl flex-col p-0">
			<CardHeader>
				<div class="flex size-full items-start justify-between">
					<div>
						<CardTitle>Gestion des amis</CardTitle>
						<CardDescription>Ici, vous pouvez voir tous vos amis</CardDescription>
					</div>
					<!-- <Icon ref="handle" name="lucide:grip-vertical" class="size-6 text-secondary" /> -->
				</div>
			</CardHeader>
			<CardContent>
				<div class="mb-6 flex items-center">
					<div class="relative ml-auto w-full max-w-sm items-center">
						<Input id="search" v-model="friendToAdd" type="text" placeholder="Ajouter un ami" class="pl-9" />
						<span class="absolute inset-y-0 start-0 flex items-center justify-center px-2">
							<Icon name="lucide:search" class="size-5 text-muted-foreground" />
						</span>
					</div>
					<Button class="ml-2 aspect-square" size="icon">
						<Icon name="lucide:user-round-plus" class="size-4" @click="inviteFriend(friendUsername, friendUsertag)" />
					</button>
				</div>
				<div class="flex h-full min-h-64 flex-col gap-4">
					<div v-if="sortedPendingFriends.length > 0" class="size-full">
						<div class="pb-2 text-lg font-semibold">En attente</div>
						<div class="flex size-full flex-col gap-4">
							<template v-for="pendingItem in sortedPendingFriends" :key="pendingItem.friend.id">
								<RowFriend
									:friend="pendingItem.friend"
									:status="pendingItem.type === 'received' ? 'pending' : 'sent'"
									@accept="acceptFriend($event)"
									@reject="onReject($event)"
								/>
							</template>
						</div>
					</div>
					<div v-if="friends.length > 0" class="size-full flex-1">
						<div v-if="sortedPendingFriends.length > 0" class="pb-2 text-lg font-semibold">Amis</div>
						<div class="flex size-full flex-col gap-4">
							<RowFriend v-for="friend in friends" :key="friend.id" :friend="friend" status="accepted" @remove="removeFriend($event)" />
						</div>
					</div>
				</div>
			</CardContent>
		</PopoverContent>
	</Popover>
</template>

<script lang="ts" setup>
import { toast } from "vue-sonner"
import type { RealtimeChannel } from "@supabase/supabase-js"
import { useDraggable } from "@vueuse/core"
import PopoverTrigger from "~/components/ui/popover/PopoverTrigger.vue"
import { User } from "~/models/user"
import { Friendship } from "~/models/friendship"

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { inviteFriend, removeFriend, acceptFriend } = useFriends()
const friendshipChannel = ref<RealtimeChannel | null>(null)
const card = useTemplateRef<HTMLElement>("card")
const handle = useTemplateRef<HTMLElement>("handle")
const { style } = useDraggable(card, {
	initialValue: { x: 0, y: 0 },
	preventDefault: true,
	handle: handle,
})

// TODO ajouter un store des amis et des demandes d'amis

const friendToAdd = ref("")
const friends = ref<Array<User>>([])
const pendingFriendsReceived = ref<Array<{ friend: User, createdAt: string }>>([])
const pendingFriendsSent = ref<Array<{ friend: User, createdAt: string }>>([])

const friendUsername = computed(() => friendToAdd.value.split("#")[0])
const friendUsertag = computed(() => friendToAdd.value.split("#")[1])

// Computed pour trier et combiner les demandes en attente
const sortedPendingFriends = computed(() => {
	const received = pendingFriendsReceived.value.map(item => ({
		...item,
		type: "received" as const,
	}))
	const sent = pendingFriendsSent.value.map(item => ({
		...item,
		type: "sent" as const,
	}))

	return [...received, ...sent].sort((a, b) =>
		new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
	)
})

async function onReject(id: string) {
	await removeFriend(id, { toast: false }).then(() => {
		toast.success("Demande d'ami rejetée", {
			description: `Vous avez rejeté une demande d'ami`,
		})
	}).catch((error) => {
		toast.error("Erreur lors de la suppression de l'ami", {
			description: error.details || "Une erreur inconnue est survenue.",
		})
	})
}

async function updateFriendList() {
	const { data: friendships, error } = await supabase
		.from("friendship")
		.select("friend_id, user_id, status, created_at")
		.or(`user_id.eq.${user?.value?.id},friend_id.eq.${user?.value?.id}`)

	if (error) {
		console.error(error)
	}
	else {
		// Séparer les demandes reçues et envoyées
		const pendingReceived = friendships.filter(relation =>
			relation.status === "pending" && relation.friend_id === user?.value?.id,
		)
		const pendingSent = friendships.filter(relation =>
			relation.status === "pending" && relation.user_id === user?.value?.id,
		)
		const accepted = friendships.filter(relation => relation.status === "accepted")

		// Récupérer les IDs des utilisateurs pour ces relations
		const pendingReceivedIds = pendingReceived.map(relation => relation.user_id)
		const pendingSentIds = pendingSent.map(relation => relation.friend_id)
		const acceptedIds = accepted.map(relation => relation.user_id === user?.value?.id ? relation.friend_id : relation.user_id)

		// Récupérer les détails des utilisateurs en une seule requête
		const allIds = [...pendingReceivedIds, ...pendingSentIds, ...acceptedIds]
		const { data: players, error: playersError } = await supabase
			.from("players")
			.select("*")
			.in("id", allIds)

		if (playersError) {
			console.error(playersError)
		}
		else {
			// Mapper les joueurs récupérés pour les organiser
			const playersMap = new Map(players.map(player => [player.id, player]))

			// Réinitialiser les listes
			pendingFriendsReceived.value = []
			pendingFriendsSent.value = []
			friends.value = []

			// Ajouter les demandes reçues
			pendingReceived.forEach((relation) => {
				const player = playersMap.get(relation.user_id)
				if (player) {
					pendingFriendsReceived.value.push({
						friend: new User(player),
						createdAt: relation.created_at,
					})
				}
			})

			// Ajouter les demandes envoyées
			pendingSent.forEach((relation) => {
				const player = playersMap.get(relation.friend_id)
				if (player) {
					pendingFriendsSent.value.push({
						friend: new User(player),
						createdAt: relation.created_at,
					})
				}
			})

			// Ajouter les amis acceptés
			accepted.forEach((relation) => {
				const friendId = relation.user_id === user?.value?.id ? relation.friend_id : relation.user_id
				const player = playersMap.get(friendId)
				if (player) {
					friends.value.push(new User(player))
				}
			})
		}
	}
}

async function popoverMount() {
	updateFriendList()
	const channel = supabase.channel("custom-all-channel")
		.on(
			"postgres_changes",
			{ event: "*", schema: "public", table: "friendship" },
			async (payload) => {
				if (payload.eventType !== "DELETE") {
					const friendShip: Friendship = new Friendship(payload.new)
					const { data, error } = await supabase
						.from("players")
						.select()
						.eq("id", friendShip.playerId)
						.single()

					if (error) {
						console.error(error)
					}
					else {
						const newFriend: User = new User(data)
						const friendshipData = {
							friend: newFriend,
							createdAt: payload.new.created_at,
						}

						if (friendShip.status === "pending") {
							// Déterminer si c'est une demande reçue ou envoyée
							if (friendShip.friendId === user?.value?.id) {
								// Demande reçue
								if (!pendingFriendsReceived.value.some(item => item.friend.id === friendShip.playerId)) {
									pendingFriendsReceived.value.push(friendshipData)
								}
							}
							else {
								// Demande envoyée
								if (!pendingFriendsSent.value.some(item => item.friend.id === friendShip.friendId)) {
									pendingFriendsSent.value.push(friendshipData)
								}
							}
						}
						else if (friendShip.status === "accepted") {
							// Retirer des listes pending et ajouter aux amis
							pendingFriendsReceived.value = pendingFriendsReceived.value.filter(item => item.friend.id !== newFriend.id)
							pendingFriendsSent.value = pendingFriendsSent.value.filter(item => item.friend.id !== newFriend.id)

							if (!friends.value.some(friend => friend.id === newFriend.id)) {
								friends.value.push(newFriend)
							}
						}
					}
				}
				else {
					await updateFriendList()
				}
			},
		)
		.subscribe()
	friendshipChannel.value = channel
}

async function popoverUnmount() {
	if (friendshipChannel.value) {
		supabase.removeChannel(friendshipChannel.value as RealtimeChannel)
		friendshipChannel.value = null
	}
}
</script>
