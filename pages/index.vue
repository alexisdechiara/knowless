<template>
	<div class="flex h-screen w-screen items-center justify-center">
		<TitleScreenCard
			title="Bienvenue"
			:links="[{
					title: 'Solo',
					description: 'Jouez seul sur une durée limité ou bien en mode infini',
					to: '/solo',
				},
				{
					title: 'Multijoueur',
					description: 'Jouez en multi sur une durée limité ou bien en mode infini',
					to: '/multiplayer',
				}]"
		/>
	</div>
</template>

<script lang="ts" setup>

</script>

<style scoped>

</style>
