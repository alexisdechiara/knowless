<template>
	<CustomCard back>
		<template #header>
			<div class="flex items-center">
				<div>
					<CardTitle>Gestion des amis</CardTitle>
					<CardDescription>Ici, vous pouvez voir tous vos amis</CardDescription>
				</div>
				<div class="relative ml-auto w-full max-w-sm items-center">
					<Input id="search" v-model="friendToAdd" type="text" placeholder="Ajouter un ami" class="pl-9" />
					<span class="absolute inset-y-0 start-0 flex items-center justify-center px-2">
						<Icon name="lucide:search" class="size-5 text-muted-foreground" />
					</span>
				</div>
				<Button class="ml-2" size="icon">
					<Icon name="lucide:user-round-plus" class="size-4" @click="addFriend" />
				</button>
			</div>
		</template>
		<template #default>
			<div>
				<div v-if="pendingFriends.length > 0" class="flex size-full flex-col gap-4">
					<RowFriend v-for="friend in pendingFriends" :key="friend.id" :friend="friend" status="pending" @accept="acceptFriend($event)" @reject="removeFriend($event)" />
				</div>
				<div v-if="friends.length > 0" class="flex size-full flex-col gap-4">
					<RowFriend v-for="friend in friends" :key="friend.id" :friend="friend" status="accepted" @remove="removeFriend($event)" />
				</div>
			</div>
		</template>
	</CustomCard>
</template>

<script lang="ts" setup>
import { toast } from "vue-sonner"
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
	// prendre en compte le cas où la demande vient de l'autre utilisateur
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
	.select("friend_id, status")
	.eq("user_id", user?.value?.id)

if (error) {
	console.error(error)
}
else {
	// n'afficher que les demande d'autres utilisateurs et les amis acceptés
	data.forEach(async (currentFriend: { friend_id: string, status: string }) => {
		const { data: player, error } = await supabase.from("players").select("*").eq("id", currentFriend.friend_id).single()
		if (error) {
			console.error(error)
		}
		else {
			if (currentFriend.status === "pending") {
				pendingFriends.value.push(new User(player))
			}
			else if (currentFriend.status === "accepted") {
				friends.value.push(new User(player))
			}
		}
	})
}
</script>
