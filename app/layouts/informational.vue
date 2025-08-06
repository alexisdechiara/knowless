<template>
	<div class="pb-32 pt-16">
		<h2 class="mb-20 text-center text-5xl font-bold">{{ title }}</h2>
		<span v-if="formattedUpdatedAt" class="mb-8 block text-center text-sm">
			Dernière mise à jour le <b class="font-medium">{{ formattedUpdatedAt }}</b>
		</span>
		<ContentRenderer v-if="content" :value="content" class="prose mx-auto prose-headings:text-2xl sm:text-justify" />
		<slot />
	</div>
</template>

<script lang="ts" setup>
import { computed, type Ref } from "vue"
const props = defineProps<{
	title: string
	description?: string
	updatedAt?: string | Date
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	content?: Record<string, any>
}>()

const { locale } = useI18n() as { locale: Ref<string> } // Récupère la locale de l'utilisateur

const formattedUpdatedAt = computed(() => {
	if (!props.updatedAt) {
		return undefined
	}

	const date = new Date(props.updatedAt)

	if (isNaN(date.getTime())) {
		console.warn(`[informational-layout] Date invalide fournie pour 'updatedAt': ${props.updatedAt}`)
		return undefined
	}

	try {
		const options: Intl.DateTimeFormatOptions = {
			year: "numeric",
			month: "long",
			day: "numeric",
		}
		return new Intl.DateTimeFormat('fr-FR', options).format(date)
	} catch (error) {
		console.error(`[informational-layout] Erreur lors du formatage de la date avec la locale '${locale.value}':`, error)
		return date.toLocaleDateString()
	}
})

useSeoMeta({
	title: props.title,
})
</script>
