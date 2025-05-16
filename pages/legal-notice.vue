<template>
	<div class="pb-32 pt-16">
		<h2 class="mb-24 text-center text-5xl font-bold">Mentions légales</h2>
		<ContentRenderer v-if="data" :value="data" class="prose mx-auto prose-headings:text-2xl sm:text-justify" />
	</div>
</template>

<script setup>
const { data } = await useAsyncData("legal-notice", () => queryCollection("content").first())

useSeoMeta({
	title: data.value?.title,
	description: data.value?.description,
})
</script>
