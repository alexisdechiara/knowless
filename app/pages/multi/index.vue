<template>
	<NuxtLayout name="selection" :previous="{ icon: 'lucide:chevron-left', button: { variant: 'outline' }, to: '/' }">
		<SelectionCard title="Créer" description="Si vous souhaitez créer une partie  personnalisée en tant que l’hôte pour jouer à plusieurs" to="/multi/create" />
		<SelectionCard title="Rejoindre" description="Si vous possédez un code d’invitation pour rejoindre une partie personnalisée" to="/multi/join" />
	</NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
	layout: "selection",
	title: "Multijoueur",
	description: "Créez ou rejoignez une partie personnalisée",
})
</script>
