<template>
	<div class="flex h-screen w-screen items-center justify-center">
		<TitleScreenCard
			title="Multijoueur"
			:links="[{
					title: 'Créer une partie',
					description: 'Si vous souhaitez créer une partie  personnalisée en tant que l’hôte pour jouer seul ou à plusieurs',
					to: '/multi/create',
				},
				{
					title: 'Rejoindre une partie',
					description: 'Si vous possédez un code d’invitation pour rejoindre une partie personnalisée',
					to: '/multi/join',
				}]"
		/>
	</div>
</template>

<script lang="ts" setup>

</script>

<style scoped>

</style>
