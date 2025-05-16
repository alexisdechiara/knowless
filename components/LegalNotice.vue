<template>
	<Tabs default-value="notice" class="relative">
		<TabsList class="fixed left-1/2 top-8 z-50 flex w-fit -translate-x-1/2">
			<TabsTrigger value="notice">
				Mentions légales
			</TabsTrigger>
			<TabsTrigger value="lincenses">
				Lincences
			</TabsTrigger>
		</TabsList>
		<div class="absolute inset-x-4 bottom-0 top-16 overflow-y-auto">
			<TabsContent value="notice">
				<ContentRenderer v-if="data" :value="data" class="prose max-w-none prose-headings:text-2xl sm:text-justify" />
			</TabsContent>
			<TabsContent value="lincenses" />
		</div>
	</tabs>
</template>

<script setup>
const { data } = await useAsyncData("legal-notice", () => queryCollection("content").first())

useSeoMeta({
	title: data.value?.title,
	description: data.value?.description,
})
</script>
