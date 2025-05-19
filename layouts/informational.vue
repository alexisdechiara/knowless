<template>
	<div class="pb-32 pt-16">
		<h2 class="mb-24 text-center text-5xl font-bold">{{ title }}</h2>
		<ContentRenderer v-if="content" :value="content" class="prose mx-auto prose-headings:text-2xl sm:text-justify" />
		<slot />
	</div>
</template>

<script lang="ts" setup>
const props = defineProps<{
	title: string
	description?: string
	lastUpdated?: string | Date
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	content?: Record<string, any>
}>()

useSeoMeta({
	title: props.title,
	description: props?.description,
})
</script>
