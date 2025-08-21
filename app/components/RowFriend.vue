<template>
	<div class="flex w-full items-center">
		<div class="relative aspect-square size-10">
			<Avatar size="sm">
				<AvatarImage :src="friend.avatar ? friend.avatar : ''" alt="avatar" />
				<AvatarFallback class="text-xl">{{ friend.username }}</AvatarFallback>
			</Avatar>
			<span class="absolute bottom-1 right-0 block size-3 rounded-full ring-2 ring-white" :class="friendStatus === 'online' ? 'bg-green-500' : friendStatus === 'in-lobby' ? 'bg-yellow-500' : friendStatus === 'playing' ? 'bg-red-500' : 'bg-background border-2 border-border'" />
		</div>
		<div class="ml-1.5 mr-3">
			<p class="text-sm font-medium">{{ friend.username }}</p>
			<p class="text-xs text-muted-foreground">#{{ friend.usertag }}</p>
		</div>
		<div class="ml-auto flex gap-2">
			<Button v-if="status === 'pending' && user?.id !== friend.id" size="sm" @click="emit('accept', friend.id)"> Accepter </Button>
			<Button v-if="status === 'pending' && user?.id !== friend.id" size="sm" variant="outline" class="hover:bg-destructive hover:text-destructive-foreground" @click="emit('reject', friend.id)">
				Refuser
			</Button>
			<Button v-if="status === 'sent' && user?.id !== friend.id" variant="outline" size="sm" class="hover:bg-destructive hover:text-destructive-foreground" @click="emit('reject', friend.id)">
				Annuler
			</Button>
			<Button v-if="lobby && status === 'accepted' && (friendStatus === 'in-lobby' || friendStatus === 'playing')" :disabled="isFull || isBanned || (lobby?.gameId && !isAlreadyPlayer) || (!lobby?.securityLevel?.includes('join') && !isAlreadyPlayer)" @click="joinFriendLobby()">
				{{ isFull ? "Complet" : isBanned ? "Banni⋅e" : "Rejoindre" }}
			</Button>
			<Button v-if="status === 'accepted'" size="icon" variant="destructive" @click="emit('remove', friend.id)">
				<Icon name="lucide:trash-2" />
			</Button>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { toast } from "vue-sonner"
import { Lobby } from "#shared/models/lobby"
import type { User } from "#shared/models/user"

const props = defineProps<{
	status: "pending" | "accepted" | "rejected" | "sent"
	friend: User
}>()

const emit = defineEmits(["accept", "reject", "join", "remove"])

const supabase = getSupabaseClient()
const lobby = ref<Lobby>()
const user = useSupabaseUser()

async function loadLobby(id?: number | null) {
    if (!id && id !== 0) return
    const { data, error } = await supabase
        .from("lobbies")
        .select("*")
        .eq("id", Number(id))
        .single()
    if (error) {
        console.error("Impossible de récupérer les informations du salon", error)
        return
    }
    if (data) lobby.value = new Lobby(data)
}

// Initial fetch if already in a lobby
await loadLobby(Number(props.friend.lobbyId))

// React to lobby changes (e.g., friend joins/leaves while popover is open)
watch(
    () => props.friend.lobbyId,
    async (newId) => {
        lobby.value = undefined
        await loadLobby(Number(newId))
    }
)

const isBanned = computed(() => lobby.value && user.value && lobby.value.bannedPlayersId.includes(user.value?.id))
const isFull = computed(() => lobby.value && lobby.value.playerIds.length + 1 >= lobby.value.maxPlayers)
const isAlreadyPlayer = computed(() => lobby.value && user.value && (lobby.value.playerIds.includes(user.value.id) || lobby.value.host === user.value.id))
const friendStatus = computed(() => {
    if (lobby.value) {
        return lobby.value.gameId ? "playing" : "in-lobby"
    }
    return props.friend.status
})

function joinFriendLobby() {
    if (!lobby.value && props.friend.lobbyId) {
        // Load lobby on-demand if not yet fetched
        loadLobby(Number(props.friend.lobbyId)).then(() => {
            if (!lobby.value) return
            // Empêche de rejoindre si la partie a déjà commencé (sauf si déjà joueur)
            if (lobby.value.gameId && !isAlreadyPlayer.value) {
                toast.error("La partie a déjà commencé")
                return
            }
            // Respecte le niveau de sécurité du lobby (join via liste d'amis)
            if (!lobby.value.securityLevel.includes("join") && !isAlreadyPlayer.value) {
                toast.error("L'hôte a désactivé la possibilité de rejoindre via la liste d'amis")
                return
            }
            joinLobby(lobby.value)
        })
        return
    }
    if (lobby.value) {
        if (lobby.value.gameId && !isAlreadyPlayer.value) {
            toast.error("La partie a déjà commencé")
            return
        }
        if (!lobby.value.securityLevel.includes("join") && !isAlreadyPlayer.value) {
            toast.error("L'hôte a désactivé la possibilité de rejoindre via la liste d'amis")
            return
        }
        joinLobby(lobby.value)
    }
}
</script>
