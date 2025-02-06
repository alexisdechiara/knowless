<template>
	<div class="flex w-full items-center">
		<div class="relative aspect-square size-10">
			<Avatar size="sm">
				<AvatarImage :src="friend.avatar ? friend.avatar : ''" alt="avatar" />
				<AvatarFallback class="text-xl">{{ friend.username }}</AvatarFallback>
			</Avatar>
			<span class="absolute bottom-1 right-0 block size-3 rounded-full ring-2 ring-white" :class="friend.status === 'online' ? 'bg-green-500' : friend.status === 'in-lobby' ? 'bg-yellow-500' : friend.status === 'playing' ? 'bg-red-500' : 'bg-background border-2 border-border'" />
		</div>
		<div class="ml-2">
			<p class="text-sm font-medium">{{ friend.username }}</p>
			<p class="text-xs text-muted-foreground">#{{ friend.usertag }}</p>
		</div>
		<div class="ml-auto flex gap-2">
			<Button v-if="status === 'pending'" @click="emit('accept', friend.id)"> Accepter </Button>
			<Button v-if="status === 'pending'" variant="outline" class="hover:bg-destructive hover:text-destructive-foreground" @click="emit('reject', friend.id)">
				Refuser
			</Button>
			<Button v-if="lobby && status === 'accepted' && (friend.status === 'in-lobby' || friend.status === 'playing')" :disabled="friend.status === 'playing' || isFull || isBanned" @click="joinFriendLobby()">
				{{ isFull ? "Complet" : isBanned ? "Banni" : "Rejoindre" }}
			</Button>
			<Button v-if="status === 'accepted'" size="icon" variant="outline" class="hover:bg-destructive hover:text-destructive-foreground" @click="emit('remove', friend.id)">
				<Icon name="lucide:trash-2" />
			</Button>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { toast } from "vue-sonner"
import { Lobby } from "~/models/lobby"
import type { User } from "~/models/user"

const props = defineProps<{
	status: "pending" | "accepted" | "rejected"
	friend: User
}>()

const emit = defineEmits(["accept", "reject", "join", "remove"])

const supabase = useSupabaseClient()
const lobby = ref<Lobby>()
const user = useSupabaseUser()

if (props.friend.status === "in-lobby") {
	const { data, error } = await supabase.from("lobbies").select("*").eq("id", props.friend.lobbyId).single()

	if (error) {
		console.error("Impossible de récupérer les informations du salon")
	}
	else if (data) {
		lobby.value = new Lobby(data)
	}
}

const isBanned = computed(() => lobby.value && user.value && lobby.value.bannedPlayersId.includes(user.value?.id))
const isFull = computed(() => lobby.value && lobby.value.playerIds.length + 1 >= lobby.value.maxPlayers)

function joinFriendLobby() {
	if (lobby.value) {
		if (lobby.value.securityLevel.includes("join")) {
			joinLobby(lobby.value)
		}
		else {
			toast.error("L'hôte a désactivé la possibilité de rejoindre via la liste d'amis")
		}
	}
}
</script>
