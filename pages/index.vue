<template>
	<div class="relative flex h-screen w-screen items-center justify-center">
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
					to: '/multi',
					disabled: true,
				}]"
		/>
		<NuxtLink to="/legal-notice" class="fixed bottom-1 left-1/2 -translate-x-1/2 text-center underline underline-offset-2 transition-colors hover:text-muted-foreground">
			Mentions légales et licences
		</NuxtLink>
	</div>
</template>

<script lang="ts" setup>
definePageMeta({
	middleware: "auth",
})
</script>

<style scoped>

</style>
