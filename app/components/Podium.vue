<template>
	<Motion as="div" class="flex flex-col" :initial="{ height: 0, opacity: 0 }" :animate="{ height: '100%', opacity: 1 }" :exit="{ height: 0, opacity: 0 }" :transition="{ duration: 0.4, ease: 'easeIn' }">
		<div class="flex grow flex-col items-center justify-end gap-y-2 pb-4">
			<Avatar size="base">
				<AvatarImage :src=" player.avatar ? player.avatar : ''" alt="avatar" />
				<AvatarFallback class="text-xl">{{ player.username }}</AvatarFallback>
			</Avatar>
			<span class="w-full overflow-hidden text-ellipsis text-center font-medium">{{ player.username }}</span>
		</div>
		<div class="relative w-full rounded-t-2xl" :class="medal === 'gold' ? 'h-36 bg-[#D6AF36]' : medal === 'silver' ? 'h-24 bg-[#A7A7AD]' : 'h-16 bg-[#A77044]'">
			<span class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl text-primary-foreground"> {{ score }} {{ score != null && score > 1 ? "pts" : "pt" }} </span>
		</div>
	</Motion>
</template>

<script lang="ts" setup>
import type { User } from "#shared/models/user"

defineProps<{
	player: User
	score: number
	medal: "gold" | "silver" | "bronze"
}>()
</script>
