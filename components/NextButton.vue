<template>
	<Button variant="secondary" class="absolute bottom-0 right-0 flex h-fit py-4 pl-5 sm:bottom-8 sm:right-8">
		<div class="flex flex-col items-end">
			<span class="text-xl font-medium">{{ title }}</span>
			<span class="text-sm text-secondary-foreground/50">{{ description }}</span>
		</div>
		<Icon name="lucide:arrow-right" class="text-3xl" />
	</Button>
</template>

<script lang="ts" setup>
defineProps<{
	title: string
	description: string
}>()
</script>
