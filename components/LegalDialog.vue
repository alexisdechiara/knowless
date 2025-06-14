<template>
	<Tabs default-value="legal" class="relative">
		<TabsList class="fixed left-1/2 top-8 z-50 flex w-fit -translate-x-1/2 scale-75 sm:scale-100">
			<TabsTrigger value="legal">
				Mentions légales
			</TabsTrigger>
			<TabsTrigger value="lincenses">
				Lincences
			</TabsTrigger>
			<TabsTrigger value="privacy">
				Confidentialité
			</TabsTrigger>
			<TabsTrigger value="terms">
				CGU
			</TabsTrigger>
		</TabsList>
		<div class="absolute inset-x-4 bottom-0 top-16 overflow-y-auto pr-4">
			<TabsContent value="legal">
				<ContentRenderer v-if="legal" :value="legal" class="prose max-w-none prose-headings:text-2xl sm:text-justify" />
			</TabsContent>
			<TabsContent value="lincenses">
				<ContentRenderer v-if="licenses" :value="licenses" class="prose max-w-none pb-6 prose-headings:text-2xl sm:text-justify" />
			</TabsContent>
			<TabsContent value="privacy">
				<ContentRenderer v-if="privacy" :value="privacy" class="prose max-w-none pb-6 prose-headings:text-2xl sm:text-justify" />
			</TabsContent>
			<TabsContent value="terms">
				<ContentRenderer v-if="terms" :value="terms" class="prose max-w-none pb-6 prose-headings:text-2xl sm:text-justify" />
			</TabsContent>
		</div>
	</tabs>
</template>

<script setup>
const { data: legal } = await useAsyncData(() => queryCollection("content").path("/legal-notice").first())
const { data: licenses } = await useAsyncData(() => queryCollection("content").path("/licenses").first())
const { data: privacy } = await useAsyncData(() => queryCollection("content").path("/privacy").first())
const { data: terms } = await useAsyncData(() => queryCollection("content").path("/terms").first())
</script>
