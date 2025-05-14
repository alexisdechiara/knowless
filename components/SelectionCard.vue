<template>
	<NuxtLink :to="to" class="cursor-pointer drop-shadow-sm transition-all hover:-translate-y-2 hover:scale-105 hover:drop-shadow-xl">
		<Card class="max-w-[256px] overflow-hidden">
			<CardHeader class="flex max-h-64 items-center justify-center" :class="{ 'h-64 bg-foreground': !$slots.img && !img }">
				<slot name="img" />
				<NuxtImg v-if="!$slots.img && img" :src="img.src" :alt="img.alt" class="size-full object-cover" />
			</CardHeader>
			<CardFooter class="flex flex-col items-center justify-center gap-y-4 pt-4">
				<CardTitle class="text-center leading-tight">
					{{ title }}
				</CardTitle>
				<CardDescription class="text-center">
					{{ description }}
				</CardDescription>
			</CardFooter>
		</Card>
	</NuxtLink>
</template>

<script lang="ts" setup>
defineProps<{
	title: string
	description?: string
	img?: {
		src: string
		alt: string
	}
	to?: string
}>()
</script>
