<template>
	<NumberField :id="player.id" v-model="modelValue" :default-value="0" class="w-full min-w-24 max-w-32">
		<Label class="mb-1 overflow-hidden text-center">
			<div class="flex flex-col items-center gap-y-1">
				<Avatar class="aspect-square size-full">
					<AvatarImage :src="player.avatar ? player.avatar : ''" alt="avatar" />
					<AvatarFallback>{{ player.username }}</AvatarFallback>
				</Avatar>
				<span class="w-full overflow-hidden text-ellipsis text-center text-base font-semibold text-primary">{{ player.username }}</span>
			</div>
		</Label>
		<NumberFieldContent>
			<NumberFieldDecrement />
			<NumberFieldInput />
			<NumberFieldIncrement />
		</NumberFieldContent>
	</NumberField>
</template>

<script lang="ts" setup>
import type { User } from "~/models/user"

const modelValue = defineModel<number>()

defineProps<{
	player: User
}>()
</script>
