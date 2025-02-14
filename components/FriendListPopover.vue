<template>
	<Popover @update:open="$event === true ? popoverMount() : popoverUnmount()">
		<PopoverTrigger>
			<slot />
		</PopoverTrigger>
		<PopoverContent :side-offset="8" class="flex w-full min-w-[320px] max-w-7xl flex-col p-0">
			<CardHeader>
				<CardTitle>Gestion des amis</CardTitle>
				<CardDescription>Ici, vous pouvez voir tous vos amis</CardDescription>
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
					<div v-if="pendingFriends.length > 0" class="size-full">
						<div class="pb-2 text-lg font-semibold">En attente</div>
						<div class="flex size-full flex-col gap-4">
							<RowFriend v-for="friend in pendingFriends" :key="friend.id" :friend="friend" status="pending" @accept="acceptFriend($event)" @reject="onReject($event)" />
						</div>
					</div>
					<div v-if="friends.length > 0" class="size-full flex-1">
						<div v-if="pendingFriends.length > 0" class="pb-2 text-lg font-semibold">Amis</div>
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
import PopoverTrigger from "~/components/ui/popover/PopoverTrigger.vue"
import { User } from "~/models/user"
import { Friendship } from "~/models/friendship"

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { inviteFriend, removeFriend, acceptFriend } = useFriends()
const friendshipChannel = ref<RealtimeChannel | null>(null)

const friendToAdd = ref("")
const friends = ref<Array<User>>([])
const pendingFriends = ref<Array<User>>([])

const friendUsername = computed(() => friendToAdd.value.split("#")[0])

const friendUsertag = computed(() => friendToAdd.value.split("#")[1])

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
		.select("friend_id, user_id, status")
		.or(`user_id.eq.${user?.value?.id},friend_id.eq.${user?.value?.id}`)

	if (error) {
		console.error(error)
	}
	else {
		// Filtrer les relations pertinentes
		const pending = friendships.filter(relation => relation.status === "pending" && relation.friend_id === user?.value?.id)
		const accepted = friendships.filter(relation => relation.status === "accepted")

		// Récupérer les IDs des utilisateurs pour ces relations
		const pendingIds = pending.map(relation => relation.user_id)
		const acceptedIds = accepted.map(relation => relation.user_id === user?.value?.id ? relation.friend_id : relation.user_id)

		// Récupérer les détails des utilisateurs en une seule requête
		const { data: players, error: playersError } = await supabase
			.from("players")
			.select("*")
			.in("id", [...pendingIds, ...acceptedIds])

		if (playersError) {
			console.error(playersError)
		}
		else {
		// Mapper les joueurs récupérés pour les organiser
			const playersMap = new Map(players.map(player => [player.id, player]))

			// Ajouter les amis acceptés et les demandes en attente
			pending.forEach((relation) => {
				const player = playersMap.get(relation.user_id) // L'utilisateur qui a envoyé la demande
				if (player && !pendingFriends.value.some(friend => friend.id === player.id)) {
					pendingFriends.value.push(new User(player))
				}
			})

			accepted.forEach((relation) => {
				const friendId = relation.user_id === user?.value?.id ? relation.friend_id : relation.user_id
				const player = playersMap.get(friendId)
				if (player && !friends.value.some(friend => friend.id === player.id)) {
					friends.value.push(new User(player))
				}
			})

			friends.value = friends.value.filter(friend =>
				accepted.some((relation) => {
					const friendId = relation.user_id === user?.value?.id ? relation.friend_id : relation.user_id
					return friend.id === friendId
				}),
			)

			// Met à jour la liste des demandes en attente
			pendingFriends.value = pendingFriends.value.filter(friend =>
				pending.some(relation => relation.user_id === friend.id),
			)
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
						if (friendShip.status === "pending" && pendingFriends.value.every(friend => friend.id !== friendShip.playerId)) {
							pendingFriends.value.push(newFriend)
						}
						else if (friendShip.status === "accepted" && friends.value.every(friend => friend.id !== friendShip.playerId || friend.id !== friendShip.friendId)) {
							pendingFriends.value = pendingFriends.value.filter(friend => friend.id !== newFriend.id)
							friends.value.push(newFriend)
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
