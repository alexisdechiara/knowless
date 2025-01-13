<template>
	<div class="flex w-full items-center">
		<div class="relative aspect-square size-10">
			<Avatar size="sm">
				<AvatarImage :src="friend.avatar ? friend.avatar : ''" alt="avatar" />
				<AvatarFallback class="text-xl">{{ friend.username }}</AvatarFallback>
			</Avatar>
			<span class="absolute bottom-1 right-0 block size-3 rounded-full ring-2 ring-white" :class="true ? 'bg-green-500' : 'bg-gray-300'" />
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
			<Button v-if="status === 'accepted'" size="icon" variant="outline" class="hover:bg-destructive hover:text-destructive-foreground" @click="emit('remove', friend.id)">
				<Icon name="lucide:trash-2" />
			</Button>
			<Button v-if="status === 'accepted'" @click="emit('join', friend.id)"> Rejoindre </Button>
		</div>
	</div>
</template>

<script lang="ts" setup>
import type { User } from "~/models/user"

defineProps<{
	status: "pending" | "accepted" | "rejected"
	friend: User
}>()

const emit = defineEmits(["accept", "reject", "join", "remove"])
</script>
