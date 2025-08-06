<template>
	<Button class="absolute bottom-0 right-0 inline-flex h-fit items-center px-4 py-3 text-lg sm:bottom-8 sm:right-8" size="lg" v-bind="$attrs">
		{{ title }}
		<Icon v-if="icon" name="lucide:chevron-right" class="text-2xl" />
	</Button>
</template>

<script lang="ts" setup>
defineProps<{
	title: string
	description?: string
	icon?: boolean
}>()
</script>
