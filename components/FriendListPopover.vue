<template>
	<Popover>
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
						<Icon name="lucide:user-round-plus" class="size-4" @click="addFriend" />
					</button>
				</div>
				<div class="flex h-full min-h-64 flex-col gap-4">
					<div v-if="pendingFriends.length > 0" class="size-full">
						<div class="pb-2 text-lg font-semibold">En attente</div>
						<div class="flex size-full flex-col gap-4">
							<RowFriend v-for="friend in pendingFriends" :key="friend.id" :friend="friend" status="pending" @accept="acceptFriend($event)" @reject="rejectFriend($event)" />
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
import PopoverTrigger from "~/components/ui/popover/PopoverTrigger.vue"
import { User } from "~/models/user"

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const friendToAdd = ref("")

const friendUsername = computed(() => friendToAdd.value.split("#")[0])

const friendUsertag = computed(() => friendToAdd.value.split("#")[1])

async function addFriend() {
	const { data: friend, error: friendError } = await supabase.from("players").select("*").eq("username", friendUsername.value).eq("usertag", friendUsertag.value).single()

	if (friendError) {
		if (friendError.code === "PGRST116") {
			toast.error("Cet utilisateur n'existe pas", {
				description: "Veuillez vérifier le nom d'utilisateur et le tag",
			})
		}
		else {
			toast.error(`Erreur ${friendError.code}`, {
				description: friendError.details,
			})
		}
	}
	else {
		const { error } = await supabase.from("friendship").insert({
			user_id: user?.value?.id,
			friend_id: friend.id,
			status: "pending",
		})

		if (error) {
			if (error.code === "23505") {
				toast(`Une demande d'ami est deja envoyée`, {
					description: `Vous avez déjà envoyé une demande d'ami à ${friend.username}#${friend.usertag}`,
				})
			}
			else {
				toast.error(`Erreur ${error.code}`, {
					description: error.details,
				})
			}
		}
		else {
			toast.success("Demande envoyée", {
				description: `Votre demande d'ami a été envoyée à ${friend.username}#${friend.usertag}`,
			})
		}
	}
}

async function removeFriend(id: string) {
	const { error } = await supabase.from("friendship").delete().eq("user_id", user?.value?.id).eq("friend_id", id)

	if (error) {
		toast.error(`Erreur ${error.code}`, {
			description: error.details,
		})
	}
	else {
		toast.success("Ami supprimé", {
			description: `Vous avez supprimé un ami de votre liste`,
		})
		friends.value = friends.value.filter(friend => friend.id !== id)
	}
}

async function rejectFriend(id: string) {
	// Supprimer la demande d'ami où l'utilisateur actuel est le destinataire
	const { error } = await supabase
		.from("friendship")
		.delete()
		.eq("friend_id", user?.value?.id) // L'utilisateur est le destinataire
		.eq("user_id", id) // L'autre utilisateur est l'expéditeur

	if (error) {
		toast.error(`Erreur ${error.code}`, {
			description: error.details,
		})
	}
	else {
		toast.success("Demande d'ami rejetée", {
			description: `Vous avez rejeté une demande d'ami`,
		})
		pendingFriends.value = pendingFriends.value.filter(friend => friend.id !== id)
	}
}

async function acceptFriend(friendId: string) {
	const { error } = await supabase.from("friendship").update({ status: "accepted" }).eq("user_id", user?.value?.id).eq("friend_id", friendId)

	if (error) {
		toast.error(`Erreur ${error.code}`, {
			description: error.details,
		})
	}
	else {
		toast.success("Ami accepté", {
			description: `Vous avez accepté un ami de votre liste`,
		})
		friends.value.push(pendingFriends.value.find(friend => friend.id === friendId) as User)
		pendingFriends.value = pendingFriends.value.filter(friend => friend.id !== friendId)
	}
}

const friends = ref<Array<User>>([])
const pendingFriends = ref<Array<User>>([])

const { data, error } = await supabase
	.from("friendship")
	.select("friend_id, user_id, status")
	.or(`user_id.eq.${user?.value?.id},friend_id.eq.${user?.value?.id}`)

if (error) {
	console.error(error)
}
else {
	// Filtrer les relations pertinentes
	const pending = data.filter(
		relation => relation.status === "pending" && relation.friend_id === user?.value?.id,
	)
	const accepted = data.filter(relation => relation.status === "accepted")

	// Récupérer les IDs des utilisateurs pour ces relations
	const pendingIds = pending.map(relation => relation.user_id) // Les utilisateurs qui ont envoyé une demande
	const acceptedIds = accepted.map(relation =>
		relation.user_id === user?.value?.id ? relation.friend_id : relation.user_id,
	)

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
			if (player) {
				pendingFriends.value.push(new User(player))
			}
		})

		accepted.forEach((relation) => {
			const friendId = relation.user_id === user?.value?.id ? relation.friend_id : relation.user_id
			const player = playersMap.get(friendId)
			if (player) {
				friends.value.push(new User(player))
			}
		})
	}
}
</script>
