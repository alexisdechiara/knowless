<template>
	<NuxtLink :to="to" class="flex cursor-pointer drop-shadow-sm transition-all hover:-translate-y-2 hover:scale-105 hover:drop-shadow-xl">
		<Card class="flex max-w-xs overflow-hidden sm:max-w-[200px] sm:flex-col md:max-w-[256px]">
			<CardHeader class="flex max-h-32 items-center justify-center p-4 sm:max-h-48 md:max-h-64 md:p-6" :class="{ 'h-64 bg-foreground': !$slots.img && !img }">
				<slot name="img" />
				<NuxtImg v-if="!$slots.img && img" :src="img.src" :alt="img.alt" class="size-full object-cover" />
			</CardHeader>
			<CardFooter class="flex grow flex-col items-center justify-center gap-y-2 p-4 pt-2 md:gap-y-4 md:p-6 md:pt-4">
				<CardTitle class="text-center text-xl leading-tight sm:text-2xl">
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
